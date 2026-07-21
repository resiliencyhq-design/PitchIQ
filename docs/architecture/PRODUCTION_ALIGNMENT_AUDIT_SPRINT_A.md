# Sprint A — Production App Alignment Audit

## Status

Audit only. This sprint makes no runtime, styling, routing, storage or feature changes.

## Trigger

Production screenshots on PC and iPhone show that the deployed app does not consistently reflect the approved July 18–20 experience. The visible Home and Academy Assessment screens are older compositions even though later feature and presentation work is present on `main`.

## Executive finding

The repository contains two different UI architectures at the same time:

1. **Canonical base renderers** in `js/app/main.js` and `js/app/routes.js`.
2. **Post-render sidecar modules** that observe, replace, move or append DOM after the base route renders.

The production shell still starts from the older base renderers. Several approved sidecar compositions exist on `main`, but at least one critical composition entrypoint is not imported by the live page. This allows merged work to exist without appearing in production.

The clearest confirmed example is Home:

- `routes.js` still renders the older Home foundation: player hero, Today's Mission, Training/Results/Player shortcuts, Training Stats and Latest Results.
- `home-content-composition.js` contains the approved H2–H6 composition pipeline and imports the H5/H6 world stack and polish.
- No active import of `home-content-composition.js` was found in the production entrypoint or repository references.
- Therefore the live page renders the older Home shown in the supplied screenshots even though the approved H-series files are merged.

This is a production integration problem, not simply browser cache lag.

---

## Production entrypoint

### Live document owner

`index.html` is the application entrypoint and loads:

- `js/app/main.js`
- mission runtime integration
- three separate landing completion/recovery modules
- onboarding enhancement modules
- Academy Journey and Academy Trial modules
- Academy Orientation enhancement modules
- development visual modules

### Important observation

The current page loads many independent modules directly. This increases the number of scripts able to observe or rewrite `#app` and makes load order and selector matching part of the visible product behaviour.

### Service-worker state

The page attempts to unregister legacy workers and clear PitchIQ caches. The current mismatch is still reproducible through a versioned URL and on PC, so cache is not sufficient to explain the stale UI.

---

## Canonical route authority

`js/app/main.js` owns the base application router.

### Canonical route set

- `splash`
- `onboard`
- `home`
- `training`
- `results`
- `player`

### Canonical render contract

```text
main.js render(route)
  -> routes.js renderer
  -> replace #app.innerHTML
  -> bindScreen()
  -> sidecar modules may observe and modify the new DOM
```

### Route ownership risk

Academy Trial uses a second hash-based routing system outside the canonical router:

- `academy-trial`
- `academy-trials`
- `lab-juggling`

It writes directly to `#app`, manipulates `window.location.hash`, hides navigation and returns Home by reloading the page. This is a parallel route owner rather than a route registered with `main.js`.

---

## Screen ownership matrix

