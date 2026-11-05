# Design system

The interface uses the CSS custom properties in `shared/css/tokens.css`; components must consume these tokens rather than introduce unrelated visual values. The palette is intentionally soft while text and interactive controls retain readable contrast.

## Color and contrast

| Token | Value | Use |
|---|---|---|
| `--color-page` | `#FFF8F3` | Page background |
| `--color-surface` | `#FFFFFF` | Cards and controls |
| `--color-surface-soft` | `#F7EBF3` | Gentle emphasis |
| `--color-text` | `#3D3345` | Main text (WCAG AA contrast on page/surface) |
| `--color-text-muted` | `#665A70` | Supporting text (WCAG AA contrast on page/surface) |
| `--color-primary` | `#70466D` | Primary button background |
| `--color-primary-hover` | `#5D385A` | Primary hover/focus background |
| `--color-on-primary` | `#FFFFFF` | Text on primary controls |
| `--color-secondary` | `#E9DCE8` | Secondary button background |
| `--color-on-secondary` | `#3D3345` | Text on secondary controls |
| `--color-border` | `#D8C9D7` | Borders |
| `--color-focus` | `#246B68` | Focus ring |
| `--color-success` | `#37684D` | Positive feedback text |
| `--color-success-soft` | `#EAF4EC` | Positive feedback background |
| `--color-success-border` | `#B9D2C0` | Positive feedback border |
| `--color-stage` | `#FFF2E8` | Princess stage background |
| `--color-feedback-soft` | `#F6F1F4` | Neutral feedback background |
| `--color-focus-soft` | `#E5F0ED` | Selected item background |
| `--color-highlight-soft` | `#F9F1DD` | Gentle hint background |
| `--color-highlight-border` | `#BFA46A` | Gentle hint border |
| `--color-backdrop` | `rgb(61 51 69 / 38%)` | Modal backdrop |

Primary and secondary button text must remain legible against their backgrounds. Do not rely on color alone to communicate a state.

## Typography

Use the system sans-serif stack for fast loading and broad glyph support. Base text is 18px; the scale is 14px, 16px, 18px, 24px, 32px, and 40px. Body line height is 1.5, headings use 1.2. Avoid long blocks of all-caps text.

## Spacing, shape, and elevation

Spacing uses a 4px base scale: 4, 8, 12, 16, 24, 32, and 48px. Cards use a 20px radius; controls use a 12px radius; pill labels use a fully rounded radius. Shadows are diffuse and subtle, with no flashing or high-contrast decoration. Component sizing, layout widths, border widths, and selected-state shadows are also tokens so game styles do not introduce independent visual values.

## Targets and components

Every interactive target is at least 48×48px. Primary buttons use the primary palette; secondary buttons use the secondary palette. Disabled controls remain visibly disabled and cannot be activated. Cards use a white surface, a soft border, generous padding, and a clear heading.

## Motion

Transitions are short (up to 180ms), gentle, and never required to understand an action. Respect `prefers-reduced-motion` and the in-app animation setting; both disable nonessential movement.

## CSS token reference

```css
:root {
  --color-page: #FFF8F3;
  --color-surface: #FFFFFF;
  --color-surface-soft: #F7EBF3;
  --color-text: #3D3345;
  --color-text-muted: #665A70;
  --color-primary: #70466D;
  --color-primary-hover: #5D385A;
  --color-on-primary: #FFFFFF;
  --color-secondary: #E9DCE8;
  --color-on-secondary: #3D3345;
  --color-border: #D8C9D7;
  --color-focus: #246B68;
  --color-success: #37684D;
  --color-success-soft: #EAF4EC;
  --color-success-border: #B9D2C0;
  --color-stage: #FFF2E8;
  --color-feedback-soft: #F6F1F4;
  --color-focus-soft: #E5F0ED;
  --color-highlight-soft: #F9F1DD;
  --color-highlight-border: #BFA46A;
  --color-backdrop: rgb(61 51 69 / 38%);
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --radius-control: 12px;
  --radius-card: 20px;
  --radius-pill: 999px;
  --shadow-card: 0 6px 24px rgb(61 51 69 / 8%);
  --shadow-selected: 0 0 0 2px var(--color-focus);
  --font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-size-small: 14px;
  --font-size-ui: 16px;
  --font-size-body: 18px;
  --font-size-h3: 24px;
  --font-size-h2: 32px;
  --font-size-h1: 40px;
  --line-height-body: 1.5;
  --motion-duration: 180ms;
  --target-size: 48px;
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --opacity-drag: 0.72;
  --opacity-disabled: 0.72;
  --size-game-panel-min-height: 500px;
  --size-game-column-min: 384px;
  --size-stage-max: 320px;
  --size-scenario-icon: 64px;
  --size-item-image: 64px;
  --size-item-choice-min: 112px;
  --size-item-choice-height: 112px;
  --size-category-min-width: 192px;
  --size-progress: 12px;
  --size-feedback-min-height: 48px;
  --layout-game-max-width: 1120px;
  --layout-game-copy-width: 640px;
  --layout-settings-max-width: 720px;
  --layout-dialog-width: 480px;
}
```
