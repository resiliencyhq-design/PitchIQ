# Quality / Platform Health Catalogue v0.1

Status: Draft  
Sprint: PF-09  
Reference implementation: PitchIQ

## Purpose

This catalogue defines the first quality and platform health scorecard for PitchIQ.

## Health dimensions

| Dimension | Baseline rating | Notes |
|---|---|---|
| Documentation completeness | Medium-high | Platform docs and catalogues now exist; MVP docs must stay current. |
| Token coverage | Medium | Strong seed tokens; motion, z-index and semantic aliases missing. |
| Component reuse | Medium | Reusable components exist; formal specs still needed. |
| Pattern coverage | Medium-high | Key patterns identified; screenshots/specs still needed. |
| Asset governance | Medium | Catalogue exists; canonical assets need confirmation. |
| ADR coverage | Low-medium | ADR backlog exists; full ADR files not yet drafted. |
| Accessibility | Low-medium | Some labels/focus/reduced motion exist; full audit not done. |
| Testing | Low | No mature test strategy documented yet. |
| Performance | Low-medium | Needs asset, animation and startup review. |
| Release readiness | Medium | App deploys, but release governance and cache policy need strengthening. |
| Technical debt visibility | Medium-high | Audit has surfaced major risks. |

## Health scale

| Rating | Meaning |
|---|---|
| High | Mature and governed. |
| Medium-high | Good baseline, minor gaps. |
| Medium | Usable but needs governance. |
| Low-medium | Partial and risk-prone. |
| Low | Needs foundational work. |

## Highest-priority improvements

1. Draft first P1 ADRs.
2. Add semantic token aliases and motion/z-index tokens.
3. Confirm canonical Position Marker and Position Selection assets.
4. Create accessibility and testing baselines.
5. Add release/cache governance.
