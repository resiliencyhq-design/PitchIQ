# Platform Work Assignment Map

Status: Draft  
Scope: Work produced during the WellTrack Platform Foundation discussion

## Purpose

This document maps the platform work completed so far to the correct long-term home. It prevents all platform thinking from being placed randomly into PitchIQ docs.

The rule is:

```text
Canonical platform knowledge belongs in the future WellTrack-Platform-Framework repository.
PitchIQ keeps only the operational docs needed while it acts as the reference implementation.
```

## Assignment model

| Work / concept | Correct long-term home | Temporary PitchIQ home | Status |
|---|---|---|---|
| WellTrack Platform Blueprint | WellTrack-Platform-Framework / Blueprint | docs/platform/README.md summary | Reflected |
| Information Architecture | WellTrack-Platform-Framework / Blueprint | docs/platform/PLATFORM_STANDARD_SEED.md summary | Reflected |
| Platform Charter | WellTrack-Platform-Framework / Canon / Platform Charter | docs/platform/README.md summary | Reflected |
| Platform Standard (WPS) | WellTrack-Platform-Framework / Standards | docs/platform/PLATFORM_STANDARD_SEED.md | Reflected |
| WPS Platform Principles | WellTrack-Platform-Framework / Standards / PL | docs/platform/PLATFORM_STANDARD_SEED.md | Reflected |
| WPS Meta-Architecture | WellTrack-Platform-Framework / Standards | docs/platform/PLATFORM_STANDARD_SEED.md | Reflected |
| Knowledge Graph | WellTrack-Platform-Framework / Knowledge Graph | docs/platform/PLATFORM_AUDIT_1_0.md catalogue model | Reflected |
| Volume 1 Platform Charter | WellTrack-Platform-Framework / Canon / Volume 1 | docs/platform/README.md summary | Reflected |
| Volume 3 Design Canon | WellTrack-Platform-Framework / Canon / Volume 3 | docs/platform/PLATFORM_AUDIT_1_0.md token/component/pattern audit | Reflected |
| Volume 4 Engineering Canon | WellTrack-Platform-Framework / Canon / Volume 4 | docs/platform/PLATFORM_REPOSITORY_ARCHITECTURE.md | Reflected |
| Edition 0.2 Operational Foundation | WellTrack-Platform-Framework / Releases / Edition 0.2 | docs/platform/PLATFORM_AUDIT_1_0.md | Reflected |
| CC-001 Position Marker Canonical Spec | WellTrack-Platform-Framework / Catalogues / Components | docs/platform/PLATFORM_AUDIT_1_0.md component catalogue workstream | Reflected |
| Edition 0.3 Platform Catalogues | WellTrack-Platform-Framework / Catalogues | docs/platform/PLATFORM_AUDIT_1_0.md | Reflected |
| Platform Audit 1.0 | WellTrack-Platform-Framework / Audits | docs/platform/PLATFORM_AUDIT_1_0.md | Added |
| Repository Architecture | WellTrack-Platform-Framework / Architecture | docs/platform/PLATFORM_REPOSITORY_ARCHITECTURE.md | Added |

## What is intentionally not added to PitchIQ

The full Word/PDF drafts are not committed into PitchIQ because they are canonical platform artefacts, not product-specific implementation docs.

They should move to a dedicated platform repository later, likely:

```text
WellTrack-Platform-Framework
```

## What PitchIQ owns now

PitchIQ currently owns:

1. The working platform foundation folder under `docs/platform/`.
2. The first reference implementation for the WellTrack Platform.
3. The first operational Platform Audit plan.
4. Product-specific implementation decisions and MVP documentation.

PitchIQ should not permanently own the full Canon, WPS, or Platform Framework.

## Immediate next work allocation

| Next work | Assigned area |
|---|---|
| Token audit | `docs/platform/PLATFORM_AUDIT_1_0.md` → Token Catalogue |
| Component audit | `docs/platform/PLATFORM_AUDIT_1_0.md` → Component Catalogue |
| Position Marker canonical implementation | Future Component Catalogue; current reference in onboarding Step 2 files |
| Asset audit | `docs/platform/PLATFORM_AUDIT_1_0.md` → Asset Catalogue |
| ADR creation | Future `docs/adr/` or platform repository `Decision-Records/` |
| HQ platform dashboard | `tools/` once implementation is approved |

## Governance note

Until the dedicated platform repository exists, this folder is the temporary working home for platform foundation docs. Once that repository exists, this folder should become a product-level pointer rather than the canonical source.
