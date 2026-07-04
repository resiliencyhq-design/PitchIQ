# Sprint PF-03 — Component Audit

Status: In progress  
Parent programme: Platform Audit 1.0  
Platform phase: PF-0 Platform Audit Foundation  
Reference implementation: PitchIQ

## Sprint mission

Create the first governed Component Catalogue for PitchIQ and identify the reusable UI and football-specific building blocks that should become part of the WellTrack Platform.

PF-03 follows PF-02 because components should be assessed against the Token Catalogue rather than reviewed only visually.

## Why this sprint matters

Components are where the platform becomes reusable.

A component catalogue helps answer:

- Which parts of PitchIQ can be reused across screens?
- Which parts could be reused by future WellTrack products?
- Which components use approved tokens?
- Which components are screen-specific and should remain local?
- Which components need accessibility, state, or asset governance?

## Scope

### In scope

- Buttons
- Glass cards / panels
- Stat cards
- Position Marker
- Progress bars
- Navigation
- Hero cards
- Mission cards
- Home dashboard cards
- Training/results cards
- Toast/sparkle UI utilities

### Out of scope

- Component refactoring
- React migration
- Visual redesign
- Asset replacement
- Feature development
- Behaviour changes

## Audit categories

| Category | Questions |
|---|---|
| Purpose | What job does this component do? |
| Reuse | Is it screen-local, product reusable, or platform reusable? |
| Anatomy | What sub-elements does it contain? |
| State | Default, selected, disabled, active, loading, empty, etc. |
| Tokens | Does it use governed values or hard-coded styling? |
| Accessibility | Labels, focus, touch target, contrast, reduced motion. |
| Assets | Does it depend on images, SVG, icons or media? |
| Implementation | CSS/JS files where it is implemented. |
| Risk | What could break if it changes? |

## Deliverables

- `docs/platform/catalogues/COMPONENT_CATALOGUE.md`
- `docs/platform/audits/PF_03_COMPONENT_AUDIT_RESULTS.md`
- Initial component reuse map
- Component risk register
- PF-04 Pattern Audit inputs

## Exit criteria

PF-03 is complete when:

- Major reusable components have been identified.
- Each component has a proposed ownership status.
- Position Marker is recorded as the first canonical football component candidate.
- Token compliance issues have been identified.
- Component risks are captured.
- PF-04 has clear pattern candidates to audit next.

## Definition of done

No app behaviour changes are required.

The sprint is done when the component catalogue and audit results are committed under `docs/platform/` and linked from Platform Audit 1.0.

## Next sprint

Sprint PF-04 — Pattern Audit

PF-04 will map reusable screen and interaction patterns such as Landing, Onboarding, Home, Training, Results, HQ and Studio.