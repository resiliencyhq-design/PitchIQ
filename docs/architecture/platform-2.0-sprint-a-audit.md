# PitchIQ Platform 2.0 — Sprint A Architecture Audit

Status: Discovery baseline  
Scope: Whole production application  
Constraint: No behavioural or visual changes in Sprint A

## 1. Purpose

This document establishes the current architecture baseline before consolidation. It records ownership, duplication, runtime risk and the recommended migration sequence. Working user journeys remain the behavioural contract while implementation is simplified underneath them.

## 2. Executive assessment

PitchIQ has a functioning core application and several increasingly well-defined domain controllers. However, the production runtime still behaves like an accumulated MVP: the root HTML directly loads a large stack of feature, compatibility and repair modules; multiple modules use document-level listeners or MutationObservers; persisted state is spread across application state, localStorage and sessionStorage; and several visual features are assembled after initial render.

The highest architectural risk is not any single file. It is **competing ownership**: more than one module can currently influence navigation, rendered markup, player state, onboarding state, progression or a screen lifecycle.

The correct approach is controlled consolidation, not a rewrite.

## 3. Current runtime baseline

### 3.1 App shell

The production shell is defined in `index.html` and contains:

- `#app` as the main render root;
- `#nav` as a separately rendered bottom-navigation root;
- a global toast;
- a boot watchdog;
- global error and unhandled-rejection handlers;
- service-worker/cache retirement logic.

This shell is suitable as a stable boundary, but boot responsibilities should eventually move into a dedicated bootstrap module.

### 3.2 Production loading model

The root page currently directly loads the primary application module plus a substantial set of feature and compatibility modules. These include home enhancements, navigation state repair, rewards, results integration, mission integration, world engines and lazy loaders, CalmSense routing, landing handoff repairs and three onboarding augmentation modules.

The CSS loading model is similarly cumulative. Position onboarding alone is composed from multiple stylesheets covering lock, tactical web, spawn, polish, layout, marker, web, animation, typography and iPhone fit.

This is a clear consolidation opportunity: direct script and stylesheet count should fall as features are absorbed into canonical domain entry points.

## 4. Preliminary ownership matrix

| Capability | Current/observed owners | Risk | Target owner |
|---|---|---:|---|
| Application bootstrap | inline `index.html`, `main.js`, `production-bootstrap.js`, boot watchdog | High | `core/bootstrap/AppBootstrap` |
| Navigation | main app/router, screen bindings, bottom-nav modules, route-specific compatibility modules | Critical | `core/navigation/NavigationService` |
| Player identity | app state, player service/controller code, onboarding modules, raw storage keys | Critical | `domains/player/PlayerService` + `PlayerRepository` |
| First-run progression | `FirstRunController` plus landing/onboarding/Academy compatibility modules | High | first-run state machine and step registry |
| Onboarding rendering | primary renderer plus jersey, number, spawn and tactical-web post-render modules | High | canonical onboarding renderer/controller |
| Academy progression | canonical Academy runtime plus first-run handoff/controller integration | High | Academy first-run controller |
| Home rendering | home renderer plus dynamically loaded enhancement modules | Medium | Home domain entry point with registered widgets |
| Bottom navigation | nav renderer plus layout/state/lock repair modules | High | navigation shell component |
| Training lifecycle | training controller, UI bindings, results/progression integrations | High | `TrainingSessionService` |
| XP/levels/rewards | game state, progression module, streak/reward module, results integration | High | `ProgressionService` |
| Results | renderer plus training snapshot and coach-feedback augmentation | Medium | Results domain controller/renderer |
| Lab features | route-specific modules and loaders | Medium | Lab module registry |
| Camera/sensors | feature-specific implementations | High | shared platform camera/sensor lifecycle services |
| Persistence | localStorage, sessionStorage and service-specific state | Critical | versioned repositories behind one storage adapter |
| Diagnostics | inline watchdog and scattered console logging | Medium | `core/diagnostics` |

## 5. Confirmed architecture pressure points

### 5.1 Root-level module accumulation

`index.html` acts as a manual dependency graph. Feature enablement, ordering and cache versions are encoded as script tags. This increases boot fragility and allows hidden ordering dependencies.

**Target:** one production entry module that imports domain entry points through an explicit composition root.

### 5.2 Post-render DOM augmentation

Current modules use MutationObservers and delegated document listeners to detect screens, insert or rewrite markup, repair labels, upgrade controls and reapply state.

This pattern was effective for emergency restoration, but it creates race conditions and makes screen ownership unclear.

**Target:** render the final canonical markup once, bind scoped handlers once, and return a cleanup function when the screen unmounts.

### 5.3 Distributed persistence

Raw localStorage/sessionStorage access remains present. First-run, identity and feature modules may know specific storage keys.

**Target:**

```text
UI event
  -> domain action
  -> service validation
  -> repository
  -> versioned storage adapter
```

Screens and visual modules must not know storage keys.

### 5.4 Navigation bypass risk

Historical regressions show that direct Home transitions, legacy listeners and screen-specific route ownership can bypass canonical progression checks.

**Target:** all route changes become navigation requests. Only the navigation service performs transitions and applies guards.

### 5.5 Domain/UI coupling

Some modules combine domain relationships, state mutation, DOM selection, animation and navigation. The tactical position web is a representative example: its football relationship data is valuable domain data, while SVG drawing is UI behaviour.

**Target:** separate data/rules from rendering so position relationships can be reused in learning, recommendations and formations.

### 5.6 Dependency version reproducibility

`package.json` currently uses `latest` for runtime and development dependencies. This makes clean installs non-deterministic and can introduce unreviewed breaking changes.

**Target:** pin dependency versions and commit a lockfile policy as part of a later tooling sprint. This should not be mixed into behavioural consolidation.

