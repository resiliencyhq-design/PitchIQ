# Sprint PF-04 — Pattern Audit

Status: In progress  
Parent programme: Platform Audit 1.0  
Platform phase: PF-0 Platform Audit Foundation  
Reference implementation: PitchIQ

## Sprint mission

Create the first governed Pattern Catalogue for PitchIQ by mapping the reusable screen, flow, and interaction patterns that combine tokens and components into complete user experiences.

PF-04 follows PF-03 because patterns should be assessed after the reusable component layer has been identified.

## Why this sprint matters

Patterns are the bridge between components and product experience.

A pattern catalogue helps answer:

- Which complete experiences are reusable?
- Which screens share the same structure?
- Which flows should be governed by the platform?
- Which patterns are PitchIQ-specific?
- Which patterns could be reused by MindIQ, SchoolIQ, CoachIQ or HQ?

## Scope

### In scope

- Landing / Splash unlock pattern
- Onboarding wizard pattern
- Position selection pattern
- Home dashboard pattern
- Training session pattern
- Results / reward pattern
- HQ dashboard pattern
- Studio editing pattern

### Out of scope

- Redesigning flows
- Refactoring route rendering
- Changing app behaviour
- Creating new screens
- Adding analytics events
- Moving Studio or HQ code

## Audit categories

| Category | Questions |
|---|---|
| Purpose | What user or platform job does this pattern complete? |
| Flow | What steps or states make up the pattern? |
| Components | Which components are used? |
| Tokens | Which token groups support the pattern? |
| Assets | Which images, icons, illustrations, or media are required? |
| State | What data/state drives the pattern? |
| Reuse | Is the pattern screen-local, product reusable, or platform reusable? |
| Accessibility | What focus, labels, motion and touch rules apply? |
| Risks | What could break if the pattern changes? |

## Deliverables

- `docs/platform/catalogues/PATTERN_CATALOGUE.md`
- `docs/platform/audits/PF_04_PATTERN_AUDIT_RESULTS.md`
- Pattern ownership map
- Pattern risk register
- PF-05 Asset Audit inputs

## Exit criteria

PF-04 is complete when:

- Major user-facing and platform-facing patterns have been identified.
- Each pattern has a proposed ownership status.
- Onboarding and Position Selection are documented as the first high-priority pattern candidates.
- Asset dependencies have been captured for PF-05.
- Pattern risks are captured.
- PF-05 has clear asset areas to audit next.

## Definition of done

No app behaviour changes are required.

The sprint is done when the pattern catalogue and audit results are committed under `docs/platform/` and linked from Platform Audit 1.0.

## Next sprint

Sprint PF-05 — Asset Audit

PF-05 will catalogue logos, controls, onboarding artwork, pitch assets, player images, backgrounds, home assets, and any Studio/HQ visual assets.