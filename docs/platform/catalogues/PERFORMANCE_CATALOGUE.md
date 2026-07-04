# Performance Catalogue v0.1

Status: Draft  
Sprint: PF-14  
Reference implementation: PitchIQ

## Purpose

This catalogue records the first performance baseline and risk map for PitchIQ.

## Performance dimensions

| Area | Baseline | Risk |
|---|---|---|
| Startup | Vite/static app | Needs measurement |
| CSS | Multiple CSS files and lock files | Medium complexity |
| JavaScript | Modular but central orchestration | Medium |
| Assets | Many image assets | Needs optimisation/lifecycle review |
| Animation | Marker and UI animations | Needs reduced-motion and frame-rate review |
| Service worker | Cache list exists | Cache governance risk |
| Mobile | iPhone-first layout | Needs device matrix testing |

## Measurement priorities

1. First load time.
2. App shell render time.
3. Asset weight by folder.
4. CSS size by file.
5. JavaScript bundle/build size.
6. Animation smoothness on iPhone.
7. Cache update reliability.
