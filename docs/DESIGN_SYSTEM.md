# Design system

The interface uses the CSS custom properties in `shared/css/tokens.css`; components must consume these tokens rather than introduce unrelated visual values. Meadow green gives Lulu Games its playful character, while warm gold and dark lettering reflect the Atypicaland hosting brand. The palette is intentionally soft while text and interactive controls retain readable contrast.

## Color and contrast

| Token | Value | Use |
|---|---|---|
| `--color-page` | `#B7E88B` | Meadow-green page background |
| `--color-surface` | `#FFFDF3` | Warm cards and controls |
| `--color-surface-soft` | `#EAF5DC` | Gentle emphasis |
| `--color-text` | `#263D27` | Main text |
| `--color-text-muted` | `#465B3C` | Supporting text |
| `--color-primary` | `#285C33` | Dark green text and emphasis |
| `--color-primary-hover` | `#1D4828` | Dark green hover |
| `--color-on-primary` | `#FFFFFF` | Text on dark green |
| `--color-accent` | `#F2BB56` | Warm gold primary buttons |
| `--color-accent-hover` | `#EAA94C` | Primary button hover |
| `--color-on-accent` | `#3B260D` | Primary button text |
| `--color-secondary` | `#F9E48B` | Sunny secondary controls |
| `--color-on-secondary` | `#263D27` | Secondary button text |
| `--color-border` | `#638752` | Borders |
| `--color-focus` | `#175C70` | Focus ring |
| `--color-success` | `#25533A` | Positive feedback text |
| `--color-success-soft` | `#E9F4DC` | Positive feedback background |
| `--color-success-border` | `#8CB779` | Positive feedback border |
| `--color-error` | `#842D38` | Gentle retry feedback text |
| `--color-error-soft` | `#FFF1F1` | Gentle retry feedback background |
| `--color-error-border` | `#B94A54` | Gentle retry feedback border |
| `--color-stage` | `#EDF5DD` | Princess stage background |
| `--color-feedback-soft` | `#F5F7E9` | Neutral feedback background |
| `--color-focus-soft` | `#E0F3EA` | Selected item background |
| `--color-highlight-soft` | `#FFF4C7` | Gentle hint background |
| `--color-highlight-border` | `#B59442` | Gentle hint border |
| `--color-backdrop` | `rgb(38 61 39 / 38%)` | Modal backdrop |
| `--color-theme-*` | translucent rose, apricot, lavender, blue, peach, green and periwinkle, each with `-border` and `-strong` shades | Theme/level selection tiles |

Primary and secondary button text must remain legible against their backgrounds. Do not rely on color alone to communicate a state.

Footer navigation (Início, Níveis, Temas) uses translucent colored pills: green for back/level actions and gold for Início, with a light border, a dashed inner ring, a small corner sparkle and a soft grounded shadow. Keep the tint and the playful details subtle; the label remains the primary cue.

## Typography

Use Nunito, a rounded and readable font, for the interface and games, with Trebuchet MS and system sans-serif fallbacks. Headings, buttons and the brand use Fredoka (`--font-display`), a rounder display face that gives the interface a friendlier, toy-like character. Both variable fonts are hosted locally under `assets/fonts/` with their SIL Open Font License, so they work without a remote font service. Base text is 18px; the scale is 14px, 16px, 18px, 24px, 32px, and 40px. Body line height is 1.5, headings use 1.15. Avoid long blocks of all-caps text; short uppercase eyebrows are acceptable.

## Spacing, shape, and elevation

Spacing uses a 4px base scale: 4, 8, 12, 16, 24, 32, and 48px. Cards use a 24px radius; controls use a 16px radius; pill labels use a fully rounded radius. Shadows are subtle and grounded, with no flashing or high-contrast decoration. Component sizing, layout widths, border widths, and selected-state shadows are also tokens so game styles do not introduce independent visual values.

## Photo backdrop and glass panels

The home page and every game/theme page share one full-screen photograph: Pexels photo 8709295 by Polina. Both use `assets/images/ui/home-bg-top.jpg` at full clarity — no blur filter and no scaling offset — with the same 20% cream veil, so inner pages match the home backdrop exactly. The taller `assets/images/ui/home-bg.jpg` crop is kept for future use but is not referenced. The cream Lulu Games logo pill is a shared component in `shared/css/brand.css` (`.brand-logo`); the home, the selection pages and the landscape game panels reuse it. The backdrop is decorative and never carries information.

