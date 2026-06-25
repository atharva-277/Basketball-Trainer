//   1. Bio form → validate → saveProfile() → go to screen-baseline
//   2. Step navigation inside screen-baseline (steps 1–4)
//   3. Stepper +/- buttons update spot makes in memory
//   4. Drill timers run per drill, unlock sequentially
//   5. "See My Results" → calculateBaseline() → saveBaseline() → populateResults() → go to screen-results

document.addEventListener("DOMContentLoaded", function () {
  // ════════════════════════════════════════════════════
  // SECTION 1 — BIO FORM
  // ════════════════════════════════════════════════════

  const submitProfileBtn = document.getElementById("btn-submit-profile");

  if (submitProfileBtn) {
    submitProfileBtn.addEventListener("click", function () {
      const age = parseInt(document.getElementById("input-age").value);
      const height = parseInt(document.getElementById("input-height").value);
      const weight = parseInt(document.getElementById("input-weight").value);
      const skillLevel = document.getElementById("input-skill").value;

      // ── Validation ───────────────────────────────────
      if (!age || !height || !weight || !skillLevel) {
        showBioError("Please fill out all fields before continuing.");
        return;
      }
      if (age < 10 || age > 60) {
        showBioError("Please enter an age between 10 and 60.");
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

      saveProfile({ age, heightInches: height, weightLbs: weight, skillLevel });
      goTo("screen-baseline");
    });
  }

  function showBioError(message) {
    const el = document.getElementById("bio-error"); // MATCH WITH FRIEND
    if (el) {
      el.textContent = message;
      el.style.display = "block";
    }
  }

  // ════════════════════════════════════════════════════
  // SECTION 2 — STEP NAVIGATION (inside screen-baseline)
  // Steps are shown/hidden divs: #baseline-step-1 through #baseline-step-4
  // Progress dots: .onboard-dot elements with data-step attributes
  // Next/back buttons use data-next and data-back attributes
  // ════════════════════════════════════════════════════

  // Show a specific step, hide all others, update progress dots
  function showStep(stepNumber) {
    document.querySelectorAll(".baseline-step").forEach((step) => {
      // MATCH WITH FRIEND — class on each step div
      step.style.display = "none";
    });

    const target = document.getElementById("baseline-step-" + stepNumber); // MATCH WITH FRIEND — id pattern for step divs
    if (target) target.style.display = "block";

    // Update progress dots
    document.querySelectorAll(".onboard-dot").forEach((dot) => {
      // MATCH WITH FRIEND — class on progress dots
      const dotStep = parseInt(dot.getAttribute("data-step")); // MATCH WITH FRIEND — data-step attribute on each dot
      dot.classList.toggle("active", dotStep <= stepNumber);
    });
  }

  // Wire up all data-next and data-back buttons inside the baseline screen
  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", function () {
      const nextStep = parseInt(this.getAttribute("data-next")); // MATCH WITH FRIEND — data-next attribute on next buttons
      showStep(nextStep);
    });
  });

  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", function () {
      const prevStep = parseInt(this.getAttribute("data-back")); // MATCH WITH FRIEND — data-back attribute on back buttons
      showStep(prevStep);
    });
  });

  // ════════════════════════════════════════════════════
  // SECTION 3 — STEPPER BUTTONS (+/-)
  // Each spot card has a .tally-stepper with two buttons
  // (data-action="inc" / data-action="dec") and a readonly input.
  // Attempts are fixed per step, enforced by the max attribute on each input.
  // ════════════════════════════════════════════════════

  // Step 1: threes — 5 spots × 10 attempts = 50 total
  // Step 2: mid-range — 5 spots × 5 attempts = 25 total
  // Step 3: finishing — 4 types × 10 attempts = 40 total
  // The max attribute on each input already enforces the per-spot cap.

  document.querySelectorAll(".spot-stepper").forEach((stepper) => {
    // MATCH WITH FRIEND — class on stepper wrapper div
    const input = stepper.querySelector("input");
    const incBtn = stepper.querySelector("[data-action='inc']"); // MATCH WITH FRIEND — data-action attribute
    const decBtn = stepper.querySelector("[data-action='dec']"); // MATCH WITH FRIEND — data-action attribute
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

  // After any stepper change, recalculate and display the running total for that step
  function updateStepTotal(stepper) {
    // Walk up the DOM to find which step this stepper belongs to
    const stepDiv = stepper.closest(".baseline-step"); // MATCH WITH FRIEND — class on step wrapper divs
    if (!stepDiv) return;

    const stepId = stepDiv.id; // e.g. "baseline-step-1"

    // Sum all inputs in this step
    const inputs = stepDiv.querySelectorAll(".spot-stepper input");
    const totalMade = Array.from(inputs).reduce(
      (sum, inp) => sum + parseInt(inp.value || 0),
      0,
    );

    // Each step has its own total display element
    if (stepId === "baseline-step-1") {
      const el = document.getElementById("spot-total-display"); // MATCH WITH FRIEND
      if (el) el.textContent = totalMade + " / 50";
    }
    if (stepId === "baseline-step-2") {
      const el = document.getElementById("midrange-total-display"); // MATCH WITH FRIEND
      if (el) el.textContent = totalMade + " / 25";
    }
    if (stepId === "baseline-step-3") {
      const el = document.getElementById("finishing-total-display"); // MATCH WITH FRIEND
      if (el) el.textContent = totalMade + " / 40";
    }
  }

  // ════════════════════════════════════════════════════
  // SECTION 4 — BALL HANDLING DRILL TIMERS (Step 4)
  // Each drill card has:
  //   - a clock display:  #clock-{n}
  //   - a start button:   data-drill-action="start" data-drill-id="{n}"
  //   - a stop button:    data-drill-action="stop"  data-drill-id="{n}"
  // Drills unlock sequentially — drill 2 unlocks after drill 1 is stopped, etc.
  // ════════════════════════════════════════════════════

  const DRILL_COUNT = 6;

  // drillTimes[n] = elapsed seconds for drill n (1-indexed)
  const drillTimes = {};
  let activeTimer = null; // holds the setInterval reference while a drill is running

  document.querySelectorAll("[data-drill-action]").forEach((btn) => {
    // MATCH WITH FRIEND — data-drill-action attribute
    btn.addEventListener("click", function () {
      const action = this.getAttribute("data-drill-action"); // "start" or "stop"
      const drillId = parseInt(this.getAttribute("data-drill-id")); // MATCH WITH FRIEND — data-drill-id attribute

      if (action === "start") startDrill(drillId);
      if (action === "stop") stopDrill(drillId);
    });
  });

  function startDrill(drillId) {
    const clockEl = document.getElementById("clock-" + drillId); // MATCH WITH FRIEND — id pattern for clock displays
    const startBtn = document.querySelector(
      `[data-drill-action="start"][data-drill-id="${drillId}"]`,
    );
    const stopBtn = document.querySelector(
      `[data-drill-action="stop"][data-drill-id="${drillId}"]`,
    );
    const drillCard = document.getElementById("drill-" + drillId); // MATCH WITH FRIEND — id pattern for drill cards
    const statusEl = drillCard
      ? drillCard.querySelector(".drill-status")
      : null; // MATCH WITH FRIEND — class on status label

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

    // Store a reference so stopDrill can read elapsed
    drillTimes["_active_elapsed"] = 0;
    drillTimes["_active_interval"] = activeTimer;
    drillTimes["_active_id"] = drillId;
    drillTimes["_active_start"] = Date.now();
  }

  function stopDrill(drillId) {
    clearInterval(activeTimer);
    activeTimer = null;

    // Calculate actual elapsed time from wall clock (more accurate than counter)
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
    const drillCard = document.getElementById("drill-" + drillId); // MATCH WITH FRIEND
    const statusEl = drillCard
      ? drillCard.querySelector(".drill-status")
      : null; // MATCH WITH FRIEND

    stopBtn.disabled = true;
    if (statusEl) {
      statusEl.textContent = formatTime(elapsed);
      statusEl.className = "drill-status done";
    }

    // Unlock the next drill if there is one
    const nextId = drillId + 1;
    if (nextId <= DRILL_COUNT) {
      const nextCard = document.getElementById("drill-" + nextId); // MATCH WITH FRIEND
      const nextStart = document.querySelector(
        `[data-drill-action="start"][data-drill-id="${nextId}"]`,
      );
      if (nextCard) nextCard.classList.remove("locked-drill"); // MATCH WITH FRIEND — locked-drill class
      if (nextStart) nextStart.disabled = false;
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  // ════════════════════════════════════════════════════
  // SECTION 5 — FINAL SUBMISSION ("See My Results")
  // ════════════════════════════════════════════════════

  const seeResultsBtn = document.getElementById("btn-see-results");

  if (seeResultsBtn) {
    seeResultsBtn.addEventListener("click", function () {
      const baseline = calculateBaseline();
      saveBaseline(baseline); // storage.js
      populateResults(baseline);
      goTo("screen-results"); // MATCH WITH FRIEND
    });
  }

  // ════════════════════════════════════════════════════
  // SECTION 6 — CALCULATION LOGIC
  // Reads all stepper inputs and drill times directly from the DOM/memory.
  // Fixed attempt totals: threes=50, mid=25, finishing per-type=10
  // ════════════════════════════════════════════════════

  function calculateBaseline() {
    // ── Threes (step 1) ─────────────────────────────
    // 5 spot cards in #baseline-step-1, each max=10
    const threeInputs = document.querySelectorAll(
      "#baseline-step-1 .spot-stepper input",
    ); // MATCH WITH FRIEND
    let threesMade = 0;
    threeInputs.forEach((inp) => {
      threesMade += parseInt(inp.value || 0);
    });
    const threesAttempted = 50;
    const threePct = Math.round((threesMade / threesAttempted) * 100);

    // ── Mid-range (step 2) ───────────────────────────
    const midInputs = document.querySelectorAll(
      "#baseline-step-2 .spot-stepper input",
    ); // MATCH WITH FRIEND
    let midMade = 0;
    midInputs.forEach((inp) => {
      midMade += parseInt(inp.value || 0);
    });
    const midAttempted = 25;
    const midPct = Math.round((midMade / midAttempted) * 100);

    // ── Finishing (step 3) — per type ────────────────
    // Spot cards are identified by data-spot attribute on the card div
    function getSpotMakes(spotKey) {
      // MATCH WITH FRIEND — data-spot values must match HTML
      const card = document.querySelector(`[data-spot="${spotKey}"]`);
      const input = card ? card.querySelector("input") : null;
      return input ? parseInt(input.value || 0) : 0;
    }

    const layupLeftMade = getSpotMakes("layup-left"); // MATCH WITH FRIEND
    const layupRightMade = getSpotMakes("layup-right"); // MATCH WITH FRIEND
    const floaterMade = getSpotMakes("floater"); // MATCH WITH FRIEND
    const reverseLayupMade = getSpotMakes("reverse-layup"); // MATCH WITH FRIEND

    const layupLeftPct = Math.round((layupLeftMade / 10) * 100);
    const layupRightPct = Math.round((layupRightMade / 10) * 100);
    const floaterPct = Math.round((floaterMade / 10) * 100);
    const reverseLayupPct = Math.round((reverseLayupMade / 10) * 100);

    const totalFinishingMade =
      layupLeftMade + layupRightMade + floaterMade + reverseLayupMade;
    const finishingPct = Math.round((totalFinishingMade / 40) * 100);

    // ── Overall shooting % (threes + mid + finishing) ─
    const totalMade = threesMade + midMade + totalFinishingMade;
    const totalAttempted = 50 + 25 + 40; // 115 total shots
    const overallPct = Math.round((totalMade / totalAttempted) * 100);

    // ── Overall rating (0-100 score shown in the ring) ─
    // Weighted: shooting matters most, finishing second, handling third
    // Weights: threes 25%, mid 20%, finishing 25%, handling 30% (avg drill time)
    const avgDrillTime = calcAvgDrillTime();
    // Normalize drill time to a 0-100 score: longer = better, cap at 120s = 100
    const handlingScore = Math.min(Math.round((avgDrillTime / 120) * 100), 100);
    const overallRating = Math.round(
      threePct * 0.25 +
        midPct * 0.2 +
        finishingPct * 0.25 +
        handlingScore * 0.3,
    );

    // ── Weakest shooting area (used for weekly goal in Phase 2) ─
    const shootingAreas = {
      "Catch & Shoot Threes": threePct,
      "Mid-Range": midPct,
      "Finishing at the Rim": finishingPct,
    };
    const weakestArea = Object.keys(shootingAreas).reduce((a, b) =>
      shootingAreas[a] < shootingAreas[b] ? a : b,
    );

    // Return full baseline object — this shape goes into DATA.md
    return {
      // Threes
      threesMade,
      threesAttempted,
      threePct,
      // Mid-range
      midMade,
      midAttempted: 25,
      midPct,
      // Finishing — per type
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
      // Overall
      overallPct,
      overallRating,
      weakestArea,
      // Ball handling — drill times in seconds
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

  // ════════════════════════════════════════════════════
  // SECTION 7 — POPULATE RESULTS SCREEN
  // Writes calculated values into the results screen elements.
  // IDs must match what your friend built in the results screen HTML.
  // ════════════════════════════════════════════════════

  // Drill names in order — used to populate the drill results list
  const DRILL_NAMES = [
    "Stationary Crossover",
    "Figure-8 Between the Legs",
    "Two-Ball Dribbling",
    "Behind-the-Back Combo",
    "Spider Dribble",
    "Full-Speed Crossover Sprint",
  ];

  function populateResults(baseline) {
    // Overall rating ring
    const ratingEl = document.getElementById("overall-rating"); // MATCH WITH FRIEND
    if (ratingEl) ratingEl.textContent = baseline.overallRating;

    // Shooting
    setElText("result-threes", baseline.threePct + "%"); // MATCH WITH FRIEND
    setElText("result-midrange", baseline.midPct + "%"); // MATCH WITH FRIEND

    // Finishing
    setElText("result-layup-left", baseline.layupLeftPct + "%"); // MATCH WITH FRIEND
    setElText("result-layup-right", baseline.layupRightPct + "%"); // MATCH WITH FRIEND
    setElText("result-floater", baseline.floaterPct + "%"); // MATCH WITH FRIEND
    setElText("result-reverse", baseline.reverseLayupPct + "%"); // MATCH WITH FRIEND

    // Snapshot context lines (makes / attempts)
    setElText("result-threes-context", baseline.threesMade + " / 50 makes"); // MATCH WITH FRIEND
    setElText("result-midrange-context", baseline.midMade + " / 25 makes"); // MATCH WITH FRIEND
    setElText(
      "result-layup-left-context",
      baseline.layupLeftMade + " / 10 makes",
    ); // MATCH WITH FRIEND
    setElText(
      "result-layup-right-context",
      baseline.layupRightMade + " / 10 makes",
    ); // MATCH WITH FRIEND
    setElText("result-floater-context", baseline.floaterMade + " / 10 makes"); // MATCH WITH FRIEND
    setElText(
      "result-reverse-context",
      baseline.reverseLayupMade + " / 10 makes",
    ); // MATCH WITH FRIEND

    // Skill level (from profile)
    const profile = getProfile(); // storage.js
    setElText("result-skill", profile ? profile.skillLevel : "—"); // MATCH WITH FRIEND

    // Ball handling drill results list
    const drillList = document.getElementById("drill-results-list"); // MATCH WITH FRIEND
    if (drillList) {
      drillList.innerHTML = ""; // clear placeholder rows
      for (let i = 1; i <= DRILL_COUNT; i++) {
        const secs = baseline.drillTimes[i] || 0;
        const row = document.createElement("div");
        row.className = "drill-result-row"; // MATCH WITH FRIEND
        row.innerHTML = `
          <span class="drill-result-name">${DRILL_NAMES[i - 1]}</span>
          <span class="drill-result-time">${formatTime(secs)}</span>
        `;
        drillList.appendChild(row);
      }
    }
  }

  // Utility: set text on an element by id, silently skip if element doesn't exist
  function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // If the user lands on the results screen after a refresh, repopulate from storage
  const savedBaseline = getBaseline(); // storage.js
  if (savedBaseline) populateResults(savedBaseline);
});
