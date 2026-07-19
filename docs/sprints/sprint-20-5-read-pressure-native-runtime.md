# Sprint 20.5 — Read the Pressure Native Runtime

## Goal

Replace the generic fallback for `read-pressure` with a native pressure-recognition runtime while preserving the existing mission platform and previously implemented native adapters.

## Delivered

- Native `read-pressure-v1` adapter registration.
- Deterministic pressure scenarios for:
  - single-defender pressure from either side;
  - a closing lane;
  - a double press.
- Cue metadata for pressure source, direction and intensity.
- A final decision step with the expected pressure-release action.
- Mission scoring for recognition, decision quality and reaction time.
- Regression tests for registration, sequencing, metadata, scoring and fallback safety.

## Runtime model

Each scenario contains two context cues followed by one decision cue. The runtime marks the final cue with `decisionRequired` and exposes `expectedDecision` for evidence collection.

Pressure intensity increases scoring weight and the pressure-recognition bonus. A correct final decision receives an additional decision bonus.

## Safety boundaries

- No changes to onboarding, Home, navigation or routing.
- `scan-first-v1`, `spot-the-cue-v1` and `predict-next-v1` remain unchanged in behaviour.
- The remaining six missions continue to use explicit generic fallback behaviour.

## Acceptance

- [x] Native runtime registered.
- [x] Pressure-aware sequencing implemented.
- [x] Pressure metadata attached to live cues.
- [x] Pressure-specific scoring implemented.
- [x] Regression tests added.
- [x] Sprint documentation added.
