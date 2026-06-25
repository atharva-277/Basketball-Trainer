// ── storage.js ──────────────────────────────────────
// The ONLY file in the project that touches localStorage.
// Every other file calls these functions — never localStorage directly.
//
// Profile object shape:
// {
//   age:          19,
//   heightInches: 74,
//   weightLbs:    185,
//   skillLevel:   "Intermediate"  // "Beginner"|"Intermediate"|"Advanced"|"Elite"
// }
//
// Baseline object shape:
// {
//   threesMade, threesAttempted, threePct,
//   midMade, midAttempted, midPct,
//   layupLeftMade, layupLeftPct,
//   layupRightMade, layupRightPct,
//   floaterMade, floaterPct,
//   reverseLayupMade, reverseLayupPct,
//   totalFinishingMade, finishingPct,
//   overallPct, overallRating, weakestArea,
//   drillTimes: { 1: seconds, 2: seconds, ... 6: seconds }
// }

// ── Profile ──────────────────────────────────────────
function saveProfile(profileObj) {
  localStorage.setItem("profile", JSON.stringify(profileObj));
}

function getProfile() {
  const data = localStorage.getItem("profile");
  return data ? JSON.parse(data) : null;
}

// ── Baseline ─────────────────────────────────────────
function saveBaseline(baselineObj) {
  localStorage.setItem("baseline", JSON.stringify(baselineObj));
}

function getBaseline() {
  const data = localStorage.getItem("baseline");
  return data ? JSON.parse(data) : null;
}

// ── Helpers ──────────────────────────────────────────
function hasCompletedOnboarding() {
  return getProfile() !== null && getBaseline() !== null;
}

// Call this in the browser console during dev to reset the app to a fresh state:
// clearAllData()
function clearAllData() {
  localStorage.clear();
}
