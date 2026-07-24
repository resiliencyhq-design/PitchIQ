# Platform 2.0 — Forensic Screen Audit Plan

## Objective

Audit every production screen and first-run step against the current `main` architecture, identify whether each screen is current, correctly routed, visually aligned, and free from obsolete or duplicated implementations.

## Current version baseline

The audit baseline is `main` at merge commit `f4a8395aee49dbc122d1b13c14536ce89fb3fd49` (Platform 2.0 Sprint D3).

## Audit dimensions

Each screen must be assessed for:

1. **Current implementation** — rendered by the canonical route/controller rather than a retired or duplicate implementation.
2. **Route correctness** — reachable from the intended navigation source and able to return correctly.
3. **State correctness** — reads and writes through current state authorities without reviving legacy-only state.
4. **Visual alignment** — content is centred within the app frame, respects safe areas, and avoids unintended bottom gaps, clipping, overlap or nav obstruction.
5. **Responsive alignment** — desktop Chromium and iPhone-sized WebKit layouts remain structurally consistent.
6. **Navigation alignment** — persistent navigation is visible only where intended, sits at the viewport bottom, and does not cover content.
7. **Version drift** — screen is not an outdated duplicate, prototype or retired variant still reachable in production.
8. **Runtime health** — no page errors, console errors, failed requests, duplicate route events or duplicate state events.

## Screen inventory

### First-run flow

- Landing
- Name
- Jersey number
- Position
- Know Your Strengths
- Academy assessment
- Academy accepted
- Meet Coach
- Meet Camera
- Practice
- Player Contract
- Avatar
- Player Style
- Home handoff

### Core app

- Home
- Training entry / Scan
- Training staged flow
- Results
- Player
- Notifications modal / reminder setup
- Rewards / Shop entry

### Home worlds and chapter screens

- Train world
- Game IQ world
- Mind world
- Player world
- Chapter and feature-card return paths

### Lab and prototypes

- Lab hub
- Auto Juggler
- Accelerometer Breathing
- Mental Imagery
- Vibroacoustic / haptic prototype
- Calm and related preview tools

### Supporting surfaces

- Developer options
- Reset confirmation and post-reset Landing
- Error and empty states
- PWA standalone / browser shell differences

## Evidence requirements

For each screen, record:

- canonical route or entry action;
- implementation file or renderer owner;
- current/legacy/duplicate classification;
- desktop screenshot result;
- iPhone-sized screenshot result;
- top, side and bottom alignment result;
- persistent-nav clearance result;
- route-back result;
- runtime error result;
- severity and remediation recommendation.

## Output classification

- **PASS** — current and aligned; no remediation required.
- **PASS WITH DEBT** — current and functional, but contains non-blocking legacy or alignment debt.
- **FAIL — ALIGNMENT** — visual layout or safe-area issue.
- **FAIL — VERSION DRIFT** — obsolete or duplicate implementation is reachable.
- **FAIL — ROUTING** — entry, exit or navigation ownership is incorrect.
- **FAIL — STATE** — screen depends on stale or competing state ownership.
- **UNVERIFIED** — source review is complete but browser evidence has not yet run.

## Important boundary

Repository source alone cannot prove pixel alignment. Final PASS/FAIL alignment decisions require browser execution and screenshots from both configured Playwright projects. Until CI or a local browser run produces those artefacts, screen alignment remains `UNVERIFIED`, not passed.
