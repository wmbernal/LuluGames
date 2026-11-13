#!/usr/bin/env node
// Baixa as fotos escolhidas em tools/<jogo>-results.json, recorta em 4:3 e
// grava os créditos. A escolha (primeira foto horizontal com 1000 px ou mais)
// é feita na etapa de raspagem, no navegador, e fica gravada em "chosen".
//
// Uso:
//   node tools/build-images.mjs                  # "O que está acontecendo?"
//   node tools/build-images.mjs --game emotions  # "Jogo das Emoções"
//   node tools/build-images.mjs --only park-     # só um tema
//   node tools/build-images.mjs --scene park-kite-flying
//   node tools/build-images.mjs --force          # baixa de novo
//   node tools/build-images.mjs --check          # valida o JSON sem acessar a rede

import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GAMES = {
  "image-interpretation": {
    label: '"O que está acontecendo?"',
    queries: "pexels-queries.json",
    results: "pexels-results.json",
    imageDir: ["assets", "images", "image-interpretation"],
    creditsJson: "image-credits.json",
    creditsDoc: "IMAGE_CREDITS.md",
  },
  emotions: {
    label: '"Jogo das Emoções"',
    queries: "emotions-queries.json",
    results: "emotions-results.json",
    imageDir: ["assets", "images", "emotions"],
    creditsJson: "emotions-credits.json",
    creditsDoc: "EMOTION_CREDITS.md",
  },
};
const DEFAULT_GAME = "image-interpretation";
const cropScriptPath = path.join(root, "tools", "crop-4x3.ps1");
const WIDTH = 1200;
const HEIGHT = 900;

function gamePaths(game) {
  const config = GAMES[game];
  if (!config) throw new Error(`Jogo desconhecido: ${game}. Use: ${Object.keys(GAMES).join(", ")}`);
  return {
    ...config,
    queriesPath: path.join(root, "tools", config.queries),
    resultsPath: path.join(root, "tools", config.results),
    imageDir: path.join(root, ...config.imageDir),
    creditsJsonPath: path.join(root, "tools", config.creditsJson),
    creditsDocPath: path.join(root, "docs", config.creditsDoc),
  };
}

function parseArgs(argv) {
  const args = { force: false, game: DEFAULT_GAME };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--force") args.force = true;
    else if (arg === "--check") args.check = true;
    else if (arg === "--game") args.game = argv[++i];
    else if (arg === "--only") args.only = argv[++i];
    else if (arg === "--scene") args.scene = argv[++i];
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`Opção desconhecida: ${arg}`);
  }
  return args;
}

function usage() {
  console.log(`Baixa e recorta as fotos de um jogo.

  node tools/build-images.mjs [opções]

Opções:
  --game <id>        jogo das fotos: ${Object.keys(GAMES).join(" | ")} (padrão: ${DEFAULT_GAME})
  --only <prefixo>   processa só cenas cujo id começa com o prefixo (ex.: park-)
  --scene <id>       processa uma cena específica
  --force            baixa de novo mesmo se o JPG já existir
  --check            valida o JSON de resultados e sai
  --help             mostra esta ajuda
`);
}

async function loadJson(file, label) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    throw new Error(`Não consegui ler ${label}: ${error.message}`);
  }
}

function cropUrl(src) {
  const url = new URL(src);
  url.search = `?cs=tinysrgb&fit=crop&w=${WIDTH}&h=${HEIGHT}&fm=jpg`;
  return url.href;
}

function jpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isStartOfFrame) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function selectScenes(scenes, results, args) {
  const selected = scenes.filter((entry) => {
    if (args.scene) return entry.scene === args.scene;
    if (args.only) return entry.scene.startsWith(args.only);
    return true;
  });
  if (args.scene && selected.length === 0) throw new Error(`Cena não encontrada: ${args.scene}`);
  if (args.only && selected.length === 0) throw new Error(`Nenhuma cena com o prefixo: ${args.only}`);
  for (const entry of selected) {
    if (!results[entry.scene]) throw new Error(`Sem resultados raspados para ${entry.scene}.`);
  }
  return selected;
}

function validate(scenes, results) {
  const problems = [];
  for (const entry of scenes) {
    const scene = results[entry.scene];
    if (!scene) {
      problems.push(`${entry.scene}: sem resultado raspado`);
      continue;
    }
    const chosen = scene.chosen;
    if (!chosen) {
      problems.push(`${entry.scene}: nenhuma foto escolhida`);
      continue;
    }
    // A entrega é sempre um recorte 4:3 de 1200x900 (verificado no download).
    // Quando a origem informa tamanho, ele também precisa ser horizontal e grande.
    if (chosen.width !== undefined) {
      if (!(chosen.width >= 1000)) problems.push(`${entry.scene}: largura ${chosen.width} < 1000`);
      if (!(chosen.width > chosen.height)) problems.push(`${entry.scene}: não é horizontal`);
    } else if (chosen.ratio !== undefined && !(chosen.ratio >= 1.2)) {
      problems.push(`${entry.scene}: proporção ${chosen.ratio} não é horizontal`);
    }
    if (!chosen.page?.includes("/foto/")) problems.push(`${entry.scene}: página inválida`);
    if (!chosen.src?.includes("images.pexels.com")) problems.push(`${entry.scene}: imagem inválida`);
    if (!chosen.author) problems.push(`${entry.scene}: sem autor`);
  }
  return problems;
}

