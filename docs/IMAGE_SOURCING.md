# Fotos de O que está acontecendo?

As buscas das 25 cenas estão em `tools/pexels-queries.json` e os resultados
registrados do Pexels em `tools/pexels-results.json`. Cada resultado escolhido
inclui a página de origem, o endereço da imagem, o fotógrafo e as dimensões.
Os arquivos locais e suas origens estão em [IMAGE_CREDITS.md](IMAGE_CREDITS.md).

## Construir as imagens registradas

```powershell
npm run images:build -- --check
npm run images:build
npm run images:build -- --scene house-sweeping
npm run images:build -- --only park-
```

O script baixa as escolhas já registradas, solicita ao servidor um recorte
central de 1200×900, regrava-o localmente em JPEG de qualidade 85 usando
PowerShell no Windows e atualiza os créditos. Arquivos
existentes são preservados; use `--force` para baixá-los novamente. A busca e
o registro de novas escolhas ainda dependem do navegador: `images:build` não
faz buscas por conta própria.

As buscas registradas vieram do navegador, pois a chave da API não estava
disponível. A intenção foi usar a primeira imagem horizontal com pelo menos
1000 pixels de largura, sem selecionar candidatos por aparência. A busca não
garante que a cena corresponda às frases do jogo; o texto deve descrever o que
aparece na imagem e não pode exigir uma ação ou detalhe ausente.

## Caminho alternativo: API oficial

`npm run images:check` valida as buscas. `npm run images:fetch` usa a API oficial
com `PEXELS_API_KEY`, quando uma chave estiver disponível, e grava candidatas
em `assets/images/image-interpretation/candidates/`. O comando
`node tools/fetch-pexels.mjs --pick <cena> <número>` seleciona uma candidata;
`npm run images:crop -- -Scene <cena>` faz o recorte local em 4:3 e salva JPEG
com qualidade 85. Esse fluxo alternativo requer uma escolha explícita.
