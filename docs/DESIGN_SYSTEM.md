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

Use Nunito, a rounded and readable font, for the interface and games, with Trebuchet MS and system sans-serif fallbacks. The variable font is hosted locally under `assets/fonts/nunito/` with its SIL Open Font License, so it works without a remote font service. Base text is 18px; the scale is 14px, 16px, 18px, 24px, 32px, and 40px. Body line height is 1.5, headings use 1.2. Avoid long blocks of all-caps text.

## Spacing, shape, and elevation

Spacing uses a 4px base scale: 4, 8, 12, 16, 24, 32, and 48px. Cards use a 24px radius; controls use a 16px radius; pill labels use a fully rounded radius. Shadows are subtle and grounded, with no flashing or high-contrast decoration. Component sizing, layout widths, border widths, and selected-state shadows are also tokens so game styles do not introduce independent visual values.

## Targets and components

Every interactive target is at least 48×48px. Primary buttons use the gold accent with dark text; secondary buttons use the yellow palette. Disabled controls remain visibly disabled and cannot be activated. Cards use a warm surface, a soft border, generous padding, and a clear heading. Shared interface icons are local SVGs under `assets/images/ui/`; game-specific pictures remain separate.

## Motion

Transitions are short (up to 180ms), gentle, and never required to understand an action. Respect `prefers-reduced-motion` and the in-app animation setting; both disable nonessential movement.

## CSS token reference

The complete, authoritative token list is in [`shared/css/tokens.css`](../shared/css/tokens.css).
