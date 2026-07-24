# Phase 4 — Home and Learning Engine Audit

Date: 2026-07-21
Baseline: `main` after Academy stability lock PR #213
Scope: Home, Football IQ, MindIQ, Reflective Space, mission engine, XP/progression, personalisation, results and profile integration.

## Executive finding

The production app has a working core loop:

`Home → Training → Results → Home/Profile`

Training completion persists session results, XP, level, combo, training time and analytics. The Academy first-run flow also returns successfully to Home.

However, the broader learning ecosystem is not yet fully integrated. Several sophisticated Football IQ, adaptive coaching and reflection modules exist in the repository, but they are not loaded by `index.html`, do not own a production Home entry point, or listen for actions that the current runtime no longer emits.

Therefore, the correct overall status is:

- Home shell and core training loop: **functional**
- XP and basic progression: **functional**
- Today's Mission display: **functional UI with generic cumulative objectives**
- Mission runtime integration: **partial and dependent on a pre-existing adaptive selection**
- Football IQ engine: **substantially built but disconnected from production navigation**
- MindIQ: **not implemented as a production runtime**
- Reflective Space / post-training reflection: **module exists but is not integrated**
- Adaptive personalisation: **engine modules exist but are not activated in production**
- Learning-loop integration: **incomplete**

## 1. Production Home inventory

### 1.1 Hero / identity panel — GREEN

Present and functional:

- Player name
- Position
- PitchIQ level
- XP progress
- Streak
- OVR summary
- Link to Player/Profile

Data is read from the canonical state and local onboarding identity keys.

### 1.2 Today's Mission — AMBER

Present and opens Training.

Current objectives are derived from cumulative state:

- train for five minutes
- reach a level-dependent combo target
- scan 50 cues

The panel does not currently select or display a specific adaptive mission from the Football IQ recommendation engine. It is a generic progress panel rather than a complete personalised mission experience.

### 1.3 Home action cards — GREEN / LIMITED SCOPE

Production Home currently exposes:

- Technical Training
- Results
- PitchIQ Lab

The original Player action is transformed into PitchIQ Lab by the Home composition layer. Profile remains accessible from the hero/bell and bottom navigation.

There are no production Home cards for:

- Football IQ Library
- MindIQ
- Reflective Space
- Academy learning modules
- adaptive plan

### 1.4 Results — GREEN

Functional:

- session accuracy
- best combo
- XP earned
- score
- latest result persistence
- return to Training or Home

### 1.5 Player/Profile — GREEN / PARTIAL SETTINGS

Functional summary and progression display.

Settings currently mark these as Coming Soon:

- change player name
- change position
- camera settings
- microphone settings
- Bluetooth settings

Reset Player is functional.

## 2. Training and progression engine

### 2.1 Core training session — GREEN

The canonical runtime supports:

- setup
- ready state
- countdown
- live cues
- coach scoring
- voice-response fallback
- correct/incorrect scoring
- combo
- XP awards
- session completion
- persisted analytics and latest result

### 2.2 XP and progression — GREEN

XP, levels, streak, best combo, daily completion and training statistics are connected to the canonical state and visibly update Home, Results and Player.

### 2.3 Mission runtime adapter — AMBER

`mission-runtime-integration.js` is loaded in production and can decorate a Training screen with a resolved mission runtime.

Limitation: it only activates when `pitchiq.adaptiveTraining.current.v1` already contains a selected mission. The production Home does not currently load the adaptive recommendation modules that create and expose this selection pathway.

Result: the adapter is technically live, but often has no mission to integrate.

## 3. Football IQ learning engine

### Status — AMBER: built, tested and disconnected

Repository components include:

- mission library
- module/category structure
- recommendations
- adaptive plan
- progression
- curriculum
- assessment and benchmarks
- Football IQ profile and storage
- Football IQ results
- mission capability framework

The adaptive UI is designed to inject:

- a personalised Home recommendation
- curriculum phases
- assessment dashboard
- recommended missions
- module-specific coach recommendations

Production integration gaps:

1. Football IQ UI/runtime scripts are not loaded in `index.html`.
2. Home does not render the required adaptive recommendation container.
3. Home has no Football IQ entry card.
4. Football IQ hash routes are not part of the canonical `main.js` route set.
5. Mission selection is therefore not available through the normal user journey.

Conclusion: Football IQ is not missing as an engine; it is missing as a production-connected user experience.

## 4. MindIQ

### Status — RED: brand concept only

Search of the production repository found MindIQ branding references but no equivalent production runtime, route, Home card, storage model, assessment, module library or learning progression comparable to Football IQ.

