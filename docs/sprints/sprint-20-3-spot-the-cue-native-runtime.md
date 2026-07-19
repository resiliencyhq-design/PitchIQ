# Sprint 20.3 — Spot the Cue Native Runtime

## Goal

Make `Spot the Cue` the second Football IQ mission with mission-specific live behaviour.

## Implementation

- Registered `spot-the-cue-v1` as a native runtime adapter.
- Added deterministic three-cue pattern rounds.
- Added sequence position, length and completion metadata to each cue.
- Added scoring for accuracy, reaction time and correct sequence completion.
- Preserved the existing `scan-first-v1` implementation.
- Preserved explicit generic fallback behaviour for unimplemented missions.

## Cue patterns

The first native pattern set cycles through:

1. Red → Blue → Red
2. Left → Right → Left
3. Blue → Red → Blue
4. Right → Left → Right

The third cue completes each sequence and carries additional evidence weight.

## Scoring contract

- Correct cue: base accuracy points.
- Faster correct response: reaction bonus.
- Correct final cue in a pattern: sequence completion bonus.
- Incorrect response: zero mission points for that cue.

## Safety boundary

This sprint does not modify onboarding, Home, navigation, mission selection or the generic session path. The remaining eight missions continue to use the explicit generic fallback until a native adapter is implemented.
