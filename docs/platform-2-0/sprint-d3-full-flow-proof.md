# Platform 2.0 — Sprint D3: Full-Flow Browser Proof

## Objective

Extend the Reliability Harness beyond startup and first-run state into the core returning-player journeys that are most likely to regress after navigation and state ownership changes.

## Added coverage

- Returning-player entry into Training from the persistent app shell.
- Notification preference persistence across reload.
- Lab entry and return to Home.
- Duplicate route-event detection for one user navigation action.
- Runtime collection of page errors, console errors and failed requests.
- Execution through both configured Playwright projects: desktop Chromium and iPhone-sized WebKit.

## Test design

The suite seeds canonical returning-player state through the D2 helpers and interacts through visible UI controls. Selectors prefer stable route and accessibility hooks, with text-based fallbacks for legacy markup. The tests do not depend on a deployed URL.

## Preserved behaviour

This sprint adds regression tests only. It does not intentionally change production navigation, state, onboarding, player data, notifications, Training, Results, Lab features or visuals.

## Verification status

The suite is registered under the existing `npm run test:e2e` command. Successful local or CI execution is not claimed until a repository test environment runs the branch.

## Remaining proof

- Complete interactive first-run onboarding from Landing to Home.
- Deterministic Training completion into Results once stable test hooks for the staged training controls are confirmed.
- Evidence-backed retirement of remaining compatibility keys.
- CI workflow execution and artifact review.
