# Sprint 4.1 — UX Refactor Patch

Built from the known-good 42a03cd repository.

Changes:
- Preserved existing architecture, index.html, routing style, storage, camera and voice services.
- Reduced scrolling by changing Training into a guided hub.
- Added Choose Drill and Training Preview screens without replacing the app shell.
- Moved Analytics into tab-style hub/detail screens: Overview, Radar, Heatmap, Coach, Parent.
- Clarified rewards with locked/earned messaging and progress steps.
- Improved Career into a compact vertical mobile ladder.
- Added mobile-first CSS to fit major features in the first viewport.

Remaining:
- Live session is still the existing training engine, not a full new native game scene.
- Reward animation remains lightweight.
- Further work should be Sprint 5.0 AAA Production Polish.
