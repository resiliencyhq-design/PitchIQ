# Sprint PF-07 — Capability Audit

Status: In progress  
Parent programme: Platform Audit 1.0  
Platform phase: PF-0 Platform Audit Foundation  
Reference implementation: PitchIQ

## Sprint mission

Create the first Capability Catalogue for PitchIQ by identifying the reusable product and platform capabilities already present in the repository.

PF-07 follows PF-06 because the Architecture Decision Audit identified several capability areas that need ownership, scope, and governance before future expansion.

## Why this sprint matters

Capabilities are the reusable functional engines behind the product experience.

A capability catalogue helps answer:

- What can PitchIQ already do?
- Which capabilities are product-specific?
- Which capabilities could become reusable WellTrack Platform services?
- Which capabilities are active now versus future-facing?
- Which capabilities should remain out of scope until MVP completion?

## Scope

### In scope

- Player profile
- XP and progression
- Rewards and achievements
- Training session engine
- Scoring
- Drill recommendations
- Cues/content
- Storage and persistence
- Analytics/session history
- Voice service
- Camera service
- Studio
- HQ/tools

### Out of scope

- Implementing new capabilities
- Refactoring services
- Cloud architecture
- AI coach implementation
- Computer vision implementation
- Wearables integration
- Backend/database design

## Audit categories

| Category | Questions |
|---|---|
| Purpose | What job does the capability perform? |
| Current status | Active, partial, experimental, future, or out of scope? |
| Files | Which files implement or support it? |
| Ownership | Product, platform candidate, Studio, HQ, or future? |
| Dependencies | What tokens, components, data, state or assets does it depend on? |
| Reuse | Could this capability apply to other WellTrack products? |
| Risk | What could break or expand scope if changed? |
| Next action | Catalogue, specify, stabilise, defer, or remove? |

## Deliverables

- `docs/platform/catalogues/CAPABILITY_CATALOGUE.md`
- `docs/platform/audits/PF_07_CAPABILITY_AUDIT_RESULTS.md`
- Capability ownership map
- Capability risk register
- PF-08 Documentation / Knowledge Audit inputs

## Exit criteria

PF-07 is complete when:

- Major product and platform capabilities have been identified.
- Each capability has a status and ownership label.
- Future-facing capabilities are separated from MVP capabilities.
- Scope-risk capabilities are flagged.
- PF-08 has clear documentation and knowledge governance inputs.

## Definition of done

No code behaviour changes are required.

The sprint is done when the capability catalogue and audit results are committed under `docs/platform/` and linked from Platform Audit 1.0.

## Next sprint

Sprint PF-08 — Documentation / Knowledge Audit

PF-08 will review canonical product docs, platform docs, sprint docs, catalogues, ADRs, and future knowledge graph requirements.