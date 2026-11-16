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
