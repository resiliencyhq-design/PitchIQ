# PF-06 Architecture Decision Audit Results

Status: Draft results  
Sprint: PF-06 Architecture Decision Audit  
Branch: `platform-foundation-docs`  
Reference implementation: PitchIQ

## Executive summary

PF-06 created the first Architecture Decision Catalogue for PitchIQ and the emerging WellTrack Platform.

The audit confirms that several important decisions have already been made through product and platform work, but they are not yet formalised as Architecture Decision Records. This is a normal early-stage risk: the project has been moving quickly, and now needs decision traceability before remediation and platform implementation begins.

The highest-priority ADRs are those that protect MVP stability while allowing the platform to mature: repository-first workflow, temporary platform docs inside PitchIQ, design token strategy, Position Marker architecture, Position Selection pattern, asset lifecycle governance, and the rule that audits should precede remediation.

## Source areas reviewed

| Area | Evidence source |
|---|---|
| Repository architecture | PF-01 Repository Audit |
| Token strategy | PF-02 Token Audit |
| Component strategy | PF-03 Component Audit |
| Pattern strategy | PF-04 Pattern Audit |
| Asset strategy | PF-05 Asset Audit |
| Product governance | `docs/CONTEXT.md`, `docs/MVP_STATUS.md` |
| Platform documentation | `docs/platform/` |
| Studio / HQ direction | Studio and tools inventory from earlier audits |

## Main decision findings

### 1. PitchIQ as reference implementation

Finding: PitchIQ is now acting as the first practical implementation of the WellTrack Platform Framework.

Risk: if this is not recorded, future contributors may treat platform docs as random product documentation.

Recommended ADR: **ADR-000 — PitchIQ as WellTrack reference implementation**

Priority: **P1**

### 2. Temporary platform docs inside PitchIQ

Finding: platform documents currently live under `docs/platform/` while a future platform repository is being prepared.

Risk: without a decision record, PitchIQ may become the accidental permanent home for all platform knowledge.

Recommended ADR: **ADR-002 — Temporary platform foundation docs inside PitchIQ**

Priority: **P1**

### 3. Token-first design system

Finding: PF-02 confirmed that tokens are already present and should become the foundation of the design system.

Risk: future screens may continue hard-coding reusable design values.

Recommended ADR: **ADR-005 — Token-first design system**

Priority: **P1**

### 4. Semantic aliases before refactoring

Finding: PF-02 recommends adding semantic token aliases without removing current shorthand tokens.

Risk: broad token renaming could break working screens.

Recommended ADR: **ADR-006 — Semantic token aliases before CSS refactoring**

Priority: **P1**

### 5. Position Marker as first canonical component

Finding: PF-03 identified Position Marker as the strongest canonical football-specific component candidate.

Risk: if not governed, marker markup, CSS, assets and states may drift again.

Recommended ADR: **ADR-007 — Position Marker canonical component candidate**

Priority: **P1**

### 6. Position Selection as first canonical pattern

Finding: PF-04 identified Position Selection as the strongest canonical football-specific interaction pattern.

Risk: pitch, marker, coordinates, CTA, state and animation could be changed separately without understanding the full pattern.

Recommended ADR: **ADR-008 — Position Selection canonical pattern candidate**

Priority: **P1**

### 7. Asset lifecycle governance

Finding: PF-05 identified multiple pitch variants and asset version suffixes.

Risk: unclear asset status could cause broken marker alignment, stale visuals, or cache issues.

Recommended ADR: **ADR-009 — Asset lifecycle governance**

Priority: **P1**

### 8. MVP stability before remediation

Finding: previous audits identify remediation work, but broad refactoring before MVP stability could destabilise the product.

Risk: platform improvement could accidentally slow MVP delivery.

Recommended ADR: **ADR-010 — Preserve MVP stability before refactoring**

Priority: **P1**

### 9. Studio as platform subsystem

Finding: Studio uses separate React/Puck-related tooling and should not be treated as a normal player app screen.

Risk: unclear boundaries could mix player app, Studio and platform concerns.

Recommended ADR: **ADR-011 — Studio as platform subsystem**

Priority: **P2**

### 10. HQ as Platform Management System

Finding: HQ should surface platform health, maturity, release and audit status rather than become another manual dashboard.

Risk: HQ could become a disconnected status page unless connected to canonical data.

Recommended ADR: **ADR-012 — HQ as Platform Management System**

Priority: **P2**

## ADR backlog summary

| Priority | Count | Notes |
|---|---:|---|
| P1 | 10 | Required before major platform remediation. |
| P2 | 5 | Important for platform scaling and governance. |
| P3 | 0 | Historical ADRs can be added later. |

## Decision risk register

| Risk | Severity | Follow-up |
|---|---|---|
| Platform docs become permanently trapped inside PitchIQ | High | Draft ADR-002 and later create platform repo. |
| Token remediation breaks MVP screens | High | Draft ADR-006 and use additive aliases first. |
| Position Marker drifts from canonical anatomy | High | Draft ADR-007 before component remediation. |
| Position Selection assets are changed without coordinate review | High | Draft ADR-008 and ADR-009. |
| Refactoring starts before audits complete | Medium-high | Draft ADR-010. |
| Studio and HQ boundaries remain unclear | Medium | Draft ADR-011 and ADR-012 later. |
| Cache/versioning decisions remain implicit | Medium | Draft ADR-013. |

## PF-06 status

**Status: COMPLETE ENOUGH TO PROCEED TO PF-07 CAPABILITY AUDIT**

PF-06 has created the first Architecture Decision Catalogue, seeded an ADR template, and identified the first decisions that should become formal ADRs.

## Recommended next actions

1. Start PF-07 Capability Audit.
2. After PF-07, draft the first P1 ADRs rather than continuing to let decisions live only in audit documents.
3. Do not begin token/component/asset remediation until ADR-010 confirms the stability-first approach.
4. Use ADR-007 and ADR-008 to guide any future Position Marker or Position Selection implementation changes.

## Open questions

- Should ADR files live under `docs/adr/` in PitchIQ or inside `docs/platform/decision-records/` until the platform repository exists?
- Should ADR-000 be approved before the current PR is merged?
- Should HQ display ADR status as part of platform maturity?
- Should future PRs be required to mention affected ADRs?