| Visible stage | Base/canonical owner | Post-render or parallel owners | Production observation | Alignment status |
|---|---|---|---|---|
| Landing | `routes.js` `renderSplash()` + `main.js` | `landing-swipe-iphone-hotfix.js`, `landing-handoff-authority.js` | PC routes successfully; iPhone completion still fails | Multiple completion owners; unresolved iPhone-only handoff/render issue |
| Onboarding 1–3 | `routes.js` `renderOnboard()` + `main.js` wizard state | jersey, number, spawn, haptics and tactical-web modules | PC can progress; iPhone does not reliably enter Step 1 | Base owner plus several DOM enhancement owners |
| Identity / Discover Strengths | Academy Journey DOM owner | many layered CSS files and motion/overlay enhancement logic | Production shows an earlier full See/Calm/Improve composition | Later refinements are selector/CSS dependent; canonical markup remains older |
| Academy orientation | `academy-trial.js` hash route owner | orientation polish and interactive observers | Separate from the canonical router | Parallel renderer |
| Academy Assessment | Academy Journey/Trial scripts | assessment/runtime modules | Production shows disabled Coming Soon list and Skip Trial card | Visible base is older than approved mission-specific assessment direction |
| Home | `routes.js` `renderHome(state)` | adaptive recommendation, Lab entry, AI Coach, results/progress and other observers | Production shows old quick actions, stats and prototype area | **Confirmed composition entrypoint missing** |
| Training | `routes.js` + `main.js` stage machine | adaptive training and evidence modules | New engines may mount around legacy training shell | Mixed canonical/sidecar ownership |
| Results | `routes.js` | Football IQ results and development sidecars | Base results remains authoritative | Mixed ownership |
| Player | `routes.js` | profile, performance index, skill radar, AI coach and progression modules | New data layers are inserted after base render | Mixed ownership |
| PitchIQ Lab | `academy-trial.js` and Lab modules | Auto Juggler camera and Home tile entry | Separate route/controller and camera ownership | Parallel feature world |
| Bottom navigation | `routes.js` `renderNav()` + `main.js` | H6 layout CSS and Home observers | Current screenshot still shows legacy four-item nav | Canonical nav unchanged; approved positioning/style depends on enhancement stack |

---

## Confirmed Home production gap

### Base Home currently rendered by `routes.js`

```text
#home.home-aaa.home-v7
└── .home-v7-grid
    ├── player identity/hero
    ├── Today's Mission
    ├── Training / Results / Player quick actions
    └── Training Stats / Latest Results
```

This exactly matches the older PC screenshot.

### Approved H-series composition exists

`js/app/home-content-composition.js`:

- imports `home-world-stack-h5.js`
- imports `home-world-polish-h6.js`
- loads H2, H3, H4, H5 and H6 stylesheets
- creates `.home-content-stack`
- assigns stable Home regions and slots
- applies world stack and polish
- marks Home with `data-home-composition="h6"`

### Integration defect

No active importer or reference to `home-content-composition.js` was found outside the file itself.

### Consequence

The approved Home composition is committed but dormant. Other sidecars may still append individual features, producing an older base screen with partial newer content rather than the approved integrated hierarchy.

### Root cause classification

**Merged but not bootstrapped.**

---

## Academy and assessment findings

### Parallel routing

`academy-trial.js` owns feature hashes and writes directly to `#app`. It does not register these stages with the canonical route set in `main.js`.

### Return-to-Home behaviour

The Academy Trial controller returns Home by removing the hash and reloading the page. This creates a second navigation lifecycle and can re-run every page-level observer and enhancement module.

### Visible assessment mismatch

The supplied production screenshot shows:

- five disabled assessment cards under Coming Soon
- a Skip Trial for Now card as the only active progression
- an older Academy Assessment header and content hierarchy

This does not reflect the later approved direction for mission-specific assessments and initial player profiling.

### Required Sprint B decision

Academy stages must either:

1. become registered canonical routes rendered by one route owner; or
2. remain a feature router behind one explicit adapter owned by `main.js`.

Direct hash routing, direct `#app.innerHTML` replacement and page reload return paths should not remain independent navigation authorities.

---

## Sidecar inventory and risk classes

### Class A — composition sidecars

Examples:

- Home content composition
- Home world stack and polish
- adaptive recommendation display

Risk: merged code is invisible when its entrypoint is not imported.

### Class B — data/feature insertion sidecars

Examples:

- Academy Profile
- Performance Index
- Skill Radar
- AI Coach
- Football IQ progress/results
- session builder and dynamic difficulty UI

Risk: selector-dependent mounting can silently fail when base markup changes.

### Class C — route-owning sidecars

Examples:

- Academy Trial
- Lab/Juggling route controller

Risk: direct DOM replacement and hash navigation compete with the canonical router.

### Class D — recovery and compatibility sidecars

Examples:

- iPhone landing touch fallback
- landing handoff authority

Risk: multiple completion owners make device-specific event order difficult to reason about.

### Class E — development modules loaded in production

