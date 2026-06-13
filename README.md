# PitchIQ Sprint 4.2.2 — Fix Training & Career Render Errors

Minimal maintenance patch.

Changed:
- `js/app/routes.js`
- `js/app/main.js`
- `README.md`
- `docs/SPRINT_4_2_2_FIX_TRAINING_CAREER.md`

Fixes:
- Training route crashed because `renderTraining()` was called without `state`, but `renderTraining` assumed `state.profile.position`.
- Career route crashed because `main.js` referenced `renderCareer(state)` but `renderCareer` was not imported/exported consistently.

No architecture changes.
