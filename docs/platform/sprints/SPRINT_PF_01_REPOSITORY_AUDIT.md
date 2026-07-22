# Sprint PF-01 — Repository Audit

Status: Draft  
Parent programme: Platform Audit 1.0  
Platform phase: PF-0 Platform Audit Foundation  
Reference implementation: PitchIQ

## Sprint mission

Create the first reliable map of the PitchIQ repository so future platform decisions are based on what actually exists rather than assumptions.

This sprint does not add product features. It establishes the baseline for later token, component, pattern, asset, architecture, capability, and quality audits.

## Why this sprint comes first

The repository audit is the foundation for the whole Platform Audit programme.

Before cataloguing tokens, components, assets, or capabilities, the platform needs a clear map of:

- where code lives
- where styles live
- where assets live
- where docs live
- which folders are product-specific
- which folders are platform-like
- where duplication or drift may already exist

## Scope

### In scope

- Repository folder map
- Documentation inventory
- CSS/style architecture inventory
- JavaScript/module inventory
- Asset folder inventory
- Tooling and build files
- Studio/HQ/tooling folders
- Known technical debt locations
- Candidate platform-owned areas

### Out of scope

- Refactoring code
- Renaming folders
- Moving assets
- Changing visual design
- Changing app behaviour
- Creating new product features

## Audit questions

This sprint should answer:

1. What are the major folders in the repository and what does each own?
2. Which files are clearly product implementation files?
3. Which files are reusable platform candidates?
4. Which documentation files are current, stale, duplicated, or missing?
5. Which CSS files are foundational, feature-specific, or temporary lock files?
6. Which JavaScript files define routes, state, data, components, or services?
7. Which asset folders contain canonical assets versus experimental or historical assets?
8. Which areas should eventually move to a dedicated platform repository?
9. Which areas should remain PitchIQ-specific?
10. What technical debt should be carried into the remediation backlog?

## Deliverables

| Deliverable | Description |
|---|---|
| Repository Map | Folder-by-folder ownership and purpose. |
| Documentation Inventory | Current docs, status, purpose, and recommended home. |
| CSS Architecture Inventory | List of global, token, layout, feature, and lock CSS files. |
| JavaScript Inventory | App routes, game logic, services, components, and data files. |
| Asset Inventory Seed | High-level asset folder map for PF-05. |
| Platform Candidate List | Items that may belong in the future WellTrack Platform repository. |
| Technical Debt Seed | Issues discovered during audit, without fixing them yet. |
| PF-02 Inputs | Clear starting points for the Token Audit. |

## Suggested repository map format

```markdown
| Path | Purpose | Owner | Status | Notes |
|---|---|---|---|---|
| css/tokens.css | Design tokens | Platform candidate | Active | Seed for Token Catalogue |
| css/layout-system-v2.css | Layout primitives | Platform candidate | Active | Mobile-first layout system |
| js/app/routes.js | Route rendering | PitchIQ product | Active | Contains screen render logic |
| assets/ | Product assets | Mixed | Needs audit | Split canonical vs experimental |
```

## Suggested documentation status labels

- `Canonical` — authoritative source.
- `Operational` — actively used by the product team.
- `Reference` — useful background but not governing.
- `Draft` — still being developed.
- `Stale` — likely out of date.
- `Duplicate` — overlaps another doc.
- `Move Later` — should move to platform repo later.

## Exit criteria

Sprint PF-01 is complete when:

- The repository folder map has been created.
- Each major folder has an assigned purpose.
- Existing docs have been inventoried and given status labels.
- CSS and JS architecture have been mapped at a high level.
- Candidate platform-owned files have been identified.
- Technical debt findings have been captured but not remediated.
- Sprint PF-02 Token Audit has clear source files and starting assumptions.

## Definition of done

No code changes are required.

The sprint is done when the audit outputs are committed under `docs/platform/` and the findings are linked from the Platform Audit 1.0 document.

## Next sprint

Sprint PF-02 — Token Audit

PF-02 will use the repository map to extract, classify, and assess design tokens, beginning with `css/tokens.css` and related layout/style files.
