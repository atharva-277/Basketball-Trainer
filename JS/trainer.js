// ── Trainer Screen ──────────────────────────────────
// Owns: .zone-slider inputs (shot distribution) on the Trainer screen.
// No dependencies on other JS files (yet — Phase 2 will have this
// write slider values into storage.js instead of just updating the
// label text).

document.querySelectorAll(".zone-slider").forEach((slider) => {
  slider.addEventListener("input", function () {
    const pctEl = this.closest(".zone-item").querySelector(".zone-pct");
    if (pctEl) pctEl.textContent = this.value + "%";
  });
});
