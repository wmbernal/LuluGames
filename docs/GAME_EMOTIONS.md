# Game: Jogo das Emoções

## Goal and flow

Practice noticing facial cues and connecting familiar situations with possible feelings. The game has no score, timer, locked level, or penalty.

1. The level chooser (`levels.html`) offers three independent activities.
2. Each level randomly selects five different questions from `content.json`.
3. The player chooses an answer. Mistakes can be retried without losing progress; a gentle clue appears after three incorrect attempts.
4. A correct answer shows a short explanation, speaks it using the shared optional Brazilian Portuguese voice, and offers **Ouvir de novo** and **Próxima**.
5. After question five, the shared completion sound and spoken congratulations play, with **Jogar de novo** and **Voltar ao menu**.
6. Leaving an unfinished round asks for confirmation.

## Levels and content

`content.json` is the source of truth for levels and questions:

- **Combinar o rosto:** one face and two face-photo options; exactly one option shows the same emotion.
- **Qual é a emoção?:** one face and three text options. Every emotion word is paired with an emoji.
- **Situação e emoção:** one everyday situation and three text options describing feelings.

Each question has a unique `id`, its `level`, a local image path and alt text, an `answer` that matches exactly one option, an explanation, a difficulty tag, and optional question-specific hint. Add questions by editing JSON only. Keep the Pexels search and selected-photo records in `tools/emotions-queries.json` and `tools/emotions-results.json`; run `npm run images:emotions` to download and crop the selected local assets, and `npm run images:emotions -- --check` to validate the records.

The content validator reports questions with missing explanations or answers that are not among their options. The tests additionally check image files, option counts, level counts, and that each level supports five distinct questions per round.

## Feedback, audio, and accessibility

Wrong answers use the same retry pattern as **O que está acontecendo?**: a gentle message, a retry mark and restrained outline, no lost progress, and a text clue after three mistakes. The existing `playMismatchSound`, `speakCardName`, and `celebrateCompletion` helpers honor the saved global sound preference. Explanations remain visible if speech is disabled or unavailable. The home settings panel was intentionally removed, so global sound and volume preferences remain active but are not currently configurable there.

The layout uses the shared design tokens, large keyboard-operable buttons, meaningful photo alternatives, polite status regions, visible focus, and the same unfinished-session confirmation dialog as the neighboring game. Do not rely on color or sound alone. Keep screens calm: no timer, flashing, or surprise movement.

## Current state

The initial face vocabulary is **feliz**, **triste**, **com raiva**, and **com medo**. The situation level uses concrete events and may introduce other words such as **cansado**. Add later face vocabulary (surpreso, cansado, envergonhado, orgulhoso) as clearly represented questions in the JSON when the photo choices are ready.
