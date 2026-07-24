# Platform 2.0 — Sprint B5: Navigation Cleanup and Final Audit

## Status

Navigation authority consolidation is functionally complete for the approved Sprint B scope.

## Final ownership boundary

- `NavigationController` owns guarded core route resolution, current route state, canonical rendering and route-change publication.
- `navigation-adapter.js` owns compatibility handoffs, Academy URL entry/normalisation and module-to-Home URL cleanup.
- `pitchiq:route-change` is the read-only route signal consumed by bottom navigation, world loaders and migrated Lab loaders.
- `FirstRunController` remains authoritative for first-run progression and protected-route recovery.
- `TrainingController` continues to own training-stage transitions while cross-screen transitions pass through navigation.

## Completed cleanup

- Removed bottom-nav route inference from DOM and URL state.
- Removed bottom-nav MutationObserver and capture-phase repair ownership.
- Centralised Academy hash entry and legacy route normalisation.
- Centralised Academy-to-Home handoff.
- Migrated Reflect, Football IQ and MindIQ lazy loaders to the central route signal.
- Migrated Auto Juggler, Mental Imagery and CalmSense route observation and entry/back transitions.
- Preserved startup deep links and `pageshow` recovery as read-only compatibility inputs.

## Remaining compatibility surfaces

The following remain intentionally supported and are not second route authorities:

- `window.PitchIQApp.enterFromLanding()`
- `window.PitchIQApp.enterAcademy()`
- `window.PitchIQApp.enterHomeFromModule()`
- `window.PitchIQApp.navigationAdapter`
- startup URL reads used to hydrate deep-linked feature modules before the first central route signal
- feature DOM observers that detect render availability but do not decide routes

These bridges may be reduced in a later versioned deprecation sprint only after external callers and deep-link analytics confirm they are unused.

## Search audit result

Repository code search on current `main` returned no indexed matches for direct `location.hash`, `hashchange`, `history.replaceState` or `pitchiq:navigate` usage outside the already-migrated and documented navigation boundary. Because GitHub code indexing can lag, this result is treated as supportive rather than absolute proof.

## Regression gates required before release

1. Fresh install completes first run and reaches Home.
2. Returning player enters Home.
3. Reset Player returns to Splash.
4. Refresh resumes every first-run stage.
5. Bottom nav opens Home, Train, Results and Player correctly.
6. Home world cards open and return.
7. Training setup, live session and Results complete correctly.
8. Results can continue training or return Home.
9. Notification centre does not reroute.
10. Academy completes to Home without a loop.
11. Legacy Academy deep link normalises once.
12. World and Lab deep links load after refresh.
13. Browser Back does not expose protected screens.
14. One route-change event is emitted per route transition.
15. iPhone Safari reload does not cycle between routes.

## Exit decision

Sprint B architecture work is complete. Runtime removal beyond the compatibility surfaces above is deferred until automated regression evidence is available. This avoids deleting working fallbacks solely for cosmetic code reduction.
