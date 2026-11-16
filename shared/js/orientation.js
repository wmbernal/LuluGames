export const PORTRAIT_SCREEN_QUERY = "(orientation: portrait) and (max-width: 1024px)";

export function markOrientationSuggested(url) {
  url.searchParams.set("orientationSuggested", "1");
}

export function consumeOrientationSuggestion(url) {
  const suggested = url.searchParams.get("orientationSuggested") === "1";
  url.searchParams.delete("orientationSuggested");
  return suggested;
}

export function suggestLandscapeOnEntry(dialog, portraitScreen) {
  if (!portraitScreen.matches) {
    return false;
  }

  function onScreenChange(event) {
    if (!event.matches && dialog.open) {
      dialog.close();
    }
  }

  function onClose() {
    portraitScreen.removeEventListener("change", onScreenChange);
    dialog.removeEventListener("close", onClose);
  }

  portraitScreen.addEventListener("change", onScreenChange);
  dialog.addEventListener("close", onClose);
  dialog.showModal();
  return true;
}

export function setupOrientationSuggestion({ selection = false } = {}) {
  const url = new URL(window.location.href);
  const alreadySuggested = consumeOrientationSuggestion(url);
  if (url.href !== window.location.href) {
    window.history.replaceState(window.history.state, "", url.href);
  }
  if (alreadySuggested && !selection) return false;

  const media = window.matchMedia(PORTRAIT_SCREEN_QUERY);
  if (!media.matches) return false;

  if (document.activeElement === document.body) {
    const main = document.querySelector("main");
    main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
  }

  const dialog = document.createElement("dialog");
  dialog.id = "orientation-dialog";
  dialog.className = "orientation-dialog";
  dialog.setAttribute("aria-labelledby", "orientation-title");
  dialog.innerHTML = `
    <form method="dialog">
      <div class="orientation-dialog__icon" aria-hidden="true">
        <span>📱</span><span class="orientation-dialog__arrow">↻</span><span class="orientation-dialog__landscape">📱</span>
      </div>
      <h2 id="orientation-title">Vire na horizontal</h2>
      <button class="button button--secondary" type="submit" autofocus>Continuar assim</button>
    </form>`;
  document.body.append(dialog);
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  return suggestLandscapeOnEntry(dialog, media);
}

export function markSelectionLink(link, suggested) {
  if (!suggested) return;
  const url = new URL(link.href);
  markOrientationSuggested(url);
  link.href = url.href;
}
