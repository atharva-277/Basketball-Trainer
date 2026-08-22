function computeWeaknessWeights(valuesMap, baseWeight = 10) {
  const keys = Object.keys(valuesMap);
  const values = keys.map((k) => valuesMap[k]);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

  const result = {};
  let totalWeight = 0;

  keys.forEach((key) => {
    const value = valuesMap[key];
    const deficit = Math.max(avg - value, 0);
    const weight = baseWeight + deficit;
    result[key] = { value, deficit, weight };
    totalWeight += weight;
  });

  keys.forEach((key) => {
    result[key].normalizedWeight = result[key].weight / totalWeight;
  });

  return result;
}

function getShootingWeaknessRanking() {
  const baseline = getBaseline();
  if (!baseline) return null;
  const source = getCurrentPerformance() || baseline;

  const values = {
    threes: source.threePct,
    midrange: source.midPct,
    finishing: source.finishingPct,
  };

  return computeWeaknessWeights(values);
}

function getHandlingWeaknessRanking() {
  const baseline = getBaseline();
  if (!baseline || !baseline.drillTimes) return null;
  const source = getCurrentPerformance() || baseline;

  const values = {};
  for (let i = 1; i <= 6; i++) {
    values[i] = (source.drillTimes && source.drillTimes[i]) || 0;
  }

  return computeWeaknessWeights(values);
}

function blendWeights(weaknessRanking, dietRawValues, dietInfluence = 0.3) {
  const keys = Object.keys(weaknessRanking);
  const dietTotal = keys.reduce((sum, k) => sum + (dietRawValues[k] || 0), 0);

  const blended = {};
  let totalWeight = 0;

  keys.forEach((key) => {
    const weaknessShare = weaknessRanking[key].normalizedWeight;
    const dietShare = dietTotal > 0 ? (dietRawValues[key] || 0) / dietTotal : 0;
    const finalWeight =
      weaknessShare * (1 - dietInfluence) + dietShare * dietInfluence;
    blended[key] = { ...weaknessRanking[key], dietShare, finalWeight };
    totalWeight += finalWeight;
  });

  keys.forEach((key) => {
    blended[key].normalizedFinalWeight = blended[key].finalWeight / totalWeight;
  });

  return blended;
}

function generateShootingSession(totalAttempts = 60) {
  const weakness = getShootingWeaknessRanking();
  const diet = getShotDiet();
  if (!weakness || !diet) return null;

  const dietValues = {
    threes: diet.threes,
    midrange: diet.midRange,
    finishing: diet.layups,
  };

  const blended = blendWeights(weakness, dietValues);

  const session = { type: "shooting", totalAttempts, subsections: {} };

  Object.keys(blended).forEach((key) => {
    session.subsections[key] = {
      attempts: Math.round(totalAttempts * blended[key].normalizedFinalWeight),
      normalizedWeight: blended[key].normalizedFinalWeight,
    };
  });

  return session;
}

const DRILL_DIET_CATEGORY = {
  1: "control", // Stationary Crossover
  2: "control", // Figure-8 Between the Legs
  3: "neutral", // Two-Ball Dribbling
  4: "live", // Behind-the-Back Combo
  5: "live", // Spider Dribble
  6: "live", // Full-Speed Crossover Sprint
};

const CONTROL_THRESHOLD_MIN = 20;
const CONTROL_THRESHOLD_MAX = 40;

function getControlThreshold(diet) {
  const ratio = diet.ballHandling / 100;
  return (
    CONTROL_THRESHOLD_MIN +
    ratio * (CONTROL_THRESHOLD_MAX - CONTROL_THRESHOLD_MIN)
  );
}

function getControlProficiency() {
  const baseline = getBaseline();
  if (!baseline) return null;
  const source = getCurrentPerformance() || baseline;
  const times = source.drillTimes || {};
  return ((times[1] || 0) + (times[2] || 0)) / 2;
}

