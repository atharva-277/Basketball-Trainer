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

    const status = getCurrentOverallStatus() || {
      overallPct: baseline.overallPct,
      weakestArea: baseline.weakestArea,
    };

    if (goalText)
      goalText.textContent = "Improve your " + status.weakestArea.toLowerCase();
    if (goalFill) goalFill.style.width = status.overallPct + "%";
    if (goalPct) goalPct.textContent = status.overallPct + "%";

    const area = status.weakestArea;
    setModuleStatus(
      "module-shooting-status",
      area === "Catch & Shoot Threes" ||
        area === "Mid-Range" ||
        area === "Finishing at the Rim"
        ? "Focus"
        : "",
    );
    setModuleStatus(
      "module-handling-status",
      area === "Ball Handling" ? "Focus" : "",
    );
  }

  function setupModuleToggle(cardId, detailsId, renderFn) {
    const card = document.getElementById(cardId);
    const details = document.getElementById(detailsId);
    if (!card || !details) return;

    // Avoid stacking duplicate listeners every time populateTrainingPlan reruns
    if (card.dataset.toggleBound) return;
    card.dataset.toggleBound = "true";

    card.addEventListener("click", function () {
      const isOpen = details.style.display === "flex";
      if (isOpen) {
        details.style.display = "none";
      } else {
        renderFn(details);
        details.style.display = "flex";
      }
    });
  }

  const HANDLING_DRILL_NAMES = {
    1: "Stationary Crossover",
    2: "Figure-8 Between the Legs",
    3: "Two-Ball Dribbling",
    4: "Behind-the-Back Combo",
    5: "Spider Dribble",
    6: "Full-Speed Crossover Sprint",
  };

  function renderShootingDetails(container) {
    const session = generateShootingSession();
    if (!session) return;
    const s = session.subsections;

    const finishingBreakdown =
      expandFinishingAttempts(s.finishing.attempts) || {};
    const finishingLabels = {
      layupLeft: "Left-Hand Layup",
      layupRight: "Right-Hand Layup",
      floater: "Floater",
      reverseLayup: "Reverse Layup",
    };

    container.innerHTML = `
      <div class="module-detail-row"><span>Threes</span><span>${s.threes.attempts} attempts</span></div>
      <div class="module-detail-row"><span>Mid-Range</span><span>${s.midrange.attempts} attempts</span></div>
      <div class="module-detail-row"><span>Finishing</span><span>${s.finishing.attempts} attempts</span></div>
      ${Object.keys(finishingBreakdown)
        .map(
          (key) =>
            `<div class="module-detail-row"><span>&nbsp;&nbsp;↳ ${finishingLabels[key]}</span><span>${finishingBreakdown[key]}</span></div>`,
        )
        .join("")}
      <button class="btn-primary" style="margin-top: 10px" onclick="startLogSession('shooting')">Start →</button>
    `;
  }

  function renderHandlingDetails(container) {
    const session = generateHandlingSession();
    if (!session) return;

    const rows = Object.keys(session.drills)
      .map((drillId) => {
        const secs = session.drills[drillId].seconds;
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        const time = m + ":" + (s < 10 ? "0" + s : s);
        return `<div class="module-detail-row"><span>${HANDLING_DRILL_NAMES[drillId]}</span><span>${time}</span></div>`;
      })
      .join("");

    container.innerHTML =
      rows +
      `<button class="btn-primary" style="margin-top: 10px" onclick="startLogSession('handling')">Start →</button>`;
  }

  function setModuleStatus(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = "module-status " + (text === "Focus" ? "current" : "");
  }

  const shootingSession = generateShootingSession();
  const shootingMeta = document.getElementById("module-shooting-meta");
  if (shootingSession && shootingMeta) {
    const s = shootingSession.subsections;
    shootingMeta.textContent = `Threes: ${s.threes.attempts} · Mid-Range: ${s.midrange.attempts} · Finishing: ${s.finishing.attempts}`;
  }

  const handlingSession = generateHandlingSession();
  const handlingMeta = document.getElementById("module-handling-meta");
  if (handlingSession && handlingMeta) {
    const totalDrillSeconds = Object.values(handlingSession.drills).reduce(
      (sum, d) => sum + d.seconds,
      0,
    );
    handlingMeta.textContent = `${Math.round(totalDrillSeconds / 60)} min planned`;
  }

  setupModuleToggle(
    "module-shooting",
    "module-shooting-details",
    renderShootingDetails,
  );
  setupModuleToggle(
    "module-handling",
    "module-handling-details",
    renderHandlingDetails,
  );
});
