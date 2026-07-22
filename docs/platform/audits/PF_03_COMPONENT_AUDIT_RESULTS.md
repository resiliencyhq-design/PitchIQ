# PF-03 Component Audit Results

Status: Draft results  
Sprint: PF-03 Component Audit  
Branch: `platform-foundation-docs`  
Reference implementation: PitchIQ

## Executive summary

PF-03 identified the first reusable component set inside PitchIQ and created the initial Component Catalogue.

The audit confirms that PitchIQ already contains several reusable interface building blocks, but most are still implemented as CSS classes and route-rendered markup rather than formal component modules. This is acceptable for the current MVP, but the platform should begin documenting and governing these components before additional screens expand the app.

The most important finding is that **Position Marker** should become the first fully governed football-specific component in the WellTrack Platform.

## Source areas reviewed

| Area | Files / examples |
|---|---|
| Global UI styling | `css/style.css` |
| Position Marker | `css/onboard-step2-marker.css`, `css/onboard-step2-animation.css`, `js/app/routes.js` |
| App rendering | `js/app/routes.js` |
| Shared utilities | `js/components/ui.js` |
| Layout/token relationship | `css/tokens.css`, `css/layout-system-v2.css` |
| Studio/tooling candidates | `studio/src/*`, `tools/pitchiq-hq-live.html` |

## Main component findings

### Primary Button

Current classes include `button`, `.primary`, `.mega`, `.full`, and `.ghost`.

Assessment: important product-level reusable component. It uses brand gradient and general button styling, but radius, padding, motion and disabled states are mostly hard-coded.

Status: **Product reusable / platform candidate**

### Glass Card / Panel

Current grouped classes include `.glass`, `.tile`, `.stat`, `.form-card`, `.panel`, and `.aaa-card`.

Assessment: strong token usage already exists through `--panel`, `--stroke`, `--r-lg`, and `--shadow-card`. This is one of the best early examples of tokenised UI.

Status: **Platform candidate**

### Stat Card

Current implementation is `stat(label, value, id="")` in `js/components/ui.js`.

Assessment: small but reusable metric component for dashboard, training and results. Needs stronger visual and accessibility specification.

Status: **Utility / product reusable**

### Position Marker

Assessment: strongest canonical component candidate. It is football-specific, has a clear anatomy and state model, includes selected, spawning, focus and reduced-motion behaviours, and has immediate relevance to onboarding, tactical views and future analysis screens.

Important risk: the CSS comments describe the desired canonical anatomy, but current route rendering should be verified before the component is declared final.

Status: **Canonical candidate**

### Position Selector / Pitch Layer

Assessment: sits between component and pattern. The pitch plus markers form a complete interaction pattern, while individual markers are components. This should be audited further during PF-04 Pattern Audit.

Status: **Pattern/component boundary**

### Progress Bars

Assessment: multiple progress styles exist across onboarding, XP and mission contexts. These should not be consolidated until PF-04 confirms pattern requirements.

Status: **Product reusable / needs review**

### Navigation

Assessment: bottom navigation is central to the app shell. It needs a dedicated component specification and should use safe-area and layout tokens consistently.

Status: **Platform candidate**

### Toast and Sparkles

Current utilities include `toast()` and `sparkles()`.

Assessment: useful lightweight utilities. Toast needs accessibility review; sparkles should remain decorative and motion-aware.

Status: **Utility**

## Component ownership findings

| Component group | Recommended ownership |
|---|---|
| Position Marker | Platform component candidate |
| Glass/Card surfaces | Platform component candidate |
| Primary Button | Platform component candidate |
| Bottom Navigation | Platform component candidate |
| Stat Card | Product reusable now; platform candidate later |
| Mission/Home/Reward cards | PitchIQ product reusable |
| Training/Results cards | PitchIQ product reusable |
| Splash swipe | Landing/onboarding pattern component |
| Studio controls | Studio platform subsystem |
| Developer Panel | Tooling component; needs review |

## Token compliance findings

| Component | Token compliance | Finding |
|---|---|---|
| Glass/Card surfaces | Good | Strong existing use of panel/stroke/radius/shadow tokens. |
| Primary Button | Partial | Needs button tokens for radius, padding, touch target and motion. |
| Position Marker | Partial | Needs marker tokens for size, halo, z-index, label and motion. |
| Progress Bars | Partial | Gradients and dimensions are hard-coded. |
| Home Hero Card | Partial | Many layout values are screen-specific. |
| Developer Panel | Weak | Inline styles bypass token system. |

## Accessibility findings

| Area | Finding |
|---|---|
| Position Marker | Uses button semantics and focus-visible styling; good foundation. |
| Marker animation | Reduced-motion handling exists. |
| Buttons | Disabled state exists; focus states need deeper review. |
| Toast | Needs accessibility review for announcements. |
| Sparkles | Decorative; should respect reduced motion. |
| Navigation | Needs dedicated touch-target and focus audit. |

## Technical debt seed

| Finding | Severity | Follow-up |
|---|---|---|
| Position Marker anatomy may not fully match rendered markup | High | Align markup/CSS before declaring canonical. |
| Buttons lack formal token/component spec | Medium | Create Button specification after marker. |
| Multiple progress patterns | Medium | Consolidate after PF-04. |
| Developer panel uses inline styles | Medium | Move to governed dev CSS later. |
| Component names are not standardised | Medium | Add WPS component naming standard. |
| Studio component boundary unclear | Medium | Run separate Studio audit later. |

## Recommended canonical component sequence

1. Position Marker
2. Primary Button
3. Glass/Card Surface
4. Progress Bar
5. Bottom Navigation
6. Stat Card
7. Mission Card
8. Results Card

## PF-03 status

**Status: COMPLETE ENOUGH TO PROCEED TO PF-04 PATTERN AUDIT**

PF-03 has created the first Component Catalogue and identified Position Marker as the first canonical component candidate.

## Recommended next actions

1. Create a detailed canonical specification for Position Marker using the existing CC-001 draft as the basis.
2. Verify and align `routes.js` marker markup with the canonical anatomy described in `onboard-step2-marker.css`.
3. Start PF-04 Pattern Audit, beginning with the Onboarding and Position Selection patterns.
4. Do not refactor components yet; finish the audit sequence first.

## Open questions

- Should components remain plain HTML/CSS/JS for MVP or begin moving toward module files?
- Should component CSS move into `css/components/` later?
- Should Studio use the same component catalogue or a separate Studio catalogue?
- Should Position Selector be a component, pattern, or both?