## 6. Target architecture

```text
src/
  core/
    bootstrap/
    navigation/
    state/
    storage/
    events/
    feature-flags/
    diagnostics/

  domains/
    player/
    first-run/
    academy/
    training/
    progression/
    rewards/
    results/
    notifications/
    home/
    lab/

  platform/
    camera/
    sensors/
    audio/
    haptics/
    sync/

  ui/
    components/
    screens/
    layouts/
    styles/
```

This is an incremental destination, not a bulk file-move requirement.

## 7. Architecture rules to lock

1. **One owner per responsibility.** Navigation, persistence, XP, rewards, reset, camera lifecycle and first-run progression each have one authority.
2. **Screens do not write storage.** They dispatch domain actions.
3. **Screens do not perform route changes directly.** They submit navigation intent.
4. **Domain logic must run without the DOM.** Business rules require unit-testable pure or service-level APIs.
5. **Persisted state is versioned and migrated.** Recovery is explicit and deterministic.
6. **Screen bindings are scoped and disposable.** No permanent global listener unless it is genuinely application-global.
7. **Compatibility patches have an owner and removal condition.** Temporary modules cannot become undocumented permanent architecture.
8. **Visual consolidation cannot change approved UX.** Architecture PRs and redesign PRs remain separate.
9. **Experimental Lab modules cannot own core navigation or player state.**
10. **Every domain publishes a small public API.** Other domains must not reach into internal files or DOM structure.

## 8. Compatibility and consolidation register

### Keep as canonical foundations

- main app composition and current approved renderers, pending extraction;
- `FirstRunController` as the seed for a proper first-run state machine;
- Player service/controller concepts;
- training controller concepts;
- approved UI and working user journeys;
- boot watchdog behaviour, moved later to diagnostics.

### Merge into canonical domains

- onboarding jersey-number flow;
- position marker setup and spawn behaviour;
- tactical position relationships and caption rendering;
- landing handoff recovery;
- bottom-navigation state locks;
- Home dynamic salutation/widgets;
- results snapshot and feedback augmentation;
- streak and reward integration.

### Candidate compatibility layers for later removal

- route-specific hotfix modules after canonical navigation owns the same behaviour;
- MutationObserver-based ordinary screen construction;
- duplicate onboarding stylesheet layers after visual parity tests;
- cache-version history embedded in filenames/query strings once build fingerprinting is authoritative;
- service-worker retirement code after the migration window is formally closed.

No candidate is to be deleted until call sites, runtime loading and regression journeys are verified.

## 9. Safety baseline — required journeys

The following journeys define the current behavioural contract:

1. Fresh storage: Landing → Name → Number → Position → Strengths → Academy induction → Coach → Camera → Practice → Contract → Avatar → Player Style → Home.
2. Refresh at every first-run step resumes deterministically.
3. Player Reset clears all player/first-run state and returns to Landing/Step 1.
4. Returning completed player opens Home directly.
5. Bottom navigation opens Home, Train, Academy/Learn and Player correctly and returns safely.
6. Home world cards open the correct chapters and return to Home.
7. Today’s Mission opens the intended training flow.
8. Training starts, runs, ends and produces one results record.
9. XP is awarded exactly once per completed rep.
10. Reward eligibility/unlock is emitted exactly once.
11. Results displays the completed session and can continue training or return Home.
12. Notification centre opens independently of Player profile.
13. Lab cards route to the correct prototype; CalmSense and other modules do not hijack core routes.
14. Camera start/stop releases media resources cleanly.
15. A malformed or partial persisted state returns a structured recovery route rather than looping or blank-screening.

## 10. Prioritised migration sequence

### Sprint B — Navigation authority consolidation

- inventory every route call and route-like listener;
- introduce one navigation service and route guards;
- migrate one route family at a time;
- remove direct hash, reload and screen-owned Home transitions;
- preserve all approved navigation outcomes.

### Sprint C — Player state and persistence

- introduce versioned PlayerRepository and storage adapter;
- migrate raw player storage calls;
- make reset transactional;
- add legacy-key migration and validation.

### Sprint D — Progression ownership

- centralise XP, levels, streaks and reward eligibility;
- guarantee idempotent training completion;
- publish progression events for UI and notifications.

### Sprint E — Training vertical slice

- isolate session state, scoring, persistence and renderer;
- formalise camera adapter boundaries;
- make results consume a completed-session record.

### Sprint F — First-run and Academy consolidation

- replace step flags with an explicit state machine;
- fold jersey, number, position and tactical-web patches into canonical screens;
- split Academy domain state, renderer and bindings;
- remove verified obsolete first-run compatibility layers.

### Sprint G — Home/Lab registries

- register Home widgets/worlds and Lab modules declaratively;
- lazy-load through domain APIs rather than root script tags;
- isolate experimental modules.

### Sprint H — Camera and sensor platform

- shared permission, start, pause, stop, release and error lifecycle;
- adapters for camera training, Auto Juggler, breathing and future sensors.

## 11. Sprint A remaining audit work

This baseline identifies the main structural risks. Before Sprint B implementation begins, the branch should be expanded with machine-verifiable registers for:

- every production script and stylesheet loaded by `index.html`;
- every raw localStorage/sessionStorage key and call site;
- every document/window listener and MutationObserver;
- every navigation call site;
- current controllers, services, repositories and renderers;
- dead/unreferenced files and duplicate CSS selectors;
- current automated test coverage mapped to the safety journeys.

## 12. Decision

Proceed with Platform 2.0 as an incremental consolidation programme. Do not rewrite the app or change frameworks during the stability phase. The first implementation target after the completed audit is **Navigation Authority Consolidation**, because navigation currently has the widest blast radius across first run, Home, Player, Academy, Lab and training.