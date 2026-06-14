# PitchIQ Engineering

## Purpose
Engineering implements approved product decisions safely.

## Rules
- Do not change routing unless approved.
- Do not change XP, rewards, scoring, training, storage, app shell, or bottom navigation unless approved.
- Modify exactly one target area per sprint unless shared components require otherwise.
- Prefer CSS/design-system primitives.
- Keep diffs minimal and reviewable.
- Runtime review is required for UI or behaviour changes.

## Runtime Review Checklist
- App loads normally.
- Target screen renders.
- No console errors.
- No horizontal scrolling.
- App shell and bottom navigation stable.
- No unrelated files changed.

## Merge Rule
Do not merge until CTO Runtime Review passes.
