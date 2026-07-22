# PF-05 Asset Audit Results

Status: Draft results  
Sprint: PF-05 Asset Audit  
Branch: `platform-foundation-docs`  
Reference implementation: PitchIQ

## Executive summary

PF-05 created the first Asset Catalogue for PitchIQ and identified the main asset groups currently supporting the product and emerging platform.

The most important finding is that **Position Selection assets are the highest-risk asset group** because marker alignment depends on pitch image dimensions, marker assets, CSS positioning, and route-rendered markup.

The second major finding is that asset governance is now needed before further expansion. PitchIQ already has brand, control, onboarding, background, Home, reward and global art assets. These should be catalogued before adding more variants.

## Source areas reviewed

| Area | Examples |
|---|---|
| Brand | `assets/brand/logo.svg`, `assets/brand/welltrack-performance-logo.png` |
| Controls | `assets/controls/swipe-bar.png`, `swipe-ball.png`, `your-name.png` |
| Onboarding | position pitch, marker, jersey/person assets |
| Backgrounds | onboarding background, splash poster |
| Home | hero background, player profile card skin |
| Global art | stadium hero background |
| Rewards | mission/reward artwork |
| Service worker | cached asset path list |

## Main asset findings

### Brand assets

Finding: PitchIQ uses WellTrack branding on the Landing Screen. `welltrack-performance-logo.png` appears to be the current landing logo, while `logo.svg` may be a broader brand asset.

Risk: canonical logo ownership is not yet explicitly defined.

Recommendation: mark `welltrack-performance-logo.png` as active and confirm canonical brand asset strategy later.

### Landing / Splash control assets

Finding: the Landing/Splash unlock pattern uses `swipe-bar.png` and `swipe-ball.png`.

Risk: these are interaction-critical assets. Visual replacement can affect perceived affordance and should be governed.

Recommendation: keep active; review later as part of Landing Pattern specification.

### Position Selection assets

Finding: multiple pitch variants are present or referenced, including `position-pitch.png`, `position-pitch-inactive.png`, and `position-pitch-active.png`.

Risk: this is the highest-risk asset area because marker alignment depends on pitch dimensions and coordinate mapping.

Recommendation: confirm canonical current pitch asset before any future Step 2 changes. Do not replace or delete variants until usage is verified.

### Marker assets

Finding: `position-marker-grey.png` and `position-marker-active.png` are active marker assets.

Risk: marker rendering is also linked to the emerging Position Marker component architecture.

Recommendation: treat marker assets as platform component dependencies and include them in the future Position Marker canonical specification.

### Player Identity assets

Finding: `name-person-icon.png-v2.png` is used for the Step 1 jersey/person preview.

Risk: naming suggests version history is embedded in the filename.

Recommendation: keep active for MVP; standardise naming later.

### Home assets

Finding: `hero-home-bg.png` and `player-profile-card-skin.png` support the Home Dashboard pattern.

Risk: Home Dashboard may expand quickly, creating asset sprawl.

Recommendation: keep active; include Home assets in future dashboard pattern governance.

### Service worker asset list

Finding: `sw.js` contains explicit cached asset paths and version strings.

Risk: asset changes may not appear reliably without cache/version governance.

Recommendation: create an ADR or release policy for cache-busting and service worker asset lifecycle.

## Asset lifecycle baseline

| Group | Lifecycle assessment |
|---|---|
| Brand assets | Active; canonical status needs confirmation. |
| Landing controls | Active. |
| Position pitch assets | Active/needs review; canonical asset must be confirmed. |
| Position marker assets | Active; platform component dependencies. |
| Player Identity artwork | Active. |
| Home dashboard assets | Active. |
| Reward assets | Active/needs deeper review. |
| Studio/HQ assets | Not fully audited yet. |

## Asset risk register

| Finding | Severity | Follow-up |
|---|---|---|
| Multiple pitch variants exist | High | Confirm canonical pitch asset. |
| Marker alignment depends on asset dimensions | High | Lock pitch/marker asset relationship in Position Selection spec. |
| Version suffixes appear in filenames | Medium | Define naming convention later. |
| Service worker caches explicit asset paths | Medium | Add release/cache ADR. |
| Logo canonical status unclear | Medium | Confirm brand asset strategy. |
| Studio/HQ assets not fully separated | Medium | Audit platform subsystem assets later. |
| Folder casing and naming are inconsistent | Low-medium | Defer until after MVP stability. |

## PF-05 status

**Status: COMPLETE ENOUGH TO PROCEED TO PF-06 ARCHITECTURE DECISION AUDIT**

PF-05 has created the first Asset Catalogue and identified the asset decisions that should become ADRs.

## Recommended next actions

1. Start PF-06 Architecture Decision Audit.
2. Create an ADR index.
3. Seed ADRs for repository-first workflow, platform docs location, token strategy, Position Marker architecture, Position Selection asset strategy, Studio separation and cache/versioning.
4. Do not move, rename or delete asset files until asset usage is verified with a full file-tree/script audit.

## Open questions

- Which pitch image is now the canonical Position Selection asset?
- Should marker assets become platform-owned component assets?
- Should WellTrack brand assets move to a shared assets repository later?
- Should asset metadata eventually live beside files or only in the catalogue?
