// ── Profile ─────────────────────────────────────────
function saveProfile(profileObj) {
  localStorage.setItem("profile", JSON.stringify(profileObj));
}

function getProfile() {
  const data = localStorage.getItem("profile");
  return data ? JSON.parse(data) : null;
}

// ── Baseline Assessment ──────────────────────────────
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

function clearAllData() {
  localStorage.clear();
}
