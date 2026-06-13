# Sprint 4.2.2 — Fix Training & Career Render Errors

## Exact causes

1. Training failure:
   - `main.js` called `renderTraining()` without passing `state`.
   - `routes.js` accessed `state.profile.position`.
   - Result: `Cannot read properties of undefined`.

2. Career failure:
   - `main.js` attempted to render `renderCareer(state)`.
   - `renderCareer` was not consistently imported/exported in the deployed module chain.
   - Result: route-level render recovery.

## Fixes

- Updated `main.js` so the training route calls `renderTraining(state)`.
- Updated `main.js` import list to include `renderCareer`.
- Updated `routes.js` so `renderTraining(state = {})` has safe fallbacks.
- Added `renderCareer(state = {})` if missing.

## Architecture

No architecture changes.
No redesign.
No unrelated route changes.
