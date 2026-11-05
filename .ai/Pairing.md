# Contexto

Este repositório já contém uma plataforma de jogos educativos simples (HTML5 + CSS + JavaScript puro, ES modules, sem frameworks e sem build) para uma criança de 10 anos com TEA que gosta de temas de princesas. Já existem:

- Uma home page (`/index.html`) que lista os jogos a partir de `shared/js/catalog.js`.
- O jogo "Vestir a Princesa" em `games/dress-princess/`.
- Módulos e estilos compartilhados em `shared/` (tokens, base, componentes, settings, storage, audio, catalog).
- Documentação em `docs/` (DESIGN_SYSTEM, UX_PRINCIPLES, ARCHITECTURE, ACCESSIBILITY, CONTRIBUTING, etc.).

Sua tarefa: adicionar um **novo jogo de pareamento e memória** com tema de princesas, integrado ao projeto existente.

# Passo 0: Ler antes de escrever (obrigatório)

Antes de qualquer alteração, leia por completo:
1. Toda a pasta `docs/` (principalmente `DESIGN_SYSTEM.md`, `UX_PRINCIPLES.md`, `ARCHITECTURE.md`, `ACCESSIBILITY.md` e `CONTRIBUTING.md`).
2. `shared/` (CSS e JS) e `games/dress-princess/` para entender padrões, nomes e convenções já em uso.

Siga exatamente esses padrões. Não crie tokens, componentes ou utilitários que já existam; reutilize-os. Se faltar algo genérico e reutilizável, adicione em `shared/` e documente. **Não altere o comportamento do jogo "Vestir a Princesa"**.

Liste em poucas linhas o que você pretende criar e reutilizar, e então prossiga.

# O jogo: "Memória das Princesas"

Jogo de pares: virar cartas viradas para baixo e encontrar os pares.

## Modos de dificuldade e progressão

O jogo evolui por níveis, e a criança escolhe quando avançar (nunca avança sozinho para um nível mais difícil):

1. **Pares idênticos** (nível inicial): duas cartas com a mesma imagem (ex.: coroa com coroa).
2. **Pares por categoria/relação**: imagens diferentes que combinam (ex.: vestido com sapato de baile, batom com espelho, varinha com estrela).
3. **Preparar a estrutura para um terceiro modo futuro** (emoções: rosto com situação) sem implementá-lo agora. Apenas garanta que o modelo de dados suporte esse tipo de par, e documente.

Tamanhos de tabuleiro por nível de dificuldade: 3 pares (6 cartas), 4 pares (8), 6 pares (12), 8 pares (16). Começar em 3 pares. A criança escolhe o tamanho em uma tela de seleção simples e visual, e o jogo lembra a última escolha.

## Regras e fluxo

1. Tela inicial do jogo: escolher modo (idênticos / por categoria) e tamanho (3, 4, 6, 8 pares), com botão grande "Começar".
2. Tabuleiro com cartas em grade fixa e previsível, tamanho de carta grande (alvo de toque mínimo conforme o design system), sempre na mesma posição durante a partida.
3. Tocar em uma carta a vira (animação curta). Ao virar a segunda:
   - **Par correto:** as duas cartas ficam visíveis, com um destaque suave (borda ou brilho discreto), e opcionalmente um som curto e agradável.
   - **Par incorreto:** após um breve intervalo, as cartas desvirem suavemente. **Sem som de erro, sem vermelho, sem mensagem negativa, sem contagem de erros visível.**
4. Bloquear novas jogadas enquanto duas cartas incorretas estão sendo desviradas (evitar cliques múltiplos e estados inconsistentes).
5. Ao encontrar todos os pares: celebração suave (curta e desativável) e tela de fim clara ("Você encontrou todas as princesas e tesouros!") com botões "Jogar de novo" e "Início".
6. Sessão curta com fim claro: respeitar a configuração global de número de rodadas por sessão (a mesma usada no jogo de vestir). Após atingir o limite, mostrar tela de encerramento ("Terminamos por hoje!") e voltar ao início.
7. **Recompensa ligada ao tema:** ao concluir uma partida, desbloquear uma figurinha/peça temática (ex.: uma nova carta decorativa ou um novo verso de carta). Salvar via `shared/js/storage.js`. Se já existir um mecanismo de peças desbloqueadas do jogo de vestir, avalie reutilizá-lo (ex.: uma peça de roupa nova), sem criar acoplamento forte entre os jogos; documente a decisão.

## Ajudas (opcionais, configuráveis)

- **Espiadinha inicial:** opção para mostrar todas as cartas por alguns segundos antes de virá-las, com duração configurável (desligada por padrão).
- **Dica:** botão "Ajuda" que destaca suavemente uma carta de um par ainda não encontrado (sem penalidade).
- Não usar cronômetro, pontuação competitiva nem ranking. Sem contador de tentativas visível para a criança.

## Layout e UX

