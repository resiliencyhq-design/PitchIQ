# PF-01 Repository Audit Results

Status: Draft results  
Sprint: PF-01 Repository Audit  
Branch: `platform-foundation-docs`  
Scope: PitchIQ repository as the first WellTrack Platform reference implementation

## Executive summary

PitchIQ currently has a workable modular static JavaScript architecture for GitHub Pages deployment, with app orchestration in `js/app`, game logic in `js/game`, services in `js/services`, shared UI utilities in `js/components`, content/data in `js/data`, styles in `css`, and visual resources in `assets`.

The repository is suitable as a reference implementation, but the audit confirms a clear split between:

1. **Product-specific implementation** — current PitchIQ screens, onboarding, training, results, player flows.
2. **Platform candidates** — tokens, layout primitives, component patterns, Studio, HQ/tools, shared assets, standards, and audit documents.
3. **Technical debt / review areas** — multiple onboarding-specific CSS lock files, cache/version drift, possible stale docs, asset variants, and mixed platform/product ownership.

PF-01 should therefore be treated as complete enough to start PF-02 Token Audit, but not as a final exhaustive file-tree audit. A local script-based tree extraction is still recommended later for precision.

## Evidence reviewed

This audit used repository metadata and direct file inspection via GitHub.

Key files reviewed:

- `package.json`
- `index.html`
- `manifest.json`
- `sw.js`
- `docs/ARCHITECTURE.md`
- `docs/CONTEXT.md`
- `docs/MVP_STATUS.md`
- `css/tokens.css`
- `css/layout-system-v2.css`
- `css/style.css`
- `css/onboard-step1-lock.css`
- `css/onboard-step2-layout.css`
- `css/onboard-step2-marker.css`
- `css/onboard-step2-animation.css`
- `js/app/main.js`
- `js/app/routes.js`

Search results also identified additional implementation areas:

- `js/data/cues.js`
- `js/game/session.js`
- `js/game/scoring.js`
- `js/game/progression.js`
- `js/services/storage.js`
- `js/components/ui.js`
- `studio/src/main.jsx`
- `studio/src/companion.js`
- `tools/pitchiq-hq-live.html`

## Repository metadata

| Field | Value |
|---|---|
| Repository | `resiliencyhq-design/PitchIQ` |
| Visibility | Public |
| Default branch | `main` |
| Current audit branch | `platform-foundation-docs` |
| Repository role | Product repository and current reference implementation |
| Long-term platform role | Temporary platform foundation until dedicated platform repository exists |

## Build and tooling inventory

`package.json` confirms this is a Vite-based project with scripts for development, Studio, and build.

| Area | Finding | Status |
|---|---|---|
| Runtime type | ES modules via `"type": "module"` | Active |
| Main app dev server | `npm run dev` → `vite` | Active |
| Studio run script | `npm run studio` → `vite --open /studio/` | Active |
| Build | `npm run build` → `vite build` | Active |
| Dependencies | React, React DOM, Puck, Moveable, TypeScript, Vite | Mixed app/studio support |

### Audit note

The production app is primarily vanilla/static JavaScript, while Studio uses React/Puck-related dependencies. This reinforces the need to keep **Production App** and **Studio** architecture documented separately.

## Top-level repository map

| Path | Purpose | Owner | Status | Notes |
|---|---|---|---|---|
| `index.html` | Production app shell and CSS/JS entry point | PitchIQ product | Active | Loads multiple CSS modules and app scripts. |
| `manifest.json` | PWA metadata | Product / release | Active | Contains product name, short name, colours, display mode. |
| `sw.js` | Service worker and cache list | Product / release | Active but needs release governance | Contains explicit cache key and asset version list. |
| `package.json` | Build and dependency configuration | Engineering | Active | Defines Vite, Studio, and build scripts. |
| `docs/` | Product and platform documentation | Mixed | Active but needs ownership labels | Existing MVP docs plus new `docs/platform`. |
| `css/` | Design tokens, layout primitives, global styles, screen CSS | Mixed product/platform | Active, needs audit | Highest priority for PF-02. |
| `js/app/` | Route rendering and orchestration | Product implementation | Active | `main.js` orchestrates state, routing, onboarding, training. |
| `js/game/` | XP, progression, scoring, session logic | Product now / platform candidate later | Active | Candidate capability layer. |
| `js/services/` | Storage, camera, voice services | Product/platform candidate | Active | Candidate shared service/capability layer. |
| `js/components/` | Shared UI utilities | Platform candidate | Active | Should be expanded into component architecture. |
| `js/data/` | Cues, rewards, drills | Product content / capability candidate | Active | Needs content/capability audit. |
| `assets/` | Brand, artwork, controls, onboarding, Home assets | Mixed | Active, needs asset governance | PF-05 priority. |
| `tools/` | HQ, roadmap, review, validation, release tools | Platform/HQ candidate | Active | Should be governed separately from product screens. |
| `studio/` | Studio editor / React/Puck area | Platform candidate | Active | Should be treated as its own platform subsystem. |
| `src/` | TypeScript source, including scoring engine | Transitional / review | Needs audit | Potential duplication with `js/game/scoring.js`. |

