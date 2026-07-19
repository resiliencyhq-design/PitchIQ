# Sprint 12.6B — Pre-Training Coach Brief

## Objective
Introduce the selected adaptive mission with a short PitchIQ Coach explanation immediately before the existing Live Rep flow.

## Delivered
- Intercepts the existing `start-mission-training` action only long enough to display a coach brief.
- Reads the canonical persisted adaptive selection from `pitchiq.adaptiveTraining.current.v1`.
- Displays coach identity, recommendation mode, mission title, evidence-aware explanation and one noticing cue.
- Provides `Start Live Rep` and `Skip brief`; both resume the same existing button action.
- Uses a safe Scan First fallback when persisted selection is unavailable.

## Architecture safeguards
- No adaptive recommendation computation occurs in the brief.
- Home remains display-only.
- The existing Live Rep handler remains the navigation authority.
- The brief module is optional and dynamically loaded.
- Failure to load the module leaves the original Live Rep button untouched.
- No assessment, XP, scoring or Football IQ score changes.

## Acceptance checks
1. Open Training and confirm the selected mission is shown.
2. Tap `Enter Live Rep` and confirm the brief repeats the same mission title.
3. Confirm personalised selections show `Your priority`; balanced selections show `Today’s focus`.
4. Confirm the noticing cue is short and action-oriented.
5. Confirm both `Start Live Rep` and `Skip brief` enter the existing Live Rep flow.
6. Confirm returning or exiting Training does not create duplicate briefs.
7. Confirm no coach wording claims unsupported observation or improvement.
