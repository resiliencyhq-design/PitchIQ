# Architecture Decision Catalogue v0.1

Status: Draft  
Sprint: PF-06 Architecture Decision Audit  
Reference implementation: PitchIQ

## Purpose

This catalogue identifies the major architecture and governance decisions already shaping PitchIQ and the emerging WellTrack Platform.

The purpose is not to write full ADRs yet. The purpose is to create the initial decision inventory and prioritise which ADRs should be written first.

## ADR status labels

| Status | Meaning |
|---|---|
| Proposed | Decision should become an ADR. |
| Seeded | Decision has enough information to draft an ADR. |
| Draft | ADR exists but is not approved. |
| Accepted | ADR is approved and governing. |
| Superseded | ADR has been replaced by a later decision. |

## Priority labels

| Priority | Meaning |
|---|---|
| P1 | Needed before major platform implementation or remediation. |
| P2 | Important for traceability and future work. |
| P3 | Useful historical/contextual record. |

## Decision inventory

| ADR ID | Decision | Status | Priority | Affected areas | Notes |
|---|---|---|---|---|---|
| ADR-000 | Treat PitchIQ as the first WellTrack Platform reference implementation | Proposed | P1 | Product, platform, docs, HQ | Foundation decision for all platform work. |
| ADR-001 | Use repository-first development and GitHub PRs as operational source of truth | Proposed | P1 | Workflow, docs, release | Aligns with current branch/PR process. |
| ADR-002 | Keep platform foundation docs in `docs/platform/` temporarily | Proposed | P1 | Documentation architecture | Temporary until a dedicated platform repository exists. |
| ADR-003 | Create a future `WellTrack-Platform-Framework` repository | Proposed | P1 | Repository architecture | Long-term home for Canon, WPS, catalogues and ADRs. |
| ADR-004 | Separate product documentation from platform documentation | Proposed | P1 | Docs, governance | Product docs stay PitchIQ-specific; platform docs become shared. |
| ADR-005 | Use design tokens as the foundation of the WellTrack design system | Seeded | P1 | CSS, components, Studio | Based on PF-02 findings. |
| ADR-006 | Introduce semantic token aliases before broad CSS refactoring | Seeded | P1 | CSS, tokens, components | Reduces breakage and preserves MVP stability. |
| ADR-007 | Treat Position Marker as the first canonical football component candidate | Seeded | P1 | Components, onboarding, assets | Based on PF-03 findings. |
| ADR-008 | Treat Position Selection as the first canonical football interaction pattern candidate | Seeded | P1 | Patterns, onboarding, assets | Based on PF-04 findings. |
| ADR-009 | Establish asset lifecycle governance before adding more asset variants | Seeded | P1 | Assets, service worker, release | Based on PF-05 findings. |
| ADR-010 | Preserve MVP stability before CSS/component refactoring | Proposed | P1 | Product, CSS, release | Prevents audit work from destabilising current app. |
| ADR-011 | Treat Studio as a platform subsystem, not a normal PitchIQ screen | Proposed | P2 | Studio, repository, platform | Studio needs separate governance. |
| ADR-012 | Treat HQ as a future Platform Management System | Proposed | P2 | HQ, tools, dashboard | HQ should surface platform health without becoming source of truth. |
| ADR-013 | Keep service worker/cache versioning under release governance | Proposed | P2 | Release, assets, PWA | Asset changes can be hidden by caching. |
| ADR-014 | Use audit catalogues before remediation | Proposed | P1 | Platform Audit 1.0 | Complete audit before broad implementation changes. |
| ADR-015 | Keep camera/voice/computer vision as future capabilities until MVP blueprint is complete | Proposed | P2 | Capabilities, scope control | Supports MVP-first rule. |

## ADR template seed

```markdown
# ADR-000 — Decision Title

Status: Proposed | Accepted | Superseded  
Date: YYYY-MM-DD  
Related sprint: PF-XX  
Affected areas: CSS, JS, assets, docs, Studio, HQ, release

## Context

What situation led to this decision?

## Decision

What decision has been made?

## Alternatives considered

What other options were considered?

## Consequences

What becomes easier, harder, safer or riskier because of this decision?

## Related implementation

Which files, folders, components, patterns or catalogues are affected?

## Review trigger

When should this decision be reviewed?
```

## First ADRs to draft

| Priority | ADR | Reason |
|---|---|---|
| P1 | ADR-000 | Establishes PitchIQ as reference implementation. |
| P1 | ADR-002 | Explains why platform docs currently live inside PitchIQ. |
| P1 | ADR-005 | Governs token system before remediation. |
| P1 | ADR-007 | Governs Position Marker as first canonical component. |
| P1 | ADR-008 | Governs Position Selection as first canonical pattern. |
| P1 | ADR-009 | Governs asset lifecycle before asset changes. |
| P1 | ADR-010 | Protects MVP from destabilising refactors. |

## PF-07 inputs

PF-07 Capability Audit should examine decisions that affect:

- XP/progression
- rewards
- profiles
- storage/persistence
- Studio
- HQ
- analytics
- camera
- voice
- future computer vision