## Documentation inventory

| Path | Purpose | Status | Recommended home |
|---|---|---|---|
| `docs/ARCHITECTURE.md` | High-level repository architecture | Operational | Keep in PitchIQ, cross-reference platform standards. |
| `docs/CONTEXT.md` | Product mission, philosophy, MVP rules | Canonical product context | Keep in PitchIQ product docs. |
| `docs/MVP_STATUS.md` | MVP stage and current status | Operational | Keep in PitchIQ product docs. |
| `docs/SPRINT_4_2_1_DEPENDENCY_AUDIT.md` | Prior sprint/dependency audit | Reference | Keep as historical sprint reference. |
| `docs/SPRINT_4_2_STABILISATION_AUDIT.md` | Prior stabilisation audit | Reference | Keep as historical sprint reference. |
| `docs/sprint-4.3-pre-implementation-plan.md` | Sprint planning | Reference | Keep as sprint archive. |
| `docs/platform/README.md` | Platform foundation index | Draft operational | Temporary home until platform repo exists. |
| `docs/platform/PLATFORM_REPOSITORY_ARCHITECTURE.md` | Repository/documentation architecture | Draft operational | Platform repo later. |
| `docs/platform/PLATFORM_STANDARD_SEED.md` | WPS hierarchy and governance seed | Draft operational | Platform repo later. |
| `docs/platform/PLATFORM_AUDIT_1_0.md` | Audit programme blueprint | Draft operational | Platform repo later. |
| `docs/platform/PLATFORM_WORK_ASSIGNMENT_MAP.md` | Maps prior platform work to correct homes | Draft operational | Platform repo later. |
| `docs/platform/sprints/SPRINT_PF_01_REPOSITORY_AUDIT.md` | PF-01 sprint plan | Draft operational | Keep while executing PF audit. |

### Documentation findings

- Existing product docs clearly prioritise the Academy Journey and MVP completion.
- The new platform docs are correctly isolated under `docs/platform/`.
- Product docs and platform docs should remain separate.
- Full Canon/Word/PDF-style material should not permanently live inside PitchIQ.
- A future `docs/adr/` or platform-level `Decision-Records/` location is needed.

## CSS architecture inventory

### CSS entry points loaded by `index.html`

`index.html` currently loads the following CSS modules:

| CSS file | Purpose | Ownership | Status |
|---|---|---|---|
| `css/style.css` | Main/global app styling | Mixed | Active; high complexity. |
| `css/onboard-step1-lock.css` | Locked Step 1 layout | Product screen lock | Active. |
| `css/onboard-step2-lock.css` | Step 2 lock/base | Product screen lock | Active. |
| `css/onboard-step2-tactical-web.css` | Tactical web visuals | Football component/pattern | Active. |
| `css/splash-fit.css` | Landing/splash fit | Product screen | Active. |
| `css/onboarding-fix.css` | Onboarding fixes | Product screen | Active; review for consolidation. |
| `css/academy-hero-asset.css` | Academy hero asset styling | Product/design | Active. |
| `css/visual-layout-studio.css` | Visual layout studio styles | Studio/platform | Active. |
| `css/onboard-step2-spawn.css` | Step 2 spawn behaviour | Motion/pattern | Active. |
| `css/onboard-step2-final-polish.css` | Step 2 final polish | Product screen polish | Active; review for consolidation. |
| `css/onboard-step2-layout.css` | Step 2 layout | Product/pattern | Active. |
| `css/onboard-step2-marker.css` | Marker component styling | Platform component candidate | Active; high priority. |
| `css/onboard-step2-web.css` | Step 2 web/tactical layer | Football pattern | Active. |
| `css/onboard-step2-animation.css` | Step 2 animation | Motion/pattern | Active. |

### Foundational CSS files

