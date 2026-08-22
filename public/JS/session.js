let activeLogType = null;
let activeLogItems = [];
let logMakes = {};
let logActual = {};
let logMissTags = {};
let logSelectedTag = {};

function startLogSession(type) {
  activeLogType = type;
  logMakes = {};
  logActual = {};
  logMissTags = {};
  logSelectedTag = {};

  const titleEl = document.getElementById("log-session-title");
  const cuesEl = document.getElementById("log-session-cues");
  const itemsEl = document.getElementById("log-session-items");
  const submitBtn = document.getElementById("btn-submit-log");
  cuesEl.style.display = "none";
  cuesEl.innerHTML = "";
  itemsEl.style.display = "block";
  submitBtn.style.display = "block";

  if (type === "shooting") {
    const session = generateShootingSession();
    if (!session) return;
    titleEl.textContent = "Log Shooting Results";

    const finishingBreakdown =
      expandFinishingAttempts(session.subsections.finishing.attempts) || {};
    const finishingLabels = {
      layupLeft: "Left-Hand Layup",
      layupRight: "Right-Hand Layup",
      floater: "Floater",
      reverseLayup: "Reverse Layup",
    };

    activeLogItems = [
      {
        key: "threes",
        label: "Threes",
        target: session.subsections.threes.attempts,
        taxonomy: "jumpshot",
      },
      {
        key: "midrange",
        label: "Mid-Range",
        target: session.subsections.midrange.attempts,
        taxonomy: "jumpshot",
      },
      ...Object.keys(finishingBreakdown).map((key) => ({
        key,
        label: finishingLabels[key],
        target: finishingBreakdown[key],
        taxonomy: "finishing",
      })),
    ];
  } else {
    const session = generateHandlingSession();
    if (!session) return;
    titleEl.textContent = "Log Ball Handling Results";

    const drillNames = {
      1: "Stationary Crossover",
      2: "Figure-8 Between the Legs",
      3: "Two-Ball Dribbling",
      4: "Behind-the-Back Combo",
      5: "Spider Dribble",
      6: "Full-Speed Crossover Sprint",
    };
    const drillCategory = {
      1: "control",
      2: "control",
      3: "neutral",
      4: "live",
      5: "live",
      6: "live",
    };

    activeLogItems = Object.keys(session.drills).map((drillId) => ({
      key: drillId,
      label: drillNames[drillId],
      target: session.drills[drillId].seconds,
      category: drillCategory[drillId],
    }));
  }

  renderLogItems();
  goTo("screen-log-session");
}

function renderLogItems() {
  const container = document.getElementById("log-session-items");
  container.innerHTML = "";

  activeLogItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "log-item-card";

    if (activeLogType === "shooting") {
      card.innerHTML = `
        <div class="log-item-header">
          <span class="log-item-name">${item.label}</span>
          <span class="log-item-target">${item.target} attempts</span>
        </div>
        <div class="log-input-row">
          <label>Makes</label>
          <input type="number" min="0" max="${item.target}" value="0" id="log-makes-${item.key}" />
        </div>
        <div class="miss-tags" id="miss-tags-${item.key}"></div>
      `;
    } else {
      card.innerHTML = `
        <div class="log-item-header">
          <span class="log-item-name">${item.label}</span>
          <span class="log-item-target">target ${item.target}s</span>
        </div>
        <div class="log-input-row">
          <label>Seconds achieved</label>
          <input type="number" min="0" value="0" id="log-actual-${item.key}" />
        </div>
        <p class="miss-tags-prompt">If you lost it, tag why:</p>
        <div class="miss-tags" id="miss-tags-${item.key}"></div>
      `;
    }

    container.appendChild(card);
    renderMissTags(item);

    const numInput = card.querySelector("input[type='number']");
    numInput.addEventListener("input", function () {
      let val = parseInt(this.value) || 0;
      if (activeLogType === "shooting") {
        val = Math.max(0, Math.min(val, item.target));
        this.value = val;
        logMakes[item.key] = val;
      } else {
        val = Math.max(0, val);
        this.value = val;
        logActual[item.key] = val;
      }
    });
  });
}

