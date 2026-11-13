# Jogo: Coloque em Ordem

## Objetivo e fluxo

Praticar a leitura e a ordem das palavras em frases simples de português
brasileiro, relacionando cada frase a uma imagem. O jogo não tem pontuação,
cronômetro ou penalidade.

1. A tela `levels.html` oferece três níveis independentes: 3, 4 ou 5 palavras.
2. Cada rodada escolhe cinco perguntas diferentes do nível selecionado.
3. Uma foto de contexto fica visível enquanto a criança monta uma frase com as
   palavras embaralhadas. Ela pode arrastar uma palavra para qualquer espaço
   vazio ou tocar nela para preencher o próximo espaço, da esquerda para a
   direita. A palavra é conferida assim que é colocada.
4. Uma palavra fora de lugar volta imediatamente à lista. A tentativa é
   ilimitada e não desfaz palavras corretas, que ficam bloqueadas no espaço.
5. Cada palavra é lida em voz alta quando escolhida. Ao completar a frase
   corretamente, o jogo confirma o acerto e lê a frase inteira uma vez; também
   oferece **Ouvir frase completa** e **Próxima**, sem explicação adicional. A
   voz e os sons usam os controles globais de áudio e podem ficar desligados.
6. Depois da quinta pergunta, o jogo celebra a rodada e oferece **Jogar de
   novo** e **Voltar ao menu**. Sair antes do fim pede confirmação.

## Níveis e conteúdo

`games/put-in-order/content.json` é a fonte de verdade. Cada nível define
`wordCount` (3, 4 ou 5), `questionsPerRound` e suas perguntas. Cada pergunta
define `sentence`, `words` como os tokens individuais exatamente na ordem da
frase, `difficulty`, `imageId`, `imageQuery`, caminho local `image` e texto
alternativo. `alternativeOrders` é opcional e aceita outras ordens completas
apenas quando mais de uma frase for realmente válida.

O validador avisa quando a quantidade de palavras não corresponde ao nível, a
frase não corresponde aos tokens, há tokens repetidos, falta imagem, ou uma
ordem alternativa é inválida. Os testes verificam ainda as quantidades mínimas
de perguntas, a consulta Pexels e os caminhos locais. Para adicionar frases,
atualize o JSON; não é necessário alterar a lógica do jogo.

As fotos atuais são imagens locais do Pexels já obtidas pelo projeto e usadas
em outros jogos. `imageId` e `imageQuery` guardam a referência para revisão.
Toda busca nova deve usar uma consulta fixa em português brasileiro e a
localidade `pt-BR`, sem fallback de idioma.
Os arquivos e créditos estão em `assets/images/image-interpretation/`,
`assets/images/emotions/`, `docs/IMAGE_CREDITS.md` e
`docs/EMOTION_CREDITS.md`. Para incluir uma foto nova, use o fluxo registrado
em `docs/IMAGE_SOURCING.md`, sem carregar imagens remotamente durante o jogo.

## Feedback e acessibilidade

Uma tentativa errada recebe destaque vermelho, mensagem gentil e o som de erro
já compartilhado; a palavra volta à lista e a criança pode tentar novamente.
Uma palavra correta fica verde e bloqueada no espaço. Erro e acerto também são
anunciados por texto e não dependem apenas de cor ou som. A frase completa fica
visível mesmo quando a voz está desligada ou indisponível.

Os botões das palavras funcionam com teclado, mouse e toque; o arraste por
ponteiro também funciona com mouse e toque. A tela usa tokens compartilhados,
alvos de pelo menos 48 px, foco visível, região de status e movimento reduzido
respeitado. Não há animação de erro, cronômetro ou limite de tentativas.

## Lista de perguntas

As palavras abaixo aparecem na ordem correta e formam a frase mostrada ao
completar cada pergunta. As consultas são referências curadas em português
brasileiro; os identificadores apontam para as fotos Pexels locais existentes.

