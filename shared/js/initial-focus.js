export function focusGameOnEntry(focusFirstControl) {
  const dialog = document.querySelector(".orientation-dialog[open]");
  if (dialog) {
    dialog.addEventListener("close", () => focusGameOnEntry(focusFirstControl), { once: true });
    return;
  }
  if (window.matchMedia("(orientation: landscape) and (max-height: 500px)").matches) {
    document.querySelector("#round-count").focus();
  } else {
    focusFirstControl();
  }
}
