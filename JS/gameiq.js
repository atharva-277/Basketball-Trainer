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
    // NOTE: this assumes the correct choice is always the 2nd button
    // (index 1). That's fragile once scenarios are dynamic — Phase 3
    // should replace this with a real "correctIndex" stored per
    // scenario, rather than relying on button position.
    const correctBtn = btn.closest(".scenario-choices").children[1];
    correctBtn.classList.add("correct");
  }

  // Unlock next scenario after delay
  setTimeout(() => {
    allBtns.forEach((b) => {
      b.disabled = false;
      b.classList.remove("correct", "wrong");
    });
  }, 2500);
}
