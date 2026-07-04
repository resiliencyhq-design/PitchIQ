# Capability Catalogue v0.1

Status: Draft  
Sprint: PF-07 Capability Audit  
Reference implementation: PitchIQ

## Purpose

This catalogue identifies the reusable functional capabilities currently present or emerging in PitchIQ. Capabilities sit beneath product screens and patterns. They are the engines that could eventually be reused across WellTrack products.

## Capability status labels

| Status | Meaning |
|---|---|
| Active | Used in the current product. |
| Partial | Present but incomplete or limited. |
| Experimental | Trial or prototype capability. |
| Future | Intended or possible later capability. |
| Out of scope | Explicitly deferred until MVP or platform readiness. |

## Ownership labels

| Owner | Meaning |
|---|---|
| Product | PitchIQ-specific capability. |
| Platform candidate | Could become reusable across WellTrack products. |
| Studio | Belongs to the Studio subsystem. |
| HQ | Belongs to the HQ / platform management subsystem. |
| Future platform | Not current MVP, but possible later WellTrack capability. |

## Capability inventory

| Capability | Current files / areas | Status | Owner | Notes |
|---|---|---|---|---|
| Player Profile | `state.profile`, onboarding keys, player route | Active | Product / platform candidate | Identity foundation for future products. |
| Onboarding Completion | localStorage keys, `completeOnboarding()`, route guard | Active | Product | Guards app access and first-run journey. |
| XP / Progression | `js/game/progression.js`, `xpNeed`, `rankForLevel` | Active | Platform candidate | Strong reusable gamification engine candidate. |
| Rewards / Packs | `js/data/rewards.js`, rewards state | Active | Product / platform candidate | Supports motivation and retention. |
| Achievements | rewards data / player progress | Partial | Platform candidate | Useful across WellTrack products. |
| Training Session Engine | `js/game/session.js`, active session state | Active | Product / platform candidate | Core training capability. |
| Scoring | `js/game/scoring.js`, `src/game/scoringEngine.ts` | Active / needs review | Platform candidate | Canonical scoring path needs confirmation. |
| Drill Recommendations | `js/data/drills.js`, `recommendedDrills()` | Active | Product | Could become adaptive recommendation capability later. |
| Cues / Training Content | `js/data/cues.js`, `CORE_CUES`, `getCue()` | Active | Product / platform candidate | Content engine for cue-based training. |
| Storage / Persistence | `js/services/storage.js`, localStorage | Active | Platform candidate | Important reusable service. |
| Analytics / Session History | `state.analytics`, completed sessions, best reaction | Partial | Platform candidate | Current local analytics; cloud analytics out of scope. |
| Voice Service | `js/services/voice.js` | Partial / future-facing | Future platform | Should remain secondary until MVP stable. |
| Camera Service | `js/services/camera.js` | Partial / future-facing | Future platform | Computer vision path; not current MVP priority. |
| Haptics | `js/app/onboard-haptics.js` | Partial | Product / platform candidate | Optional interaction enhancement. |
| Tactical Web | `js/app/onboard-tactical-web.js`, CSS tactical web | Active/partial | Product pattern capability | Supports Position Selection feeling and tactical links. |
| Marker Spawn | `js/app/onboard-step2-spawn.js`, marker animation CSS | Active | Product / component capability | Supports Position Marker and Position Selection. |
| Studio Editing | `studio/`, visual layout studio | Partial | Studio | Platform subsystem, not normal product screen. |
| HQ Dashboard | `tools/pitchiq-hq-live.html` | Partial | HQ | Future platform management capability. |
| Developer Navigation | dev panel in `main.js` | Active | Tooling | Useful for QA/dev but should be bounded. |
| Service Worker / Offline Cache | `sw.js` | Active | Product / release capability | Needs release governance. |
| PWA Manifest | `manifest.json` | Active | Product / release capability | Supports installable/mobile app behaviour. |

## Capability ownership map

| Ownership | Capabilities |
|---|---|
| Platform candidates | XP/progression, profile, storage, scoring, analytics, achievements |
| Product-specific now | onboarding completion, drill recommendations, cues, training session engine, rewards |
| Future platform | camera, voice, computer vision, cloud analytics, wearables |
| Studio subsystem | Studio editing, visual layout editing, inspector controls |
| HQ subsystem | roadmap/status dashboard, platform maturity, audit status, release health |
| Tooling | developer navigation, local validation helpers |

## MVP capability boundary

The current MVP should prioritise:

1. Player identity
2. Onboarding completion
3. Training session engine
4. Scoring
5. XP/progression
6. Results/reward loop
7. Storage/persistence
8. Basic local analytics

The current MVP should **not** expand into:

- AI coach
- cloud analytics
- computer vision
- wearables
- multiplayer
- coach portal
- parent portal
- team features

These future capabilities should be catalogued, but not implemented until the Academy Journey MVP is stable.

## Capability risk register

| Risk | Area | Severity | Follow-up |
|---|---|---|---|
| Scoring implementation path unclear | Scoring | High | Confirm canonical scoring engine. |
| Camera/voice services could trigger scope creep | Future capabilities | High | Keep deferred until MVP blueprint completion. |
| Analytics is local and partial | Analytics | Medium | Define future analytics capability separately. |
| Studio and product app share repo/dependencies | Studio | Medium | Document subsystem boundary. |
| HQ could become manual duplicate truth | HQ | Medium | Connect HQ to canonical docs/catalogues later. |
| Storage model may not scale | Persistence | Medium | Keep local for MVP; ADR later for cloud transition. |
| Rewards/progression may become inconsistent | Gamification | Medium | Govern through capability spec. |

## PF-08 inputs

PF-08 Documentation / Knowledge Audit should review:

1. Product context docs.
2. MVP status docs.
3. Platform foundation docs.
4. Sprint docs.
5. Catalogues.
6. ADR backlog.
7. Knowledge graph requirements.
8. How HQ should read and display canonical knowledge.
