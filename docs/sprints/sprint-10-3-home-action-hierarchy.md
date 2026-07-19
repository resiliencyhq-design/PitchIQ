# Sprint 10.3 — Home Action & Hierarchy

## Objective
Make the Home screen's next action unmistakable while preserving the existing Home renderer, progression data, navigation routes, avatar assets, mission logic, and Auto Juggler integration.

## Changes
- Compact the Level status panel.
- Reveal more of the dynamically selected player avatar.
- Add a full-width Start Training action using the existing `data-route="training"` contract.
- Shorten the persistent navigation while Home is active.
- Give the Home destination a clear lime active state.
- Load all changes through isolated Home enhancement CSS and JavaScript modules.

## Architecture safeguards
- No Home renderer replacement.
- No progression, XP, OVR, reward, mission, onboarding, trial, or identity logic changes.
- No new training route.
- No changes to the Auto Juggler Home tile injection contract.

## Validation
- Verify Home on a small iPhone viewport and a tall current iPhone viewport.
- Verify dynamic player name, avatar, position, play style, OVR, level, and XP.
- Tap Start Training and confirm the existing Training screen opens.
- Verify all four persistent navigation destinations.
- Verify Auto Juggler remains visible and opens.
- Complete first-run flow and confirm Avatar → Home.
- Reopen installed PWA and confirm expected Home start.
