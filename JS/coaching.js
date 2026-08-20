const JUMPSHOT_MISS_REASONS = ["short", "long", "offTarget", "rushed"];

const FINISHING_MISS_REASONS = [
  "offBalance",
  "rushed",
  "wrongFootwork",
  "touch",
];

const SUBSECTION = {
  threes: "jumpshot",
  midrange: "jumpshot",
  layupLeft: "finishing",
  layupRight: "finishing",
  floater: "finishing",
  reverseLayup: "finishing",
};

const JUMPSHOT_CUES = {
  short: [
    "Power your base to be prepared for the shot.",
    "Keep your movement fluid so you're not losing momentum",
    "Follow through with your limbs to generate enough power.",
  ],
  long: [
    "Don't muscle into it, a good base has enough power",
    "Don't rush the shot, be calm and smooth with your movement.",
    "Your power should be a repeatable action, not a slam dunk every time.",
  ],
  offTarget: [
    "Make sure your feet are pointed correctly, otherwise your inaccurate.",
    "Keep your feet a comfortable amount apart to avoid drifting.",
  ],
  rushed: [
    "Plan out your steps before you start moving.",
    "Reset your feet and visualize your steps every time.",
  ],
};

const FINISHING_CUES = {
  offBalance: [
    "Slow down to gain balance before powering into it.",
    "Stay composed, a faulty slipup can mess up every other shot as well.",
  ],
  rushed: [
    "Lull the defense into their own rhythm before finishing.",
    "Set yourself up to make sure you know where you go before you're there.",
  ],
  wrongFootwork: [
    "Practice your exact footwork before taking shots, it'll come naturally when you actually shoot then.",
    "Know your landing foot after every time, no matter where you're coming from.",
  ],
  touch: [
    "Remember that you're alone at the rim, be particular in placement.",
    "Place the ball in the rim, don't let the ball have the option to rim out.",
  ],
};

function getDominantMissReason(missBreakdown) {
  if (!missBreakdown) return null;
  const keys = Object.keys(missBreakdown);
  if (keys.length === 0) return null;

  return keys.reduce((topKey, key) =>
    missBreakdown[key] > missBreakdown[topKey] ? key : topKey,
  );
}

function getCueForMiss(subsection, missReason) {
  const taxonomy = SUBSECTION[subsection];
  if (!taxonomy || !missReason) return null;

  const bank = taxonomy === "jumpshot" ? JUMPSHOT_CUES : FINISHING_CUES;
  const cues = bank[missReason];
  if (!cues || cues.length === 0) return null;

  return cues[Math.floor(Math.random() * cues.length)];
}

function getCueForSubsection(subsection, missBreakdown) {
  const dominantReason = getDominantMissReason(missBreakdown);
  return getCueForMiss(subsection, dominantReason);
}

const DRILL_CATEGORY = {
  1: "control", // Stationary Crossover
  2: "control", // Figure-8 Between the Legs
  3: "neutral", // Two-Ball Dribbling
  4: "live", // Behind-the-Back Combo
  5: "live", // Spider Dribble
  6: "live", // Full-Speed Crossover Sprint
};

const CONTROL_MISS_REASONS = [
  "ballTooHigh",
  "wideHands",
  "eyesDown",
  "looseHandle",
];
const LIVE_MISS_REASONS = [
  "paceControl",
  "predictable",
  "eyesDown",
  "footworkBreakdown",
];
const NEUTRAL_MISS_REASONS = ["offHandLag", "rhythmBreak", "eyesDown"];

const CONTROL_CUES = {
  ballTooHigh: [
    "Keep the ball below your waist since dribbling high limits your control.",
    "Shorten your dribble height. Don't try to bounce the ball as high.",
  ],
  wideHands: [
    "Keep your hand on top of the ball to maintain control every contact.",
    "Tighten up where your hand meets the ball. Ensure that your hand is in control, not your fingers.",
  ],
  eyesDown: [
    "Keep your eyes up and get a feel for where the ball is in space.",
    "Focus on a point in the distance and feel for where the ball is.",
  ],
  looseHandle: [
    "Tighten up and keep small movements, no need to generate big dribbles.",
    "Slow down and get the drill down before focusing on speed.",
  ],
};

const LIVE_CUES = {
  paceControl: [
    "Control your pace one dribble at a time",
    "Slow down and focus on the specific movement.",
  ],
  predictable: [
    "Mixup your movement and don't hesitate to change direction.",
    "Don't be rigid, vary up tempo and direction while maintaining speed",
  ],
  eyesDown: [
    "Eyes up, always focus on movements and not the ball",
    "Slow down and focus up before speeding up, don't let the ball control your eyes",
  ],
  footworkBreakdown: [
    "Make sure your feet are set and are ready to move.",
    "Stay balanced, don't shift around and mess up the handle.",
  ],
};

const NEUTRAL_CUES = {
  offHandLag: [
    "Force both hands to split the work, one hand can't dictate the rhythm.",
    "Try the drill with just your weak hand to get a better feel.",
  ],
  rhythmBreak: [
    "Keep the same tempo, don't let your hands desync",
    "Count out loud to keep a consistent tempo.",
  ],
  eyesDown: [
    "Keep you eyes up, and ensure you're aware of your surroundings.",
    "Don't let the ball take control of your eyes.",
  ],
};

function getCueForDrill(drillId, missBreakdown) {
  const category = DRILL_CATEGORY[drillId];
  if (!category) return null;

  const dominantReason = getDominantMissReason(missBreakdown);
  if (!dominantReason) return null;

  const bank =
    category === "control"
      ? CONTROL_CUES
      : category === "live"
        ? LIVE_CUES
        : NEUTRAL_CUES;

  const cues = bank[dominantReason];
  if (!cues || cues.length === 0) return null;

  return cues[Math.floor(Math.random() * cues.length)];
}
