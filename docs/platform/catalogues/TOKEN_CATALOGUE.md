# Token Catalogue v0.1

Status: Draft  
Sprint: PF-02 Token Audit  
Reference implementation: PitchIQ  
Primary source files: `css/tokens.css`, `css/layout-system-v2.css`

## Purpose

This catalogue records the first governed set of reusable visual values in PitchIQ. It is the starting point for the WellTrack Platform design token system.

The current codebase already has two important token sources:

1. `css/tokens.css` — visual brand and surface tokens.
2. `css/layout-system-v2.css` — layout and typography primitives.

## Token governance status labels

| Status | Meaning |
|---|---|
| Canonical | Approved token and safe to reuse. |
| Candidate | Useful token, but naming or scope may need review. |
| Screen-local | Should remain local to a specific screen or component. |
| Missing | Needed but not yet defined. |
| Deprecated | Should be replaced. |

## Current canonical / candidate tokens

### Core surface and brand tokens

| Token | Value | Category | Status | Notes |
|---|---|---|---|---|
| `--bg` | `#020807` | Colour / background | Candidate | Main app background. Should likely become `--color-bg-app`. |
| `--surface` | `#06120D` | Colour / surface | Candidate | Base dark surface. |
| `--panel` | `rgba(8,25,19,.72)` | Colour / panel | Candidate | Glass/panel base. |
| `--lime` | `#D7FF2E` | Colour / brand accent | Candidate | Primary neon brand accent. |
| `--green` | `#27FF9A` | Colour / brand accent | Candidate | Secondary green accent. |
| `--purple` | `#8F45FF` | Colour / accent | Candidate | Secondary accent; usage needs review. |
| `--gold` | `#FFD84D` | Colour / reward/accent | Candidate | Reward or achievement candidate. |
| `--red` | `#FF3D57` | Colour / error/alert | Candidate | Error/danger candidate. |
| `--text` | `#F7FFF8` | Colour / text | Candidate | Primary text. |
| `--muted` | `#A9B8AD` | Colour / text-muted | Candidate | Secondary text. |
| `--stroke` | `rgba(255,255,255,.15)` | Colour / border | Candidate | Default border/stroke. |

### Radius tokens

| Token | Value | Category | Status | Notes |
|---|---|---|---|---|
| `--r-sm` | `14px` | Radius | Candidate | Small cards/buttons. |
| `--r-md` | `22px` | Radius | Candidate | Medium cards/buttons. |
| `--r-lg` | `34px` | Radius | Candidate | Large glass cards. |
| `--r-xl` | `46px` | Radius | Candidate | Extra large panels. |

### Shadow / glow tokens

| Token | Value | Category | Status | Notes |
|---|---|---|---|---|
| `--shadow-card` | `0 30px 90px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.10)` | Shadow | Candidate | Main card elevation. |
| `--glow-lime` | `0 0 42px rgba(215,255,46,.22)` | Glow | Candidate | Lime glow effect. |

### Layout / safe area tokens

| Token | Value | Category | Status | Notes |
|---|---|---|---|---|
| `--safe-bottom` | `calc(106px + env(safe-area-inset-bottom))` | Safe area | Candidate | Bottom safe area; overlaps conceptually with layout tokens. |
| `--app-max-width` | `430px` | Layout width | Candidate | Main mobile app shell width. |
| `--app-pad-x` | `20px` | Spacing | Candidate | Default horizontal padding. |
| `--app-pad-top` | `calc(18px + env(safe-area-inset-top))` | Spacing / safe area | Candidate | Top safe area padding. |
| `--app-pad-bottom` | `calc(110px + env(safe-area-inset-bottom))` | Spacing / safe area | Candidate | Bottom safe area padding. |
| `--section-gap` | `16px` | Spacing | Candidate | Default section gap. |
| `--hero-gap` | `16px` | Spacing | Candidate | Hero layout gap. |
| `--hero-visual-width` | `38%` | Layout | Candidate | Hero visual column width. |

### Typography tokens

| Token | Value | Category | Status | Notes |
|---|---|---|---|---|
| `--type-hero` | `clamp(44px,12vw,64px)` | Typography size | Candidate | Hero title size. |
| `--type-title` | `clamp(32px,8vw,48px)` | Typography size | Candidate | Screen title size. |
| `--type-body` | `clamp(15px,4vw,18px)` | Typography size | Candidate | Body text size. |

### Responsive token overrides

| Breakpoint | Token changes | Status | Notes |
|---|---|---|---|
| `@media(max-width:380px)` | `--app-pad-x:16px`, `--hero-gap:12px`, `--hero-visual-width:36%` | Candidate | Should be formalised as small-phone layout profile. |

## Missing token groups

The audit identified several reusable values that are not yet governed by tokens.

