export function suggestLandscapeOnEntry(dialog, portraitScreen) {
  if (!portraitScreen.matches) {
    return;
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
}
