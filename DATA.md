# Baseline — Data Reference

## User Profile

Saved to localStorage under the key "profile"

{
age: 19,
heightInches: 74,
weightLbs: 185,
skillLevel: "Intermediate" // "Beginner" | "Intermediate" | "Advanced" | "Elite"
}

## Baseline Assessment

Saved to localStorage under the key "baseline"

{
threesMade, threesAttempted, threePct,
midMade, midAttempted, midPct,
layupLeftMade, layupLeftPct,
layupRightMade, layupRightPct,
floaterMade, floaterPct,
reverseLayupMade, reverseLayupPct,
totalFinishingMade, finishingPct,
overallPct, overallRating, weakestArea,
drillTimes: { 1: seconds, 2: seconds, ... 6: seconds }
}
