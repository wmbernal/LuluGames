# Accessibility checklist

- [ ] Set `<html lang="pt-BR">`.
- [ ] Navigate every feature using only the keyboard; preserve a logical tab order.
- [ ] Provide a clearly visible focus indicator and do not trap focus.
- [ ] Use semantic headings, buttons, links, and form labels.
- [ ] Give meaningful images alternative text; hide decorative images from assistive technology.
- [ ] Provide accessible names (`aria-label` or visible text) for controls whose purpose is not otherwise clear.
- [ ] Announce feedback and round changes with an appropriate live region without moving focus unexpectedly.
- [ ] Give memory cards descriptive names and pressed states; announce positive matches politely.
- [ ] Support arrow-key movement within the memory grid as well as Tab, Enter, and Space.
- [ ] Verify WCAG AA text contrast, including button states and focus indicators.
- [ ] Ensure interactive targets are at least 48×48 CSS pixels.
- [ ] Provide keyboard-equivalent controls for every pointer/touch interaction; dragging must not be required.
- [ ] Respect `prefers-reduced-motion` and provide an in-app animation setting.
- [ ] Make audio optional; never communicate an essential instruction or result only through sound.
- [ ] Check the interface at narrow viewport widths and browser zoom.
