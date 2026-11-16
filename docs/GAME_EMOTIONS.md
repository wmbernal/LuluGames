# Game: Jogo das Emoções

## Goal and flow

Practice noticing facial cues, gestures, and body posture, and connecting familiar situations with possible feelings. The game has no score, timer, locked level, or penalty.

1. The level chooser (`levels.html`) offers four independent activities, shown as shared Home-style tiles with the Lulu Games logo and the **Escolha um nível** heading in a compact row inside the panel.
2. Each level randomly selects five different questions from `content.json`.
3. The player chooses an answer. Mistakes can be retried without losing progress; a gentle clue appears after three incorrect attempts.
4. A correct answer shows a short explanation and offers **Ouvir de novo** and **Próxima**. The explanation is spoken automatically unless the level sets `speakExplanation: false`.
5. After question five, the shared completion sound and spoken congratulations play, with **Jogar de novo** and **Voltar ao menu**.
6. Leaving an unfinished round asks for confirmation.

## Levels and content

`content.json` is the source of truth for levels and questions:

- **Combinar o rosto:** one face and two face-photo options; exactly one option shows the same emotion.
- **Qual é a emoção?:** one face and three text options. Every emotion word is paired with an emoji.
- **Situação e emoção:** one everyday situation and three text options describing feelings.
- **Detetive de Gestos:** one photo of a gesture or posture and three text options. `shuffleOptions: true` shows those options in a different order each round, so the position never gives the answer away.

Each question has a unique `id`, its `level`, a local image path and alt text, an `answer` that matches exactly one option, an explanation, a difficulty tag, and optional question-specific hint. A question may also set its own `question` text; otherwise the level question is used. Add questions by editing JSON only. Keep the Pexels search and selected-photo records in `tools/emotions-queries.json` and `tools/emotions-results.json`; run `npm run images:emotions` to download and crop the selected local assets, and `npm run images:emotions -- --check` to validate the records. Only run those image commands when the user asks for or authorizes new photos; never during play, tests, or reviews.

**Detetive de Gestos** sets `imageQueryRequired: true`, so every question must keep an `imageQuery` describing the photo it expects. It also sets `speakExplanation: false`: the explanation appears on screen without being spoken automatically, and **Ouvir de novo** stays available for anyone who wants to hear it. Write that query in Brazilian Portuguese, the same rule used for the Pexels search: "dedo nos lábios", never "finger on lips". The validator warns when a query looks English, when it is missing, and when a question has the wrong number of options. The tests additionally check image files, option counts, level counts, and that each level supports five distinct questions per round. When the round has exactly five questions, all five are used, still in random order.

Gestures are taught as clues, not certainties:

- Explain what to look at: hands, face, body posture, and what is happening around the person.
- Never ask for or encourage eye contact. Eyes are one clue among others, never a requirement.
- Ambiguous gestures say so. Crossed arms can mean discomfort, but also cold or tiredness, so the explanation teaches checking the face and the situation too.
- Prefer clear photos: one person, the gesture visible, a plain background, and no text or logos.

A question may set `placeholder: true` when no suitable photo exists yet; the image is then a local neutral SVG. The "vem cá" question uses `gesture-vem-ca.svg` until a real photo is chosen. Do not search for a replacement without an explicit request.

## Detetive de Gestos: question review

The five starting questions, with the image search that produced the photo and the correct answer. Use this table to check each photo against its question before changing the level.

| id | Image file | `imageQuery` | Correct answer |
|---|---|---|---|
| `gesture-silencio` | `gesture-silencio.jpg` | pessoa com dedo nos lábios pedindo silêncio | Faça silêncio |
| `gesture-joinha` | `gesture-joinha.jpg` | homem mostrando polegar para cima | Está tudo bem / Gostei |
| `gesture-vem-ca` | `gesture-vem-ca.svg` (placeholder) | pessoa chamando com a mão venha cá | Para eu chegar perto |
| `gesture-ombros` | `gesture-ombros.jpg` | pessoa dando de ombros | Eu não sei |
| `gesture-bracos-cruzados` | `gesture-bracos-cruzados.jpg` | homem de braços cruzados fundo branco | Chateada ou incomodada |

Only `gesture-bracos-cruzados` is marked `ambiguous: true`; its explanation states that crossed arms can also mean cold or tiredness.

## Feedback, audio, and accessibility

Wrong answers use the same retry pattern as **O que está acontecendo?**: a gentle message, a retry mark and restrained outline, no lost progress, and a text clue after three mistakes. The existing `playMismatchSound`, `speakCardName`, and `celebrateCompletion` helpers honor the saved global sound preference. Explanations remain visible if speech is disabled or unavailable. The home settings panel was intentionally removed, so global sound and volume preferences remain active but are not currently configurable there.

The layout uses the shared design tokens, large keyboard-operable buttons, meaningful photo alternatives, polite status regions, visible focus, and the same unfinished-session confirmation dialog as the neighboring game. Do not rely on color or sound alone. Keep screens calm: no timer, flashing, or surprise movement.

## Current state

The initial face vocabulary is **feliz**, **triste**, **com raiva**, and **com medo**. The situation level uses concrete events and may introduce other words such as **cansado**. Add later face vocabulary (surpreso, cansado, envergonhado, orgulhoso) as clearly represented questions in the JSON when the photo choices are ready.
