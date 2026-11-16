const TONES = ["rose", "apricot", "lavender", "blue", "peach", "green", "periwinkle"];

function applyTileTone(tile, index) {
  const tone = TONES[index % TONES.length];
  tile.style.setProperty("--tile-color", `var(--color-theme-${tone})`);
  tile.style.setProperty("--tile-border", `var(--color-theme-${tone}-border)`);
  tile.style.setProperty("--tile-border-strong", `var(--color-theme-${tone}-strong)`);
}

/**
 * Fills a selection link with the shared Home tile pattern.
 * The full label, description and count stay available to screen readers,
 * while the visible tile keeps only a big icon and a short label.
 */
export function decorateSelectionTile(
  tile,
  { icon, label, visibleLabel = label, description, count, index = 0 },
) {
  tile.classList.add("selection-tile");
  applyTileTone(tile, index);

  const accessibleLabel = [label, description, count].filter(Boolean).join(" ");
  if (accessibleLabel) tile.setAttribute("aria-label", accessibleLabel);

  const iconElement = document.createElement("span");
  iconElement.className = "selection-tile__icon";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.textContent = icon;

  const title = document.createElement("span");
  title.className = "selection-tile__title";
  title.textContent = visibleLabel;

  tile.append(iconElement, title);
}
