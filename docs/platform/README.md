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

## Documents

- `PLATFORM_REPOSITORY_ARCHITECTURE.md` — where platform, product, and HQ knowledge should live.
- `PLATFORM_AUDIT_1_0.md` — first operational audit plan for tokens, components, patterns, assets, decisions, capabilities, documentation, and quality.
- `PLATFORM_STANDARD_SEED.md` — initial standards hierarchy and governance model.

## Platform rule

Every future feature should answer:

- What product value did it create?
- What platform capability did it improve?
- What knowledge did it capture?
- What technical debt did it reduce?
- What became reusable?
