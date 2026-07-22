# WellTrack Repository & Documentation Architecture

Status: Proposed  
Edition: 1.0 draft

## Purpose

This document defines where each class of WellTrack knowledge should live so platform standards, product implementation, and HQ views remain organised and maintainable.

## Three-layer architecture

### Layer 1 — WellTrack Platform Framework

The authoritative source for reusable platform knowledge.

It should contain:

- Platform Charter
- WellTrack Platform Standard (WPS)
- Canon volumes
- Knowledge graph
- Catalogues
- Research
- Templates
- Shared diagrams
- Architecture Decision Records

Recommended future repository:

```text
WellTrack-Platform-Framework
```

### Layer 2 — Product repositories

Working implementations of products.

Examples:

```text
PitchIQ
MindIQ
SchoolIQ
CoachIQ
```

Each product repository should contain only the documentation required to build, maintain, validate, and release that product.

### Layer 3 — HQ

HQ should act as the platform management system.

HQ should:

- read from the Platform Framework
- link to product repositories
- surface standards, compliance, maturity, and release health
- avoid becoming the source of truth itself

## Recommended GitHub organisation

```text
WellTrack-Platform-Framework
PitchIQ
MindIQ
SchoolIQ
CoachIQ
HQ
Shared-Assets
Shared-Components
```

## Platform repository structure

Proposed structure for the future dedicated platform repository:

```text
Blueprint/
Canon/
Standards/
Catalogues/
Research/
Templates/
Diagrams/
Decision-Records/
Releases/
```

## PitchIQ repository structure

PitchIQ should remain product-focused:

```text
src/
assets/
css/
js/
docs/
tests/
tools/
studio/
```

## Governance rule

Information flows in one direction:

```text
Platform Framework
  ↓
Product Documentation
  ↓
Code
  ↓
Running Application
```

Changes to reusable standards should begin in the Platform Framework before being adopted by products.

## Immediate next steps

1. Use this folder as the temporary platform foundation inside PitchIQ.
2. Create the dedicated `WellTrack-Platform-Framework` repository when ready.
3. Move canonical platform documents into that repository.
4. Keep PitchIQ documentation product-specific.
5. Expand HQ to link platform standards, product docs, and live implementation.
