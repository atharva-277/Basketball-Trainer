// ── Meetup Screen ───────────────────────────────────
// Owns: .filter-chip and .btn-connect elements on the Meetup screen.
// No dependencies on other JS files.

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", function () {
    this.closest(".filter-bar")
      .querySelectorAll(".filter-chip")
      .forEach((c) => c.classList.remove("active-chip"));
    this.classList.add("active-chip");
  });
});

document.querySelectorAll(".btn-connect").forEach((btn) => {
  btn.addEventListener("click", function () {
    if (this.textContent === "Connect") {
      this.textContent = "Connected ✓";
      this.style.borderColor = "var(--green)";
      this.style.color = "var(--green)";
    }
  });
});