function generateHandlingSession(totalMinutes = 12) {
  const weakness = getHandlingWeaknessRanking();
  const diet = getShotDiet();
  if (!weakness || !diet) return null;

  const threshold = getControlThreshold(diet);
  const controlProficiency = getControlProficiency();
  const readyForLiveWork =
    controlProficiency !== null && controlProficiency >= threshold;

  const liveScore = diet.layups + diet.ballHandling;
  const controlScore = diet.threes + diet.midRange;
  const neutralScore = (liveScore + controlScore) / 2;

  const dietValues = {};
  Object.keys(weakness).forEach((drillId) => {
    const category = DRILL_DIET_CATEGORY[drillId];
    if (category === "live") {
      dietValues[drillId] = readyForLiveWork ? liveScore : 0;
    } else if (category === "control") {
      dietValues[drillId] = controlScore;
    } else {
      dietValues[drillId] = neutralScore;
    }
  });

  const blended = blendWeights(weakness, dietValues);
  const totalSeconds = totalMinutes * 60;

  const session = {
    type: "handling",
    totalMinutes,
    readyForLiveWork,
    controlProficiency,
    threshold,
    drills: {},
  };

  Object.keys(blended).forEach((drillId) => {
    session.drills[drillId] = {
      seconds: Math.round(
        totalSeconds * blended[drillId].normalizedFinalWeight,
      ),
      normalizedWeight: blended[drillId].normalizedFinalWeight,
    };
  });

  return session;
}

function getFinishingWeaknessRanking() {
  const baseline = getBaseline();
  if (!baseline) return null;
  const source = getCurrentPerformance() || baseline;

  const values = {
    layupLeft: source.layupLeftPct,
    layupRight: source.layupRightPct,
    floater: source.floaterPct,
    reverseLayup: source.reverseLayupPct,
  };

  return computeWeaknessWeights(values);
}

function expandFinishingAttempts(finishingAttempts) {
  const subRanking = getFinishingWeaknessRanking();
  if (!subRanking) return null;

  const breakdown = {};
  Object.keys(subRanking).forEach((key) => {
    breakdown[key] = Math.round(
      finishingAttempts * subRanking[key].normalizedWeight,
    );
  });

  return breakdown;
}

const PERFORMANCE_DECAY = 0.75;

function updateCurrentPerformance(sessionResults) {
  const baseline = getBaseline();
  if (!baseline) return;

  const current = getCurrentPerformance() || { ...baseline };

  Object.keys(sessionResults).forEach((key) => {
    if (key === "drillTimes") {
      current.drillTimes = current.drillTimes || {};
      Object.keys(sessionResults.drillTimes).forEach((drillId) => {
        const oldVal =
          current.drillTimes[drillId] ?? baseline.drillTimes[drillId] ?? 0;
        const newVal = sessionResults.drillTimes[drillId];
        current.drillTimes[drillId] = Math.round(
          PERFORMANCE_DECAY * oldVal + (1 - PERFORMANCE_DECAY) * newVal,
        );
      });
    } else {
      const oldVal = current[key] ?? baseline[key] ?? 0;
      const newVal = sessionResults[key];
      current[key] = Math.round(
        PERFORMANCE_DECAY * oldVal + (1 - PERFORMANCE_DECAY) * newVal,
      );
    }
  });

  saveCurrentPerformance(current);
}

function getCurrentOverallStatus() {
  const baseline = getBaseline();
  if (!baseline) return null;
  const source = getCurrentPerformance() || baseline;

  const times = source.drillTimes || {};
  const times_arr = [1, 2, 3, 4, 5, 6].map((i) => times[i] || 0);
  const avgDrillTime = times_arr.reduce((a, b) => a + b, 0) / times_arr.length;
  const handlingScore = Math.min(Math.round((avgDrillTime / 120) * 100), 100);

  const overallPct = Math.round(
    source.threePct * 0.25 +
      source.midPct * 0.2 +
      source.finishingPct * 0.25 +
      handlingScore * 0.3,
  );

  const allAreas = {
    "Catch & Shoot Threes": source.threePct,
    "Mid-Range": source.midPct,
    "Finishing at the Rim": source.finishingPct,
    "Ball Handling": handlingScore,
  };
  const weakestArea = Object.keys(allAreas).reduce((a, b) =>
    allAreas[a] < allAreas[b] ? a : b,
  );

  return { overallPct, weakestArea, handlingScore };
}
