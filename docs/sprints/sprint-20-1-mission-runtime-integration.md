# Sprint 20.1 — Mission Runtime Integration

## Purpose

Connect the adaptive mission selected by PitchIQ to the capability framework introduced in Sprint 20.0.

## Delivered

- Reads the canonical adaptive mission selection from local storage.
- Resolves the selected mission through the mission capability runtime.
- Persists a lightweight active-runtime snapshot in session storage.
- Exposes the resolved integration as `window.PitchIQMissionRuntime` for the current app shell.
- Adds mission, adapter, cue-profile and scoring-profile metadata to the training/live-rep DOM.
- Registers `Scan First` as the first native runtime adapter.
- Marks every other mission as an explicit generic fallback until its dedicated module is implemented.
- Fails clearly for missing or unknown mission IDs.

## Current boundary

This sprint connects selection to runtime identity and capability activation. It does not yet replace the generic cue-generation internals in `js/app/main.js`.

`Scan First` now has a canonical native adapter contract:

- adapter: `scan-first-v1`
- cue profile: `scan-colour-direction`
- scoring profile: `accuracy-reaction`

The next implementation slice can consume this adapter contract inside the session/cue engine without changing mission selection, home routing or AI Coach briefing.

## Regression protection

The integration is loaded as a sidecar module. Existing onboarding, home, navigation and training control functions are not modified.
