# PF-04 Pattern Audit Results

Status: Draft results  
Sprint: PF-04 Pattern Audit  
Branch: `platform-foundation-docs`  
Reference implementation: PitchIQ

## Executive summary

PF-04 created the first Pattern Catalogue for PitchIQ and identified the main reusable screen and interaction patterns already present in the product.

The key finding is that PitchIQ has moved beyond isolated screens. It now contains repeatable experience patterns: Landing, Onboarding, Position Selection, Home Dashboard, Training Session, Results / Reward, HQ Dashboard and Studio Editing.

The strongest canonical pattern candidate is **Position Selection**, because it combines the Position Marker component, pitch artwork, coordinate logic, selected state, mobile layout, animation and CTA behaviour into a reusable football-specific interaction.

## Source areas reviewed

| Area | Files / examples |
|---|---|
| Landing / Splash | `renderSplash()`, splash CSS, swipe assets |
| Onboarding | `renderOnboard()`, onboarding Step 1-3 panels |
| Position Selection | `renderOnboardPositionSelector()`, marker CSS, pitch assets |
| Home Dashboard | Home hero, mission, action cards, XP/OVR modules |
| Training | Training route and reactive session shell |
| Results | Results v2 card, stat grid, reward framing |
| HQ | `tools/pitchiq-hq-live.html` |
| Studio | `studio/`, visual layout studio CSS/JS |

## Main pattern findings

### Landing / Splash Unlock

Assessment: strong brand entry pattern. It frames app entry as an academy unlock moment rather than a standard sign-in screen.

Status: **Product reusable**

Risk: naming drift remains between Splash and Landing. The product language should standardise on **Landing Screen** while legacy code may retain splash names until refactoring.

### Onboarding Wizard

Assessment: high-value pattern. It structures identity, position and academy entry into a simple staged flow.

Status: **Canonical candidate**

Risk: onboarding currently relies on several CSS lock and polish files. This is acceptable for MVP stability but should be rationalised later.

### Position Selection

Assessment: strongest canonical pattern candidate. It combines pitch artwork, marker components, selection state, animation and CTA enablement.

Status: **Canonical candidate**

Risk: depends heavily on canonical pitch and marker assets. PF-05 should verify which assets are current versus historical.

### Player Identity Setup

Assessment: valuable product pattern. The player name and jersey preview turn form entry into identity creation.

Status: **Product reusable**

Risk: depends on player/jersey artwork and exact mobile layout constraints.

### Home Dashboard

Assessment: product dashboard pattern that combines identity, level, OVR, XP, missions and secondary actions.

Status: **Product reusable**

Risk: could grow into a cluttered dashboard unless governed by dashboard pattern rules.

### Daily Mission

Assessment: strong gamified action pattern. It creates focus and repeat behaviour.

Status: **Product reusable**

Risk: mission logic and reward state should eventually be linked to capability catalogue.

### Training Session

Assessment: core learning pattern. It includes cue display, timer, scoring, voice/tap mode, stage transitions and feedback.

Status: **Product reusable / future platform candidate**

Risk: training logic should stay simple until MVP blueprint is complete.

### Results / Reward

Assessment: core reinforcement pattern. It summarises performance and connects effort to reward.

Status: **Product reusable**

Risk: should avoid overloading results with too many metrics before validation.

### HQ Dashboard

Assessment: platform subsystem pattern. HQ has the potential to become the Platform Management System by surfacing progress, maturity, audit status, release readiness and platform health.

Status: **Platform subsystem**

Risk: HQ should display canonical data rather than become another source of truth.

### Studio Editing

Assessment: platform subsystem pattern. Studio is a future product-building capability, not simply a PitchIQ screen.

Status: **Platform subsystem**

Risk: Studio needs its own subsystem architecture and governance later.

## Pattern ownership findings

| Pattern | Recommended ownership |
|---|---|
| Position Selection | Platform pattern candidate |
| Onboarding Wizard | Platform pattern candidate, with PitchIQ-specific narrative layer |
| Bottom App Navigation | Platform shell pattern candidate |
| HQ Dashboard | Platform subsystem |
| Studio Editing | Platform subsystem |
| Home Dashboard | PitchIQ product reusable |
| Daily Mission | PitchIQ product reusable / future capability-linked pattern |
| Training Session | PitchIQ product reusable / future learning capability pattern |
| Results / Reward | PitchIQ product reusable |
| Landing / Splash Unlock | PitchIQ product reusable for now |

## Token and component dependency findings

| Pattern | Key components | Token dependency |
|---|---|---|
| Landing / Splash | Swipe control, logo, hero text | Motion, layout, colour, safe area |
| Onboarding Wizard | Progress, CTA, panels, input, confirmation card | Layout, button, typography, progress |
| Position Selection | Position Marker, pitch layer, CTA, selected feedback | Marker, tactical, motion, z-index, focus |
| Home Dashboard | Hero card, stat cards, progress bars, mission cards | Card, typography, progress, colour |
| Training Session | Cue shell, controls, stat panels | Motion, typography, colour, feedback states |
| Results / Reward | Result card, stat grid, CTA, reward framing | Card, reward/accent, typography, spacing |
| HQ Dashboard | Dashboard tiles, status panels, roadmap widgets | Dashboard tokens, status colours, cards |
| Studio Editing | Canvas, handles, inspector, controls | Editor controls, z-index, focus, drag states |

## Asset dependency findings

PF-04 confirms that PF-05 Asset Audit should begin with the assets that support the highest-risk patterns:

1. Position Selection pitch and marker assets.
2. Landing/Splash logo and swipe assets.
3. Player Identity jersey/player image.
4. Home hero and profile assets.
5. Reward and mission assets.
6. HQ and Studio visual assets.

## Technical debt seed

| Finding | Severity | Follow-up |
|---|---|---|
| Pattern logic is concentrated in `routes.js` | Medium | Decompose only after MVP stability. |
| Position Selection depends on exact asset dimensions | High | PF-05 must verify canonical assets. |
| Onboarding CSS is split across several lock/polish files | Medium | Consolidate after audit sequence. |
| Progress patterns vary across screens | Medium | Govern Progress Bar after PF-05. |
| HQ and Studio are platform subsystems but live inside PitchIQ | Medium | Move later or clearly document boundaries. |
| Landing/Splash terminology still mixed | Low-medium | Standardise docs to Landing, preserve code names until refactor. |

## PF-04 status

**Status: COMPLETE ENOUGH TO PROCEED TO PF-05 ASSET AUDIT**

PF-04 has created the first Pattern Catalogue and identified Position Selection as the strongest canonical pattern candidate.

## Recommended next actions

1. Begin PF-05 Asset Audit.
2. Start with `assets/onboarding/` because Position Selection depends on pitch and marker assets.
3. Assign asset lifecycle status: canonical, active, experimental, deprecated or unknown.
4. Confirm which pitch and marker assets are current after recent Step 2 work.
5. Avoid replacing assets during the audit unless an asset is clearly broken or missing.

## Open questions

- Should Position Selection become a WellTrack platform pattern or remain PitchIQ-specific?
- Which onboarding pitch asset is canonical after the latest Step 2 changes?
- Should HQ and Studio move to their own repositories later?
- Should pattern specs include screenshots as part of future documentation?
