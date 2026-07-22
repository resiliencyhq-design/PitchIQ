# PF-07 Capability Audit Results

Status: Draft results  
Sprint: PF-07 Capability Audit  
Branch: `platform-foundation-docs`  
Reference implementation: PitchIQ

## Executive summary

PF-07 created the first Capability Catalogue for PitchIQ and separated current MVP capabilities from future platform capabilities.

The key finding is that PitchIQ already contains several reusable capability seeds: player profile, XP/progression, rewards, training sessions, scoring, drill recommendations, cues, storage, analytics, Studio, HQ and release/PWA support.

The main governance risk is scope expansion. Camera, voice, computer vision, AI coach, cloud analytics and wearables are valuable future capabilities, but they should remain deferred until the Academy Journey MVP is stable.

## Source areas reviewed

| Capability area | Source examples |
|---|---|
| Profile / onboarding | `state.profile`, onboarding keys, route guard |
| XP / progression | `js/game/progression.js` |
| Rewards / achievements | `js/data/rewards.js` |
| Training sessions | `js/game/session.js`, training state in `main.js` |
| Scoring | `js/game/scoring.js`, `src/game/scoringEngine.ts` |
| Drills / cues | `js/data/drills.js`, `js/data/cues.js` |
| Storage | `js/services/storage.js` |
| Camera / voice | `js/services/camera.js`, `js/services/voice.js` |
| Studio | `studio/` |
| HQ / tools | `tools/` |
| Release/PWA | `sw.js`, `manifest.json` |

## Main capability findings

### Player Profile

Assessment: active identity capability. It supports onboarding, personalisation and player route experiences.

Platform relevance: high. Profile capability could apply to PitchIQ, MindIQ, SchoolIQ and CoachIQ.

Status: **Active / platform candidate**

### XP and Progression

Assessment: active gamification capability. It supports level, XP thresholds and rank progression.

Platform relevance: very high. This could become a shared WellTrack motivation engine.

Status: **Active / platform candidate**

### Rewards and Achievements

Assessment: active or partial reward loop capability. Rewards help convert training effort into visible reinforcement.

Platform relevance: high. Reward logic could be reused across WellTrack products if kept generic enough.

Status: **Active-partial / platform candidate**

### Training Session Engine

Assessment: active core PitchIQ capability. It manages the structured training experience, selected drills, cue flow and session state.

Platform relevance: medium-high. The structure may generalise to other micro-training products.

Status: **Active / product now, platform candidate later**

### Scoring

Assessment: active but needs canonical path confirmation because both JS and TypeScript scoring-related paths were identified.

Platform relevance: high. Scoring is a central training capability and should eventually have clear test coverage and ownership.

Status: **Active / needs review**

### Drill Recommendations

Assessment: active product capability. It recommends drills based on player context/position.

Platform relevance: medium. Could become adaptive recommendation capability later.

Status: **Active / product-specific now**

### Cues and Training Content

Assessment: active content capability. It supports cue-based cognitive football training.

Platform relevance: high for PitchIQ; moderate for other WellTrack products depending on content model.

Status: **Active / product and platform candidate**

### Storage and Persistence

Assessment: active local persistence capability. It is central to onboarding completion, profile state and progress.

Platform relevance: high. Storage/persistence should become a governed service boundary.

Status: **Active / platform candidate**

### Analytics / Session History

Assessment: partial local analytics capability. It can record sessions, best reaction, weekly XP and training totals.

Platform relevance: high, but current implementation should remain local/simple until MVP is stable.

Status: **Partial / future platform candidate**

### Camera and Voice

Assessment: future-facing services already exist as code areas, but they are scope-risk capabilities.

Platform relevance: high long-term, but not current MVP priority.

Status: **Partial / future platform, deferred**

### Studio

Assessment: emerging platform subsystem. It is not a normal product screen and should remain separately governed.

Platform relevance: very high.

Status: **Partial / Studio subsystem**

### HQ

Assessment: emerging platform management subsystem. It should display canonical platform status rather than duplicate it manually.

Platform relevance: very high.

Status: **Partial / HQ subsystem**

## MVP capability boundary

PF-07 confirms that the current MVP should focus on:

1. Player identity
2. Academy onboarding completion
3. Position selection
4. Training session engine
5. Scoring
6. XP/progression
7. Results/reward loop
8. Storage/persistence
9. Basic local analytics

The following should remain deferred:

- AI coach
- cloud analytics
- computer vision
- wearables
- multiplayer
- coach portal
- parent portal
- team features

## Capability risk register

| Risk | Severity | Recommended response |
|---|---|---|
| Future capabilities create scope creep before MVP completion | High | Keep deferred in catalogue only. |
| Scoring canonical path is unclear | High | Add ADR or technical audit for scoring ownership. |
| Camera/voice services are tempting but premature | High | Keep disabled/deferred unless MVP requires them. |
| Analytics is local and partial | Medium | Define analytics roadmap later. |
| Studio and app share dependencies | Medium | Keep Studio as subsystem with separate governance. |
| HQ becomes manual duplicate truth | Medium | Connect HQ to canonical docs/catalogues later. |
| Storage may need cloud migration later | Medium | Keep local for MVP; ADR later for storage evolution. |

## PF-07 status

**Status: COMPLETE ENOUGH TO PROCEED TO PF-08 DOCUMENTATION / KNOWLEDGE AUDIT**

PF-07 has created the first Capability Catalogue and separated MVP capabilities from deferred future capabilities.

## Recommended next actions

1. Start PF-08 Documentation / Knowledge Audit.
2. Review all product docs, platform docs, sprint docs, catalogues and ADR backlog.
3. Decide how HQ should surface platform knowledge without becoming the source of truth.
4. Keep future capabilities documented but out of implementation scope until MVP blueprint completion.

## Open questions

- Should XP/progression become a shared WellTrack capability or remain PitchIQ-specific until validated?
- Which scoring implementation is canonical?
- Should camera and voice files remain in the repo during MVP, or be explicitly marked future/deferred?
- Should HQ read status from docs/catalogues automatically in future?
