# Sprint 21.1 — Module Progress and Mastery

## Objective

Connect the Football IQ module experience to persistent player mission results so completion, attempts, personal bests, recency, mastery and continue-training state reflect real use.

## Changes

- Hydrates mission display state from `pitchiq.footballIq.progress.v1`.
- Records the selected mission before handing off to the existing Training route.
- Uses the existing `pitchiq:mission-complete` event to update attempts, best score, completion, XP and last-played time.
- Calculates module mastery from personal-best performance across currently unlocked missions.
- Excludes locked missions from module completion and mastery totals.
- Adds four mastery bands: Foundation, Developing, Strong and Mastered.
- Selects Continue Training by prioritising incomplete missions, then the lowest score and least-recently trained mission.
- Refreshes library, module and mission-detail screens when progress changes.
- Displays live Academy level and relative last-trained information.

## Architecture safety

- No native mission runtime adapters were changed.
- No scoring algorithms were changed.
- No Home, Results, Player or bottom-navigation behaviour was changed.
- Existing local-storage progress schema remains compatible.
- Existing mission launch continues through the Training route.

## Acceptance criteria

- Attempts increment after every completion.
- Personal best never decreases.
- Last-trained state updates after completion.
- Progress survives app restart through local storage.
- Locked missions are excluded from module totals.
- Continue Training is based on actual player history.
- Module pages update automatically after a mission result.
