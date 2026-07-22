# PF-10 Repository Module Audit Results

Status: Draft results  
Sprint: PF-10  
Reference implementation: PitchIQ

## Executive summary

PF-10 creates a repository and module baseline. PitchIQ has a practical modular structure, but some responsibilities remain concentrated in large orchestration and rendering files.

## Findings

- `css/tokens.css` and `css/layout-system-v2.css` are platform design-system seeds.
- `js/app/main.js` remains the central app orchestrator.
- `js/app/routes.js` remains the central rendering file.
- `js/game/`, `js/services/`, and `js/data/` map well to future capability boundaries.
- `studio/` and `tools/` are platform subsystems that should remain documented separately.
- `src/game/scoringEngine.ts` should be reviewed against `js/game/scoring.js`.

## Ownership baseline

| Ownership | Areas |
|---|---|
| Product | `js/app`, product docs, current screens |
| Platform candidates | tokens, components, game services, storage |
| Studio subsystem | `studio/`, visual layout tooling |
| HQ subsystem | `tools/` |
| Release | `sw.js`, `manifest.json`, deployment settings |

## Status

**Complete enough to proceed to PF-11 Design System Audit.**
