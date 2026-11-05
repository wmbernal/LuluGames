# Etapa 3: Requisitos da Home (`/index.html`)

- Título amigável, cartões grandes de jogo gerados a partir de `shared/js/catalog.js` (cada item: id, título, descrição curta, ícone, caminho). Hoje só "Vestir a Princesa".
- Botão de configurações (engrenagem) abrindo painel com: som ligado/desligado, volume, animações ligadas/desligadas, número de rodadas por sessão (3, 4 ou 5).
- Layout estável e previsível, responsivo (celular, tablet, desktop).

# Etapa 4: Requisitos do jogo "Vestir a Princesa"

**Estrutura da tela (fixa e previsível):**
- Topo: texto do cenário (curto) + ícone + botão de ouvir (preparar a estrutura para áudio; se não houver arquivo, ocultar o botão).
- Centro: princesa montada em **camadas sobrepostas** (corpo, roupa, calçado, acessório, coroa), todas do mesmo tamanho e alinhadas com CSS.
- Lateral/baixo: bandeja de itens por categoria, sempre no mesmo lugar.
- Rodapé: botões "Pronto" e "Início".

**Interação:**
- Duas formas, ambas ativas: (a) arrastar o item até a princesa (Pointer Events, funciona com toque e mouse) e (b) tocar no item e depois tocar na princesa / tocar no item para equipar e tocar de novo para tirar.
- Um item por categoria por vez (trocar substitui o anterior).
- Suporte a teclado (Tab, Enter, Espaço) para equipar/remover.

**Regras e fluxo:**
1. Mostrar um cenário (ex.: chuva, baile, praia, escola, neve).
2. A criança escolhe livremente os itens e aperta "Pronto".
3. Validar usando os dados de `data.js`: cada cenário define itens adequados por categoria (aceitar mais de uma combinação válida; não exigir uma única resposta).
4. Se adequado: celebração suave (animação curta, desativável) e botão "Próximo".
5. Se não adequado: mensagem gentil ("Vamos tentar outra opção?"), sem som de erro, sem vermelho, sem perda das peças escolhidas; incluir uma dica visual opcional (destacar suavemente uma categoria).
6. Ao final do número de rodadas configurado: tela de encerramento clara ("Terminamos por hoje!") com uma peça nova desbloqueada (guardada em localStorage) e botão de voltar ao início.

**Dados (`data.js`):** estruturas simples e extensíveis, por exemplo:

```js
export const categories = ["dress", "shoes", "accessory", "crown"];
export const items = [
  { id: "raincoat", category: "accessory", label: "Capa de chuva", image: "assets/images/raincoat.svg", tags: ["rain"] },
  // ...
];
export const scenarios = [
  { id: "rain", text: "Está chovendo!", icon: "assets/images/icon-rain.svg", requiredTags: ["rain"] },
  // ...
];
```

Defina uma regra clara de validação baseada em `tags` (ex.: pelo menos um item com a tag exigida pelo cenário) e documente-a em `docs/GAME_VESTIR_PRINCESA.md`.

**Conteúdo inicial:**
- 4 cenários, cerca de 3 opções por categoria.
- Como não temos arte final, gere **imagens SVG simples e temporárias** (formas geométricas coloridas, estilo fofo e limpo), todas com o mesmo `viewBox`, para que as camadas se alinhem. Facilite a troca futura por arte definitiva (basta substituir os arquivos e atualizar `data.js`).

# Requisitos técnicos e boas práticas

- JavaScript com **ES modules** (`type="module"`), sem frameworks e sem bibliotecas externas, sem build.
- Separar claramente dados, lógica e renderização. Funções pequenas e com nomes claros. Sem variáveis globais.
- Usar **somente** as variáveis CSS do design system (nada de cores ou tamanhos "soltos" nos CSS dos jogos).
- Mobile-first, layout responsivo (flexbox/grid), `meta viewport`, orientação paisagem e retrato.
- Acessibilidade conforme `docs/ACCESSIBILITY.md`: foco visível, `aria-label`, `lang="pt-BR"`, respeitar `prefers-reduced-motion`.
- `storage.js` deve usar try/catch e funcionar mesmo se o localStorage estiver indisponível.
- Áudio só inicia após a primeira interação (botão "Começar" ou toque); tratar ausência de arquivos de áudio sem erro.
- Caminhos **relativos** em todo o projeto (compatível com GitHub Pages em subpasta).
- Comentários apenas onde agregam valor (por quê, não o quê). Código formatado consistentemente (incluir `.editorconfig`).
- Incluir `.gitignore` e um `package.json` mínimo apenas com script de servidor local, se necessário (ex.: `npx serve`), já que módulos ES não funcionam abrindo o arquivo direto (file://). Explicar no README como rodar (extensão Live Server do VS Code ou `npx serve`).

# Entrega esperada

1. Todos os arquivos da Etapa 1 (documentação) completos e coerentes entre si.
2. Todos os arquivos de código da Etapa 2, funcionando ao rodar localmente.
3. Ao final, um resumo curto com: como rodar, como adicionar um novo jogo ao catálogo e como adicionar novos itens e cenários.

Antes de escrever o código, confirme o plano de arquivos em uma lista curta e prossiga. Se houver ambiguidade, escolha a opção mais simples e registre a decisão em `docs/ARCHITECTURE.md`.