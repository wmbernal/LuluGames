# Fotos de O que está acontecendo?

As buscas das 25 cenas estão em `tools/pexels-queries.json` e os resultados
escolhidos em `tools/pexels-results.json`. Cada resultado registra a página da
foto, o endereço da imagem, a proporção, o autor e o texto alternativo. Os
arquivos locais e suas origens estão em [IMAGE_CREDITS.md](IMAGE_CREDITS.md).

## Como as fotos foram escolhidas

A emissão de chaves da API do Pexels estava pausada, então a busca foi feita em
um navegador real: o Cloudflare bloqueia `curl`, `fetch` do Node e navegadores
headless, mas uma aba normal consegue carregar a busca e as páginas das fotos.

Para cada cena, a busca abre
`https://www.pexels.com/pt-br/procurar/<consulta>/`, usando
`?orientation=landscape` quando necessário. A escolha é o primeiro resultado
horizontal com pelo menos 1000 px de largura, sem triagem visual. Quando a
consulta genérica trazia uma cena ambígua, o texto alternativo foi usado apenas
para filtrar palavras-chave (por exemplo, "cortando" para o bolo e "andando"
para a bicicleta). O autor é lido no `og:title` da página da foto
("Foto de X no Pexels").

## Construir as imagens registradas

```powershell
npm run images:build -- --check
npm run images:build
npm run images:build -- --scene house-sweeping
npm run images:build -- --only park-
```

O script baixa as escolhas já registradas e pede ao CDN do Pexels um recorte
central de 1200×900 (`fit=crop&w=1200&h=900&fm=jpg`), portanto as imagens já
saem em 4:3 sem recorte local. Ele valida o JSON, grava os JPGs em
`assets/images/image-interpretation/` e atualiza os créditos. Arquivos
existentes são preservados; use `--force` para baixá-los novamente. O comando
não faz buscas por conta própria.

A busca não garante que a cena corresponda às frases do jogo; o texto deve
descrever o que aparece na imagem e não pode exigir uma ação ou detalhe ausente.

## Jogo das Emoções

As buscas fixas e os resultados escolhidos para as 22 imagens estão em
`tools/emotions-queries.json` e `tools/emotions-results.json`. As fotos usadas
pelas perguntas ficam em `assets/images/emotions/`, com origem e autoria em
[EMOTION_CREDITS.md](EMOTION_CREDITS.md). O mesmo construtor do Pexels valida
os registros e baixa os recortes locais:

```powershell
npm run images:emotions -- --check
npm run images:emotions
npm run images:emotions -- --scene face-feliz-1
```

O conteúdo dos níveis aponta apenas para os arquivos locais; não procure fotos
durante o jogo. Confira cada foto contra o texto alternativo e a emoção antes de
adicionar novas perguntas a `games/emotions/content.json`.

## Caminho alternativo: API oficial

`tools/fetch-pexels.mjs` continua no repositório para quando uma chave estiver
disponível. `npm run images:check` valida as buscas e `npm run images:fetch`
usa a API oficial com `PEXELS_API_KEY`, gravando candidatas em
`assets/images/image-interpretation/candidates/` (ignorado pelo Git). O comando
`node tools/fetch-pexels.mjs --pick <cena> <número>` seleciona uma candidata e
`npm run images:crop -- -Scene <cena>` faz o recorte local em 4:3. Esse fluxo
alternativo requer uma escolha explícita e não é usado pelo build atual.
