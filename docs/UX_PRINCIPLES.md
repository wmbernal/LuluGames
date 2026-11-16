# UX principles

These principles guide every screen, interaction, and game mechanic.

- **Predictability:** Keep layout and the position of recurring controls consistent. Explain what happens before an action; avoid surprise content or timed interactions.
- **Supportive feedback for mistakes:** Provide a gentle, distinct error sound when sound is enabled, alongside clear visual or text feedback. Never use punitive feedback or remove progress; use gentle language and always allow another try.
- **Brief answer feedback:** For new or revised exercises, keep post-answer feedback concise and supportive. Do not add a separate explanatory paragraph or automatically speak an explanation after the answer; when useful, let the child request the prompt before answering.
- **Controlled sensory input:** Sound and animation are optional. Provide an in-app volume control and animation toggle, and honor `prefers-reduced-motion`.
- **Short instructions:** Use brief, concrete Portuguese instructions with a familiar icon. Audio instructions may be offered, but never required.
- **Short sessions with a clear end:** The default session lasts three rounds. Show the remaining rounds and a clear completion screen with a choice to play again or return home.
- **Thematic rewards:** Rewards may unlock themed clothing or accessories. Do not use abstract scores, rankings, or competition.
- **Clear navigation:** Keep visible **Voltar** and **Início** navigation on game screens. Confirm before abandoning an unfinished session when progress would otherwise be lost.
- **Choice and calm:** Offer a small, manageable set of options at once. Do not add timers, flashing effects, or startling audio.
- **Efficient use of the screen:** Avoid excessive empty space above and below exercise content. Aim to fit the complete exercise and primary actions within one viewport without scrolling; reduce decorative and header spacing first, and consider placing the header beside the exercise when helpful. Never hide essential content or controls just to force a fit. Check mobile layouts at an iPhone 14 viewport (390×844 CSS pixels in portrait), in landscape, and at browser zoom; keep all controls usable and prevent horizontal overflow.
- **Orientation suggestion:** New games show the shared, optional **Vire na horizontal** dialog on entry to a portrait viewport up to 1024 CSS pixels wide, regardless of pointer type. Let the player choose **Continuar assim**, and close it automatically when the viewport turns landscape. Show it once when moving from a theme or level chooser to its game, but also support direct game entry. Never require rotation to play or reopen the suggestion during the same page visit.

## Applying these principles

The home settings panel was intentionally removed. Saved global sound, volume, and animation preferences are still honored, but general controls are not currently available from the home page; do not describe them as user-adjustable until an alternative entry point is added.

Read [GAME_VESTIR_PRINCESA.md](GAME_VESTIR_PRINCESA.md) for the current game's flow, and [ACCESSIBILITY.md](ACCESSIBILITY.md) before considering a screen complete.