| File | Finding | Platform relevance |
|---|---|---|
| `css/tokens.css` | Contains first-generation tokens for background, surface, panel, colours, radii, shadow, glow, and safe bottom. | High. Start PF-02 here. |
| `css/layout-system-v2.css` | Defines mobile max width, app padding, section gaps, hero gaps, type sizes, layout primitives. | High. Candidate platform layout standard. |
| `css/style.css` | Imports tokens/layout and contains broad global styling plus screen-specific styling. | High complexity; needs later decomposition. |

### CSS findings

- The codebase already has a seed token system and a layout system.
- Step 2 has been modularised into layout, marker, web, and animation CSS, which aligns well with platform principles.
- There are still many screen lock/polish files, which are useful for MVP stability but should be reviewed for consolidation later.
- `!important` usage is likely high in lock files; acceptable short-term, but a technical-debt item for later architecture cleanup.

## JavaScript architecture inventory

| Path | Purpose | Owner | Status |
|---|---|---|---|
| `js/app/main.js` | App orchestration, routing, state binding, onboarding/training logic | Product implementation | Active; central file. |
| `js/app/routes.js` | Screen rendering templates and route names | Product implementation | Active; may need future decomposition. |
| `js/app/onboard-step2-spawn.js` | Onboarding Step 2 marker spawn behaviour | Product/pattern | Active; motion/component candidate. |
| `js/app/onboard-haptics.js` | Haptic feedback | Capability candidate | Active. |
| `js/app/onboard-tactical-web.js` | Tactical web behaviour | Football pattern candidate | Active. |
| `js/dev/visual-layout-studio.js` | Dev visual layout tooling | Studio/platform tooling | Active. |
| `js/dev/dev-floating-panels.js` | Dev floating panels | Tooling | Active. |
| `js/components/ui.js` | Shared UI utilities | Platform candidate | Active. |
| `js/game/progression.js` | XP/progression logic | Capability candidate | Active. |
| `js/game/session.js` | Training session logic | Product/capability candidate | Active. |
| `js/game/scoring.js` | Scoring logic | Product/capability candidate | Active. |
| `js/services/storage.js` | Persistence/state storage | Platform service candidate | Active. |
| `js/services/camera.js` | Camera service | Future capability | Active but likely out of current MVP scope. |
| `js/services/voice.js` | Voice service | Future capability | Active but likely out of current MVP scope. |
| `js/data/cues.js` | Training cue content | Product content/capability | Active. |
| `js/data/rewards.js` | Rewards/career/achievements | Product content/capability | Active. |
| `js/data/drills.js` | Drill recommendations/data | Product content/capability | Active. |
| `src/game/scoringEngine.ts` | TypeScript scoring engine | Review | Potential parallel/duplicate scoring path. |
| `studio/src/main.jsx` | Studio app entry | Platform/studio | Active. |
| `studio/src/companion.js` | Studio companion logic | Platform/studio | Active. |
| `studio/src/typography-controls.js` | Studio typography controls | Platform/studio | Active. |

### JavaScript findings

- `main.js` is the central orchestration point and currently owns many responsibilities: routing, app shell, onboarding, training, dev panel, persistence synchronization, and training state.
- `routes.js` contains significant rendering logic and should be considered a future decomposition candidate.
- Game/session/progression/data/services already map naturally to future platform capabilities.
- Studio should be documented as a separate subsystem, not treated as part of the player app.
- `src/game/scoringEngine.ts` should be reviewed against `js/game/scoring.js` to determine whether it is canonical, experimental, or stale.

## Asset folder inventory seed

The service worker cache list provides a useful first asset inventory seed.

| Asset area | Examples identified | Status |
|---|---|---|
| `assets/brand/` | `logo.svg`, `welltrack-performance-logo.png` | Brand assets; needs logo governance. |
| `assets/controls/` | `your-name.png`, `continue-button.png`, `enter-academy.png`, `swipe-bar.png`, `swipe-ball.png` | Control/UI assets; needs canonical status. |
| `assets/onboarding/` | `position-marker-grey.png`, `position-marker-active.png`, `position-pitch.png`, `position-pitch-inactive.png`, `position-pitch-active.png`, `name-person-icon.png-v2.png` | High-priority PF-05 audit area. |
| `assets/backgrounds/` | `onboarding-background-V1.png`, `splash-poster.png` | Backgrounds; needs lifecycle/versioning. |
| `assets/Home/` | `hero-home-bg.png`, `player-profile-card-skin.png` | Home screen assets; needs naming convention. |
| `assets/art/` | `stadium-hero.svg` identified through CSS | Shared artwork candidate. |

### Asset findings

- Asset governance is required before expansion.
- Onboarding pitch and marker assets should be the first PF-05 focus because several variants exist.
- Asset naming currently mixes lower-case, camel/capitalised folders, and version suffixes.
- A canonical/deprecated/experimental status field is needed.

