# Sprint R1 — Results Screen Redesign

## Status
Prepared for implementation.

## Objective
Replace the current Results presentation with a premium, coach-feedback-led Football IQ results screen while preserving the existing Results route, navigation, scoring, profile evidence, XP, level and reward architecture.

## Approved visual reference
Use the approved Option 2 coach-feedback layout as the visual benchmark, with one binding change: **no player avatar or player portrait**.

The reference informs hierarchy, dark stadium atmosphere, neon lime accents, rounded cards and premium academy styling. It is not a licence to introduce unsupported or decorative metrics.

## UX hierarchy
1. Results header
2. Hero: Great Session + Football IQ score + relative performance status
3. Coach Says card
4. Key Stats card
5. Skill Development card
6. Level & Progress card
7. Next Unlock card
8. Existing bottom navigation

## Content rules
- Football IQ is the primary visual element.
- Coach feedback appears immediately beneath the hero.
- Show no player avatar, coach portrait or human illustration.
- Coach feedback may contain up to two strengths and one next-focus cue.
- Use live, defensible data where available.
- Unsupported values must use a neutral fallback rather than invented precision.
- Preserve evidence-state behaviour: do not display a definitive overall score until the scoring model marks it eligible.
- Preserve empty and building-profile states.

## Approved hero
- Label: `WELL DONE, {PLAYER NAME}!` when a name is available; otherwise `WELL DONE!`
- Heading: `Great Session!`
- Primary value: Football IQ score, or an evidence-building state when unavailable
- Relative status: compare to prior eligible result only when a valid comparison exists
- Background: dark stadium or abstract tactical field atmosphere
- No avatar, portrait or player illustration

## Coach Says
One premium card containing:
- Up to two positive observations derived from the strongest eligible evidence
- One next-focus cue derived from the weakest eligible evidence or current coaching recommendation
- Short closing encouragement

Do not show a coach portrait. Use a quotation or coaching icon only.

## Key Stats
Maximum four compact metrics. Prefer existing real values such as:
- Accuracy
- Reaction or response time, only when available
- Combo or streak
- XP earned or current session XP

Fallbacks must be `—`, `Building`, or another transparent state. Do not fabricate values.

## Skill Development
- Five Football IQ dimensions may be displayed when the screen can scroll naturally.
- Prefer the existing evidence-backed constructs: Awareness, Game Reading, Decision Quality, Adaptability and Use of Space.
- A radar chart is permitted only when it remains readable and uses real eligible scores.
- Ineligible constructs should be visibly marked as building evidence.

## Level & Progress
Reuse the canonical progression architecture:
- Current level
- Current XP
- XP required for next level
- Progress bar

## Next Unlock
Show one canonical reward or unlock where available. If the reward engine has no eligible reward, show a transparent next-step card rather than inventing an item.

## Technical constraints
- Reuse the existing `#results` route.
- Preserve bottom-nav ownership and active Results state.
- Preserve existing profile storage and evidence gating.
- Avoid a second route owner or competing mutation observer.
- Consolidate the current results renderers rather than layering another results component over them.
- The existing training snapshot must be audited and either integrated into Key Stats or retired from Results to avoid duplicate metrics.
- No backend schema changes in R1 unless an audit proves a small adapter is essential.

## Likely implementation files
- `src/results/football-iq-results.js`
- New isolated Results stylesheet, proposed: `css/results-coach-feedback-r1.css`
- `index.html` for stylesheet cache key only
- `js/app/training-snapshot-results-h30.js` only if required to consolidate duplicate ownership
- Tests or validation fixtures related to Results rendering

## Implementation sequence
### R1.1 — Architecture audit and consolidation
- Trace every Results route owner and mutation observer.
- Confirm which renderer is canonical for standard Results and Football IQ profile Results.
- Identify duplicate metric injection from the H30 training snapshot.
- Record the safe consolidation approach before layout changes.

### R1.2 — Static structure
- Implement the new semantic card hierarchy.
- Preserve empty, building and complete states.
- Add no motion yet.

### R1.3 — Live-data mapping
- Map eligible Football IQ score and dimensions.
- Map training metrics, XP and level.
- Map coach strengths and next-focus cue.
- Add explicit fallbacks for missing evidence.

### R1.4 — Visual polish
- Add stadium/tactical background treatment.
- Match approved hierarchy, spacing, typography, borders, shadows and lime accents.
- Confirm no avatar or portrait remains.

### R1.5 — Motion
- Score reveal/count-up only for eligible numeric scores.
- Subtle hero glow.
- Coach card and lower cards reveal progressively.
- XP bar fill.
- Respect `prefers-reduced-motion`.

### R1.6 — Regression audit
Validate:
- Home → Results
- Training completion → Results
- Results → Home
- Results → Development, if retained
- Bottom-nav state and position
- Empty profile
- Building profile
- Complete profile
- iPhone viewport and safe areas
- No duplicate Training Snapshot card
- No score shown when evidence is insufficient

## Acceptance criteria
- Approved Option 2 visual direction is recognisable.
- No player avatar, player portrait, coach avatar or human illustration is displayed.
- Football IQ is the dominant result.
- Coach Says is the second visual priority.
- Existing data and evidence gates remain functional.
- No invented precision or unsupported metrics are presented.
- No duplicate Results route owner or duplicated stat section is introduced.
- Bottom navigation remains fixed, correctly positioned and functional.
- Screen is clean and readable on the target iPhone viewport; natural scrolling is acceptable for the full approved reference layout.
- Reduced-motion users receive an equivalent static experience.

## Out of scope
- AI-generated coaching text service changes
- New scoring algorithms
- New reward economy
- New player/avatar image generation
- Backend migrations
- Redesign of Home, Train, Lab or Profile

## Product lock
This sprint is approved to proceed from audit to implementation. Merge remains a separate approval gate after visual and regression review.
