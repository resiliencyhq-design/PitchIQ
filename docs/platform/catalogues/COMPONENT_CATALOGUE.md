# Component Catalogue v0.1

Status: Draft  
Sprint: PF-03 Component Audit  
Reference implementation: PitchIQ

## Purpose

This catalogue identifies the reusable UI and football-specific components currently visible in the PitchIQ implementation. It is the starting point for a governed WellTrack Platform component system.

## Component status labels

| Status | Meaning |
|---|---|
| Canonical candidate | Strong reusable component; should be specified and governed. |
| Product reusable | Useful across PitchIQ screens, but not yet platform-wide. |
| Screen-local | Belongs to a single screen or flow. |
| Utility | Small helper or behaviour utility rather than a full component. |
| Needs review | Unclear ownership or possible duplication. |

## Component inventory

| Component | Current implementation | Status | Platform relevance | Notes |
|---|---|---|---|---|
| Primary Button | Global `button`, `.primary`, `.mega`, `.full`, `.ghost` in `css/style.css` | Product reusable | High | Needs button token group and accessibility review. |
| Glass Card / Panel | `.glass`, `.tile`, `.stat`, `.form-card`, `.panel`, `.aaa-card` in `css/style.css` | Product reusable | High | Uses `--panel`, `--stroke`, `--r-lg`, `--shadow-card`. |
| Stat Card | `stat()` utility in `js/components/ui.js`; `.stat` styling | Product reusable | Medium | Small reusable metric component. |
| Position Marker | `button.position-marker` plus `.marker-halo`, `.marker-base`, `.marker-shirt`, `.marker-label` | Canonical candidate | Very high | First football-specific component candidate. |
| Position Selector / Pitch Layer | `.position-selector`, `.position-game-layer`, marker coordinate box | Pattern/component boundary | High | Likely belongs to PF-04 as a pattern plus PF-03 as supporting component group. |
| Progress Bar | `.academy-progress`, `.xpbar`, onboarding progress image/data | Product reusable | Medium | Multiple progress styles; needs consolidation later. |
| Splash Swipe Control | `.splash-swipe`, swipe bar/ball assets | Screen-local / product reusable | Medium | Strong onboarding/landing pattern component. |
| Academy Hero Panel | `AcademyHeroPanel()` SVG component in `routes.js` | Product reusable | Medium | Rich SVG hero component; may become a brand illustration pattern. |
| Home Hero Card | `.home-hero-card`, `.home-hero-locked`, hero grid | Product reusable | Medium | Dashboard-like identity module. |
| Mission Card | `renderMission()`, `.mission-card`, `.home-mock-mission` | Product reusable | Medium | Core gamified task component. |
| Reward / Pack Card | `.home-pack-card`, rewards data/assets | Product reusable | Medium | Tied to XP/rewards capability. |
| Bottom Navigation | `renderNav()` and `.nav.bottom-nav` | Product reusable | High | Needs component specification and safe-area tokens. |
| Toast | `toast()` in `js/components/ui.js` | Utility | Medium | Needs global container/failure-state governance. |
| Sparkles / Particles | `sparkles()` and `.spark` | Utility / motion component | Low-medium | Decorative; should respect reduced motion. |
| Training Reactive Shell | `.training-reactive`, `.reactive-*` | Screen-local now | Medium | May become Training Session pattern. |
| Results Card | `.results-v2-card`, `.results-v2-grid`, `.results-v2-primary-stat` | Product reusable | Medium | Strong pattern/component candidate. |
| Developer Panel | `renderDeveloperPanel()` inline styles | Tooling component | Medium | Should move out of inline styles later. |
| Studio Controls | `studio/src/*`, `visual-layout-studio.css` | Platform subsystem | High | Needs separate Studio component audit later. |

## First canonical component candidate: Position Marker

The Position Marker is the best first canonical component because it has:

- clear anatomy
- explicit button semantics
- football-specific purpose
- selected/default/spawning states
- asset dependencies
- focus state
- reduced-motion support
- strong reuse potential across onboarding, tactics, player position selection and future analysis screens

### Current anatomy

```text
button.position-marker
  span.marker-halo
  img.marker-base
  span.marker-shirt
    img.marker-shirt-img
  b.marker-label
```

### Current states

| State | Implementation |
|---|---|
| Default | `.position-marker` |
| Selected | `.is-selected`, `.selected`, `.active` |
| Spawning | `.is-spawning` |
| Focus | `:focus-visible` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` |

### Current risks

- Some render markup in `routes.js` may not yet fully match the canonical anatomy described in CSS comments.
- Many marker design values are hard-coded and should become component tokens.
- Marker assets need canonical/deprecated status labels.
- Marker z-index values should use platform layer tokens.

## Token compliance summary

| Component | Token compliance | Notes |
|---|---|---|
| Glass Card / Panel | Good | Uses core panel/stroke/radius/shadow tokens. |
| Primary Button | Partial | Uses brand gradient but radius/padding/motion are hard-coded. |
| Position Marker | Partial | Uses brand colours conceptually but size, halo, z-index and motion are hard-coded. |
| Progress Bar | Partial | Uses direct gradients and dimensions. |
| Navigation | Unknown/needs deeper audit | Should be reviewed in PF-03 follow-up. |
| Home Hero Card | Partial | Many values are direct and screen-specific. |
| Results Card | Partial | Strong visual pattern but many direct values. |
| Developer Panel | Weak | Inline styles; should be governed later. |

## Component ownership map

| Ownership | Components |
|---|---|
| Platform candidate | Position Marker, Glass Card/Panel, Primary Button, Bottom Navigation, Studio Controls |
| Product reusable | Mission Card, Home Hero Card, Reward Card, Results Card, Progress Bar |
| Screen-local | Training Reactive Shell, Splash Swipe Control for now |
| Utility | Toast, Sparkles/Particles, Stat utility |
| Needs review | Developer Panel, Position Selector/Pitch Layer boundary |

## Initial component risk register

| Risk | Area | Severity | Follow-up |
|---|---|---|---|
| Markup/CSS anatomy drift | Position Marker | High | Align rendered markup with canonical marker anatomy before declaring final. |
| Hard-coded values | Buttons, markers, cards, progress | Medium | Token remediation sprint. |
| Multiple progress implementations | Onboarding/Home | Medium | Consolidate into Progress component later. |
| Inline styles in developer panel | Tooling | Medium | Move to CSS or dev component module later. |
| Studio component boundary unclear | Studio | Medium | Separate Studio component audit needed. |
| Component names not standardised | All UI | Medium | Create naming convention under WPS-ENG component standard. |

## PF-04 Pattern Audit inputs

PF-04 should assess how these components combine into patterns:

1. Landing / Splash unlock pattern
2. Onboarding wizard pattern
3. Position selection pattern
4. Home dashboard pattern
5. Training session pattern
6. Results/reward pattern
7. HQ platform dashboard pattern
8. Studio editing pattern
