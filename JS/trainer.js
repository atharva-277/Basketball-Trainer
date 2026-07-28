document.addEventListener("DOMContentLoaded", function () {
  const dietSetup = document.getElementById("shot-diet-setup");
  const trainingPlan = document.getElementById("training-plan");

  function initTrainerScreen() {
    const savedDiet = getShotDiet();
    if (!savedDiet) {
      dietSetup.style.display = "block";
      trainingPlan.style.display = "none";
    } else {
      dietSetup.style.display = "none";
      trainingPlan.style.display = "block";
      populateTrainingPlan(savedDiet);
    }
  }
  const trainerScreen = document.getElementById("screen-trainer");
  const observer = new MutationObserver(function () {
    if (trainerScreen.classList.contains("active")) {
      initTrainerScreen();
    }
  });
  observer.observe(trainerScreen, { attributeFilter: ["class"] });

  initTrainerScreen();

  const dietInputIds = [
    "diet-threes",
    "diet-midrange",
    "diet-layups",
    "diet-ballhandling",
  ];

  dietInputIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateDietTotal);
  });

  function updateDietTotal() {
    const total = getDietInputTotal(dietInputIds);
    const display = document.getElementById("diet-total-display");
    if (display) {
      display.textContent = total + " / 100";
      display.style.color = total === 100 ? "var(--green)" : "var(--orange)";
    }
  }

  function getDietInputTotal(ids) {
    return ids.reduce((sum, id) => {
      const el = document.getElementById(id);
      return sum + (parseInt(el?.value) || 0);
    }, 0);
  }

  const saveDietBtn = document.getElementById("btn-save-diet");
  if (saveDietBtn) {
    saveDietBtn.addEventListener("click", function () {
      const total = getDietInputTotal(dietInputIds);
      const errorEl = document.getElementById("diet-error");

      if (total !== 100) {
        errorEl.textContent =
          "Your percentages must add up to 100. Currently: " + total + "%";
        errorEl.style.display = "block";
        return;
      }

      errorEl.style.display = "none";

      saveShotDiet({
        threes: parseInt(document.getElementById("diet-threes").value),
        midRange: parseInt(document.getElementById("diet-midrange").value),
        layups: parseInt(document.getElementById("diet-layups").value),
        ballHandling: parseInt(
          document.getElementById("diet-ballhandling").value,
        ),
      });

      dietSetup.style.display = "none";
      trainingPlan.style.display = "block";
      populateTrainingPlan(getShotDiet());
    });
  }

  function populateTrainingPlan(diet) {
    const baseline = getBaseline();
    const profile = getProfile();
    if (!baseline || !profile) return;

    const goalText = document.getElementById("trainer-goal-text");
    const goalFill = document.getElementById("trainer-goal-fill");
    const goalPct = document.getElementById("trainer-goal-pct");

    if (goalText)
      goalText.textContent =
        "Improve your " + baseline.weakestArea.toLowerCase();
    if (goalFill) goalFill.style.width = baseline.overallPct + "%";
    if (goalPct) goalPct.textContent = baseline.overallPct + "%";

    const area = baseline.weakestArea;
    setModuleStatus(
      "module-shooting-status",
      area === "Catch & Shoot Threes" || area === "Mid-Range" ? "Focus" : "",
    );
    setModuleStatus(
      "module-handling-status",
      area === "Ball Handling" ? "Focus" : "",
    );
  }

  function setModuleStatus(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = "module-status " + (text === "Focus" ? "current" : "");
  }
});
