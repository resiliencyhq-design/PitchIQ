# Sprint PF-05 — Asset Audit

Status: In progress  
Parent programme: Platform Audit 1.0  
Platform phase: PF-0 Platform Audit Foundation  
Reference implementation: PitchIQ

## Sprint mission

Create the first governed Asset Catalogue for PitchIQ by identifying, classifying, and assigning lifecycle status to the visual assets that support the current product and emerging WellTrack Platform.

PF-05 follows PF-04 because the Pattern Audit identified the highest-risk asset dependencies: Position Selection, Landing, Player Identity, Home Dashboard, Rewards, HQ and Studio.

## Why this sprint matters

Assets are part of the product architecture. PitchIQ currently depends on images, logos, controls, pitch artwork, player artwork and reward media. Without asset governance, the repository can accumulate duplicate, stale or experimental files that make future development harder.

## Scope

### In scope

- Brand assets
- Landing / Splash assets
- Onboarding assets
- Position Selection pitch and marker assets
- Player Identity artwork
- Home Dashboard assets
- Reward and mission assets
- HQ / tools visual assets
- Studio visual assets where identifiable

### Out of scope

- Replacing assets
- Redesigning artwork
- Compressing media
- Moving files
- Renaming files
- Deleting deprecated assets

## Audit categories

| Category | Questions |
|---|---|
| Purpose | What is the asset used for? |
| Location | Where does it live? |
| Usage | Which screen, component, or pattern uses it? |
| Lifecycle | Is it canonical, active, experimental, deprecated, or unknown? |
| Ownership | Product-specific, platform candidate, brand, Studio, HQ or unknown? |
| Risk | What breaks if it changes? |
| Follow-up | Should it be renamed, consolidated, optimised, or moved later? |

## Lifecycle labels

| Label | Meaning |
|---|---|
| Canonical | Authoritative asset for current implementation. |
| Active | Used in current implementation, but canonical status not yet confirmed. |
| Experimental | Trial asset or visual exploration. |
| Deprecated | Should not be used for new work. |
| Unknown | Usage or ownership still unclear. |

## Deliverables

- `docs/platform/catalogues/ASSET_CATALOGUE.md`
- `docs/platform/audits/PF_05_ASSET_AUDIT_RESULTS.md`
- Asset lifecycle map
- Asset risk register
- PF-06 Architecture Decision Audit inputs

## Exit criteria

PF-05 is complete when:

- Major asset groups have been identified.
- Current high-risk assets have lifecycle labels.
- Position Selection asset dependencies are documented.
- Landing, onboarding and Home assets are catalogued.
- Asset governance risks are recorded.
- PF-06 has clear architecture decision inputs.

## Definition of done

No asset files are changed.

The sprint is done when the asset catalogue and audit results are committed under `docs/platform/` and linked from Platform Audit 1.0.

## Next sprint

Sprint PF-06 — Architecture Decision Audit

PF-06 will convert major design and engineering choices into Architecture Decision Records.