#!/usr/bin/env node
// Busca fotos no Pexels pela API oficial e monta uma folha de contatos para escolha.
// Uso:
//   node tools/fetch-pexels.mjs                 # busca todas as 25 cenas (3 opções cada)
//   node tools/fetch-pexels.mjs --only house-   # só um tema
//   node tools/fetch-pexels.mjs --scene park-kite-flying --count 5
//   node tools/fetch-pexels.mjs --pick park-kite-flying 2
// Requer PEXELS_API_KEY (gratuita em https://www.pexels.com/api/).

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const queriesPath = path.join(root, "tools", "pexels-queries.json");
const candidatesDir = path.join(root, "assets", "images", "image-interpretation", "candidates");
const finalDir = path.join(root, "assets", "images", "image-interpretation");
const creditsJsonPath = path.join(root, "tools", "image-credits.json");
const creditsDocPath = path.join(root, "docs", "IMAGE_CREDITS.md");
const API = "https://api.pexels.com/v1/search";

function usage() {
  console.log(`Busca fotos no Pexels para as cenas de "O que está acontecendo?".

  node tools/fetch-pexels.mjs [opções]

Opções:
  --only <prefixo>      processa só cenas cujo id começa com o prefixo (ex.: house-)
  --scene <id>          processa uma cena específica
  --count <n>           quantas opções baixar por cena (padrão 3)
  --page <n>            página de resultados da API (padrão 1)
  --force               baixa de novo mesmo se o candidato já existir
  --pick <id> <n>       copia a opção n para assets/.../<id>.jpg e registra o crédito
  --check               valida tools/pexels-queries.json e sai
  --help                mostra esta ajuda

Ambiente:
  PEXELS_API_KEY        chave gratuita de https://www.pexels.com/api/
`);
}

function parseArgs(argv) {
  const args = { count: 3, page: 1, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--check") args.check = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--only") args.only = argv[++i];
    else if (arg === "--scene") args.scene = argv[++i];
    else if (arg === "--count") args.count = Number(argv[++i]);
    else if (arg === "--page") args.page = Number(argv[++i]);
    else if (arg === "--pick") {
      args.pick = argv[++i];
      args.pickIndex = Number(argv[++i]);
    } else {
      throw new Error(`Opção desconhecida: ${arg}`);
    }
  }
  return args;
}

async function loadQueries() {
  const { scenes } = JSON.parse(await readFile(queriesPath, "utf8"));
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new Error("tools/pexels-queries.json não tem a lista 'scenes'.");
  }
  const seen = new Set();
  for (const entry of scenes) {
    for (const field of ["scene", "theme", "query", "queryEn"]) {
      if (!entry[field]) throw new Error(`Cena sem '${field}': ${JSON.stringify(entry)}`);
    }
    if (seen.has(entry.scene)) throw new Error(`Cena repetida: ${entry.scene}`);
    seen.add(entry.scene);
  }
  return scenes;
}

function selectScenes(scenes, args) {
  if (args.scene) {
    const found = scenes.filter((entry) => entry.scene === args.scene);
    if (found.length === 0) throw new Error(`Cena não encontrada: ${args.scene}`);
    return found;
  }
  if (args.only) return scenes.filter((entry) => entry.scene.startsWith(args.only));
  return scenes;
}

function apiKey() {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Defina PEXELS_API_KEY. Crie uma chave gratuita em https://www.pexels.com/api/ e rode, por exemplo:\n"
      + '  $env:PEXELS_API_KEY="sua-chave"; node tools/fetch-pexels.mjs --only house-',
    );
  }
  return key;
}