| Missing token group | Why needed | Example current values |
|---|---|---|
| Font family | Body font is hard-coded globally. | `Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif` |
| Font weight scale | Many weights are hard-coded. | `850`, `900`, `1000` |
| Button radius | Buttons use direct values. | `24px`, `32px` |
| Button padding | Buttons use direct values. | `15px 20px`, `24px 48px` |
| Minimum touch target | Buttons and markers use direct values. | `48px`, `44px`, `54px` |
| Tactical glow | Marker halo uses direct rgba/drop-shadow values. | `rgba(215,255,53,.72)`, `0 0 28px` |
| Motion duration | Animations use direct durations. | `.18s`, `.32s`, `700ms`, `2s` |
| Motion easing | Easing curves are hard-coded. | `cubic-bezier(.19,1.24,.34,1)` |
| Z-index scale | Layers use direct z-index values. | `0`, `1`, `2`, `3`, `4`, `9999`, `10000` |
| Breakpoints | Media queries use direct sizes. | `380px`, `390px`, `430px` |
| Panel blur | Glass blur values are direct. | `blur(28px)`, `blur(18px)` |
| Border opacity scale | Repeated rgba border values. | `rgba(255,255,255,.12)`, `.18`, `.22` |

## Proposed semantic token direction

The current token names are short and useful for speed. As the platform matures, semantic names should be introduced while preserving compatibility.

### Proposed colour aliases

| Proposed token | Maps to | Purpose |
|---|---|---|
| `--color-bg-app` | `--bg` | Main app background. |
| `--color-surface-base` | `--surface` | Base surface colour. |
| `--color-surface-panel` | `--panel` | Glass/panel surface. |
| `--color-brand-primary` | `--lime` | Primary brand accent. |
| `--color-brand-secondary` | `--green` | Secondary brand accent. |
| `--color-text-primary` | `--text` | Primary text. |
| `--color-text-muted` | `--muted` | Secondary text. |
| `--color-border-default` | `--stroke` | Default border. |
| `--color-state-danger` | `--red` | Danger/error. |
| `--color-state-reward` | `--gold` | Rewards/achievements. |

### Proposed spacing aliases

| Proposed token | Maps to | Purpose |
|---|---|---|
| `--space-screen-x` | `--app-pad-x` | Screen horizontal padding. |
| `--space-screen-top` | `--app-pad-top` | Screen top padding. |
| `--space-screen-bottom` | `--app-pad-bottom` | Screen bottom padding. |
| `--space-section-gap` | `--section-gap` | Section vertical gap. |
| `--space-hero-gap` | `--hero-gap` | Hero layout gap. |

### Proposed motion tokens

| Proposed token | Candidate value | Purpose |
|---|---|---|
| `--motion-fast` | `.18s` | Button and small interactions. |
| `--motion-screen-in` | `.32s` | Screen transition. |
| `--motion-marker-spawn` | `700ms` | Marker entrance animation. |
| `--motion-pulse-slow` | `2s` | Selected pulse loop. |
| `--ease-screen` | `cubic-bezier(.2,.8,.2,1)` | Screen entrance. |
| `--ease-spring` | `cubic-bezier(.19,1.24,.34,1)` | Marker spawn. |

### Proposed z-index tokens

| Proposed token | Candidate value | Purpose |
|---|---|---|
| `--z-world` | `0` | Background world layer. |
| `--z-app` | `1` | Main app content. |
| `--z-marker-base` | `1` | Marker base. |
| `--z-marker-shirt` | `2` | Marker shirt. |
| `--z-marker-label` | `3` | Marker label. |
| `--z-marker-hitbox` | `4` | Marker button/hit layer. |
| `--z-dev-panel` | `9999` | Developer panel. |
| `--z-dev-toggle` | `10000` | Developer toggle. |

## Token coverage baseline

| Area | Current coverage | Notes |
|---|---|---|
| Core colours | Good seed coverage | Main brand/background/text tokens exist. |
| Radius | Good seed coverage | Four radius tokens exist, but button-specific radii are hard-coded. |
| Shadows/glows | Partial | Card and lime glow exist, tactical marker glow is hard-coded. |
| Layout | Good seed coverage | App width, padding, section gap, hero gap exist. |
| Typography | Partial | Size tokens exist, but font family/weights/letter spacing are hard-coded. |
| Motion | Weak | Animation durations/easing are not tokenised. |
| Z-index | Weak | Layer values are direct. |
| Breakpoints | Weak/partial | Breakpoints exist as media queries, not named tokens. |

## Initial remediation backlog

| Priority | Item | Rationale |
|---|---|---|
| P1 | Add semantic aliases for core colours | Enables platform-wide naming without breaking current shorthand tokens. |
| P1 | Add motion tokens | Marker spawn, screen entrance and button transitions need governed values. |
| P1 | Add z-index tokens | Layering is central to onboarding, Studio, HQ and dev tools. |
| P1 | Add typography family and weight tokens | Current font/weight use is broad and inconsistent. |
| P2 | Add button-specific tokens | Buttons are reusable components and should not rely on direct padding/radius values. |
| P2 | Add tactical/football tokens | Marker halos, pitch overlays and tactical web effects need semantic tokens. |
| P2 | Add breakpoint tokens or named layout profiles | Small-phone and iPhone-frame logic should be governed. |
| P3 | Audit all hard-coded rgba values | Consolidate repeated border/surface/glow opacities. |

## PF-03 inputs

PF-03 Component Audit should assess the following first:

1. Primary button token compliance.
2. Position Marker token compliance.
3. Glass/card token compliance.
4. Progress bar token compliance.
5. Navigation token compliance.

The Position Marker is the best first component because it already has a clear anatomy and uses direct values that should become component tokens.
