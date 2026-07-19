# Sprint H1 — Home Architecture Audit

## Purpose

Document the current Home screen ownership, state, navigation and injection points before any visual reconfiguration. This sprint makes no runtime or styling changes.

## Locked boundary

The existing player hero is out of scope for H2–H7 and must remain pixel-identical unless a separate approved sprint explicitly unlocks it.

Locked hero responsibilities include:

- greeting and player name
- avatar/hero artwork
- OVR
- position and play style
- level and XP
- streak and playing level
- hero data bindings and background assets

## Current render pipeline

The canonical application renderer is `js/app/main.js`.

- `render("home")` calls `renderHome(state)`.
- `renderHome` is imported from `js/app/routes.js`.
- `bindScreen()` binds the standard `[data-route]` and `[data-action]` controls after each canonical render.
- The bottom navigation is rendered by `renderNav()` and remains the canonical route authority for Home, Training, Results and Player.
- Protected routes require completed onboarding.

This means the safe Home reconfiguration path is to preserve `renderHome(state)`, preserve canonical route attributes, and change only the composition beneath the hero in controlled stages.

## Canonical Home composition

`renderHome(state)` currently renders:

```text
#home.home-aaa.home-v7
└── .home-v7-grid
    ├── renderIdentityModule(state, metrics)
    ├── renderMissionModule(state, metrics)
    ├── renderQuickActionsModule()
    └── renderWeeklyPackModule(metrics, state)
```

### 1. Player hero

**Owner**

- markup: `js/app/routes.js` → `renderIdentityModule(state, metrics)`
- metrics: `homeMetrics(state)`, `playerOverall(state)`, progression helpers
- styling: existing Home/hero rules in the current application stylesheet stack

**State dependencies**

- `state.profile.name`
- `state.profile.position`
- `state.game.level`
- `state.game.xp`
- streak/rank/overall calculations
- onboarding mirror keys synchronised by `main.js`

**Navigation**

- no reconfiguration required

**H2–H7 rule**

- do not move internal hero nodes
- do not rename hero classes
- do not replace hero markup
- do not alter hero metric calculations

### 2. Today’s Mission

**Owner**

- markup: `js/app/routes.js` → `renderMissionModule(state, metrics)`
- mission progress helpers in `routes.js`:
  - `comboTargetForLevel`
  - `formatMissionTime`
  - `completedCueCount`
  - `completedTrainingSeconds`
- training state and mission launch authority: `js/app/main.js`

**Current responsibility**

- shows the daily mission/reward
- shows time, combo and cue progress
- sends the player into Training

**Canonical destination**

- route: `training`
- mission execution: `startMissionTraining()` in `main.js`
- mission drill authority: `missionDrill()` using `recommendedDrills()`

**Target responsibility**

- remain the single primary action for continuing the assigned/current mission
- become the bright primary card in H3
- must not become a mission chooser

### 3. Adaptive Football IQ recommendation card

**Owner**

- runtime injection: `js/app/home-adaptive-recommendation.js`
- storage key: `pitchiq.adaptiveTraining.current.v1`
- selector: `[data-home-adaptive-recommendation]`

**Insertion behaviour**

- created asynchronously after the canonical Home render
- inserted after `.home-mock-mission` when present
- otherwise prepended to `.home-v7-grid`
- refreshed through a child-list `MutationObserver`, `pageshow`, and Home navigation events

**Current responsibility**

- displays the selected adaptive Football IQ mission or the first-mission empty state
- currently contains another `Continue Training` button

**Navigation safeguard**

- its click handler delegates to the canonical bottom-nav Training button rather than introducing a parallel router

**Known duplication**

- Today’s Mission and the adaptive Football IQ card both currently behave as Continue Training entries

**Target responsibility**

- H4 should convert this area into Football IQ mission exploration/browsing
- the primary card should no longer compete with Today’s Mission
- adaptive selection logic remains untouched

### 4. Quick actions

**Owner**

- markup: `js/app/routes.js` → `renderQuickActionsModule()`

**Current controls**

- Training → `data-route="training"`
- Results → `data-route="results"`
- Player → `data-route="player"`

**Binding**

- canonical `bindScreen()` route handling in `main.js`

**Target responsibility**

- these routes should be reused by the world-card stack
- no new duplicate navigation functions should be introduced
- Player remains available through bottom navigation even if removed from the main content stack

### 5. Training Stats and Latest Results

**Owner**

- markup: `js/app/routes.js` → `renderWeeklyPackModule(metrics, state)`
- calculation: `trainingStats(state)`

**State dependencies**

- `state.analytics.sessions`
- `state.game.trainingSeconds`
- `state.game.lastResult`
- `state.game.bestCombo`
- `state.game.xp`
- `state.game.level`

**Current controls**

- Latest Results card → `data-route="results"`

**Target responsibility**

- retain existing calculations and Results route
- move below the new world cards during H6
- do not create a second statistics pipeline

### 6. Football IQ progress and weekly focus

**Current observed role**

- Football IQ evidence-building progress
- session and active-day totals
- current weekly training focus
- links to progress/report views

**Architecture note**

- these sections are not part of the four static modules returned directly by the base `renderHome()` composition shown above
- they are therefore treated as post-render/enhancement content and must be located by stable selectors during H2 before any movement
- their data engines must remain authoritative and must not be duplicated inside the new world cards

