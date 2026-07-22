# WellTrack Platform Foundation

Status: Draft  
Product reference implementation: PitchIQ

This folder contains the operational platform documents used by the PitchIQ repository while the dedicated WellTrack Platform repository is being established.

## Purpose

PitchIQ is no longer treated only as a standalone application. It is the first reference implementation of the WellTrack Platform Framework.

The platform work is organised into three streams:

1. **Product** — improves PitchIQ for players.
2. **Platform** — creates reusable standards, components, assets, tokens, and capabilities.
3. **Knowledge** — captures decisions, rationale, and lessons so future products do not need to rediscover them.

## Authority model

Information should flow downward:

```text
WellTrack Platform Framework
  ↓
Product repository documentation
  ↓
Implementation
  ↓
Running application
```

The long-term plan is to move canonical platform material into a dedicated `WellTrack-Platform-Framework` repository. Until then, this folder acts as the working platform foundation inside PitchIQ.

## Platform Audit 1.0

Platform Audit 1.0 discovery is complete across PF-01 to PF-18.

- `PLATFORM_AUDIT_1_0.md` — audit index and completion summary.
- `audits/` — audit result documents.
- `catalogues/` — platform catalogues created from the audit.
- `sprints/` — platform audit sprint plans.

## Edition 1.0

Edition 1.0 converts the audit discovery baseline into operational governance.

- `edition-1/README.md` — Edition 1.0 workspace.
- `edition-1/PLATFORM_AUDIT_REPORT_V1.md` — consolidated audit report draft.
- `edition-1/ADR_BACKLOG_P1.md` — first Architecture Decision Record backlog.
- `edition-1/STANDARDS_BACKLOG.md` — first WellTrack Platform Standards backlog.

## Foundation documents

- `PLATFORM_REPOSITORY_ARCHITECTURE.md` — where platform, product, and HQ knowledge should live.
- `PLATFORM_STANDARD_SEED.md` — initial standards hierarchy and governance model.
- `PLATFORM_WORK_ASSIGNMENT_MAP.md` — maps platform work to correct long-term and temporary homes.

## What belongs here

This folder should contain the operational platform material PitchIQ needs while it acts as the reference implementation.

It should not permanently become the canonical home for the full WellTrack Platform Canon, WPS, Knowledge Graph, or long-form publication drafts. Those belong in the future `WellTrack-Platform-Framework` repository.

## Platform rule

Every future feature should answer:

- What product value did it create?
- What platform capability did it improve?
- What knowledge did it capture?
- What technical debt did it reduce?
- What became reusable?
