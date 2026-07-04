# Engineering Standards Catalogue v0.1

Status: Draft  
Sprint: PF-12  
Reference implementation: PitchIQ

## Purpose

This catalogue defines the first engineering standards baseline for PitchIQ.

## Standards areas

| Area | Baseline | Gap |
|---|---|---|
| Git workflow | Branch/PR workflow in use | Formal PR checklist needed |
| CSS architecture | Tokens, layout and screen CSS exist | Component CSS structure needed |
| JavaScript architecture | Modular static JS | Rendering/orchestration files are large |
| Naming | Mixed but understandable | Formal naming convention needed |
| Documentation | Strong audit docs | Keep indexes current |
| Release | GitHub Pages/PWA supported | Release checklist and cache policy needed |
| Testing | Not mature | Test strategy needed |
| Validation | Manual validation common | Automated gates needed later |

## Draft standards

1. One objective per sprint.
2. No broad refactor without audit and ADR.
3. Platform docs live temporarily in `docs/platform/`.
4. MVP stability takes priority over cleanup.
5. New reusable values should become tokens.
6. New reusable UI should be catalogued as a component or pattern.
7. Asset changes must consider service worker cache.