Cards use a warm surface, a light border and a soft grounded shadow. Selection tiles and game cards may lift gently on hover; selected, correct and matched states keep their stronger focus/success colors. All movement is decorative and disabled when motion is reduced. Game screens have no top header. Selection pages keep one compact header row inside the cream panel: the shared logo on the left and the short heading beside it, with no eyebrow or instruction paragraph. In landscape game screens with an empty top-left corner the logo becomes a compact pill inside the panel; it always links home and never covers content. Game pages keep all navigation in the footer (Voltar/Temas + Início) to give the game the full viewport. Footer navigation uses translucent token-based colors, a dashed inner ring and a small sparkle, with visible Portuguese labels so color is never the only cue.

The selection pages use the same pastel token per tile (`--color-theme-*`) with matching `-border` and `-strong` shades. Keep the tint on hover and focus; only the border and focus ring change to the tile's own saturated shade, never to a shared dark blue. Color supplements the icon and label rather than identifying a choice on its own.

The home menu and the in-game theme/level pickers share one selection pattern from `shared/css/components.css`: large square, fully clickable tiles in a wrapping grid. Each tile combines a recognizable icon, a distinct soft token color and a one-to-three-word Portuguese label, without descriptions. Keep full accessible names (label, description and count) when the visible label is abbreviated. The grid wraps and scrolls vertically when necessary, including at high zoom or in short windows.

On playing screens, show the game name in the compact green round-status pill instead of a separate large title panel. Retain a semantic page heading for assistive technology; theme and level selection screens keep their own headings.

## Selection tiles

The home menu and the in-game theme/level pickers use the same component from `shared/css/components.css` (`.selection-panel`, `.selection-header`, `.selection-grid`, `.selection-tile`). The selection header is a compact row inside the panel — shared logo plus the single heading, separated from the tiles by a light dashed rule — not a separate card above the panel. Do not create a separate picker style.

- Tiles are large, square and fully clickable, with one big icon and a one-to-three-word Portuguese label. Descriptions and counts are not shown; keep them in the link's accessible name.
- Each tile sets `--tile-color` from a soft palette token, `--tile-border` for its resting border and `--tile-border-strong` for hover and focus. Use the matching `--color-theme-*-border` and `--color-theme-*-strong` tokens; never use a fixed blue focus color for every tile.
- Hover and focus change only the border and focus ring to the tile's own darker, more saturated shade, keeping the tile color. The 3px focus ring must stay visible against the panel.
- Keep the 48×48px minimum target even when the grid is compact. The grid wraps and scrolls vertically when necessary.

## Logo placement

The shared logo lives in `shared/css/brand.css` and always links to the home page.

- Home: `.brand-logo` inside `.home-header`.
- Selection pages: `.brand-logo` inside the panel's `.selection-header` row, beside the single short heading and vertically centred. Keep the row compact; there is no eyebrow or instruction paragraph. On phones the wordmark may hide but the icon stays.
- Game screens in landscape: `.brand-logo--compact` inside the game panel's empty top-left corner, absolutely positioned so it never pushes or covers content. The compact pill keeps a 44px-tall target and shows the wordmark from 900px wide. It is hidden in portrait and wherever the top-left band is occupied: O que eu digo? in its compressed short-landscape layout (its status pill and picture fill the corner) and Jogo dos Pares below 600px wide landscape (its round pill reaches the left edge).

## Layout and screen space

The main content of every screen must use the available viewport, on any orientation:

- Center the primary panel both vertically and horizontally on phones; do not pin menus to the bottom or leave a large empty band on one side. On wide desktop windows an anchored composition may be used, but phones always get a centered layout.
- Fill leftover space with the decorative backdrop, not with dead layout space. The backdrop may be cropped, scaled, or repositioned per breakpoint, but it never carries information.
- Test both orientations. Reduce decorative spacing before shrinking controls. Aim to fit primary game actions on a phone, but allow vertical scrolling for the home grid and whenever content or zoom requires it; never hide essential controls to force a fit.
- Never cause horizontal scrolling; check that `scrollWidth` matches the viewport at every breakpoint.
- Keep interactive targets at least 48×48px even in compact variants, and keep the same order and grouping across orientations so the layout stays predictable.

## Targets and components

Every interactive target is at least 48×48px. Primary buttons use the gold accent with dark text; secondary buttons use the yellow palette on the home page and a translucent cream surface with a green border on game pages. Disabled controls remain visibly disabled and cannot be activated. Cards use a warm surface, a soft border, generous padding, and a clear heading. Shared interface icons are local SVGs under `assets/images/ui/`; game-specific pictures remain separate.

## Motion

Transitions are short (up to 180ms), gentle, and never required to understand an action. Respect `prefers-reduced-motion` and the in-app animation setting; both disable nonessential movement.

## CSS token reference

The complete, authoritative token list is in [`shared/css/tokens.css`](../shared/css/tokens.css).
