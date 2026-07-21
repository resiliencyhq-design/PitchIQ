# Sprint C.3.2 — Final Academy Runtime Ownership Audit

## Production symptom

The iPhone Match Ready screen displayed the legacy `ENTER THE ACADEMY` CTA after Sprint C.3.1. The canonical runtime renders `START ORIENTATION`, so the visible copy proved that a legacy renderer was replacing the canonical DOM.

## Confirmed root cause

`academy-trial.js` still declared `academy-trial`, `academy-trials`, and `lab-juggling` as feature routes. Because it loaded after `academy-runtime-canonical.js`, it immediately overwrote the canonical Match Ready screen with its legacy `intro()` renderer and legacy CTA.

This also explains why the C.3.1 delegated handler did not advance: the visible button was not a canonical `[data-canonical-next]` control.

## Final route ownership

| Route | Owner |
|---|---|
| `#academy-trial` | `academy-runtime-canonical.js` |
| `#academy-trials` | canonical redirect only |
| `#lab-juggling` | `academy-trial.js`, lazy-loaded by `academy-lab-loader.js` |

## Production change

`academy-trial.js` is no longer loaded during normal application startup. `academy-lab-loader.js` imports it only after the route becomes `#lab-juggling`.

## Regression requirements

- Production HTML must not directly load `academy-trial.js`.
- The lab loader must import `academy-trial.js` only for `lab-juggling`.
- The canonical Match Ready CTA remains `START ORIENTATION`.
- The experimental Lab camera flow remains available through `#lab-juggling`.
