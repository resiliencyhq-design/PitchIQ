# PitchIQ Platform Stability Lock

**Sprint:** 19.1 — Platform Integration and Stability Lock  
**Status:** Approved baseline  
**Scope:** Core player, coach and team-intelligence architecture through Sprint 19.0

## Locked platform flow

Academy Entry → Football IQ Assessment → Football IQ Profile → Academy Season Engine → Adaptive Training → Training Evidence → Match Intelligence → Unified Evidence Store → Assessment Readiness → AI Coach → Football IQ Reassessment → Updated Football IQ Profile → Coach Dashboard → Team Intelligence

## Locked scientific boundaries

1. Football IQ is an individual formal assessment.
2. Training evidence and match evidence may inform recommendations and readiness, but cannot directly change Football IQ scores.
3. Reassessment is the only route to an updated Football IQ profile.
4. AI Coach recommendations must remain explainable and non-diagnostic.
5. Team Intelligence may aggregate evidence but must not rank players or replace individual evidence.
6. Game XP and training rewards remain separate from formal Football IQ scoring.

## Integration acceptance criteria

The platform is considered stable only when all of the following pass:

- `npm test`
- `npm run build`
- Landing and onboarding complete without routing regressions.
- Returning players reopen to Home.
- Home renders each integrated feature card no more than once.
- Empty or partial evidence states render safely.
- Player state and evidence persist across reloads.
- Football IQ values are not mutated by training, match, AI Coach or Team Intelligence modules.
- Existing Academy Season, Adaptive Training, Training Evidence, Match Intelligence, AI Coach, Coach Dashboard and Team Intelligence experiences load without blocking Home.
- iPhone Safari/PWA and desktop browser smoke tests pass.

## Change-control rule

This architecture is locked as the current product baseline. Future work must use a new sprint branch and must not alter a locked scientific boundary without explicit Product Owner approval, documented rationale and regression evidence.

## Required merge evidence

Every future architecture-affecting pull request must report:

- root cause or product objective
- files changed
- test and build results
- browser/device verification
- scoring and evidence-boundary impact
- merge readiness: yes or no
