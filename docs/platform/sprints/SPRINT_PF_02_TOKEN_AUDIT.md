# Sprint PF-02 — Token Audit

Status: In progress  
Parent programme: Platform Audit 1.0  
Platform phase: PF-0 Platform Audit Foundation  
Reference implementation: PitchIQ

## Sprint mission

Create the first governed Token Catalogue for PitchIQ and identify reusable visual values that should become part of the WellTrack Platform design system.

PF-02 follows PF-01 because the repository audit identified `css/tokens.css`, `css/layout-system-v2.css`, `css/style.css`, and onboarding CSS as the highest-priority token sources.

## Why this sprint matters

Tokens are the lowest-level design contract between product design, CSS, components, Studio, and future WellTrack products.

Without a governed token catalogue, the UI will continue accumulating hard-coded values, duplicate colours, inconsistent spacing, and screen-specific overrides.

## Scope

### In scope

- `css/tokens.css`
- `css/layout-system-v2.css`
- `css/style.css`
- Step 1 onboarding CSS
- Step 2 onboarding CSS
- Landing/splash CSS
- Studio CSS where relevant

### Out of scope

- Visual redesign
- CSS refactor
- Token renaming in live code
- Component rebuilds
- Asset replacement
- Feature development

## Audit categories

| Category | Examples |
|---|---|
| Colour | Background, surface, text, muted, accents, tactical, warning, error |
| Typography | Font family, type scale, weights, line heights, letter spacing |
| Spacing | Padding, margins, gaps, safe areas |
| Radius | Buttons, cards, panels, pills, circles |
| Shadow / glow | Cards, neon effects, tactical selected states |
| Motion | Durations, delays, easing, animation names |
| Layout | App width, max width, safe-area, breakpoints |
| Z-index | App shell, overlays, nav, markers, Studio, dev tools |

## Deliverables

- `docs/platform/catalogues/TOKEN_CATALOGUE.md`
- `docs/platform/audits/PF_02_TOKEN_AUDIT_RESULTS.md`
- Token coverage baseline
- Hard-coded value report
- Missing token recommendations
- PF-03 Component Audit inputs

## Exit criteria

PF-02 is complete when:

- Existing root tokens are catalogued.
- Layout tokens are catalogued.
- Major hard-coded values are identified.
- Missing semantic token groups are listed.
- Token remediation work is added to the backlog.
- PF-03 has enough token information to assess component compliance.

## Definition of done

No app behaviour changes are required.

The sprint is done when the token catalogue and audit results are committed under `docs/platform/` and linked from Platform Audit 1.0.

## Next sprint

Sprint PF-03 — Component Audit

PF-03 will use the Token Catalogue to assess whether reusable components use governed design values consistently.
