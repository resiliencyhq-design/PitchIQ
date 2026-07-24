# Platform 2.0 — Sprint B: Navigation Authority Consolidation

## Objective

Establish one authoritative navigation boundary for the whole application without changing approved user flows or visual design.

## Current confirmed route owners

The current runtime contains several navigation paths:

- `goto(route)` in `js/app/main.js`
- direct route rendering through `render(route)`
- `window.location.hash = "academy-trial"` in the Academy handoff
- `window.history.replaceState(...)` during module-to-Home handoff
- document-level `[data-route]` handlers
- developer-panel route handlers
- controller callbacks that render Training or Results directly
- feature modules receiving `goto` as a callback

This produces a partially centralised system: route guarding exists, but route intent can still originate through multiple APIs and direct browser mutations.

## Target boundary

Introduce a single `NavigationController` with these responsibilities:

1. Validate route names.
2. Apply first-run and protected-route guards.
3. Normalise route intent.
4. Own current route state.
5. Perform browser URL/history updates where required.
6. Trigger the canonical renderer.
7. Publish one route-change event.
8. Provide a compatibility adapter for existing modules during migration.

## Proposed public API

```js
navigation.go("home");
navigation.replace("home");
navigation.resume();
navigation.getCurrentRoute();
navigation.canAccess("training");
```

## Architectural rules

- Screens and feature modules must not call `render(route)` directly.
- Screens and feature modules must not write `window.location.hash`.
- Screens and feature modules must not call `history.pushState` or `replaceState` directly.
- First-run guards remain authoritative and are called by NavigationController.
- Training stage transitions remain owned by TrainingController; cross-screen routing moves through NavigationController.
- The existing `window.PitchIQApp` surface becomes a temporary compatibility adapter, not a second navigation owner.
- All compatibility methods must have a documented removal phase.

## Migration sequence

### B1 — Introduce controller and compatibility adapter

- Add `js/app/controllers/navigation-controller.js`.
- Move route validation and guard orchestration into the controller.
- Keep `goto()` temporarily as a thin adapter.
- Preserve current route names and behaviour.

### B2 — Migrate canonical main runtime

- Route nav buttons through `navigation.go()`.
- Route developer controls through the same authority.
- Route render-error recovery through the same authority.
- Move current-route ownership into NavigationController.

### B3 — Migrate Academy handoffs

- Replace direct hash mutation.
- Replace direct history mutation.
- Keep the approved first-run resume logic unchanged.

### B4 — Migrate feature modules and controller callbacks

- Notification centre
- Training to Results
- Results to Training/Home
- Home world cards
- Player and reset flows
- Lab routes

### B5 — Remove duplicate route paths

After regression validation:

- remove direct cross-screen `render(route)` calls;
- remove direct hash/history writes;
- remove duplicate global route handlers;
- reduce `window.PitchIQApp` to the minimum supported public bridge.

## Regression gates

Every sub-phase must pass:

1. Fresh install → complete first run → Home.
2. Returning player → Home.
3. Reset Player → Splash.
4. Refresh at each first-run stage.
5. Bottom nav routes open correctly.
6. Home world cards open and return.
7. Training setup → live → Results.
8. Results → Continue Training.
9. Player opens and reset remains functional.
10. Notification centre opens and closes without rerouting.
11. Academy handoff continues to the correct first-run stage.
12. Direct protected-route request resumes first run rather than bypassing it.
13. iPhone Safari reload does not cycle between routes.
14. Browser Back does not expose an invalid protected screen.
15. No duplicate route-change events per user action.

## Scope lock

Sprint B must not:

- redesign screens;
- rename user-facing routes;
- alter first-run content;
- change player data;
- change XP or rewards;
- remove legacy code before its caller is migrated and tested.

## Exit criteria

Sprint B is complete when:

- all cross-screen navigation goes through NavigationController;
- direct hash/history route mutations are removed;
- one guarded route-change event is emitted per transition;
- current behaviour passes the regression gates;
- compatibility adapters are explicitly registered for later removal.