async function searchPhotos(entry, key, page) {
  const attempt = async (query, locale) => {
    const url = new URL(API);
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("size", "large");
    url.searchParams.set("locale", locale);
    url.searchParams.set("per_page", "24");
    url.searchParams.set("page", String(page));
    const response = await fetch(url, { headers: { Authorization: key } });
    if (response.status === 401) throw new Error("Chave do Pexels inválida (401).");
    if (response.status === 429) throw new Error("Limite de requisições do Pexels atingido (429).");
    if (!response.ok) throw new Error(`Pexels respondeu ${response.status} para "${query}".`);
    return response.json();
  };

  let data = await attempt(entry.query, "pt-BR");
  let locale = "pt-BR";
  if (data.photos.length === 0) {
    data = await attempt(entry.queryEn, "en-US");
    locale = "en-US";
  }
  if (data.photos.length === 0) {
    data = await attempt(entry.queryEn, "en-US");
    locale = "en-US";
  }
  return { photos: data.photos, locale, total: data.total_results };
}

function usable(photo) {
  return photo.width >= 1000 && photo.height >= 700 && photo.width > photo.height;
}

function candidateUrl(photo) {
  return photo.src.large2x || photo.src.large || photo.src.original;
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar imagem (${response.status}): ${url}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(path.join(candidatesDir, "manifest.json"), "utf8"));
  } catch {
    return { scenes: {} };
  }
}