## Product versus platform ownership

| Area | Current home | Recommended ownership |
|---|---|---|
| Academy Journey docs | `docs/CONTEXT.md`, `docs/MVP_STATUS.md` | PitchIQ product. |
| Design tokens | `css/tokens.css` | Platform candidate. |
| Layout primitives | `css/layout-system-v2.css` | Platform candidate. |
| Position Marker | Step 2 CSS/JS and route markup | Platform component candidate. |
| Training XP/progression | `js/game/` | Product now; capability candidate later. |
| Storage | `js/services/storage.js` | Platform service candidate. |
| Camera/voice | `js/services/` | Future capability; current scope caution. |
| Studio | `studio/`, `js/dev/`, `css/visual-layout-studio.css` | Platform subsystem. |
| HQ/tools | `tools/` | Platform management candidate. |
| Platform Canon/WPS | `docs/platform/` temporarily | Dedicated platform repo later. |

## Technical debt seed

| Finding | Area | Severity | Recommended follow-up |
|---|---|---|---|
| Multiple Step 2 CSS files | CSS/onboarding | Medium | Consolidation review after MVP lock. |
| `style.css` contains global + screen-specific CSS | CSS architecture | Medium | Split into base/components/screens over time. |
| Cache list includes explicit versioned paths | Release/service worker | Medium | Add release/cache-busting policy. |
| Asset variants for pitch/markers | Assets/onboarding | Medium | PF-05 canonical asset review. |
| `src/game/scoringEngine.ts` plus `js/game/scoring.js` | Scoring architecture | Medium | Determine canonical scoring path. |
| Docs reference `docs/MVP_BLUEPRINT.md`, but audit did not verify presence | Documentation | Medium | Confirm file exists or update references. |
| Product and platform docs currently co-located | Documentation architecture | Low/expected | Move canonical platform docs later. |
| Studio dependencies in product package | Build/dependencies | Low/medium | Document Studio dependency boundary. |

## PF-02 Token Audit inputs

PF-02 should begin with:

1. `css/tokens.css`
2. `css/layout-system-v2.css`
3. `css/style.css`
4. `css/onboard-step1-lock.css`
5. `css/onboard-step2-layout.css`
6. `css/onboard-step2-marker.css`
7. `css/onboard-step2-animation.css`
8. `css/onboard-step2-tactical-web.css`
9. `css/splash-fit.css`
10. `css/onboarding-fix.css`
11. `css/academy-hero-asset.css`
12. `css/visual-layout-studio.css`

Token categories to extract:

- Colours
- Gradients
- Typography values
- Spacing values
- Radius values
- Shadows/glows
- Motion durations/easing
- Z-index values
- Breakpoints/media queries
- Safe-area/layout values

## PF-01 exit criteria assessment

| Exit criterion | Status | Notes |
|---|---|---|
| Repository folder map created | Partial pass | High-level map created; exact tree still needs script extraction. |
| Each major folder assigned purpose | Pass | Major folders have proposed ownership. |
| Existing docs inventoried | Partial pass | Key docs inventoried; full docs folder list needs local tree. |
| CSS architecture mapped | Pass for loaded/high-priority CSS | Entry CSS and major Step 1/2 files mapped. |
| JS architecture mapped | Partial pass | Core app/game/service files mapped; exact file list needs local tree. |
| Platform candidate files identified | Pass | Tokens, layout, marker, Studio, HQ, services identified. |
| Technical debt findings captured | Pass | Seed list created. |
| PF-02 inputs identified | Pass | Token audit source list created. |

## Overall PF-01 status

**Status: COMPLETE ENOUGH TO PROCEED TO PF-02 TOKEN AUDIT**

PF-01 has produced a usable repository baseline. It should be revisited later with a script-generated full repository tree, but it is sufficient to start PF-02.

## Recommended next actions

1. Add this audit result to the Platform Audit 1.0 index.
2. Start Sprint PF-02 — Token Audit.
3. Create `docs/platform/catalogues/TOKEN_CATALOGUE.md`.
4. Extract token values from `css/tokens.css` and `css/layout-system-v2.css` first.
5. Then inspect hard-coded design values in `style.css` and Step 2 CSS files.

## Open questions

- Does `docs/MVP_BLUEPRINT.md` exist and remain canonical?
- Is `src/game/scoringEngine.ts` actively used or historical?
- Which pitch/marker assets are canonical after Step 2 refactor?
- Should Studio remain inside the PitchIQ repository during MVP, or move later?
- Should `tools/` become the future HQ repository?
