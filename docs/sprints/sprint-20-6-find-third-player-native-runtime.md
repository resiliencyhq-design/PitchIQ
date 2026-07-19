# Sprint 20.6 — Find the Third Player Native Runtime

## Purpose

Make **Find the Third Player** the fifth Football IQ mission with a dedicated live runtime instead of the generic fallback.

## Delivered

- Registered native adapter `find-third-player-v1`.
- Added deterministic four-step third-player scenarios.
- Modelled primary, secondary and third-player passing options.
- Added blocked-lane, pressure-source and passing-lane availability metadata.
- Marked the final cue in each scenario as the required third-player decision.
- Added mission-specific scoring for:
  - correct third-player identification;
  - passing-lane recognition;
  - scanning evidence;
  - reaction speed.
- Added regression tests for registration, cue sequencing, metadata, scoring and fallback preservation.

## Runtime sequence

Each scenario presents three context cues and then a final third-player solution. The runtime advances deterministically through the scenario set and resets its step counter after each decision cue.

## Safety boundaries

- Existing native runtimes remain unchanged in behaviour.
- Unimplemented missions continue to resolve through the generic fallback.
- No onboarding, Home, routing, navigation or first-run state code changed.

## Acceptance

- Native adapter registered.
- Third-player scenario engine active.
- Mission evidence metadata available on every cue.
- Correct final decisions receive third-player and lane-recognition bonuses.
- Scanning evidence can increase the mission score within a capped range.
- Existing native missions remain available.