function renderMissTags(item) {
  const wrap = document.getElementById(`miss-tags-${item.key}`);
  if (!wrap) return;

  if (activeLogType === "shooting") {
    const tags =
      item.taxonomy === "jumpshot"
        ? JUMPSHOT_MISS_REASONS
        : FINISHING_MISS_REASONS;
    if (!logMissTags[item.key]) logMissTags[item.key] = {};

    wrap.innerHTML = tags
      .map((tag) => {
        const count = logMissTags[item.key][tag] || 0;
        return `
          <div class="miss-tag-counter ${count > 0 ? "tagged" : ""}">
            <span class="miss-tag-label">${formatTagLabel(tag)}</span>
            <button type="button" data-tag-key="${item.key}" data-tag-name="${tag}" data-tag-dir="dec">−</button>
            <span class="miss-tag-count">${count}</span>
            <button type="button" data-tag-key="${item.key}" data-tag-name="${tag}" data-tag-dir="inc">+</button>
          </div>`;
      })
      .join("");

    wrap.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", function () {
        const key = this.getAttribute("data-tag-key");
        const tag = this.getAttribute("data-tag-name");
        const dir = this.getAttribute("data-tag-dir");
        const current = logMissTags[key][tag] || 0;
        logMissTags[key][tag] =
          dir === "inc" ? current + 1 : Math.max(0, current - 1);
        renderMissTags(item);
      });
    });
  } else {
    const tags =
      item.category === "control"
        ? CONTROL_MISS_REASONS
        : item.category === "live"
          ? LIVE_MISS_REASONS
          : NEUTRAL_MISS_REASONS;

    const selected = logSelectedTag[item.key] || null;

    wrap.innerHTML = tags
      .map(
        (tag) =>
          `<button type="button" class="miss-tag-btn ${tag === selected ? "tagged" : ""}" data-tag-key="${item.key}" data-tag-name="${tag}">${formatTagLabel(tag)}</button>`,
      )
      .join("");

    wrap.querySelectorAll(".miss-tag-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const key = this.getAttribute("data-tag-key");
        const tag = this.getAttribute("data-tag-name");
        logSelectedTag[key] = logSelectedTag[key] === tag ? null : tag;
        renderMissTags(item);
      });
    });
  }
}

function formatTagLabel(tag) {
  return tag.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("btn-submit-log");
  if (submitBtn) {
    submitBtn.addEventListener("click", submitLogSession);
  }
});

function submitLogSession() {
  const errorEl = document.getElementById("log-session-error");
  const missingItems = [];

  if (activeLogType === "shooting") {
    activeLogItems.forEach((item) => {
      const makes = logMakes[item.key] || 0;
      if (makes < item.target) {
        const breakdown = logMissTags[item.key];
        const taggedCount = breakdown
          ? Object.values(breakdown).reduce((sum, c) => sum + c, 0)
          : 0;
        if (taggedCount === 0) missingItems.push(item.label);
      }
    });
  } else {
    activeLogItems.forEach((item) => {
      const actual = logActual[item.key] || 0;
      if (actual < item.target && !logSelectedTag[item.key]) {
        missingItems.push(item.label);
      }
    });
  }

  if (missingItems.length > 0) {
    errorEl.textContent = "Tag a miss reason for: " + missingItems.join(", ");
    errorEl.style.display = "block";
    return;
  }

  errorEl.style.display = "none";

  const sessionResults = {};
  const cues = [];

  if (activeLogType === "shooting") {
    let finishMade = 0,
      finishAttempts = 0;

    activeLogItems.forEach((item) => {
      const makes = logMakes[item.key] || 0;
      const pct = item.target > 0 ? Math.round((makes / item.target) * 100) : 0;

      if (item.key === "threes") sessionResults.threePct = pct;
      else if (item.key === "midrange") sessionResults.midPct = pct;
      else {
        sessionResults[item.key + "Pct"] = pct;
        finishMade += makes;
        finishAttempts += item.target;
      }

      const breakdown = logMissTags[item.key];
      if (breakdown && Object.values(breakdown).some((c) => c > 0)) {
        const cue = getCueForSubsection(item.key, breakdown);
        if (cue) cues.push({ label: item.label, cue });
      }
    });

    if (finishAttempts > 0) {
      sessionResults.finishingPct = Math.round(
        (finishMade / finishAttempts) * 100,
      );
    }
  } else {
    sessionResults.drillTimes = {};
    activeLogItems.forEach((item) => {
      const actual = logActual[item.key] || 0;
      sessionResults.drillTimes[item.key] = actual;

      const tag = logSelectedTag[item.key];
      if (tag) {
        const cue = getCueForDrill(item.key, { [tag]: 1 });
        if (cue) cues.push({ label: item.label, cue });
      }
    });
  }

  updateCurrentPerformance(sessionResults);
  saveTrainingSession({
    date: new Date().toISOString(),
    type: activeLogType,
    subsections: sessionResults,
  });

  renderCues(cues);
}

function renderCues(cues) {
  const cuesEl = document.getElementById("log-session-cues");
  const itemsEl = document.getElementById("log-session-items");
  const submitBtn = document.getElementById("btn-submit-log");

  itemsEl.style.display = "none";
  submitBtn.style.display = "none";
  document.getElementById("log-session-error").style.display = "none";

  if (cues.length === 0) {
    cuesEl.innerHTML = `<div class="cue-card"><strong>Nice work</strong>Clean session — no misses tagged.</div>`;
  } else {
    cuesEl.innerHTML = cues
      .map(
        (c) =>
          `<div class="cue-card"><strong>${c.label}</strong>${c.cue}</div>`,
      )
      .join("");
  }
  cuesEl.style.display = "block";
}
