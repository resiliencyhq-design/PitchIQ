# WellTrack Platform Standard Seed

Status: Draft  
Abbreviation: WPS

## Purpose

The WellTrack Platform Standard (WPS) defines the authoritative standards for designing, engineering, validating, documenting, and releasing WellTrack products.

It is not a description of the current implementation. It is the governing standard the implementation should move toward.

## Normative language

| Keyword | Meaning |
|---|---|
| MUST | Mandatory requirement. |
| SHOULD | Recommended unless a documented reason exists. |
| MAY | Optional implementation. |
| EXAMPLE | Illustrative guidance only. |

## Five-layer governance model

```text
Principles
  ↓
Standards
  ↓
Patterns
  ↓
Components
  ↓
Implementation
```

### Layer 1 — Principles

Long-lived beliefs that rarely change.

Examples:

- Build once, reuse everywhere.
- One source of truth.
- Documentation is part of the product.
- Simple over clever.
- Evidence informs product decisions.

### Layer 2 — Standards

Normative rules that implement principles.

Examples:

- Design values MUST use approved tokens where appropriate.
- Major architecture decisions MUST be recorded as ADRs.
- Reusable components SHOULD be documented with purpose, states, accessibility, assets, and implementation notes.

### Layer 3 — Patterns

Approved recurring solutions.

Examples:

- Onboarding pattern
- Position selection pattern
- Dashboard metric pattern
- Training session pattern

### Layer 4 — Components

Reusable building blocks.

Examples:

- Primary Button
- Progress Bar
- Position Marker
- Hero Card
- Mission Card
- Dashboard Tile

### Layer 5 — Implementation

Product-specific code, assets, and configuration.

Implementation MAY vary between products if it remains compliant with higher-level principles and standards.

## Initial standard backlog

| ID | Title |
|---|---|
| WPS-PL-001 | Platform Principles |
| WPS-DS-001 | Design Tokens |
| WPS-DS-002 | Colour System |
| WPS-DS-003 | Typography |
| WPS-DS-004 | Buttons |
| WPS-DS-005 | Cards |
| WPS-ENG-001 | Repository Structure |
| WPS-ENG-002 | Component Architecture |
| WPS-ENG-003 | State Management |
| WPS-VAL-001 | Accessibility |
| WPS-OPS-001 | Release Workflow |

## Architecture Decision Records

Every significant platform decision SHOULD be captured as an ADR with:

- Context
- Decision
- Alternatives considered
- Consequences
- Related implementation
- Review trigger

## Sprint rule

Every sprint should improve at least one of:

1. Product value
2. Platform capability
3. Knowledge capture
4. Technical quality
5. Reusability