| Nível | Identificador da foto · consulta Pexels | Frase |
|---|---|---|
| 1 · 3 palavras | `house-brushing-teeth` · criança escovando os dentes banheiro | A pasta espuma. |
| 1 · 3 palavras | `school-painting` · criança pintando com pincel e tinta | As pessoas pintam. |
| 1 · 3 palavras | `park-bench-reading` · mulher lendo livro no banco do parque | Ela lê sentada. |
| 1 · 3 palavras | `food-orange-juice` · espremendo laranja no espremedor de suco | O suco escorre. |
| 1 · 3 palavras | `food-bread-butter` · passando manteiga no pão com faca | Alguém espalha manteiga. |
| 1 · 3 palavras | `park-sand-castle` · criança enchendo balde de areia com pá | O balde enche. |
| 1 · 3 palavras | `transport-bus-boarding` · mulher entrando no ônibus | O passageiro embarca. |
| 1 · 3 palavras | `transport-bike-riding` · menino andando de bicicleta | O menino pedala. |
| 1 · 3 palavras | `sit-sorvete` · criança com sorvete | Alguém toma sorvete. |
| 1 · 3 palavras | `sit-brinquedo` · criança brincando com dinossauro de brinquedo | A criança brinca. |
| 1 · 3 palavras | `park-kite-flying` · menino soltando pipa no parque | A pipa voa. |
| 1 · 3 palavras | `sit-presente` · criança abrindo presente | Abriu o presente. |
| 2 · 4 palavras | `house-brushing-teeth` · criança escovando os dentes banheiro | Alguém escova os dentes. |
| 2 · 4 palavras | `house-watering-plants` · criança regando planta no vaso | A criança borrifa folhas. |
| 2 · 4 palavras | `house-washing-dishes` · pessoa lavando louça na pia | A pessoa lava louça. |
| 2 · 4 palavras | `house-sweeping` · pessoa varrendo o chão com vassoura | Alguém junta a sujeira. |
| 2 · 4 palavras | `food-soup-stirring` · menino mexendo sopa na panela | A panela tem sopa. |
| 2 · 4 palavras | `food-cake-cutting` · mulher cortando bolo com faca | O bolo é cortado. |
| 2 · 4 palavras | `school-writing` · criança escrevendo no caderno com lápis | Alguém escreve a lápis. |
| 2 · 4 palavras | `school-raising-hand` · criança levantando a mão na sala de aula | Alguém ergue o braço. |
| 2 · 4 palavras | `school-eating-apple` · menino comendo maçã no pátio | A maçã está mordida. |
| 2 · 4 palavras | `park-flower-watering` · menina regando flores com regador | Ela rega as flores. |
| 2 · 4 palavras | `food-pizza-oven` · cozinheiro colocando pizza no forno | A pizza é assada. |
| 2 · 4 palavras | `park-swing-pushing` · pai empurrando filho no balanço | A criança está sentada. |
| 3 · 5 palavras | `house-brushing-teeth` · criança escovando os dentes banheiro | A criança escova os dentes. |
| 3 · 5 palavras | `house-washing-dishes` · pessoa lavando louça na pia | A pessoa enxágua o prato. |
| 3 · 5 palavras | `food-soup-stirring` · menino mexendo sopa na panela | A criança mexe sua sopa. |
| 3 · 5 palavras | `food-orange-juice` · espremendo laranja no espremedor de suco | O espremedor recebe a laranja. |
| 3 · 5 palavras | `food-pizza-oven` · cozinheiro colocando pizza no forno | A pizza entra no forno. |
| 3 · 5 palavras | `transport-bus-boarding` · mulher entrando no ônibus | O passageiro entra no ônibus. |
| 3 · 5 palavras | `transport-bike-riding` · menino andando de bicicleta | O menino pedala a bicicleta. |
| 3 · 5 palavras | `school-painting` · criança pintando com pincel e tinta | As pessoas pintam o papel. |
| 3 · 5 palavras | `park-sand-castle` · criança enchendo balde de areia com pá | A criança enche o balde. |
| 3 · 5 palavras | `park-flower-watering` · menina regando flores com regador | A menina rega as flores. |
