# Repository / Module Catalogue v0.1

Status: Draft  
Sprint: PF-10  
Reference implementation: PitchIQ

## Purpose

This catalogue maps major repository folders and module areas to ownership and platform relevance.

## Repository map

| Area | Role | Ownership | Status |
|---|---|---|---|
| `index.html` | App entry shell | Product / release | Active |
| `css/` | Styling, tokens, layout, screens | Product / platform candidate | Active |
| `js/app/` | App orchestration and route rendering | Product | Active |
| `js/components/` | Shared UI utilities | Platform candidate | Active |
| `js/game/` | Progression, scoring, sessions | Platform candidate | Active |
| `js/services/` | Storage, camera, voice | Platform candidate / future | Active-partial |
| `js/data/` | Cues, rewards, drills | Product / capability | Active |
| `assets/` | Visual assets | Product / platform candidate | Active |
| `studio/` | Studio subsystem | Platform subsystem | Active-partial |
| `tools/` | HQ/review tools | HQ / platform subsystem | Active-partial |
| `docs/` | Product and platform docs | Mixed | Active |
| `src/` | TypeScript / transitional code | Needs review | Review |
| `sw.js` | Service worker cache | Release capability | Active |
| `manifest.json` | PWA metadata | Release capability | Active |

## Module risks

| Risk | Area | Severity |
|---|---|---|
| App rendering concentrated in `routes.js` | `js/app` | Medium |
| State/orchestration concentrated in `main.js` | `js/app` | Medium |
| Possible scoring duplication | `js/game`, `src/game` | High |
| Studio and product app share package dependencies | `studio`, root package | Medium |
| Service worker asset list must track asset changes | `sw.js` | Medium |

## Recommended next steps

- Confirm canonical scoring implementation.
- Keep Studio and HQ boundaries documented.
- Decompose app routes only after MVP stability.
- Avoid moving files during audit phase.
