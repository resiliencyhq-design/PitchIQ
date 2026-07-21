# Sprint C.3.3 — Academy Stability Lock

## Status

**LOCKED — iPhone validated on 2026-07-21**

The following first-run Academy journey is the approved production baseline:

1. Discover Your Strengths
2. Match Ready
3. Meet Your Coach
4. Camera Finder
5. Quick Challenge
6. Academy Accepted
7. Avatar Selection
8. Home

## Locked route ownership

- `#academy-trial` is owned only by `js/app/academy-runtime-canonical.js`.
- `#academy-trials` is redirect-only and must not render a screen.
- `#lab-juggling` is owned by the lazily loaded experimental lab runtime.
- `js/app/academy-trial.js` must not be eagerly loaded from `index.html`.

## Locked interaction behaviour

- All Academy forward, back and avatar actions use the permanent delegated canonical controller.
- The Match Ready CTA must remain visible and actionable on iPhone.
- Each Academy stage must reset scroll position to the top.
- Player name, number and position must persist through the Academy flow.
- Completing Avatar Selection must set Academy acceptance and return to Home.

## Change-control rule

Future work may improve visual polish, copy, animation or accessibility, but must not change route ownership, reintroduce legacy Academy renderers, or replace the canonical delegated controller without a full regression run.

Any change touching these files requires Academy regression verification:

- `index.html`
- `js/app/academy-runtime-canonical.js`
- `js/app/academy-journey.js`
- `js/app/academy-lab-loader.js`
- `js/app/academy-trial.js`

## Required regression sequence

Test on iPhone Safari/PWA:

`Landing → Name → Number → Position → Discover Your Strengths → Match Ready → Coach → Camera → Quick Challenge → Academy Accepted → Avatar → Home`

The stability lock is broken if any screen fails to render, any CTA becomes inactive, the legacy `Enter the Academy` screen reappears, or the flow fails to return to Home.
