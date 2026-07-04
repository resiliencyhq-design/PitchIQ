# Asset Catalogue v0.1

Status: Draft  
Sprint: PF-05 Asset Audit  
Reference implementation: PitchIQ

## Purpose

This catalogue identifies the major asset groups currently used by PitchIQ and assigns initial lifecycle and ownership status. It is the starting point for WellTrack Platform asset governance.

## Lifecycle labels

| Label | Meaning |
|---|---|
| Canonical | Authoritative asset for current implementation. |
| Active | Used now, but canonical status needs confirmation. |
| Experimental | Trial, exploration or temporary asset. |
| Deprecated | Should not be used for new work. |
| Unknown | Usage or ownership is unclear. |

## Ownership labels

| Owner | Meaning |
|---|---|
| Brand | WellTrack / PitchIQ identity asset. |
| Product | PitchIQ-specific implementation asset. |
| Platform candidate | May be reused across WellTrack products. |
| Studio | Related to editing/composition tooling. |
| HQ | Related to dashboard/platform management tooling. |
| Unknown | Needs further audit. |

## Asset inventory

| Asset / folder | Current usage | Lifecycle | Owner | Notes |
|---|---|---|---|---|
| `assets/brand/logo.svg` | Brand identity | Active | Brand | Needs confirmation against current WellTrack logo usage. |
| `assets/brand/welltrack-performance-logo.png` | Landing logo | Active | Brand | Current landing brand asset. |
| `assets/controls/swipe-bar.png` | Landing swipe control | Active | Product | Used by Landing/Splash unlock pattern. |
| `assets/controls/swipe-ball.png` | Landing swipe control handle | Active | Product | Used by Landing/Splash unlock pattern. |
| `assets/controls/your-name.png` | Player Identity input artwork | Active | Product | Supports Step 1 identity setup. |
| `assets/controls/continue-button.png` | CTA artwork/control | Unknown | Product | Usage needs confirmation. |
| `assets/controls/enter-academy.png` | CTA artwork/control | Unknown | Product | Usage needs confirmation. |
| `assets/onboarding/position-marker-grey.png` | Position Marker base/inactive | Active | Platform candidate | Needs canonical status check. |
| `assets/onboarding/position-marker-active.png` | Position Marker active state | Active | Platform candidate | Needs canonical status check. |
| `assets/onboarding/position-pitch.png` | Position Selection pitch | Active/canonical candidate | Platform candidate | Likely canonical current pitch asset; verify against rendered code. |
| `assets/onboarding/position-pitch-inactive.png` | Position Selection pitch variant | Active/needs review | Product | Used in current route rendering; may conflict with single-pitch direction. |
| `assets/onboarding/position-pitch-active.png` | Position Selection pitch variant | Needs review | Product | May be historical or variant. |
| `assets/onboarding/name-person-icon.png-v2.png` | Player Identity jersey/person preview | Active | Product | Current Step 1 player identity image. |
| `assets/backgrounds/onboarding-background-V1.png` | Onboarding background | Active | Product | Needs version/lifecycle status. |
| `assets/backgrounds/splash-poster.png` | Landing/Splash poster/background | Active | Product | Used by service worker cache. |
| `assets/Home/hero-home-bg.png` | Home dashboard hero background | Active | Product | Core Home Dashboard asset. |
| `assets/Home/player-profile-card-skin.png` | Player profile card artwork | Active | Product | Home/profile visual asset. |
| `assets/art/stadium-hero.svg` | Global world/background artwork | Active | Product / platform candidate | Used by global world background. |
| `assets/Home/mission-reward-elite-boots.png` | Mission reward artwork | Active | Product | Used by mission/reward pattern if present. |

## High-priority asset groups

### Position Selection assets

These are highest priority because the Position Selection pattern depends on exact pitch and marker alignment.

| Asset | Priority | Reason |
|---|---|---|
| `position-pitch.png` | P1 | Candidate canonical pitch. |
| `position-pitch-inactive.png` | P1 | Current route-rendered pitch variant; needs review. |
| `position-pitch-active.png` | P1 | Possible legacy/variant asset. |
| `position-marker-grey.png` | P1 | Marker inactive asset. |
| `position-marker-active.png` | P1 | Marker active asset. |

### Brand and Landing assets

| Asset | Priority | Reason |
|---|---|---|
| `welltrack-performance-logo.png` | P1 | Current landing logo. |
| `logo.svg` | P2 | Needs relationship to WellTrack logo confirmed. |
| `swipe-bar.png` | P1 | Landing interaction depends on it. |
| `swipe-ball.png` | P1 | Landing interaction depends on it. |
| `splash-poster.png` | P2 | Background/poster asset. |

### Player Identity and Home assets

| Asset | Priority | Reason |
|---|---|---|
| `name-person-icon.png-v2.png` | P1 | Player identity screen depends on it. |
| `hero-home-bg.png` | P1 | Home dashboard depends on it. |
| `player-profile-card-skin.png` | P2 | Profile/Home visual element. |

## Asset governance findings

| Finding | Severity | Recommendation |
|---|---|---|
| Multiple pitch variants exist | High | Confirm canonical pitch asset and mark variants. |
| Asset naming includes version suffixes | Medium | Add naming/versioning convention before new asset expansion. |
| Folder casing is inconsistent (`Home`) | Low-medium | Standardise later; do not move during MVP. |
| Brand logo relationship needs confirmation | Medium | Decide current canonical logo asset. |
| Asset lifecycle status is not stored near files | Medium | Maintain catalogue until platform repo or metadata system exists. |
| Service worker caches explicit asset paths | Medium | Asset changes need release/cache governance. |

## Proposed future asset status model

Every important asset should eventually have:

- name
- path
- owner
- lifecycle status
- version
- product usage
- component/pattern dependency
- replacement policy
- optimisation status
- accessibility considerations where relevant

## PF-06 inputs

PF-06 Architecture Decision Audit should create or seed ADRs for:

1. Canonical pitch asset strategy.
2. Asset lifecycle governance.
3. Brand asset ownership.
4. Service worker cache/versioning policy.
5. Studio/HQ asset boundaries.