MindIQ should be treated as a future product/workstream, not an existing disconnected feature.

## 5. Reflective Space and coaching reflection

### Status — AMBER/RED: implementation exists, production flow absent

`post-training-coach-reflection.js` provides:

- a three-choice reflection prompt
- local reflection history
- mission association
- saved coaching context
- no XP or assessment impact

Integration failures:

1. The script is not loaded by production `index.html`.
2. It listens for `data-action="finish-live-session"`.
3. The canonical training runtime completes through `finishTraining()` and does not emit that action.
4. Home has no Reflective Space card or reflection-history screen.
5. Reflections cannot currently be reviewed by the player.

Conclusion: the repository contains a post-session reflection component, but there is no functioning Reflective Space in the production app.

## 6. Adaptive coaching and personalisation

### Status — AMBER: architecture present, production activation incomplete

Existing modules include:

- pre-training coach brief
- post-training reflection
- progressive coaching memory
- Football IQ recommendations
- adaptive curriculum and assessment
- mission runtime capability adapters

Production gaps:

- most modules are not loaded
- no canonical orchestrator connects them to Home and Training
- current Home mission uses generic state metrics
- reflection does not feed the next mission in the live runtime
- no visible explanation of why a mission was selected

## 7. Current learning pipeline

### What works

`Onboarding/Academy → Home → Generic Training → Results → XP/Profile/Home`

### What is intended but incomplete

`Assessment/Profile → Adaptive Mission → Training → Reflection → Coaching Memory → Next Mission`

Missing production links:

- Football IQ assessment/profile to Home recommendation
- Home recommendation to mission selection
- mission selection to canonical training content
- training completion to reflection
- reflection to coaching memory
- coaching memory to next recommendation

## 8. Readiness matrix

| Area | Exists in repo | Loaded in production | User entry point | Persists data | Overall |
|---|---:|---:|---:|---:|---|
| Home shell | Yes | Yes | Yes | Yes | GREEN |
| Technical Training | Yes | Yes | Yes | Yes | GREEN |
| Results | Yes | Yes | Yes | Yes | GREEN |
| Player/Profile | Yes | Yes | Yes | Yes | GREEN |
| XP/Levels/Streak | Yes | Yes | Yes | Yes | GREEN |
| Today's Mission panel | Yes | Yes | Yes | Yes | AMBER |
| Mission runtime adapter | Yes | Yes | Indirect | Session only | AMBER |
| Football IQ engine | Yes | No | No | Yes | AMBER |
| Football IQ assessment | Yes | No | No | Yes | AMBER |
| Adaptive recommendations | Yes | No | No | Yes | AMBER |
| Post-training reflection | Yes | No | No | Yes | RED in production |
| Reflective Space history | No complete UI | No | No | Partial records | RED |
| MindIQ | No production engine | No | No | No | RED |
| End-to-end adaptive learning loop | Partial | Partial | No | Partial | RED/AMBER |

## 9. Priority backlog

### Priority 1 — Production route and entry-point consolidation

Create canonical routes and Home entry points for:

1. Football IQ
2. Reflective Space
3. Academy/learning modules where appropriate

Do not load legacy modules globally. Use route-scoped lazy loading, following the Academy stability pattern.

### Priority 2 — Connect Football IQ to Home

- render a Football IQ Home card
- expose the adaptive recommendation container
- select a mission through the recommendation engine
- persist the selected mission
- pass the selected mission into canonical Training

### Priority 3 — Complete the reflection loop

- invoke reflection from canonical session completion
- store reflection against the completed mission/session
- provide a Reflective Space history screen
- connect coaching memory to future recommendations without changing XP or assessment validity

### Priority 4 — Clarify Today's Mission ownership

Choose one owner:

- generic daily training objectives, or
- adaptive Football IQ mission

Avoid displaying two competing concepts both called Today's Mission.

### Priority 5 — MindIQ product definition

Define MindIQ's scope, measures, modules, data model and relationship to Football IQ before implementation.

## 10. Audit conclusion

The requested features are **not all present and functioning in production**.

The core Home and training system is stable and usable. Football IQ and adaptive coaching are significantly developed at code level but disconnected. Reflective Space is not yet a functioning production feature. MindIQ is not yet implemented beyond brand-level references.

The recommended next implementation sequence is:

1. Football IQ production entry and lazy route
2. adaptive mission selection into canonical Training
3. canonical post-training reflection
4. Reflective Space history and return loop
5. MindIQ definition and build
