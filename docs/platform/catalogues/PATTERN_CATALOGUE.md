# Pattern Catalogue v0.1

Status: Draft  
Sprint: PF-04 Pattern Audit  
Reference implementation: PitchIQ

## Purpose

This catalogue identifies the reusable product and platform patterns currently present in PitchIQ. Patterns describe complete user experiences or interaction structures that combine tokens, components, assets, state and behaviour.

## Pattern status labels

| Status | Meaning |
|---|---|
| Canonical candidate | Strong reusable pattern that should be specified and governed. |
| Product reusable | Reusable within PitchIQ, but not yet clearly platform-wide. |
| Platform subsystem | Pattern belongs to HQ, Studio, validation or release tooling. |
| Screen-local | Specific to one screen or current MVP flow. |
| Needs review | Pattern boundary or ownership is unclear. |

## Pattern inventory

| Pattern | Current implementation | Status | Platform relevance | Notes |
|---|---|---|---|---|
| Landing / Splash Unlock | `renderSplash()`, splash CSS, swipe assets | Product reusable | Medium | Academy entry moment; strong brand pattern. |
| Onboarding Wizard | `renderOnboard()`, Step 1-3 panels, onboarding CSS | Canonical candidate | High | Three-step identity, position and academy entry pattern. |
| Position Selection | `renderOnboardPositionSelector()`, marker/pitch CSS/JS | Canonical candidate | Very high | First football-specific interaction pattern. |
| Player Identity Setup | Step 1 name input and jersey preview | Product reusable | High | Identity creation pattern; could apply across WellTrack products. |
| Academy Entry Confirmation | Step 3 confirmation card and Enter Academy CTA | Product reusable | Medium | Completion/commitment pattern. |
| Home Dashboard | home hero, mission, action cards, XP/OVR | Product reusable | High | Core dashboard pattern; future HQ alignment possible. |
| Daily Mission | mission card, CTA, progress/reward state | Product reusable | High | Gamified action pattern. |
| Training Session | training route/stages, cue display, timer, score | Product reusable | High | Core learning/training pattern. |
| Results / Reward | results card, score summary, XP/reward | Product reusable | High | Feedback and reinforcement pattern. |
| Player Profile | player route/profile summary | Product reusable | Medium | Identity/progress pattern. |
| Bottom App Navigation | `renderNav()`, bottom nav CSS | Product reusable / platform candidate | High | App-shell navigation pattern. |
| Developer Navigation | developer panel in `main.js` | Platform tooling | Medium | Useful for testing but currently inline. |
| HQ Dashboard | `tools/pitchiq-hq-live.html` | Platform subsystem | Very high | Future platform management pattern. |
| Studio Editing | `studio/`, visual layout studio CSS/JS | Platform subsystem | Very high | Future editing/composition pattern. |

## First canonical pattern candidate: Position Selection

The Position Selection pattern is the strongest first canonical pattern because it combines:

- football-specific visual layout
- interactive markers
- pitch artwork
- selection state
- marker animation
- haptics/tactical web behaviour
- CTA enablement
- accessibility labels
- mobile layout constraints

### Pattern anatomy

```text
Position Selection Pattern
  Screen heading
  Pitch layer
  Marker coordinate box
  Position Marker components
  Selected position feedback
  Continue CTA
```

### Pattern responsibilities

| Responsibility | Owner |
|---|---|
| Pitch artwork placement | Pattern |
| Marker anatomy | Component |
| Marker coordinates | Pattern / product data |
| Selected state | App state |
| Continue CTA enablement | Pattern behaviour |
| Animation sequence | Motion pattern / component behaviour |
| Haptics | Capability / optional enhancement |

## Pattern ownership map

| Ownership | Patterns |
|---|---|
| Platform candidates | Position Selection, Onboarding Wizard, Bottom App Navigation, HQ Dashboard, Studio Editing |
| Product reusable | Home Dashboard, Daily Mission, Training Session, Results / Reward, Player Identity Setup |
| Screen-local | Landing/Splash Unlock for now, Academy Entry Confirmation for now |
| Needs review | Developer Navigation, Position Selector boundary between component and pattern |

## Token dependency summary

| Pattern | Key token groups |
|---|---|
| Landing / Splash | Colour, motion, layout, typography, safe area |
| Onboarding Wizard | Layout, typography, button, progress, safe area |
| Position Selection | Marker, tactical, layout, motion, z-index, focus |
| Home Dashboard | Card, typography, colour, progress, spacing |
| Training Session | Colour, typography, motion, card, feedback states |
| Results / Reward | Card, typography, colour, reward/accent, spacing |
| HQ Dashboard | Dashboard, status, cards, maturity metrics |
| Studio Editing | Editor controls, resize/drag states, inspector layout |

## Asset dependency summary

| Pattern | Asset dependencies |
|---|---|
| Landing / Splash | WellTrack logo, swipe bar, swipe ball, splash poster/background |
| Player Identity Setup | player/jersey image, name input control |
| Position Selection | pitch image, marker base, marker active/inactive assets, shirt asset |
| Home Dashboard | home hero background, player avatar/profile artwork, reward assets |
| Training Session | Mostly UI-driven; may use cue/reward assets later |
| Results / Reward | reward assets, pack/card artwork |
| HQ Dashboard | icons, status cards, roadmap visuals |
| Studio Editing | editor UI assets and handles, if any |

## Initial pattern risk register

| Risk | Area | Severity | Follow-up |
|---|---|---|---|
| Pattern logic concentrated in `routes.js` | Onboarding/Home/Training/Results | Medium | Decompose after MVP stability. |
| Position Selection depends on exact asset dimensions | Position Selection | High | Asset audit must confirm canonical pitch/marker assets. |
| Multiple progress styles across flows | Onboarding/Home/Results | Medium | Consolidate after pattern requirements are clear. |
| HQ and Studio patterns not fully governed | Platform subsystems | Medium | Separate subsystem audits later. |
| Landing/Splash naming drift | Landing/Splash | Low-medium | Standardise terminology as Landing Screen. |
| App shell navigation safe-area rules need review | Navigation | Medium | Component and pattern spec needed. |

## PF-05 Asset Audit inputs

PF-05 should prioritise assets used by the highest-risk patterns:

1. Position Selection pitch and marker assets.
2. Landing/Splash logo and swipe assets.
3. Player Identity jersey/player image.
4. Home dashboard hero and profile assets.
5. Reward and mission assets.
6. HQ/Studio icons and tooling visuals.
