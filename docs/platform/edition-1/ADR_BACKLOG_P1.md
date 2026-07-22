# Edition 1.0 — P1 ADR Backlog

Status: Draft  
Source: PF-06 Architecture Decision Audit  
Reference implementation: PitchIQ

## Purpose

This backlog identifies the first Architecture Decision Records that should be drafted before broad platform remediation begins.

## P1 ADRs

| ADR | Title | Why it matters | Status |
|---|---|---|---|
| ADR-000 | PitchIQ as WellTrack reference implementation | Establishes why platform work is currently grounded in PitchIQ. | Planned |
| ADR-001 | Repository-first workflow | Confirms GitHub PRs and repo docs as operational source of truth. | Planned |
| ADR-002 | Temporary platform docs inside PitchIQ | Prevents platform docs becoming accidentally permanent inside product repo. | Planned |
| ADR-003 | Future WellTrack Platform Framework repository | Establishes long-term canonical platform home. | Planned |
| ADR-004 | Token-first design system | Governs design-system foundation. | Planned |
| ADR-005 | Semantic aliases before refactoring | Protects MVP from unsafe token rewrites. | Planned |
| ADR-006 | Position Marker canonical component | Prevents marker anatomy, assets and states drifting. | Planned |
| ADR-007 | Position Selection canonical pattern | Governs pitch, markers, state, animation and CTA as one pattern. | Planned |
| ADR-008 | Asset lifecycle governance | Prevents stale/duplicate/unknown assets from accumulating. | Planned |
| ADR-009 | MVP stability before remediation | Establishes the stability-first remediation rule. | Planned |
| ADR-010 | Release and cache governance | Reduces GitHub Pages/PWA stale-cache risk. | Planned |

## Drafting order

1. ADR-009 MVP stability before remediation
2. ADR-000 PitchIQ as reference implementation
3. ADR-002 Temporary platform docs inside PitchIQ
4. ADR-004 Token-first design system
5. ADR-010 Release and cache governance
6. ADR-006 Position Marker canonical component
7. ADR-007 Position Selection canonical pattern
8. ADR-008 Asset lifecycle governance
9. ADR-001 Repository-first workflow
10. ADR-003 Future platform repository

## Rule

No broad CSS, component, asset or repository remediation should begin until ADR-009 and ADR-010 are drafted.
