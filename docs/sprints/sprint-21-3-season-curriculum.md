# Sprint 21.3 — Football IQ Season Curriculum

## Purpose

Sequence the existing Football IQ modules into a clear 12-week development pathway while preserving the adaptive mission and runtime architecture.

## Curriculum

1. **Foundation — Weeks 1–3**
   - Awareness
   - Scanning
2. **Read the Game — Weeks 4–6**
   - Vision
   - Anticipation
3. **Act Early — Weeks 7–9**
   - Decision Making
   - Positioning
4. **Lead the Picture — Weeks 10–12**
   - Communication

## Behaviour

- Curriculum progress is calculated from the existing persistent mission progress store.
- Each phase displays completion, mastery score, duration and current status.
- The first incomplete phase becomes the current phase.
- A phase is complete when all currently unlocked missions are completed with an average score of at least 70%.
- Locked missions remain excluded until the player reaches the required Academy level.
- The season pathway refreshes automatically after mission completion.

## Architecture safety

- No mission runtime adapter changes.
- No scoring changes.
- No navigation or bottom-bar changes.
- No duplicate mission state.
- The curriculum references existing module and mission IDs.

## Acceptance criteria

- All seven modules appear once within the four-phase pathway.
- New players begin in Foundation.
- Progress survives app restart through the existing progress store.
- Current phase updates after mission progress events.
- Completed seasons display 100% and four completed phases.
- Layout remains usable on narrow iPhone widths.
