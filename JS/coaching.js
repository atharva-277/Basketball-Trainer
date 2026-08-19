const JUMPSHOT_MISS_REASONS = [
  "short",
  "long",
  "offTargetLeft",
  "offTargetRight",
  "rushed",
];

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
    "Load your legs before the catch — let the power come from your base, not your arm.",
    "Catch on the hop, don't collect and reset. A dead stop kills your leg drive.",
    "Push up through the floor as you shoot — if you're flat-footed, you're leaving the shot short.",
  ],
  long: [
    "Ease off trying to muscle it — a set base gives you enough power on its own.",
    "Check if you're lunging into the shot. A controlled base beats a rushed one.",
    "Let your legs do less work if you're a set-shot, comfortable distance — power should feel repeatable, not maxed out.",
  ],
  offTargetLeft: [
    "Square your lead foot to the rim before you catch — a turned foot pulls the whole shot with it.",
    "Check your base width. Too narrow and your balance drifts sideways mid-shot.",
  ],
  offTargetRight: [
    "Same fix, opposite side — point your feet at the rim, not at the passer or your gather direction.",
    "Widen your stance slightly if you're finding yourself drifting on the release.",
  ],
  rushed: [
    "Find your gather step. Catching mid-stride without a set point is why the shot feels rushed.",
    "Reset your feet on every single rep — no exceptions, even in a drill. That habit is what shows up in games.",
  ],
};

const FINISHING_CUES = {
  offBalance: [
    "Slow the last two steps down before you attack the rim — most balance issues start before you even leave the ground.",
    "Get your body under control before the gather. Speed is good, but not if you're falling into the finish.",
  ],
  rushed: [
    "Let the defense dictate your speed, not the other way around — attacking under control still beats attacking recklessly.",
    "Take one more beat to gather before you go up. A rushed finish is usually an unset gather.",
  ],
  wrongFootwork: [
    "Check your gather step — same foot pattern every time builds consistency at the rim.",
    "Land your gather on the correct foot for this finish before you leave your feet, not after.",
  ],
  touch: [
    "Think about touch, not force — a finish at the rim needs less power than it feels like in traffic.",
    "Work on releasing off your fingertips with a soft touch rather than pushing the ball at the rim.",
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
    "Keep the ball below your waist — a high dribble is the first thing that gets you out of control.",
    "Shorten your dribble height. You should be pushing the ball down, not bouncing it.",
  ],
  wideHands: [
    "Keep your hand on top of the ball, not off to the side — that's what gives you control on contact.",
    "Tighten up where your hand meets the ball. Too wide and you lose it on every change of direction.",
  ],
  eyesDown: [
    "Get your eyes up. Looking at the ball is why you lose the feel for where your hand actually is.",
    "Practice this drill while looking at a fixed point across the room — force the habit.",
  ],
  looseHandle: [
    "Tighten the move up — smaller, quicker taps beat big, loose ones for staying in control.",
    "Slow the drill down a notch and focus on control before trying to speed it back up.",
  ],
};

const LIVE_CUES = {
  paceControl: [
    "You don't have to go full speed to be effective — control your pace, then push it once it's clean.",
    "Slow down 10%, get the move clean, then build speed back up. Control first, speed second.",
  ],
  predictable: [
    "Mix up your rhythm — a hesitation or change of pace inside the move keeps you unpredictable.",
    "Don't let the move become a metronome. Vary the timing, not just the speed.",
  ],
  eyesDown: [
    "Eyes up, even at full speed — that's the difference between a drill and a game-usable move.",
    "If your eyes are down, slow the drill back down until you can keep them up.",
  ],
  footworkBreakdown: [
    "Check your feet — most live-speed breakdowns start with footwork, not hands.",
    "Stay balanced on your base as you move. If your feet get sloppy, the handle follows.",
  ],
};

const NEUTRAL_CUES = {
  offHandLag: [
    "Your off-hand is doing less work than your strong hand — slow down and force it to match.",
    "Isolate your weak hand for a few reps by itself before going back to both together.",
  ],
  rhythmBreak: [
    "Both hands need to stay on the same clock — if one drifts, the whole rhythm falls apart.",
    "Count the dribble out loud or in your head to keep both hands locked to the same tempo.",
  ],
  eyesDown: [
    "Eyes up here too — this drill is as much about vision as it is about your hands.",
    "Get comfortable enough that you're not watching either ball to keep control.",
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