- Estrutura de tela fixa: título do jogo e botão "Voltar/Início" no topo (mesma posição do jogo anterior), tabuleiro no centro, controles no rodapé.
- Verso das cartas consistente (um único design por partida), frente com imagem grande e legível.
- Responsivo: celular (retrato e paisagem), tablet e desktop. A grade deve se adaptar, mantendo as cartas grandes e sem rolagem durante a partida sempre que possível.
- Seguir integralmente `UX_PRINCIPLES.md` (previsibilidade, sem punição, estímulos controlados, instruções curtas com ícone) e `DESIGN_SYSTEM.md` (apenas variáveis CSS e componentes existentes).
- Respeitar `prefers-reduced-motion` e as configurações globais de som e animação. Com animações desativadas, a carta deve alternar entre frente e verso de forma imediata, mas ainda clara.

## Acessibilidade

- Cartas como `<button>` com `aria-label` descritivo (ex.: "Carta virada para baixo" / "Coroa") e `aria-pressed`/estado equivalente; anunciar acertos via região `aria-live="polite"` (texto curto e positivo).
- Navegação completa por teclado (Tab/setas, Enter/Espaço), foco visível.
- Não depender apenas de cor para indicar estado (acerto também com ícone/borda diferente).
- Seguir `docs/ACCESSIBILITY.md`.

# Estrutura de arquivos

Crie, seguindo o padrão do jogo existente:

```
games/
└── memory-pairs/
    ├── index.html
    ├── game.js        # lógica pura (estado, embaralhar, comparar pares, fim de partida), sem acessar DOM
    ├── ui.js          # renderização e eventos do DOM
    ├── data.js        # pares e conjuntos de cartas por modo
    └── game.css       # apenas o que for específico deste jogo, usando tokens
docs/
└── GAME_MEMORY_PAIRS.md
```

Atualizações em arquivos existentes (mínimas e cirúrgicas):
- `shared/js/catalog.js`: adicionar o novo jogo ao catálogo (id, título "Memória das Princesas", descrição curta, ícone, caminho relativo).
- `README.md` e `docs/ARCHITECTURE.md`: mencionar o novo jogo e a estrutura.

# Modelo de dados (`data.js`)

Dados separados da lógica, extensíveis e independentes do modo:

```js
// Each card has a pairId; two cards with the same pairId form a pair.
export const modes = {
  identical: {
    label: "Iguais",
    pairs: [
      { pairId: "crown", cards: [{ image: "assets/images/memory/crown.svg", label: "Coroa" }] }
      // identical mode: the same card is rendered twice
    ]
  },
  category: {
    label: "Combinam",
    pairs: [
      {
        pairId: "dress-shoes",
        cards: [
          { image: "assets/images/memory/ball-gown.svg", label: "Vestido de baile" },
          { image: "assets/images/memory/glass-shoes.svg", label: "Sapato de cristal" }
        ]
      }
    ]
  }
};
```

Defina e documente em `GAME_MEMORY_PAIRS.md` como cada modo gera as cartas do tabuleiro a partir desses dados, e como adicionar um novo modo (ex.: emoções).

Conteúdo inicial: pelo menos 8 pares no modo "idênticos" e 8 pares no modo "categoria". Como ainda não há arte final, gere **SVGs simples e temporários** (formas limpas e fofas, mesmo `viewBox`, em `assets/images/memory/`), facilmente substituíveis depois (trocar o arquivo e, se necessário, o `data.js`).

# Requisitos técnicos

- Manter a arquitetura existente: ES modules, sem dependências externas, sem variáveis globais, caminhos relativos (compatível com GitHub Pages em subpasta).
- **Separar lógica e interface:** `game.js` deve ser puro e testável (embaralhamento Fisher-Yates, criação do tabuleiro, comparação de cartas, detecção de fim). Nenhuma lógica de jogo dentro de handlers de DOM.
- Máquina de estados simples e explícita (ex.: `idle → oneFlipped → checking → finished`) para evitar jogadas inválidas durante animações.
- Persistência via `shared/js/storage.js` (última configuração escolhida, recompensas), com tolerância a falha do localStorage.
- Áudio via `shared/js/audio.js`; sem erro se os arquivos de áudio não existirem.
- Incluir testes unitários simples da lógica (`game.js`) usando o executor nativo do Node (`node --test`), sem instalar dependências. Cobrir: embaralhamento mantém todas as cartas, comparação de par correto e incorreto, bloqueio durante verificação, detecção de fim de partida.
- Código limpo, funções pequenas, comentários apenas onde explicam o "porquê", seguindo `CONTRIBUTING.md` e `.editorconfig`.

# Entrega esperada

1. Documento `docs/GAME_MEMORY_PAIRS.md` (regras, modos, modelo de dados, como adicionar novos modos e pares, decisões tomadas).
2. Código do novo jogo funcionando, integrado à home e ao catálogo.
3. Testes da lógica executáveis com `node --test`.
4. Um resumo curto no final com: o que foi criado, o que foi alterado em arquivos existentes, como rodar e como testar, e decisões em aberto.

Em caso de dúvida, escolha a opção mais simples, consistente com os documentos existentes, e registre a decisão em `docs/ARCHITECTURE.md`.