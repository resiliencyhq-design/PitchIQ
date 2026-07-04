# PF-02 Token Audit Results

Status: Draft results  
Sprint: PF-02 Token Audit  
Branch: `platform-foundation-docs`  
Reference implementation: PitchIQ

## Executive summary

PitchIQ already contains a strong seed token system. The two most important foundation files are:

- `css/tokens.css`
- `css/layout-system-v2.css`

Together they define core colour, surface, radius, card shadow, glow, safe-area, mobile layout, and basic typography scale tokens.

However, the audit also confirms that many reusable values remain hard-coded in screen and component CSS. This is expected at the current MVP stage, especially because several files were introduced as layout locks and visual fixes. The next platform step should not be a large refactor. It should be a controlled expansion of the token system, followed by gradual migration.

## Source files reviewed

| File | Role | Finding |
|---|---|---|
| `css/tokens.css` | Core token seed | Contains current root visual tokens. |
| `css/layout-system-v2.css` | Layout/type token seed | Contains mobile-first layout and type primitives. |
| `css/style.css` | Main global/screen CSS | Uses tokens but also contains many hard-coded values. |
| `css/onboard-step2-marker.css` | Position Marker component CSS | Strong component candidate; many values should become component tokens. |
| `css/onboard-step2-animation.css` | Marker spawn animation | Strong motion token candidate. |

## Root token inventory

`css/tokens.css` currently defines:

### Colours

| Token | Value | Role |
|---|---|---|
| `--bg` | `#020807` | App background |
| `--surface` | `#06120D` | Surface background |
| `--panel` | `rgba(8,25,19,.72)` | Glass/panel surface |
| `--lime` | `#D7FF2E` | Primary neon accent |
| `--green` | `#27FF9A` | Secondary accent |
| `--purple` | `#8F45FF` | Secondary accent |
| `--gold` | `#FFD84D` | Reward/accent |
| `--red` | `#FF3D57` | Danger/error |
| `--text` | `#F7FFF8` | Primary text |
| `--muted` | `#A9B8AD` | Muted text |
| `--stroke` | `rgba(255,255,255,.15)` | Border/stroke |

### Radius

| Token | Value |
|---|---|
| `--r-sm` | `14px` |
| `--r-md` | `22px` |
| `--r-lg` | `34px` |
| `--r-xl` | `46px` |

### Effects and safe area

| Token | Value | Role |
|---|---|---|
| `--shadow-card` | `0 30px 90px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.10)` | Main card shadow |
| `--glow-lime` | `0 0 42px rgba(215,255,46,.22)` | Lime glow |
| `--safe-bottom` | `calc(106px + env(safe-area-inset-bottom))` | Bottom safe spacing |

## Layout token inventory

`css/layout-system-v2.css` defines:

| Token | Value | Role |
|---|---|---|
| `--app-max-width` | `430px` | Main mobile app width |
| `--app-pad-x` | `20px` | Screen horizontal padding |
| `--app-pad-top` | `calc(18px + env(safe-area-inset-top))` | Screen top padding |
| `--app-pad-bottom` | `calc(110px + env(safe-area-inset-bottom))` | Screen bottom padding |
| `--section-gap` | `16px` | Default section gap |
| `--hero-gap` | `16px` | Hero gap |
| `--hero-visual-width` | `38%` | Hero visual width |
| `--type-hero` | `clamp(44px,12vw,64px)` | Hero type size |
| `--type-title` | `clamp(32px,8vw,48px)` | Title type size |
| `--type-body` | `clamp(15px,4vw,18px)` | Body type size |

Small-screen overrides:

| Breakpoint | Changes |
|---|---|
| `max-width:380px` | `--app-pad-x:16px`, `--hero-gap:12px`, `--hero-visual-width:36%` |

## Strong token foundations

| Area | Assessment |
|---|---|
| Brand colours | Strong seed foundation. |
| Core dark surfaces | Strong seed foundation. |
| Glass cards | Good seed foundation via `--panel`, `--stroke`, `--shadow-card`. |
| Mobile layout | Strong seed foundation via layout system v2. |
| Radius | Good seed foundation, but component-specific radius tokens are missing. |
| Typography size | Partial foundation. |

## Hard-coded reusable values found

### Global/button values

`css/style.css` includes reusable values that should eventually be tokenised:

| Value type | Examples | Recommended token direction |
|---|---|---|
| Font family | `Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif` | `--font-sans` |
| Button radius | `24px`, `32px` | `--radius-button`, `--radius-button-lg` |
| Button padding | `15px 20px`, `24px 48px` | `--button-pad`, `--button-pad-lg` |
| Touch target | `48px`, `44px`, `54px` | `--touch-target-min`, `--touch-target-compact` |
| Button transition | `.18s` | `--motion-fast` |
| Screen transition | `.32s cubic-bezier(.2,.8,.2,1)` | `--motion-screen-in`, `--ease-screen` |
| App max width | repeated `430px` | Use `--app-max-width` consistently |
| Bottom spacing | `112px + env(safe-area-inset-bottom)` | Align with layout/safe tokens |

### Position Marker values

`css/onboard-step2-marker.css` contains multiple reusable component values:

