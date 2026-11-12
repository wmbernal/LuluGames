# Game: O que está acontecendo?

## Goal and flow

Practice visual interpretation, image-to-text association, reading, and everyday vocabulary. Each session uses the home setting of 3, 4, or 5 rounds. The player starts from an introduction, then sees one illustrated situation, the fixed question, and three text choices in a fixed order. Five original local SVG scenes provide one different image per round.

A correct answer is marked with a check and a soft success color, read aloud when sound and browser speech are available, and followed by **Próxima**. An incorrect answer receives a gentle message, a red outline and retry icon, and the optional error bell; the player may try as often as needed. After three incorrect attempts in a round a scene-specific textual clue appears. No attempt count is shown. The clue resets on the next round. The final screen offers replay or home. Leaving an unfinished session asks for confirmation.

## Data and accessibility

`games/image-interpretation/data.js` defines each scene's image, alternative text, hint, three labeled choices, and one correct option ID. Add scenes with clearly distinguishable images and alternatives. The pure `game.js` module handles validation, attempts, answers, and session progression; `session.js` connects settings and audio; `ui.js` renders the screen. The scene image has alternative text, the answer controls are keyboard-operable buttons, and feedback and hints use polite live regions. Error and success use icons and text as well as color. Sound is optional and follows global settings; the player can change sound and volume without leaving the session.

The explicit request for red incorrect-answer highlighting differs from the soft shared palette; this game uses a restrained local red with readable text instead of changing shared tokens or existing games.
