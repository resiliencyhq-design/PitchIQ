# Security / Release Catalogue v0.1

Status: Draft  
Sprint: PF-15  
Reference implementation: PitchIQ

## Purpose

This catalogue records the first security and release governance baseline for PitchIQ.

## Release/security areas

| Area | Baseline | Risk |
|---|---|---|
| Repository visibility | Public | Code/assets visible externally |
| GitHub Pages | Active deployment model | Needs release checklist |
| Service worker | Explicit cache list | Stale cache risk |
| Versioning | Query-string/cache keys used | Needs standard |
| Dependencies | Vite/React/Puck/Moveable | Needs periodic review |
| Secrets | No secret handling documented | Must avoid secrets in public repo |
| Rollback | Git history available | Formal rollback checklist needed |

## Release checklist seed

1. Confirm build passes.
2. Confirm no secrets/API keys committed.
3. Confirm service worker cache key updated if cached assets changed.
4. Confirm MVP screens still load.
5. Confirm iPhone Safari smoke test.
6. Confirm docs/status updated.
7. Confirm PR summary includes affected areas.