**H2 requirement**

- inventory their final DOM selectors at runtime
- move existing nodes only after they render
- do not copy their HTML into a second card

### 7. PitchIQ Lab

**Current entry points**

- small Home Lab tile/entry
- larger Experimental Lab promotional card lower on Home
- feature route/controller in `js/app/academy-trial.js`
- Lab route currently remains separate from formal Football IQ training

**Target responsibility**

- one clear PitchIQ Lab world card near the top of the Home content stack
- preserve the existing Lab destination and camera ownership
- keep the larger Experimental Lab card until the smaller replacement is validated, then remove duplication in H6

### 8. Bottom navigation

**Owner**

- markup: `renderNav()` in `js/app/routes.js`
- shell/binding: `ensureAppShell()` and `bindScreen()` in `js/app/main.js`

**Current routes**

- Home
- Train
- Results
- Player

**Locked rule**

- bottom navigation architecture remains unchanged during H2–H6
- new cards should use existing `data-route` targets or delegate to canonical nav controls

## Current source-of-truth map

| Home content | Render/owner | Data authority | Current action | H-series target |
|---|---|---|---|---|
| Player hero | `routes.js` identity module | profile + progression state | none | locked/unchanged |
| Today’s Mission | `routes.js` mission module | mission/progression/session state | Training | primary Continue card |
| Football IQ recommendation | `home-adaptive-recommendation.js` | adaptive current selection | delegated Training | browse/select missions |
| Training shortcut | `routes.js` quick actions | canonical router | Training | absorbed into world structure |
| Results shortcut | `routes.js` quick actions | canonical router | Results | Results world card |
| Player shortcut | `routes.js` quick actions | canonical router | Player | bottom nav remains authority |
| Training Stats | `routes.js` weekly pack module | analytics/game state | none | supporting content below worlds |
| Latest Results | `routes.js` weekly pack module | last result/session state | Results | supporting content below worlds |
| Football IQ progress | post-render enhancement | evidence/progress engine | progress/report | retain, move only |
| Weekly focus | post-render enhancement | adaptive/evidence engine | report/training | retain, move only |
| PitchIQ Lab | Home enhancements + Academy/Lab controller | Lab controller/state | Lab | single world card |
| Experimental Lab promo | lower Home enhancement | Lab controller/state | Lab | remove only after replacement validates |

## Collision and regression risks

### Risk 1 — asynchronous injection order

The adaptive recommendation card is inserted after the canonical Home render. A new wrapper that assumes all cards exist synchronously could place it outside the intended stack or duplicate it.

**Control:** H2 must support late-arriving nodes and apply composition idempotently.

### Risk 2 — duplicate Training routes

Today’s Mission, adaptive recommendation, quick-action Training and bottom-nav Train all lead to Training.

**Control:** preserve one canonical route authority; redefine card purpose before removing any entry.

### Risk 3 — broad MutationObservers

Home enhancements use observers to react to rerenders. Rewriting observed content repeatedly can create loops or freeze iPhone Safari.

**Control:** use child-list observation only where required; compare signatures/classes before writing; disconnect/reconnect around node movement if necessary.

### Risk 4 — state duplication

Mission progress, stats, results and adaptive recommendations come from different existing state sources.

**Control:** world cards may summarise existing state, but may not calculate or persist competing values.

### Risk 5 — bottom-nav overlap

The current fixed navigation can cover lower CTAs and cards.

**Control:** H2 wrapper must include bottom safe-area/navigation clearance without changing nav positioning.

### Risk 6 — Lab camera ownership

Lab and formal training use separate camera/training controllers.

**Control:** world-card changes must only route to existing entry points; no camera code belongs in Home composition.

## Approved target hierarchy

```text
PLAYER HERO — locked

TODAY’S MISSION
Continue assigned/current mission

FOOTBALL IQ TRAINING
Browse another Football IQ mission

TECHNICAL TRAINING
Enter technical skill development

RESULTS
Track development

PITCHIQ LAB
Open experimental features

TRAINING STATS
LATEST RESULTS
FOOTBALL IQ PROGRESS
WEEKLY FOCUS
```

## Recommended H2 implementation contract

H2 may:

- add one scoped wrapper beneath the hero
- add stable composition hooks/classes
- order existing nodes without recreating their data
- accommodate asynchronously injected cards
- add bottom-navigation clearance

H2 may not:

- alter hero markup or styles
- change routes
- rename storage keys
- change adaptive recommendations
- change training, XP, OVR, results or progress calculations
- remove any current Home content
- introduce new visual world cards yet

## H2 acceptance checks

1. Hero remains visually identical.
2. Every current Home section still appears once.
3. Today’s Mission still opens Training.
4. Adaptive Continue Training still opens Training.
5. Training, Results and Player shortcuts still work.
6. Lab entry still works.
7. Stats and progress values remain unchanged.
8. Home rerenders do not duplicate cards.
9. Returning from every destination restores Home.
10. Bottom navigation does not obscure content.

## H1 conclusion

The redesign can be achieved without replacing Home. The safest path is progressive composition around the existing renderers and enhancement modules. The main architectural issue is not missing functionality; it is duplicate purpose between Today’s Mission and the adaptive Football IQ card. H3 and H4 should separate those responsibilities while retaining all current state and routing engines.