`index.html` loads visual-layout and floating-panel development modules on every production page.

Risk: unnecessary observers and production boot complexity, even when their visible controls are gated.

---

## Approved experience versus current production

| Area | Approved direction | Current production | Gap |
|---|---|---|---|
| Identity | simplified tactical strengths reveal with later locked refinements | earlier See/Calm/Improve card and explanatory copy | canonical markup/style stack not consolidated |
| Assessment | real initial profile pathway with mission-specific modules | disabled Coming Soon list and skip path | older assessment owner still active |
| Home | hero + Today's Mission + Football IQ + Technical Training + Results + Lab + supporting progress | quick-action foundation with old stats/results/prototype content | H2–H6 entrypoint dormant |
| Navigation | sticky, centred, validated on iPhone | legacy appearance visible in PC capture | enhancement/canonical nav not aligned |
| New intelligence features | integrated Academy experience | largely sidecar-based and selector-dependent | features can exist in code without a stable visible mount |

---

## Production ownership conclusions

1. `main.js` and `routes.js` remain the canonical base application.
2. The canonical base application still contains older visible screen compositions.
3. Later approved work was frequently delivered as observers and sidecar modules.
4. At least one critical approved composition (`home-content-composition.js`) is not loaded by production.
5. Academy Trial is a parallel router that directly replaces the app and reloads to return Home.
6. The current production result is therefore expected: old base screens plus whichever enhancements happen to mount.
7. PC success on the landing transition validates the direct router API but does not validate the rest of the production experience.
8. iPhone failure is likely amplified by the number of competing event/observer owners, but Sprint A does not alter it.

---

## Sprint B implementation priorities

### B1 — Establish one boot manifest

Create one explicit production module entry that imports approved application enhancements in a documented order. Remove dormant-but-unloaded behaviour.

### B2 — Establish one route authority

Extend the canonical router or add one controlled feature-route adapter. Eliminate direct independent `#app` replacement and reload-based return paths.

### B3 — Activate and verify approved Home composition

Import the H2–H6 composition through the production manifest, then verify:

- each Home region appears once
- no observer loops
- no duplicated Training or Lab entries
- current engines and saved data remain unchanged

### B4 — Consolidate Academy Assessment

Identify the approved assessment renderer and make it the sole owner of the visible assessment selection stage. Retire the disabled placeholder owner only after route and progression validation.

### B5 — Reduce landing ownership

After route consolidation, keep one gesture owner and one router call. Compatibility code may translate touch input but must not own navigation.

### B6 — Remove development modules from the production boot path

Load development tools only in explicit local/dev mode.

---

## Sprint B acceptance gate

Before visual refinements continue, the production build must demonstrate on PC:

```text
Landing
→ Onboarding Step 1
→ Number
→ Position
→ Identity
→ Academy Assessment
→ Home
→ Football IQ
→ Technical Training
→ Results
→ Player
→ PitchIQ Lab
→ Home
```

Required evidence:

- one renderer/adapter named for every stage
- one active instance of every visible Home section
- no page reload needed for internal navigation
- no missing approved composition entrypoints
- no uncaught console errors
- no repeating MutationObserver writes
- saved profile and progression preserved

Only after this PC gate passes should the exact sequence be validated on iPhone Safari/PWA.

---

## Files reviewed

- `index.html`
- `js/app/main.js`
- `js/app/routes.js`
- `js/app/home-content-composition.js`
- `js/app/academy-trial-home-return.js`
- `js/app/academy-trial.js`
- `docs/architecture/HOME_ARCHITECTURE_AUDIT_H1.md`
- repository search inventory for `MutationObserver`, Home, Academy and assessment owners
- recent merged PR history through the landing hotfix series and Academy/Learning work

## Sprint A conclusion

The repository does not need a rollback. The approved engines and UI work should be preserved. The next phase must connect those pieces through a single production boot and route architecture, beginning with the confirmed dormant Home composition and the parallel Academy route owner.
