# Sprint 21.4 — Assessment and Benchmarks

## Purpose

Add measurable Football IQ benchmarking to the existing mission, module, adaptive-coach and season-curriculum layers without changing the native mission runtime.

## Delivered

- overall Football IQ benchmark score;
- Foundation, Developing, Advanced and Elite performance bands;
- Starter, Bronze, Silver and Gold badge states;
- strengths derived from module scores at or above 70%;
- development priorities derived from the lowest module scores;
- four phase benchmark checkpoints;
- passed, ready, in-progress and locked checkpoint states;
- current phase and season-progress summary;
- automatic recalculation after persistent progress events;
- responsive iPhone presentation;
- regression coverage.

## Data source

The assessment model reads only the existing Football IQ progress store, module snapshots and season curriculum. It does not duplicate mission completion, personal-best, XP or mastery state.

## Architecture safety

- no runtime adapter changes;
- no scoring-engine changes;
- no route or bottom-navigation changes;
- no new persistent storage key;
- no changes to Home, Results or Player architecture;
- locked missions continue to be excluded through existing module and curriculum snapshots.

## Acceptance checks

- benchmark changes when mission personal bests change;
- strengths and priorities are derived from live module progress;
- phase checkpoints reflect curriculum status;
- dashboard refreshes on `pitchiq:football-iq-progress`;
- narrow iPhone layout remains readable.
