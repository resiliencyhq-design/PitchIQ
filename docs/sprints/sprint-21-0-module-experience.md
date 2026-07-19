# Sprint 21.0 — Module Experience

## Objective

Turn each Football IQ category tile into a persistent learning hub without changing mission runtime, training, Home, Results, Player or bottom navigation architecture.

## Implementation

- Added a module metadata registry for Awareness, Scanning, Vision, Decision Making, Positioning, Anticipation and Communication.
- Added registry-driven helpers for module mission membership and progress.
- Added the `football-iq-module/<module-id>` route.
- Category tiles now open a dedicated module page rather than filtering the flat mission list.
- Module pages display:
  - coaching purpose and prompt;
  - completion percentage and mastery level;
  - completed / total missions;
  - available training time;
  - last-trained state;
  - continue-training recommendation;
  - dynamically generated mission list with available, complete and locked states.
- Mission detail back navigation returns to its parent module.
- Added responsive iPhone styling and narrow-width fallback.

## Architecture safety

The module layer references mission IDs and categories from the existing mission registry. It does not duplicate mission runtime logic or alter native runtime adapters. Existing launch behaviour continues to hand off to the established Training route.

## Acceptance

- Module category tap opens a dedicated page.
- Mission lists update from the registry.
- Progress is calculated from current mission status data.
- Locked missions remain non-launchable.
- Mission detail remains available.
- Home, Train, Results, Player and bottom navigation behaviour are unchanged.
- Responsive layout supports narrow iPhone widths.

## Verification

`tests/football-iq-module-experience.test.js` covers module registration, dynamic mission membership, progress and mastery calculation, available-duration calculation, and empty/locked module behaviour.
