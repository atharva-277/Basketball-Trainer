document.addEventListener("DOMContentLoaded", function () {
  const submitProfileBtn = document.getElementById("btn-submit-profile");
  const profile = getProfile();
  const baseline = getBaseline();

  if (baseline) {
    goTo("screen-trainer");
  }

  if (submitProfileBtn) {
    submitProfileBtn.addEventListener("click", function () {
      if (!profile) {
        const age = parseInt(document.getElementById("input-age").value);
        const height = parseInt(document.getElementById("input-height").value);
        const weight = parseInt(document.getElementById("input-weight").value);
        const skillLevel = document.getElementById("input-skill").value;

        if (!age || !height || !weight || !skillLevel) {
          showBioError("Please fill out all fields before continuing.");
          return;
        }
        if (age < 10 || age > 80) {
          showBioError("Please enter an age between 10 and 80.");
          return;
        }
        if (height < 48 || height > 108) {
          showBioError(
            "Please enter a valid height in inches (e.g. 74 for 6'2\").",
          );
          return;
        }
        if (weight < 80 || weight > 400) {
          showBioError("Please enter a valid weight in lbs.");
          return;
        }

        saveProfile({
          age,
          heightInches: height,
          weightLbs: weight,
          skillLevel,
        });
      }
      goTo("screen-baseline");
    });
  }

  function showBioError(message) {
    const el = document.getElementById("bio-error");
    if (el) {
      el.textContent = message;
      el.style.display = "block";
    }
  }

  function showStep(stepNumber) {
    document.querySelectorAll(".baseline-step").forEach((step) => {
      step.style.display = "none";
    });

    const target = document.getElementById("baseline-step-" + stepNumber);
    if (target) target.style.display = "block";

    document.querySelectorAll(".onboard-dot").forEach((dot) => {
      const dotStep = parseInt(dot.getAttribute("data-step"));
      dot.classList.toggle("active", dotStep <= stepNumber);
    });
  }

  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", function () {
      const nextStep = parseInt(this.getAttribute("data-next"));
      showStep(nextStep);
    });
  });

  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", function () {
      const prevStep = parseInt(this.getAttribute("data-back"));
      showStep(prevStep);
    });
  });

  document.querySelectorAll(".spot-stepper").forEach((stepper) => {
    const input = stepper.querySelector("input");
    const incBtn = stepper.querySelector("[data-action='inc']");
    const decBtn = stepper.querySelector("[data-action='dec']");
    const max = parseInt(input.getAttribute("max"));

    incBtn.addEventListener("click", function () {
      const current = parseInt(input.value);
      if (current < max) {
        input.value = current + 1;
        updateStepTotal(stepper);
      }
    });

    decBtn.addEventListener("click", function () {
      const current = parseInt(input.value);
      if (current > 0) {
        input.value = current - 1;
        updateStepTotal(stepper);
      }
    });
  });

  function updateStepTotal(stepper) {
    const stepDiv = stepper.closest(".baseline-step");
    if (!stepDiv) return;

    const stepId = stepDiv.id;

    const inputs = stepDiv.querySelectorAll(".spot-stepper input");
    const totalMade = Array.from(inputs).reduce(
      (sum, inp) => sum + parseInt(inp.value || 0),
      0,
    );

    if (stepId === "baseline-step-1") {
      const el = document.getElementById("spot-total-display");
      if (el) el.textContent = totalMade + " / 50";
    }
    if (stepId === "baseline-step-2") {
      const el = document.getElementById("midrange-total-display");
      if (el) el.textContent = totalMade + " / 25";
    }
    if (stepId === "baseline-step-3") {
      const el = document.getElementById("finishing-total-display");
      if (el) el.textContent = totalMade + " / 40";
    }
  }

  const DRILL_COUNT = 6;

  const drillTimes = {};
  let activeTimer = null;

  document.querySelectorAll("[data-drill-action]").forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.getAttribute("data-drill-action");
      const drillId = parseInt(this.getAttribute("data-drill-id"));
      if (action === "start") startDrill(drillId);
      if (action === "stop") stopDrill(drillId);
    });
  });

  function startDrill(drillId) {
    const clockEl = document.getElementById("clock-" + drillId);
    const startBtn = document.querySelector(
      `[data-drill-action="start"][data-drill-id="${drillId}"]`,
    );
    const stopBtn = document.querySelector(
      `[data-drill-action="stop"][data-drill-id="${drillId}"]`,
    );
    const drillCard = document.getElementById("drill-" + drillId);
    const statusEl = drillCard
      ? drillCard.querySelector(".drill-status")
      : null;

    let elapsed = 0;

    startBtn.disabled = true;
    stopBtn.disabled = false;
    if (statusEl) {
      statusEl.textContent = "Running…";
      statusEl.className = "drill-status running";
    }

    activeTimer = setInterval(function () {
      elapsed++;
      if (clockEl) clockEl.textContent = formatTime(elapsed);
    }, 1000);

    drillTimes["_active_elapsed"] = 0;
    drillTimes["_active_interval"] = activeTimer;
    drillTimes["_active_id"] = drillId;
    drillTimes["_active_start"] = Date.now();
  }

  function stopDrill(drillId) {
    clearInterval(activeTimer);
    activeTimer = null;

    const elapsed = drillTimes["_active_start"]
      ? Math.round((Date.now() - drillTimes["_active_start"]) / 1000)
      : 0;

    drillTimes[drillId] = elapsed;

    const startBtn = document.querySelector(
      `[data-drill-action="start"][data-drill-id="${drillId}"]`,
    );
    const stopBtn = document.querySelector(
      `[data-drill-action="stop"][data-drill-id="${drillId}"]`,
    );
    const drillCard = document.getElementById("drill-" + drillId);
    const statusEl = drillCard
      ? drillCard.querySelector(".drill-status")
      : null;

    stopBtn.disabled = true;
    if (statusEl) {
      statusEl.textContent = formatTime(elapsed);
      statusEl.className = "drill-status done";
    }

    const nextId = drillId + 1;
    if (nextId <= DRILL_COUNT) {
      const nextCard = document.getElementById("drill-" + nextId);
      const nextStart = document.querySelector(
        `[data-drill-action="start"][data-drill-id="${nextId}"]`,
      );
      if (nextCard) nextCard.classList.remove("locked-drill");
      if (nextStart) nextStart.disabled = false;
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  const seeResultsBtn = document.getElementById("btn-see-results");

  if (seeResultsBtn) {
    seeResultsBtn.addEventListener("click", function () {
      const baseline = calculateBaseline();
      saveBaseline(baseline);
      populateResults(baseline);
      goTo("screen-results");
    });
  }

  function calculateBaseline() {
    const threeInputs = document.querySelectorAll(
      "#baseline-step-1 .spot-stepper input",
    );
    let threesMade = 0;
    threeInputs.forEach((inp) => {
      threesMade += parseInt(inp.value || 0);
    });
    const threesAttempted = 50;
    const threePct = Math.round((threesMade / threesAttempted) * 100);

    const midInputs = document.querySelectorAll(
      "#baseline-step-2 .spot-stepper input",
    );
    let midMade = 0;
    midInputs.forEach((inp) => {
      midMade += parseInt(inp.value || 0);
    });
    const midAttempted = 25;
    const midPct = Math.round((midMade / midAttempted) * 100);

    function getSpotMakes(spotKey) {
      const card = document.querySelector(`[data-spot="${spotKey}"]`);
      const input = card ? card.querySelector("input") : null;
      return input ? parseInt(input.value || 0) : 0;
    }

    const layupLeftMade = getSpotMakes("layup-left");
    const layupRightMade = getSpotMakes("layup-right");
    const floaterMade = getSpotMakes("floater");
    const reverseLayupMade = getSpotMakes("reverse-layup");

    const layupLeftPct = Math.round((layupLeftMade / 10) * 100);
    const layupRightPct = Math.round((layupRightMade / 10) * 100);
    const floaterPct = Math.round((floaterMade / 10) * 100);
    const reverseLayupPct = Math.round((reverseLayupMade / 10) * 100);

    const totalFinishingMade =
      layupLeftMade + layupRightMade + floaterMade + reverseLayupMade;
    const finishingPct = Math.round((totalFinishingMade / 40) * 100);

    const totalMade = threesMade + midMade + totalFinishingMade;
    const totalAttempted = 50 + 25 + 40;
    const overallPct = Math.round((totalMade / totalAttempted) * 100);

    const avgDrillTime = calcAvgDrillTime();
    const handlingScore = Math.min(Math.round((avgDrillTime / 120) * 100), 100);
    const overallRating = Math.round(
      threePct * 0.25 +
        midPct * 0.2 +
        finishingPct * 0.25 +
        handlingScore * 0.3,
    );

    const allAreas = {
      "Catch & Shoot Threes": threePct,
      "Mid-Range": midPct,
      "Finishing at the Rim": finishingPct,
      "Ball Handling": handlingScore,
    };
    const weakestArea = Object.keys(allAreas).reduce((a, b) =>
      allAreas[a] < allAreas[b] ? a : b,
    );

    return {
      threesMade,
      threesAttempted,
      threePct,
      midMade,
      midAttempted: 25,
      midPct,
      layupLeftMade,
      layupLeftPct,
      layupRightMade,
      layupRightPct,
      floaterMade,
      floaterPct,
      reverseLayupMade,
      reverseLayupPct,
      totalFinishingMade,
      finishingPct,
      overallPct,
      overallRating,
      weakestArea,
      drillTimes: {
        1: drillTimes[1] || 0,
        2: drillTimes[2] || 0,
        3: drillTimes[3] || 0,
        4: drillTimes[4] || 0,
        5: drillTimes[5] || 0,
        6: drillTimes[6] || 0,
      },
    };
  }

  function calcAvgDrillTime() {
    const times = [];
    for (let i = 1; i <= DRILL_COUNT; i++) {
      if (drillTimes[i]) times.push(drillTimes[i]);
    }
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }
  const DRILL_NAMES = [
    "Stationary Crossover",
    "Figure-8 Between the Legs",
    "Two-Ball Dribbling",
    "Behind-the-Back Combo",
    "Spider Dribble",
    "Full-Speed Crossover Sprint",
  ];

  function populateResults(baseline) {
    const ratingEl = document.getElementById("overall-rating");
    if (ratingEl) ratingEl.textContent = baseline.overallRating;

    setElText("result-threes", baseline.threePct + "%");
    setElText("result-midrange", baseline.midPct + "%");

    setElText("result-layup-left", baseline.layupLeftPct + "%");
    setElText("result-layup-right", baseline.layupRightPct + "%");
    setElText("result-floater", baseline.floaterPct + "%");
    setElText("result-reverse", baseline.reverseLayupPct + "%");

    setElText("result-threes-context", baseline.threesMade + " / 50 makes");
    setElText("result-midrange-context", baseline.midMade + " / 25 makes");
    setElText(
      "result-layup-left-context",
      baseline.layupLeftMade + " / 10 makes",
    );
    setElText(
      "result-layup-right-context",
      baseline.layupRightMade + " / 10 makes",
    );
    setElText("result-floater-context", baseline.floaterMade + " / 10 makes");
    setElText(
      "result-reverse-context",
      baseline.reverseLayupMade + " / 10 makes",
    );

    const profile = getProfile();
    setElText("result-skill", profile ? profile.skillLevel : "—");

    const drillList = document.getElementById("drill-results-list");
    if (drillList) {
      drillList.innerHTML = "";
      for (let i = 1; i <= DRILL_COUNT; i++) {
        const secs = baseline.drillTimes[i] || 0;
        const row = document.createElement("div");
        row.className = "drill-result-row";
        row.innerHTML = `
          <span class="drill-result-name">${DRILL_NAMES[i - 1]}</span>
          <span class="drill-result-time">${formatTime(secs)}</span>
        `;
        drillList.appendChild(row);
      }
    }
  }
  function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  const savedBaseline = getBaseline();
  if (savedBaseline) populateResults(savedBaseline);
});
