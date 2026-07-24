# Platform 2.0 — Sprint B4 Navigation Call-Site Audit

## Purpose

Audit the remaining direct navigation and route-observation call sites after B1–B3, classify their ownership, and define the final migration order without changing behaviour yet.

## Current findings

### Canonical navigation ownership

The core application now owns route validation and protected-route guards through `NavigationController`, while cross-module Landing and Academy handoffs are routed through `navigation-adapter.js`.

### Remaining direct route observers

The repository still contains feature loaders and compatibility modules that independently read `window.location.hash` and subscribe to `hashchange` or `pageshow`. These include world lazy-loaders, Lab loaders, legacy Academy modules and bottom-navigation state repair code.

### Highest-risk remaining owner

`bottom-nav-state-lock-h20.js` still infers the active route from either DOM screen IDs or the URL hash, then uses MutationObservers, a capture-phase click listener, `hashchange`, and `pageshow` to repair nav state after rendering. This is duplicate route-state ownership and should be replaced by an explicit route-change subscription after compatibility validation.

### Lower-risk observers

Feature lazy-loaders such as `reflect-lazy-loader-h10.js` use hash observation to conditionally import optional modules. These are route observers rather than route decision-makers, but they should ultimately consume a central route signal or module registry instead of independently parsing the URL.

## B4 migration sequence

1. Introduce a central read-only route-change event/API emitted by NavigationController after a resolved route is committed.
2. Migrate bottom-nav active-state synchronisation to the central route signal.
3. Remove its DOM MutationObserver, capture click listener and hash-derived route inference.
4. Migrate world and Lab lazy-loaders in small groups to the central route signal or module registry.
5. Remove direct custom `pitchiq:navigate` fallback listeners where the controller/adapter is guaranteed.
6. Retain URL hash parsing only for true deep-link entry boundaries until declarative routing replaces hashes.

## Safety constraints

- Preserve current route names and deep links.
- Preserve Home, Train, Results and Player bottom-nav behaviour.
- Preserve Academy refresh/resume and Lab/world loading.
- Do not mix visual changes with route ownership changes.
- Do not delete compatibility modules until equivalent regression coverage exists.

## Exit criteria

B4 is complete when all remaining direct route call sites are registered and prioritised, the bottom-nav duplicate owner is replaced by explicit navigation state, and optional module loaders no longer decide application navigation.
