# Game: O que eu digo?

## Goal and flow

Practice functional communication: asking for help, refusing politely, asking for a break, and handling small conflicts. The child sees one everyday situation, reads the question, and chooses what to say or do. There is no score, timer, locked level, or penalty.

1. The home menu opens `index.html` directly; there is no level or theme chooser.
2. Each round randomly selects five different questions from `content.json`. With exactly five questions, all five are used in random order.
3. The options are shuffled for every question, so the position never gives the answer away.
4. A wrong answer shows a gentle message and a retry mark. Progress is never lost, and a short clue appears after three attempts.
5. **Ouvir a pergunta** reads the current situation aloud on request before an answer is chosen. It reads only the displayed question and can be replayed.
6. A correct answer shows the selected option, gentle positive feedback, and **Próxima**. Do not add a written or spoken explanation after the answer.
7. When the correct option is a spoken phrase, **Treine a frase** appears as a separate, optional action and plays that phrase only when requested. There is no recording and no scoring for this step.
8. After question five, the shared completion sound and spoken congratulations play, with **Jogar de novo** and **Voltar ao menu**.
9. Leaving an unfinished round asks for confirmation.

## Content

`content.json` is the source of truth for the whole game. Each question has:

- `id`: unique kebab-case identifier.
- `category`: one of `pedir ajuda`, `recusar com educação`, `pedir pausa`, `lidar com conflito`. Categories are for organization and future filtering; they are not shown to the child in this version.
- `difficulty`: short tag such as `fácil` or `médio`.
- `image`: local path under `assets/images/what-do-i-say/`.
- `imageQuery`: the fixed Brazilian Portuguese search that produced the photo. Required, because `imageQueryRequired` is `true`.
- `alt`: what the photo actually shows, written without inferring relationships the photo does not establish.
- `question`: the situation prompt shown above the options.
- `options`: exactly three options. Speech options are written in the first person and inside quotation marks.
- `answer`: the `id` of the correct option.
- `practicePhrase`: the exact phrase played by **Treine a frase**. It must appear inside the correct option text.
- `hint`: optional gentle clue shown after three wrong attempts.

Adding or editing questions requires only JSON changes. The validator warns about a missing correct answer, the wrong number of options, a missing image query, an image query that looks English, an unknown category, and a practice phrase that does not appear in the correct option.

## Initial questions

| id | Category | `imageQuery` | Correct answer | Practice phrase |
|---|---|---|---|---|
| `pedir-ajuda-pacote` | pedir ajuda | criança tentando abrir embalagem de biscoito | "Você pode me ajudar a abrir, por favor?" | Você pode me ajudar a abrir, por favor? |
| `pedir-ajuda-mercado` | pedir ajuda | criança sozinha no corredor do supermercado | "Não estou vendo meu responsável. Pode me ajudar?" | Não estou vendo meu responsável. Pode me ajudar? |
| `conflito-brinquedo` | lidar com conflito | duas crianças disputando um brinquedo | "Você pode me devolver, por favor?" | Você pode me devolver, por favor? |
| `recusar-comida` | recusar com educação | criança recusando comida balançando a cabeça | "Não, obrigada, não quero." | Não, obrigada, não quero. |
| `pedir-pausa-barulho` | pedir pausa | criança tapando os ouvidos em lugar barulhento | "Preciso de uma pausa. Posso ir para um lugar mais calmo?" | Preciso de uma pausa. Posso ir para um lugar mais calmo? |

All five correct answers are spoken phrases, so all five offer **Treine a frase**. A future action-only answer can omit `practicePhrase`; the button then stays hidden.

## Content rules

- Write everything in simple, positive Brazilian Portuguese for a 10-year-old.
- Wrong options are realistic and calm. Never mock, shame, or punish the child for choosing them.
- Keep stressful situations gentle. For a child who cannot find their responsible adult, do not use scary words, images, or sounds; make it clear in the question who can help.
- Reinforce that saying no, asking for help, and asking for a break are good choices.
- Do not add explanations after an answer; keep success feedback brief and let the child request the exercise question again.
- The photo must match the situation. Do not describe details the photo does not show.
- Every Pexels query is in Brazilian Portuguese with the `pt-BR` locale. Never fall back to English: "criança tapando os ouvidos", never "child covering ears".

## Images

The fixed searches and selected photos are in `tools/what-do-i-say-queries.json` and `tools/what-do-i-say-results.json`. The local files live in `assets/images/what-do-i-say/`, with origin and authorship in [WHAT_DO_I_SAY_CREDITS.md](WHAT_DO_I_SAY_CREDITS.md). Use the shared Pexels builder:

```powershell
npm run images:what-do-i-say -- --check
npm run images:what-do-i-say
npm run images:what-do-i-say -- --scene pedir-ajuda-pacote
```

Only run those commands when the user asks for or authorizes new photos. The game itself never searches for or downloads images. The supermarket query is kept exactly as requested; its chosen photo shows a child alone in a bright shopping mall, which matches the "lost in a big store" situation without contradicting the question.

## Feedback, audio, and accessibility

Wrong answers use the same retry pattern as **O que está acontecendo?** and **Jogo das Emoções**: a gentle message, a retry mark, no lost progress, and a text clue after three mistakes. The existing `playMismatchSound`, `speakCardName`, and `celebrateCompletion` helpers honor the saved global sound preference. The written question remains available when speech is disabled or unavailable, with a message if the requested audio cannot play. Question audio stops when the child chooses an answer or changes questions. Practice phrases remain a separate optional action.

The layout reuses the neighboring game's panel, photo, option, completion, and leave-dialog styles. It uses the shared design tokens, large keyboard-operable buttons, meaningful photo alternatives, polite status regions, visible focus, and no color-only or sound-only feedback. The page keeps a calm pace: no timer, flashing, or surprise movement.