async function writeContactSheet(manifest) {
  const cards = [];
  for (const [sceneId, info] of Object.entries(manifest.scenes)) {
    const options = info.options
      .map((option, index) => `
        <figure class="option">
          <img src="${escapeHtml(path.basename(option.file))}" alt="${escapeHtml(option.alt)}" loading="lazy">
          <figcaption>
            <strong>${index + 1}</strong> · ${option.width}x${option.height}
            ${option.alt ? `<br><span>${escapeHtml(option.alt)}</span>` : ""}
            <br><a href="${escapeHtml(option.page)}" target="_blank" rel="noopener">${escapeHtml(option.photographer)}</a>
          </figcaption>
        </figure>`)
      .join("");
    cards.push(`
      <section class="scene">
        <header>
          <h2>${escapeHtml(sceneId)}</h2>
          <p class="meta">${escapeHtml(info.theme)} · busca: "${escapeHtml(info.query)}" (${escapeHtml(info.locale)})</p>
          <p class="brief"><b>Precisa:</b> ${escapeHtml(info.mustShow)}<br><b>Não pode:</b> ${escapeHtml(info.mustNot)}</p>
          <p class="pick">Escolher: <code>node tools/fetch-pexels.mjs --pick ${escapeHtml(sceneId)} N</code></p>
        </header>
        <div class="options">${options || "<p>Nenhuma foto utilizável.</p>"}</div>
      </section>`);
  }

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Candidatas do Pexels — O que está acontecendo?</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 24px; font: 15px/1.5 system-ui, sans-serif; background: #f6f7f2; color: #24301c; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .intro { margin: 0 0 24px; max-width: 70ch; }
  .scene { background: #fff; border: 1px solid #dbe3cf; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
  .scene h2 { margin: 0; font-size: 18px; }
  .meta, .brief, .pick { margin: 4px 0; }
  .pick code { background: #eef3e4; padding: 2px 6px; border-radius: 4px; }
  .options { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin-top: 12px; }
  .option { margin: 0; border: 1px solid #e2e8d8; border-radius: 8px; overflow: hidden; background: #fbfcf8; }
  .option img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: #e7ecdd; }
  figcaption { padding: 8px; font-size: 13px; }
  figcaption span { color: #5a6650; }
  a { color: #3f6b2a; }
</style>
</head>
<body>
<h1>Candidatas do Pexels</h1>
<p class="intro">Fotos baixadas para as 25 cenas de <code>docs/IMAGE_LIST.md</code>. Confira "Precisa" e "Não pode" antes de escolher.
Ao escolher, o arquivo é copiado para o jogo e recortado em 4:3 pelo script de recorte. Créditos ficam em <code>docs/IMAGE_CREDITS.md</code>.</p>
${cards.join("\n")}
</body>
</html>`;

  await writeFile(path.join(candidatesDir, "index.html"), html);
}

async function writeCredits(picked) {
  const rows = Object.entries(picked)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([scene, info]) => `| \`${scene}.jpg\` | ${info.photographer} | [Pexels](${info.page}) |`)
    .join("\n");
  const doc = `# Créditos das fotos

Fotos obtidas pelo Pexels e armazenadas localmente. Crédito aos fotógrafos conforme as
[orientações da API do Pexels](https://www.pexels.com/api/documentation/).

| Arquivo | Fotógrafo | Origem |
|---|---|---|
${rows || "| — | — | — |"}
`;
  await writeFile(creditsDocPath, doc);
}

async function pick(sceneId, index) {
  if (!Number.isInteger(index) || index < 1) throw new Error("Informe o número da opção: --pick <cena> <n>.");
  const manifest = await readManifest();
  const info = manifest.scenes[sceneId];
  if (!info) throw new Error(`Nenhuma candidata baixada para ${sceneId}. Rode a busca primeiro.`);
  const option = info.options[index - 1];
  if (!option) throw new Error(`${sceneId} só tem ${info.options.length} opções.`);

  const target = path.join(finalDir, `${sceneId}.jpg`);
  await copyFile(path.join(candidatesDir, path.basename(option.file)), target);

  let picked = {};
  try {
    picked = JSON.parse(await readFile(creditsJsonPath, "utf8"));
  } catch {
    picked = {};
  }
  picked[sceneId] = {
    photographer: option.photographer,
    photographerUrl: option.photographerUrl,
    page: option.page,
  };
  await writeFile(creditsJsonPath, `${JSON.stringify(picked, null, 2)}\n`);
  await writeCredits(picked);

  console.log(`Escolhida: ${option.file} -> assets/images/image-interpretation/${sceneId}.jpg`);
  console.log(`Crédito: ${option.photographer} (${option.page})`);
  console.log(`Agora recorte: npm run images:crop -- -Scene ${sceneId}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const scenes = await loadQueries();
  if (args.check) {
    console.log(`OK: ${scenes.length} cenas, ids únicos.`);
    return;
  }
  if (args.pick) {
    await pick(args.pick, args.pickIndex);
    return;
  }

  const key = apiKey();
  const selected = selectScenes(scenes, args);
  await mkdir(candidatesDir, { recursive: true });
  const manifest = await readManifest();

  for (const [position, entry] of selected.entries()) {
    const prefix = `[${position + 1}/${selected.length}] ${entry.scene}`;
    try {
      const { photos, locale } = await searchPhotos(entry, key, args.page);
      const options = photos.filter(usable).slice(0, args.count);
      if (options.length === 0) {
        console.warn(`${prefix}: nenhuma foto horizontal utilizável.`);
        manifest.scenes[entry.scene] = { ...entry, locale, options: [] };
        continue;
      }

      const saved = [];
      for (const [index, photo] of options.entries()) {
        const file = path.join(candidatesDir, `${entry.scene}-${index + 1}.jpg`);
        const exists = await readFile(file).then(() => true, () => false);
        if (!exists || args.force) {
          await download(candidateUrl(photo), file);
        }
        saved.push({
          file,
          width: photo.width,
          height: photo.height,
          alt: photo.alt ?? "",
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          page: photo.url,
        });
      }

      manifest.scenes[entry.scene] = {
        theme: entry.theme,
        query: locale === "pt-BR" ? entry.query : entry.queryEn,
        locale,
        mustShow: entry.mustShow,
        mustNot: entry.mustNot,
        options: saved,
      };
      console.log(`${prefix}: ${saved.length} opções (${locale}).`);
      await sleep(250);
    } catch (error) {
      console.error(`${prefix}: ${error.message}`);
      process.exitCode = 1;
    }
  }

  await writeFile(path.join(candidatesDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeContactSheet(manifest);
  console.log(`\nFolha de contatos: assets/images/image-interpretation/candidates/index.html`);
  console.log(`Escolha com: node tools/fetch-pexels.mjs --pick <cena> <n>`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
