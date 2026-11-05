# Contexto

Você é um desenvolvedor front-end sênior. Vamos criar uma plataforma de jogos educativos simples, em HTML5 + CSS + JavaScript puro (sem frameworks e sem etapa de build), para uma criança de 10 anos que gosta de jogos temáticos de princesas e tem TEA (Transtorno do Espectro Autista). Os jogos devem apoiar o desenvolvimento dela (raciocínio contextual, sequenciamento, emoções), sem perder a graça.

Escopo inicial:
1. Uma **home page** de seleção de jogos (hoje com apenas um jogo, mas pronta para receber outros).
2. O jogo **"Vestir a Princesa"**: vestir a princesa de acordo com um cenário/contexto (ex.: "Está chovendo!").

Idioma da interface: português do Brasil. Código, nomes de arquivos e comentários: inglês.

# Etapa 1: Documentação (criar ANTES do código)

Crie estes arquivos e use-os como referência obrigatória em todo o código:

- `README.md`: visão geral, como rodar localmente, estrutura de pastas, como adicionar um novo jogo e como publicar no GitHub Pages.
- `docs/DESIGN_SYSTEM.md`: padrões visuais. Deve definir:
  - Paleta de cores (tons suaves, sem contrastes agressivos; incluir cores de texto com contraste mínimo WCAG AA).
  - Tipografia (fonte legível e grande, tamanhos base e escala).
  - Espaçamentos, raios de borda, sombras.
  - Tamanhos mínimos de alvo de toque (mínimo 48x48 px).
  - Estilos de botão (primário, secundário, desabilitado) e de cartão.
  - Regras de animação (suaves, curtas, sempre desativáveis).
  - Tudo isso expresso como variáveis CSS (`:root`) que o `docs` documenta e o código usa.
- `docs/UX_PRINCIPLES.md`: princípios de UX para crianças com TEA, que devem guiar toda decisão:
  - Previsibilidade: layout e posição de botões iguais em todas as telas; sem surpresas.
  - Nenhuma punição pelo erro: sem sons de erro, sem vermelho, sem perda de progresso; usar mensagens gentis e permitir tentar de novo.
  - Estímulos sensoriais controlados: som e animação opcionais, com volume e intensidade ajustáveis; respeitar `prefers-reduced-motion`.
  - Instruções curtas, com ícone e (opcionalmente) áudio.
  - Sessões curtas com fim claro ("mais 3 rodadas" e tela de encerramento).
  - Recompensa ligada ao tema (desbloquear peças novas), nunca pontos abstratos ou competição.
  - Navegação sempre com botão visível de "Voltar" e "Início".
- `docs/ARCHITECTURE.md`: estrutura de pastas, responsabilidade de cada módulo, convenções de nomes, como os dados (JSON/JS) são organizados e como adicionar um novo jogo ao catálogo.
- `docs/ACCESSIBILITY.md`: checklist (navegação por teclado, foco visível, `aria-label`, textos alternativos, contraste, alvos de toque, `lang="pt-BR"`).
- `docs/GAME_VESTIR_PRINCESA.md`: especificação do jogo (regras, fluxo, cenários, categorias de itens, critérios de acerto).
- `docs/CONTRIBUTING.md`: padrões de código (ES modules, nomes, comentários, sem variáveis globais, sem dependências externas).

# Etapa 2: Estrutura do projeto

Use esta estrutura (ajuste se houver bom motivo e documente em ARCHITECTURE.md):

```
/
├── index.html                 # Home: seleção de jogos
├── games/
│   └── dress-princess/
│       ├── index.html
│       ├── game.js            # lógica do jogo
│       ├── ui.js              # renderização/DOM
│       ├── data.js            # cenários, itens e regras (dados separados da lógica)
│       └── game.css
├── shared/
│   ├── css/
│   │   ├── tokens.css         # variáveis do design system
│   │   ├── base.css           # reset + estilos globais
│   │   └── components.css     # botões, cartões, modal, etc.
│   └── js/
│       ├── settings.js        # configurações (som, animações, rodadas por sessão)
│       ├── storage.js         # wrapper de localStorage com try/catch
│       ├── audio.js           # áudio (só toca após interação do usuário)
│       └── catalog.js         # catálogo de jogos exibidos na home
├── assets/
│   ├── images/
│   └── audio/
└── docs/
```