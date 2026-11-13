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
| `--color-stage` | `#EDF5DD` | Princess stage background |
| `--color-feedback-soft` | `#F5F7E9` | Neutral feedback background |
| `--color-focus-soft` | `#E0F3EA` | Selected item background |
| `--color-highlight-soft` | `#FFF4C7` | Gentle hint background |
| `--color-highlight-border` | `#B59442` | Gentle hint border |
| `--color-backdrop` | `rgb(38 61 39 / 38%)` | Modal backdrop |

Primary and secondary button text must remain legible against their backgrounds. Do not rely on color alone to communicate a state.

## Typography

Use Nunito, a rounded and readable font, for the interface and games, with Trebuchet MS and system sans-serif fallbacks. Headings, buttons and the brand use Fredoka (`--font-display`), a rounder display face that gives the interface a friendlier, toy-like character. Both variable fonts are hosted locally under `assets/fonts/` with their SIL Open Font License, so they work without a remote font service. Base text is 18px; the scale is 14px, 16px, 18px, 24px, 32px, and 40px. Body line height is 1.5, headings use 1.15. Avoid long blocks of all-caps text; short uppercase eyebrows are acceptable.

## Spacing, shape, and elevation

Spacing uses a 4px base scale: 4, 8, 12, 16, 24, 32, and 48px. Cards use a 24px radius; controls use a 16px radius; pill labels use a fully rounded radius. Shadows are subtle and grounded, with no flashing or high-contrast decoration. Component sizing, layout widths, border widths, and selected-state shadows are also tokens so game styles do not introduce independent visual values.

## Photo backdrop and glass panels

The home page and every game/theme page share one full-screen photograph: Pexels photo 8709295 by Polina. Inner pages use `assets/images/ui/home-bg.jpg` with a soft blur and a cream veil so cards stay readable. The home uses a top crop of the same photo, `assets/images/ui/home-bg-top.jpg`, so the paper-letter word stays fully visible near the top of the viewport above the centered menu card; the card is horizontally centered at every width, anchored near the bottom on desktop and centered on both axes on phones (with compact variants on short screens). A translucent cream pill keeps the Lulu Games brand readable where it overlaps the letters. The backdrop is decorative and never carries information.

Cards use a translucent warm surface with `backdrop-filter: blur()`, a light border and a soft grounded shadow. Large cards repeat the dashed inner border from the home menu to tie the screens together. Theme choices and game cards lift 2–4px on hover with a gold border; selected, correct and matched states keep their stronger focus/success colors. All effects are decorative and disabled when motion is reduced. Game screens have no top header: the brand stays on the home and theme chooser, while game pages keep all navigation in the footer (Voltar/Temas + Início) to give the game the full viewport.

## Layout and screen space

The main content of every screen must use the available viewport, on any orientation:

- Center the primary panel both vertically and horizontally on phones; do not pin menus to the bottom or leave a large empty band on one side. On wide desktop windows an anchored composition may be used, but phones always get a centered layout.
- Fill leftover space with the decorative backdrop, not with dead layout space. The backdrop may be cropped, scaled, or repositioned per breakpoint, but it never carries information.
- Test both orientations. Landscape phones and short windows trigger a compact variant: shrink padding, icon, and text sizes, and drop secondary lines (such as the home subtitle) before dropping controls. Never require scrolling to reach the primary actions on a phone.
- Never cause horizontal scrolling; check that `scrollWidth` matches the viewport at every breakpoint.
- Keep interactive targets at least 44×44px even in compact variants, and keep the same order and grouping across orientations so the layout stays predictable.

## Targets and components

Every interactive target is at least 48×48px. Primary buttons use the gold accent with dark text; secondary buttons use the yellow palette on the home page and a translucent cream surface with a green border on game pages. Disabled controls remain visibly disabled and cannot be activated. Cards use a warm surface, a soft border, generous padding, and a clear heading. Shared interface icons are local SVGs under `assets/images/ui/`; game-specific pictures remain separate.

## Motion

Transitions are short (up to 180ms), gentle, and never required to understand an action. Respect `prefers-reduced-motion` and the in-app animation setting; both disable nonessential movement.

## CSS token reference

The complete, authoritative token list is in [`shared/css/tokens.css`](../shared/css/tokens.css).
