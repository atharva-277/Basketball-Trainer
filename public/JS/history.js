document.addEventListener("DOMContentLoaded", function () {
  const historyScreen = document.getElementById("screen-history");
  let viewYear, viewMonth;

  const detailPanel = document.getElementById("day-detail-panel");
  const detailDate = document.getElementById("day-detail-date");
  const detailBody = document.getElementById("day-detail-body");
  const detailClose = document.getElementById("day-detail-close");

  if (detailClose) {
    detailClose.addEventListener("click", function () {
      detailPanel.classList.remove("open");
    });
  }

  if (historyScreen) {
    const observer = new MutationObserver(function () {
      if (historyScreen.classList.contains("active")) {
        const today = new Date();
        viewYear = today.getFullYear();
        viewMonth = today.getMonth();
        detailPanel.classList.remove("open");
        renderHistory();
      }
    });
    observer.observe(historyScreen, { attributeFilter: ["class"] });
  }

  function renderHistory() {
    const datesMap = getSessionDatesMap();
    const streaks = calculateStreaks(datesMap);

    renderStreakDisplay(streaks);
    renderCalendar(datesMap);
  }

  function getSessionDatesMap() {
    const sessions = getTrainingSessions();
    const map = {};

    sessions.forEach((session) => {
      const key = dateKey(new Date(session.date));
      map[key] = (map[key] || 0) + 1;
    });

    return map;
  }

  function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function calculateStreaks(datesMap) {
    const activeDays = Object.keys(datesMap).sort();
    if (activeDays.length === 0) return { current: 0, longest: 0 };

    let current = 0;
    let cursor = new Date();
    if (!datesMap[dateKey(cursor)]) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (datesMap[dateKey(cursor)]) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }

    let longest = 0;
    let run = 0;
    let prevDate = null;

    activeDays.forEach((key) => {
      const [y, m, d] = key.split("-").map(Number);
      const thisDate = new Date(y, m - 1, d);

      if (prevDate) {
        const diffDays = Math.round(
          (thisDate - prevDate) / (1000 * 60 * 60 * 24),
        );
        run = diffDays === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }

      longest = Math.max(longest, run);
      prevDate = thisDate;
    });

    return { current, longest };
  }

  function renderStreakDisplay(streaks) {
    const currentEl = document.getElementById("streak-current");
    const longestEl = document.getElementById("streak-longest");
    if (currentEl) currentEl.textContent = streaks.current;
    if (longestEl) longestEl.textContent = streaks.longest;
  }

  const SHOOTING_LABELS = {
    threePct: "Threes",
    midPct: "Mid-Range",
    layupLeftPct: "Left-Hand Layup",
    layupRightPct: "Right-Hand Layup",
    floaterPct: "Floater",
    reverseLayupPct: "Reverse Layup",
    finishingPct: "Finishing (Overall)",
  };

  const HANDLING_DRILL_NAMES = {
    1: "Stationary Crossover",
    2: "Figure-8 Between the Legs",
    3: "Two-Ball Dribbling",
    4: "Behind-the-Back Combo",
    5: "Spider Dribble",
    6: "Full-Speed Crossover Sprint",
  };

  const TYPE_LABELS = {
    shooting: "Shooting Session",
    handling: "Ball Handling Session",
    drill: "Drill Work",
  };

  function showDayDetail(key) {
    const todayKey = dateKey(new Date());
    const [y, m, d] = key.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const readableDate = dateObj.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    detailDate.textContent = readableDate;

    if (key > todayKey) {
      detailBody.innerHTML = `<div class="day-detail-future">Go train today, train on this day when it comes around</div>`;
      openDetailPanel();
      return;
    }

    const sessions = getTrainingSessions().filter(
      (s) => dateKey(new Date(s.date)) === key,
    );

    if (sessions.length === 0) {
      detailBody.innerHTML = `<div class="day-detail-empty">No sessions logged this day.</div>`;
      openDetailPanel();
      return;
    }

    detailBody.innerHTML = sessions.map(renderSessionDetail).join("");
    openDetailPanel();
  }

  function renderSessionDetail(session) {
    let rows = "";

    if (session.type === "handling") {
      const times = session.subsections.drillTimes || {};
      rows = Object.keys(times)
        .map((drillId) => {
          const label = HANDLING_DRILL_NAMES[drillId] || drillId;
          const secs = times[drillId];
          const mm = Math.floor(secs / 60);
          const ss = secs % 60;
          const value = mm + ":" + (ss < 10 ? "0" + ss : ss);
          return `<div class="module-detail-row"><span>${label}</span><span>${value}</span></div>`;
        })
        .join("");
    } else {
      rows = Object.keys(session.subsections)
        .map((key) => {
          let label, value;
          if (session.type === "shooting") {
            label = SHOOTING_LABELS[key] || key;
            value = session.subsections[key] + "%";
          } else {
            label = key;
            value = session.subsections[key] + " reps";
          }
          return `<div class="module-detail-row"><span>${label}</span><span>${value}</span></div>`;
        })
        .join("");
    }

    return `
    <div class="day-detail-session">
      <div class="day-detail-session-type">${TYPE_LABELS[session.type] || session.type}</div>
      ${rows}
    </div>
  `;
  }

  function openDetailPanel() {
    detailPanel.classList.remove("open");
    void detailPanel.offsetWidth;
    detailPanel.classList.add("open");
    setTimeout(() => {
      detailPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 160);
  }

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function renderCalendar(datesMap) {
    const label = document.getElementById("calendar-month-label");
    const grid = document.getElementById("calendar-grid");
    if (!label || !grid) return;

    label.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const todayKey = dateKey(new Date());

    let cellsHtml = "";

    for (let i = 0; i < startWeekday; i++) {
      cellsHtml += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = dateKey(new Date(viewYear, viewMonth, day));
      const isActive = !!datesMap[key];
      const isToday = key === todayKey;
      const isFuture = key > todayKey;

      const classes = ["calendar-day"];
      if (isActive) classes.push("active-day");
      if (isToday) classes.push("today");

      cellsHtml += `<div class="${classes.join(" ")}" data-date="${key}">${day}</div>`;
    }

    grid.innerHTML = cellsHtml;

    grid.querySelectorAll(".calendar-day:not(.empty)").forEach((cell) => {
      cell.addEventListener("click", function () {
        showDayDetail(this.getAttribute("data-date"));
      });
    });
  }

  const prevBtn = document.getElementById("cal-prev-month");
  const nextBtn = document.getElementById("cal-next-month");

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      viewMonth--;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
      }
      detailPanel.classList.remove("open");
      renderCalendar(getSessionDatesMap());
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      viewMonth++;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
      }
      detailPanel.classList.remove("open");
      renderCalendar(getSessionDatesMap());
    });
  }
});
