// Profile object shape:
// {
//   age: 19,
//   heightInches: 74,
//   weightLbs: 185,
//   skillLevel: "Intermediate"  // "Beginner"|"Intermediate"|"Advanced"|"Elite"
//   units: "imperial"
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
//
// Session object shape:
// {
//   date: "2026-08-04T...",
//   type: "shooting" | "handling",
//   subsections: {
//     // shooting example:
//     threes: { attempts, made, pct },
//     midrange: { attempts, made, pct },
//     finishing: { attempts, made, pct }
//     // handling example:
//     // drillId: { seconds }
//   }
// }
//
// iqSkills object shape:
// {
//   passingVision:      { score: 62, attempts: 14 },
//   foulPrevention:      { score: 71, attempts: 9 },
//   lateClockDecisions:  { score: 55, attempts: 20 },
//   pickRollCoverage:    { score: 68, attempts: 11 }
// }
//
// currentPerformance object shape:
// {
//   threePct, midPct, finishingPct,
//   layupLeftPct, layupRightPct, floaterPct, reverseLayupPct,
//   drillTimes: { 1: seconds, ..., 6: seconds }
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

function saveTrainingSession(sessionObj) {
  const sessions = getTrainingSessions();
  sessions.push(sessionObj);
  localStorage.setItem("trainingSessions", JSON.stringify(sessions));
}

function getTrainingSessions() {
  const data = localStorage.getItem("trainingSessions");
  return data ? JSON.parse(data) : [];
}

function saveIqSkills(iqSkillsObj) {
  localStorage.setItem("iqSkills", JSON.stringify(iqSkillsObj));
}

function getIqSkills() {
  const data = localStorage.getItem("iqSkills");
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

function saveCurrentPerformance(perfObj) {
  localStorage.setItem("currentPerformance", JSON.stringify(perfObj));
}

function getCurrentPerformance() {
  const data = localStorage.getItem("currentPerformance");
  return data ? JSON.parse(data) : null;
}

function hasCompletedOnboarding() {
  return getProfile() !== null && getBaseline() !== null;
}

function inchesToCm(inches) {
  return Math.round(inches * 2.54);
}
function cmToInches(cm) {
  return Math.round(cm / 2.54);
}
function lbsToKg(lbs) {
  return Math.round(lbs * 0.453592);
}
function kgToLbs(kg) {
  return Math.round(kg / 0.453592);
}

function clearAllData() {
  localStorage.clear();
}
