# Sprint PF-06 — Architecture Decision Audit

Status: In progress  
Parent programme: Platform Audit 1.0  
Platform phase: PF-0 Platform Audit Foundation  
Reference implementation: PitchIQ

## Sprint mission

Create the first Architecture Decision Catalogue for PitchIQ by identifying the major design, engineering, repository, asset, Studio, HQ, and platform decisions already made during MVP development.

PF-06 follows PF-05 because the previous audits surfaced several decisions that need formal traceability before future remediation begins.

## Why this sprint matters

Architecture Decision Records prevent the platform from relying on memory, chat history, or undocumented assumptions.

An ADR makes clear:

- what decision was made
- why it was made
- what alternatives were considered
- what consequences follow
- what files, docs, components, or patterns are affected
- when the decision should be reviewed

## Scope

### In scope

- Repository-first workflow
- Platform documentation location
- Product/platform documentation split
- Token strategy
- Component catalogue strategy
- Position Marker architecture
- Position Selection pattern
- Asset lifecycle governance
- Service worker/cache versioning
- Studio separation
- HQ as platform management system
- MVP-first product governance

### Out of scope

- Implementing ADR-driven code changes
- Refactoring architecture
- Moving repositories
- Moving Studio or HQ
- Changing app behaviour
- Creating the future platform repository

## Deliverables

- `docs/platform/catalogues/ARCHITECTURE_DECISION_CATALOGUE.md`
- `docs/platform/audits/PF_06_ARCHITECTURE_DECISION_AUDIT_RESULTS.md`
- Initial ADR backlog
- ADR template seed
- PF-07 Capability Audit inputs

## Exit criteria

PF-06 is complete when:

- Major platform decisions have been identified.
- Each decision has a proposed ADR ID.
- Initial ADR priorities have been assigned.
- Decisions discovered during PF-01 to PF-05 are represented.
- PF-07 has clear capability areas to audit next.

## Definition of done

No code or architecture changes are required.

The sprint is done when the decision catalogue and audit results are committed under `docs/platform/` and linked from Platform Audit 1.0.

## Next sprint

Sprint PF-07 — Capability Audit

PF-07 will catalogue reusable capabilities such as XP, rewards, profiles, storage, Studio, HQ, analytics, camera, voice and future platform services.