async function download(url, destination, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const size = jpegSize(buffer);
      if (!size) throw new Error("resposta não é um JPEG");
      if (size.width !== WIDTH || size.height !== HEIGHT) {
        throw new Error(`recorte saiu ${size.width}x${size.height}, esperado ${WIDTH}x${HEIGHT}`);
      }
      await writeFile(destination, buffer, { flag: "wx" });
      return size;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }
  throw new Error(`falha ao baixar ${url}: ${lastError.message}`);
}

async function writeCredits(scenes, results, paths) {
  const credits = {};
  const rows = [];
  let currentTheme = null;
  for (const entry of scenes) {
    const chosen = results[entry.scene]?.chosen;
    if (!chosen) continue;
    try {
      await readFile(path.join(paths.imageDir, `${entry.scene}.jpg`));
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    credits[entry.scene] = {
      theme: entry.theme,
      author: chosen.author,
      page: chosen.page,
      alt: chosen.alt,
      width: chosen.width,
      height: chosen.height,
    };
    if (entry.theme !== currentTheme) {
      currentTheme = entry.theme;
      rows.push(`\n### ${entry.theme}\n`);
      rows.push("| Arquivo | Fotógrafo | Origem |");
      rows.push("|---|---|---|");
    }
    const author = chosen.author.replace(/\|/g, "\\|");
    rows.push(`| \`${entry.scene}.jpg\` | ${author} | [Pexels](${chosen.page}) |`);
  }

  await writeFile(paths.creditsJsonPath, `${JSON.stringify(credits, null, 2)}\n`);
  const relativeImageDir = paths.imageDir.split(path.sep).slice(-2).join("/");
  const doc = `# Créditos das fotos — ${paths.label}

Fotos obtidas do Pexels e armazenadas localmente. O Pexels permite uso gratuito,
inclusive educacional, sem atribuição obrigatória; os créditos ficam aqui por cortesia
e para rastrear a origem de cada arquivo.

Todas as imagens foram recortadas em 4:3 (${WIDTH}x${HEIGHT}, JPEG) e estão em
\`${relativeImageDir}/\`.

${rows.join("\n")}
`;
  await writeFile(paths.creditsDocPath, doc);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const paths = gamePaths(args.game);
  const { scenes } = await loadJson(paths.queriesPath, `tools/${paths.queries}`);
  const results = await loadJson(paths.resultsPath, `tools/${paths.results}`);
  const selected = selectScenes(scenes, results, args);
  const problems = validate(args.check ? scenes : selected, results);

  if (problems.length > 0) {
    console.error(problems.join("\n"));
    process.exitCode = 1;
    return;
  }
  if (args.check) {
    console.log(`OK: ${scenes.length} cenas de ${paths.label} com foto horizontal, autor e link.`);
    return;
  }

  await mkdir(paths.imageDir, { recursive: true });
  let downloaded = 0;
  let skipped = 0;

  for (const entry of selected) {
    const chosen = results[entry.scene].chosen;
    const target = path.join(paths.imageDir, `${entry.scene}.jpg`);
    if (!args.force) {
      let existing;
      try {
        existing = await readFile(target);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      if (existing) {
        const size = jpegSize(existing);
        if (!size || size.width !== WIDTH || size.height !== HEIGHT) {
          throw new Error(`${entry.scene}: arquivo existente não é JPEG ${WIDTH}x${HEIGHT}; use --force para substituí-lo.`);
        }
        skipped += 1;
        continue;
      }
    }
    const temporaryScene = `${entry.scene}.${randomUUID()}.tmp`;
    const temporary = path.join(paths.imageDir, `${temporaryScene}.jpg`);
    try {
      const size = await download(cropUrl(chosen.src), temporary);
      execFileSync("powershell", [
        "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", cropScriptPath,
        "-Scene", temporaryScene, "-Game", args.game,
      ], { encoding: "utf8" });
      await rename(temporary, target);
      downloaded += 1;
      console.log(`${entry.scene}: ${chosen.author} (${size.width}x${size.height})`);
    } catch (error) {
      console.error(`${entry.scene}: ${error.message}`);
      process.exitCode = 1;
    } finally {
      try {
        await unlink(temporary);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }

  if (process.exitCode) return;
  await writeCredits(scenes, results, paths);
  console.log(`\n${downloaded} baixada(s), ${skipped} já existente(s).`);
  console.log(`Créditos: docs/${paths.creditsDoc}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
