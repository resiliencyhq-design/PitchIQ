# Sprint PF-08 — Documentation / Knowledge Audit

Status: In progress  
Parent programme: Platform Audit 1.0  
Platform phase: PF-0 Platform Audit Foundation  
Reference implementation: PitchIQ

## Sprint mission

Create the first Documentation / Knowledge Catalogue for PitchIQ by identifying the current product docs, platform docs, sprint docs, catalogues, ADR backlog, and future knowledge graph requirements.

PF-08 follows PF-07 because the Capability Audit identified that the platform now needs a clear knowledge layer to keep product, platform, HQ, Studio, and future WellTrack products aligned.

## Why this sprint matters

Documentation is now part of the product architecture.

A knowledge audit helps answer:

- Which documents are canonical?
- Which documents are operational?
- Which documents are historical references?
- Which documents should move to the future platform repository?
- Which documents should HQ read from?
- Which documents are stale, duplicated or incomplete?
- How should knowledge be organised for future products?

## Scope

### In scope

- Product context documents
- MVP status documents
- Architecture documents
- Platform foundation documents
- Sprint documents
- Audit result documents
- Catalogues
- ADR backlog
- Repository architecture documents
- Future Knowledge Graph requirements
- HQ knowledge display requirements

### Out of scope

- Rewriting all docs
- Deleting old sprint docs
- Moving docs to a new repository
- Building the knowledge graph
- Building HQ data ingestion
- Creating new app features

## Audit categories

| Category | Questions |
|---|---|
| Purpose | Why does this document exist? |
| Status | Canonical, operational, reference, draft, stale, duplicate or move later? |
| Owner | Product, platform, HQ, Studio, release or unknown? |
| Audience | Developer, product owner, platform owner, future contributor or external reviewer? |
| Source of truth | Is this document authoritative or supporting? |
| Dependency | Which catalogues, ADRs, screens or capabilities does it relate to? |
| Risk | What happens if it is missing, stale or duplicated? |

## Deliverables

- `docs/platform/catalogues/KNOWLEDGE_CATALOGUE.md`
- `docs/platform/audits/PF_08_DOCUMENTATION_KNOWLEDGE_AUDIT_RESULTS.md`
- Documentation ownership map
- Knowledge risk register
- PF-09 Quality / Platform Health Audit inputs

## Exit criteria

PF-08 is complete when:

- Major documents have been classified.
- Product and platform source-of-truth boundaries are clear.
- The future platform repository knowledge boundary is restated.
- Knowledge risks are recorded.
- HQ knowledge display requirements are identified.
- PF-09 has clear quality/platform health inputs.

## Definition of done

No documents are deleted or moved.

The sprint is done when the Knowledge Catalogue and audit results are committed under `docs/platform/` and linked from Platform Audit 1.0.

## Next sprint

Sprint PF-09 — Quality / Platform Health Audit

PF-09 will create the first platform health baseline, including documentation completeness, token coverage, component reuse, asset governance, ADR coverage, accessibility, testing, performance, release readiness, and technical debt.