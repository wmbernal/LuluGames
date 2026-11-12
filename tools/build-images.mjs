#!/usr/bin/env node
// Baixa as fotos escolhidas em tools/pexels-results.json, recorta em 4:3 e
// grava os créditos. A escolha (primeira foto horizontal com 1000 px ou mais)
// é feita na etapa de raspagem, no navegador, e fica gravada em "chosen".
//
// Uso:
//   node tools/build-images.mjs                  # baixa as 25 cenas que faltam
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
const resultsPath = path.join(root, "tools", "pexels-results.json");
const queriesPath = path.join(root, "tools", "pexels-queries.json");
const imageDir = path.join(root, "assets", "images", "image-interpretation");
const creditsJsonPath = path.join(root, "tools", "image-credits.json");
const creditsDocPath = path.join(root, "docs", "IMAGE_CREDITS.md");
const cropScriptPath = path.join(root, "tools", "crop-4x3.ps1");
const WIDTH = 1200;
const HEIGHT = 900;

function parseArgs(argv) {
  const args = { force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--force") args.force = true;
    else if (arg === "--check") args.check = true;
    else if (arg === "--only") args.only = argv[++i];
    else if (arg === "--scene") args.scene = argv[++i];
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`Opção desconhecida: ${arg}`);
  }
  return args;
}

function usage() {
  console.log(`Baixa e recorta as fotos de "O que está acontecendo?".

  node tools/build-images.mjs [opções]

Opções:
  --only <prefixo>   processa só cenas cujo id começa com o prefixo (ex.: park-)
  --scene <id>       processa uma cena específica
  --force            baixa de novo mesmo se o JPG já existir
  --check            valida tools/pexels-results.json e sai
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
    if (!(chosen.width >= 1000)) problems.push(`${entry.scene}: largura ${chosen.width} < 1000`);
    if (!(chosen.width > chosen.height)) problems.push(`${entry.scene}: não é horizontal`);
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

async function writeCredits(scenes, results) {
  const credits = {};
  const rows = [];
  let currentTheme = null;
  for (const entry of scenes) {
    const chosen = results[entry.scene]?.chosen;
    if (!chosen) continue;
    try {
      await readFile(path.join(imageDir, `${entry.scene}.jpg`));
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

  await writeFile(creditsJsonPath, `${JSON.stringify(credits, null, 2)}\n`);
  const doc = `# Créditos das fotos

Fotos obtidas do Pexels e armazenadas localmente. O Pexels permite uso gratuito,
inclusive educacional, sem atribuição obrigatória; os créditos ficam aqui por cortesia
e para rastrear a origem de cada arquivo.

Todas as imagens foram recortadas em 4:3 (${WIDTH}x${HEIGHT}, JPEG) e estão em
\`assets/images/image-interpretation/\`.

${rows.join("\n")}
`;
  await writeFile(creditsDocPath, doc);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const { scenes } = await loadJson(queriesPath, "tools/pexels-queries.json");
  const results = await loadJson(resultsPath, "tools/pexels-results.json");
  const selected = selectScenes(scenes, results, args);
  const problems = validate(args.check ? scenes : selected, results);

  if (problems.length > 0) {
    console.error(problems.join("\n"));
    process.exitCode = 1;
    return;
  }
  if (args.check) {
    console.log(`OK: ${scenes.length} cenas com foto horizontal, autor e link.`);
    return;
  }

  await mkdir(imageDir, { recursive: true });
  let downloaded = 0;
  let skipped = 0;

  for (const entry of selected) {
    const chosen = results[entry.scene].chosen;
    const target = path.join(imageDir, `${entry.scene}.jpg`);
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
    const temporary = path.join(imageDir, `${temporaryScene}.jpg`);
    try {
      const size = await download(cropUrl(chosen.src), temporary);
      execFileSync("powershell", [
        "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", cropScriptPath,
        "-Scene", temporaryScene,
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
  await writeCredits(scenes, results);
  console.log(`\n${downloaded} baixada(s), ${skipped} já existente(s).`);
  console.log(`Créditos: docs/IMAGE_CREDITS.md`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
