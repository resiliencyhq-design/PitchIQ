# Sprint 12.5C — Coaching Intelligence Integration

## Objective
Use reliable Football IQ assessment evidence to personalise the Training mission without changing app startup, routing, Home, Results, Player, XP, or the live-rep controller.

## Behaviour
- Read the latest stored Football IQ profile for the current player.
- Reuse the latest Coaching Intelligence output when it matches the current assessment.
- Otherwise generate and persist a new Coaching Intelligence output.
- Convert developing and strong confidence bands into the adaptive engine's evidence contract.
- Personalise only when Coaching Intelligence reports `ready` evidence.
- Continue balanced evidence-building when evidence is unavailable or insufficient.
- Preserve the existing `Scan First` fallback when loading fails.

## Confidence bridge
- `strong_confidence` → 0.90 confidence, 5 observations.
- `developing_confidence` → 0.70 confidence, 3 observations.
- `emerging_evidence` → 0.30 confidence, 1 observation and remains below the personalisation threshold.

## Architecture safeguards
- Coaching Intelligence loads dynamically only after Training is selected.
- No global adaptive or coaching imports are added.
- No screen renderer or navigation controller changes.
- No changes to assessment scoring or Coaching Intelligence ranking rules.
- Home remains outside recommendation computation.

## Validation
1. A player with no reliable assessment receives a balanced mission.
2. A player with a ready Coaching Intelligence priority receives a mission from that construct and sees `Your priority`.
3. Training setup, countdown, live rep, exit, Results, Player, and Home remain stable.
