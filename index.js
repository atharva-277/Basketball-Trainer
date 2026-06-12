// ── Screen Navigation ──────────────────────────────
function goTo(screenId) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
    window.scrollTo(0, 0);
  }
}

// ── Game IQ: Choice Selection ──────────────────────
function selectChoice(btn, isCorrect) {
  const allBtns = btn
    .closest(".scenario-choices")
    .querySelectorAll(".choice-btn");
  allBtns.forEach((b) => {
    b.classList.remove("correct", "wrong");
    b.disabled = true;
  });

  if (isCorrect) {
    btn.classList.add("correct");
    btn.textContent = "✓ " + btn.textContent + " — Nice read!";
  } else {
    btn.classList.add("wrong");
    // Highlight correct answer
    allBtns.forEach((b) => {
      if (b !== btn && b.dataset.correct !== undefined) return;
      // Find the correct one (index 1 = correct in our layout)
    });
    const correctBtn = btn.closest(".scenario-choices").children[1];
    correctBtn.classList.add("correct");
  }

  // Unlock next scenario after delay
  setTimeout(() => {
    allBtns.forEach((b) => (b.disabled = false));
    allBtns.forEach((b) => b.classList.remove("correct", "wrong"));
  }, 2500);
}

// ── Shot zone sliders: live pct update ────────────
document.querySelectorAll(".zone-slider").forEach((slider) => {
  slider.addEventListener("input", function () {
    const pctEl = this.closest(".zone-item").querySelector(".zone-pct");
    if (pctEl) pctEl.textContent = this.value + "%";
  });
});

// ── Filter chips toggle ────────────────────────────
document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", function () {
    this.closest(".filter-bar")
      .querySelectorAll(".filter-chip")
      .forEach((c) => c.classList.remove("active-chip"));
    this.classList.add("active-chip");
  });
});

// ── Connect button toggle ──────────────────────────
document.querySelectorAll(".btn-connect").forEach((btn) => {
  btn.addEventListener("click", function () {
    if (this.textContent === "Connect") {
      this.textContent = "Connected ✓";
      this.style.borderColor = "var(--green)";
      this.style.color = "var(--green)";
    }
  });
});
