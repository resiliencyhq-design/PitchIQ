# Knowledge Catalogue v0.1

Status: Draft  
Sprint: PF-08 Documentation / Knowledge Audit  
Reference implementation: PitchIQ

## Purpose

This catalogue classifies the product, platform, sprint, audit and governance documents currently shaping PitchIQ and the emerging WellTrack Platform.

The purpose is to prevent documentation drift by making clear which documents are canonical, operational, reference-only, draft, or intended for a future platform repository.

## Document status labels

| Status | Meaning |
|---|---|
| Canonical | Authoritative source of truth for current decisions or product direction. |
| Operational | Used to guide current build, audit, validation or release work. |
| Reference | Historical or supporting document; useful but not governing. |
| Draft | Work in progress; not yet approved as governing. |
| Move later | Should eventually live in the future platform repository. |
| Stale / needs review | May be outdated or inconsistent with current direction. |

## Ownership labels

| Owner | Meaning |
|---|---|
| Product | PitchIQ-specific product documentation. |
| Platform | WellTrack Platform documentation. |
| Sprint | Sprint planning or execution record. |
| HQ | Dashboard/platform management knowledge. |
| Studio | Studio subsystem knowledge. |
| Release | Release, cache, deployment or validation knowledge. |
| Future platform repo | Should move to `WellTrack-Platform-Framework` later. |

## Knowledge inventory

| Document / area | Current purpose | Status | Owner | Notes |
|---|---|---|---|---|
| `docs/CONTEXT.md` | PitchIQ mission, philosophy and MVP rules | Canonical | Product | Product source of truth for Academy Journey direction. |
| `docs/MVP_STATUS.md` | Current MVP phase and stage status | Operational | Product | Should be kept current as MVP stages change. |
| `docs/ARCHITECTURE.md` | High-level repository architecture | Operational | Product / platform | Should be cross-linked with platform architecture docs. |
| `docs/SPRINT_4_2_1_DEPENDENCY_AUDIT.md` | Previous dependency audit | Reference | Sprint | Historical sprint evidence. |
| `docs/SPRINT_4_2_STABILISATION_AUDIT.md` | Previous stabilisation audit | Reference | Sprint | Historical sprint evidence. |
| `docs/sprint-4.3-pre-implementation-plan.md` | Training flow sprint plan | Reference | Sprint | Historical product sprint plan. |
| `docs/platform/README.md` | Platform foundation index | Operational | Platform | Temporary platform index inside PitchIQ. |
| `docs/platform/PLATFORM_REPOSITORY_ARCHITECTURE.md` | Product/platform/HQ repository model | Draft / move later | Platform | Should move to future platform repo. |
| `docs/platform/PLATFORM_STANDARD_SEED.md` | WPS seed and standards hierarchy | Draft / move later | Platform | Foundation for standards system. |
| `docs/platform/PLATFORM_AUDIT_1_0.md` | Platform audit programme index | Operational | Platform | Current audit hub. |
| `docs/platform/PLATFORM_WORK_ASSIGNMENT_MAP.md` | Maps platform work to correct homes | Operational | Platform | Prevents PitchIQ becoming permanent platform archive. |
| `docs/platform/sprints/*` | Platform audit sprint plans | Operational | Sprint / platform | Current PF sprint trail. |
| `docs/platform/audits/*` | Platform audit results | Operational | Platform | Evidence base for Platform Audit 1.0. |
| `docs/platform/catalogues/TOKEN_CATALOGUE.md` | Token inventory and baseline | Draft / operational | Platform | First design-system catalogue. |
| `docs/platform/catalogues/COMPONENT_CATALOGUE.md` | Component inventory and ownership map | Draft / operational | Platform | First component catalogue. |
| `docs/platform/catalogues/PATTERN_CATALOGUE.md` | Pattern inventory and ownership map | Draft / operational | Platform | First pattern catalogue. |
| `docs/platform/catalogues/ASSET_CATALOGUE.md` | Asset inventory and lifecycle baseline | Draft / operational | Platform | First asset catalogue. |
| `docs/platform/catalogues/ARCHITECTURE_DECISION_CATALOGUE.md` | ADR backlog and template seed | Draft / operational | Platform | Needs ADR files later. |
| `docs/platform/catalogues/CAPABILITY_CATALOGUE.md` | Capability inventory and MVP boundary | Draft / operational | Platform | First capability catalogue. |
| `docs/platform/catalogues/KNOWLEDGE_CATALOGUE.md` | Documentation and knowledge inventory | Draft / operational | Platform | This file. |

## Source-of-truth hierarchy

Current temporary hierarchy:

```text
PitchIQ product docs
  docs/CONTEXT.md
  docs/MVP_STATUS.md
  docs/ARCHITECTURE.md

WellTrack platform foundation docs inside PitchIQ
  docs/platform/README.md
  docs/platform/PLATFORM_AUDIT_1_0.md
  docs/platform/catalogues/*
  docs/platform/audits/*
  docs/platform/sprints/*

Future canonical platform home
  WellTrack-Platform-Framework repository
```

## Product vs platform boundary

| Belongs in PitchIQ long-term | Belongs in future platform repo |
|---|---|
| PitchIQ mission and MVP status | Platform Charter |
| PitchIQ app architecture | WPS standards |
| PitchIQ release notes | Canon volumes |
| PitchIQ product decisions | Shared catalogues |
| PitchIQ-specific ADRs | Platform ADRs |
| Product validation results | Knowledge graph model |

## HQ knowledge display requirements

HQ should eventually surface:

- current audit status
- catalogue completeness
- ADR backlog status
- platform health score
- sprint status
- release readiness
- documentation freshness
- component/token/asset maturity

HQ should **not** become the source of truth. It should read from or link to canonical documents and catalogues.

## Knowledge risks

| Risk | Severity | Recommendation |
|---|---|---|
| Platform docs remain permanently inside PitchIQ | High | Create future platform repository and migrate canonical docs later. |
| MVP status becomes stale | High | Update `docs/MVP_STATUS.md` after each material MVP change. |
| Audit documents grow without summary layer | Medium | Add consolidated Platform Audit Report later. |
| ADR backlog exists but ADRs are not written | Medium-high | Draft first P1 ADRs after PF-09. |
| HQ duplicates docs manually | Medium | HQ should link/read canonical docs. |
| Sprint docs become hard to navigate | Medium | Maintain `docs/platform/README.md` and audit index. |
| Product and platform audiences are mixed | Medium | Label docs clearly by owner and status. |

## PF-09 inputs

PF-09 Quality / Platform Health Audit should score:

1. Documentation completeness.
2. Token coverage.
3. Component reuse maturity.
4. Pattern coverage.
5. Asset governance.
6. ADR coverage.
7. MVP scope clarity.
8. Platform repository readiness.
9. HQ knowledge readiness.
10. Technical debt visibility.
