// Profile object shape:
// {
//   age: 19,
//   heightInches: 74,
//   weightLbs: 185,
//   skillLevel: "Intermediate"  // "Beginner"|"Intermediate"|"Advanced"|"Elite"
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
//
//Shot diet object shape:
// {
//   threes: 25,
//   midRange: 25,
//   layups: 25,
//   ballHandling: 25
// }
//
// Workout plan object shape:
// {
//   weeklyGoal: { area: "Catch & Shoot Threes", currentPct: 30, targetPct: 38, label: "Hit 38% from three" },
//   modules: [ { name, category, priority, drills: [...] } ],
//   generatedAt: timestamp
// }

function saveProfile(profileObj) {
  localStorage.setItem("profile", JSON.stringify(profileObj));
}

function getProfile() {
  const data = localStorage.getItem("profile");
  return data ? JSON.parse(data) : null;
}

function saveBaseline(baselineObj) {
  localStorage.setItem("baseline", JSON.stringify(baselineObj));
}

function getBaseline() {
  const data = localStorage.getItem("baseline");
  return data ? JSON.parse(data) : null;
}

function saveShotDiet(dietObj) {
  localStorage.setItem("shotDiet", JSON.stringify(dietObj));
}

function getShotDiet() {
  const data = localStorage.getItem("shotDiet");
  return data ? JSON.parse(data) : null;
}

function saveWorkoutPlan(planObj) {
  localStorage.setItem("workoutPlan", JSON.stringify(planObj));
}

function getWorkoutPlan() {
  const data = localStorage.getItem("workoutPlan");
  return data ? JSON.parse(data) : null;
}

function hasCompletedOnboarding() {
  return getProfile() !== null && getBaseline() !== null;
}

function clearAllData() {
  localStorage.clear();
}
