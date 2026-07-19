# Sprint 22.3 — Vision Module Expansion

## Purpose

Expand Vision into a complete three-mission Football IQ learning pathway using the Sprint 22.0 content contract and existing platform architecture.

## Module objective

Help players recognise developing patterns, weak-side opportunities and overloads before those options become obvious.

## End-state competency

The player recognises how the picture is developing, identifies valuable options beyond the immediate action, and anticipates where an advantage will emerge.

## Mission pathway

### 1. Foundation — Predict the Next Play

**Learning behaviour:** Read movement, shape and passing cues to identify the most likely next action before it begins.

**Primary focus:** See what the picture is becoming.

### 2. Developing — See the Weak Side

**Learning behaviour:** Recognise valuable space and options away from the immediate ball action.

**Primary focus:** Look where the defence is not looking.

### 3. Advanced — Spot the Overload

**Learning behaviour:** Recognise meaningful numerical or positional advantages and update the preferred option as defenders move.

**Primary focus:** Find where your team has the advantage.

## Stable mission IDs

- `predict-next-play`
- `see-weak-side`
- `spot-overload`

The existing `predict-next-play` ID remains unchanged for stored progress, recommendations and route compatibility.

## Content contract

Each mission includes:

- Vision category;
- Foundation, Developing or Advanced stage;
- difficulty, XP and duration;
- player-facing description and objectives;
- coaching prompt;
- success indicators;
- recognition, timing and decision-quality assessment criteria;
- common mistakes;
- before, during and after feedback;
- real-match transfer question;
- existing training launch route compatibility.

## Runtime approach

All three missions resolve through the existing generic runtime fallback.

The repository contains an older native adapter key named `predict-next`, but the live library mission uses the stable ID `predict-next-play`. This sprint does not rename either ID or modify shared runtime architecture. Native adapter alignment, if required later, must be handled as a separately approved technical sprint with compatibility tests.

## Architecture guardrails

This sprint does not redesign:

- mission lifecycle or runtime architecture;
- persistence or stored progress;
- XP and Academy level logic;
- adaptive recommendations;
- module routing;
- curriculum or benchmark engines;
- home or bottom navigation.

## Acceptance criteria

Sprint 22.3 is complete when:

- Vision contains exactly three core missions;
- stages are ordered Foundation, Developing and Advanced;
- each mission satisfies the Sprint 22.0 content contract;
- the existing `predict-next-play` identity remains compatible;
- all three missions appear through the Vision module data source;
- all three resolve safely through the documented fallback;
- module progress aggregates three available missions and sixteen minutes;
- focused tests cover mission count, stages, metadata, aggregation and runtime resolution;
- no unrelated architecture or UI files change.

## Verification

1. Run the Vision expansion test.
2. Run existing module, progression, curriculum and assessment tests.
3. Confirm Vision reports three missions in the correct order.
4. Confirm each mission launches through the training route without a missing registry error.
5. Confirm other modules and existing mission IDs remain unchanged.