| Value type | Examples | Recommended token direction |
|---|---|---|
| Marker size | `clamp(42px,12vw,58px)`, `54px`, `50px` | `--marker-size`, `--marker-size-sm`, `--marker-size-md` |
| Marker z-index | `4`, `1`, `2`, `3` | `--z-marker-hitbox`, `--z-marker-base`, `--z-marker-shirt`, `--z-marker-label` |
| Marker text | `clamp(9px,2.6vw,12px)`, `1000`, `-.02em` | `--marker-label-size`, `--font-weight-black`, `--letter-tight-sm` |
| Marker halo | `radial-gradient(...)`, `drop-shadow(...)` | `--marker-halo-bg`, `--marker-halo-shadow` |
| Focus outline | `2px solid rgba(215,255,46,.9)` | `--focus-ring`, `--focus-ring-offset` |
| Selected pulse | `2s ease-in-out infinite` | `--motion-pulse-slow`, `--ease-pulse` |

### Motion values

`css/onboard-step2-animation.css` contains strong motion-token candidates:

| Value | Current purpose | Recommended token |
|---|---|---|
| `700ms` | Marker spawn duration | `--motion-marker-spawn` |
| `cubic-bezier(.19,1.24,.34,1)` | Marker spring easing | `--ease-spring` |
| `150ms` increments | Marker stagger delay | `--motion-marker-stagger` |
| `-112px`, `12px`, `-5px` | Spawn movement offsets | Component-local animation constants or marker motion tokens |

## Missing token categories

| Category | Current status | Recommendation |
|---|---|---|
| Font family | Hard-coded | Add `--font-sans`. |
| Font weights | Hard-coded throughout | Add `--font-weight-bold`, `--font-weight-heavy`, `--font-weight-black`. |
| Letter spacing | Hard-coded | Add `--tracking-tight`, `--tracking-kicker`, `--tracking-label`. |
| Button tokens | Mostly hard-coded | Add button component tokens before PF-03. |
| Motion tokens | Mostly hard-coded | Add platform motion tokens. |
| Z-index tokens | Hard-coded | Add layer scale. |
| Component tokens | Mostly missing | Start with Position Marker. |
| Breakpoint tokens | Media-query based | Define named screen profiles in documentation. |
| Tactical/football tokens | Hard-coded | Add marker/tactical web semantic tokens later. |

## Proposed token remediation sequence

### Step 1 — Add semantic aliases without breaking existing CSS

Do not remove existing short tokens yet. Add aliases such as:

```css
:root{
  --color-bg-app:var(--bg);
  --color-surface-base:var(--surface);
  --color-surface-panel:var(--panel);
  --color-brand-primary:var(--lime);
  --color-brand-secondary:var(--green);
  --color-text-primary:var(--text);
  --color-text-muted:var(--muted);
  --color-border-default:var(--stroke);
}
```

### Step 2 — Add missing foundation tokens

Suggested additions:

```css
:root{
  --font-sans:Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif;
  --font-weight-bold:800;
  --font-weight-heavy:900;
  --font-weight-black:1000;

  --touch-target-min:48px;
  --motion-fast:.18s;
  --motion-screen-in:.32s;
  --motion-marker-spawn:700ms;
  --motion-marker-stagger:150ms;
  --motion-pulse-slow:2s;
  --ease-screen:cubic-bezier(.2,.8,.2,1);
  --ease-spring:cubic-bezier(.19,1.24,.34,1);
}
```

### Step 3 — Add component token group for Position Marker

```css
:root{
  --marker-size:clamp(42px,12vw,58px);
  --marker-size-md:54px;
  --marker-size-sm:50px;
  --marker-label-size:clamp(9px,2.6vw,12px);
  --marker-halo-inset:-10px;
  --marker-pulse-scale:1.06;
}
```

### Step 4 — Gradual migration

Only after aliases and missing tokens exist should CSS be migrated gradually. Do not refactor all screen CSS at once.

## Token coverage baseline

| Area | Rating | Notes |
|---|---|---|
| Core colour tokens | Good | Strong seed exists. |
| Surface/card tokens | Good | Glass/token base exists. |
| Radius tokens | Good | Four sizes exist; component aliases missing. |
| Layout tokens | Good | Layout system v2 is a strong base. |
| Typography tokens | Partial | Sizes exist; family/weights/tracking missing. |
| Motion tokens | Weak | Needs immediate tokenisation. |
| Z-index tokens | Weak | Direct numbers used in markers/dev UI. |
| Component tokens | Weak | Position Marker should be first. |
| Tactical/football tokens | Weak | Needed for marker, pitch, tactical web. |

## PF-02 status

**Status: COMPLETE ENOUGH TO PROCEED TO PF-03 COMPONENT AUDIT**

The current token system is strong enough to support component audit work, but remediation should be planned before major new visual development.

## Recommended next actions

1. Add semantic aliases to `css/tokens.css` in a dedicated implementation sprint.
2. Add foundation tokens for font, motion, touch target, z-index and focus ring.
3. Add Position Marker component tokens.
4. Begin PF-03 Component Audit using Position Marker as the first test case.
5. Avoid broad CSS refactoring until component catalogue priorities are clear.

## Open questions

- Should token names preserve short names (`--lime`) or move fully to semantic names (`--color-brand-primary`)?
- Should component tokens live globally or inside component-specific CSS files?
- Should Studio consume the same tokens directly, or should it have a token adapter layer?
- Should football-specific tokens be part of the global system or a PitchIQ product layer?
