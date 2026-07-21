# Sprint C.3 — Academy Architecture Audit & Consolidation

## Audit finding

The Academy onboarding journey had four simultaneously active runtime owners:

1. `academy-journey.js`
   - rendered and isolated Discover Your Strengths
   - intercepted the final onboarding CTA
   - changed the hash
   - observed the entire document body

2. `academy-trial.js`
   - owned `#academy-trial`, `#academy-trials`, and `#lab-juggling`
   - rendered Match Ready and the legacy Learn the Tools preview
   - registered another hash listener and app observer

3. `academy-orientation-polish.js`
   - observed the Academy DOM
   - rewrote legacy preview copy after render

4. `academy-orientation-interactive.js`
   - observed the Academy DOM
   - changed the Match Ready CTA after render
   - rendered Coach, Camera, and Challenge screens
   - redirected the legacy route

This created competing screen, route, event, and DOM ownership. A correct hash transition could still leave the wrong screen visible because another observer or renderer could act after it.

## Consolidated ownership

### Canonical Academy onboarding owner

`js/app/academy-runtime-canonical.js`

Owns:

- transition from Discover Your Strengths
- `#academy-trial`
- Match Ready
- Meet Your Coach
- Camera Finder
- Quick Challenge
- Academy Accepted
- Avatar selection
- completion return to Home
- legacy `#academy-trials` redirect

### Identity presentation owner

`js/app/academy-journey.js`

Retained only to create and present the Discover Your Strengths identity scene during onboarding. Its legacy click handler is prevented from becoming route authority because the canonical runtime is loaded first and owns the capture-phase transition.

### Experimental assessment owner

`js/app/academy-trial.js`

Retained for the separate `#lab-juggling` experimental assessment and Home lab entry. Its old Academy welcome renderer may still exist internally during this transition sprint, but the canonical controller renders after route events and is the production Academy onboarding authority.

### Retired production owners

The following scripts are no longer loaded by `index.html`:

- `academy-orientation-polish.js`
- `academy-orientation-interactive.js`

Their responsibilities now live in the canonical controller.

## Canonical journey

```text
Landing
→ Name
→ Number
→ Position
→ Discover Your Strengths
→ Match Ready
→ Meet Your Coach
→ Camera Finder
→ Quick Challenge
→ Academy Accepted
→ Avatar
→ Home
```

## Route ownership

| Route | Canonical owner | Purpose |
|---|---|---|
| no hash | main app + Academy identity presentation | Landing/onboarding/Home |
| `#academy-trial` | `academy-runtime-canonical.js` | Entire Academy welcome and orientation journey |
| `#academy-trials` | canonical redirect only | Legacy compatibility |
| `#lab-juggling` | `academy-trial.js` | Experimental camera assessment |

## Regression requirements

- Continue must visibly replace Discover Your Strengths with Match Ready.
- The identity overlay must be removed before Academy rendering.
- Match Ready must be rendered directly, not through a post-render mutation.
- No production script may rewrite Match Ready into Learn the Tools.
- Coach, Camera, and Challenge must be stages within one controller.
- Academy Accepted and Avatar must not depend on a hidden or previously bound button.
- Legacy `#academy-trials` must redirect to `#academy-trial`.
