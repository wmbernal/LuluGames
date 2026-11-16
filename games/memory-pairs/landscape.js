export function alignBoardOnLandscape(window, status, canAlign) {
  const landscape = window.matchMedia(
    "(orientation: landscape) and (max-width: 1024px) and (max-height: 500px)",
  );
  const portrait = window.matchMedia("(orientation: portrait) and (max-width: 1024px)");

  function align() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if ((!landscape.matches && !portrait.matches) || !canAlign()) return;
        const dialog = window.document.querySelector("dialog[open]");
        if (dialog) {
          dialog.addEventListener("close", align, { once: true });
          return;
        }
        if (portrait.matches && status.getBoundingClientRect().top >= 0) return;
        const top = window.scrollY + status.getBoundingClientRect().top - 8;
        window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
      });
    });
  }

  landscape.addEventListener("change", align);
}
