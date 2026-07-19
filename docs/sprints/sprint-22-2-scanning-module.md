# Sprint 22.2 — Scanning Module Expansion

## Purpose

Expand Scanning into a complete three-mission learning pathway using the Sprint 22.0 content contract and the existing mission runtime architecture.

## Module objective

Help players gather relevant information repeatedly before receiving, while moving, and immediately after possession changes.

## End-state competency

The player scans early and more than once, updates the picture as pressure and support change, and uses the information to prepare an appropriate next action.

## Mission pathway

### 1. Foundation — Scan Before Receiving

**Mission ID:** `scan-before-receive`

**Learning behaviour:** Check both shoulders before the ball arrives and use the information to prepare the first action.

**Primary focus:** Look before the ball arrives.

### 2. Developing — Scan While Moving

**Mission ID:** `scan-while-moving`

**Learning behaviour:** Continue gathering and updating information while moving into support or receiving positions.

**Primary focus:** Move, check, update.

### 3. Advanced — Scan During Transition

**Mission ID:** `transition-scan`

**Learning behaviour:** Scan immediately when possession changes to identify the first attacking opportunity or defensive threat.

**Primary focus:** When possession changes, scan first.

## Runtime strategy

- `scan-before-receive` uses the approved generic fallback because no mission-specific native adapter exists for that stored mission ID.
- `scan-while-moving` uses the approved generic fallback.
- `transition-scan` reuses the existing native transition-scan adapter and scoring profile.
- Existing mission IDs, runtime contracts and stored progress are preserved.

## Content requirements

Every mission includes:

- stable mission ID;
- Scanning category;
- Foundation, Developing or Advanced stage;
- difficulty, XP and duration;
- player-facing description and objectives;
- coaching prompt;
- success indicators;
- recognition, timing and decision-quality criteria;
- common mistakes;
- before, during and after coaching copy;
- real-game transfer question;
- compatible training launch route;
- explicit runtime mode.

## Architecture guardrails

This sprint does not redesign:

- mission lifecycle;
- shared mission runtime;
- progression persistence;
- XP or Academy levels;
- adaptive recommendations;
- module routing;
- curriculum or benchmark engines;
- home or bottom navigation.

## Acceptance criteria

Sprint 22.2 is complete when:

- Scanning contains exactly three core missions;
- stages are ordered Foundation, Developing and Advanced;
- each mission satisfies the Sprint 22.0 content contract;
- all three appear through the existing Scanning module aggregation;
- each mission resolves through a native or documented fallback runtime;
- the existing `transition-scan` native adapter remains unchanged;
- progress, mastery, recommendations, curriculum and benchmarks remain compatible;
- focused regression tests cover count, stage order, metadata, aggregation and runtime resolution;
- no unrelated UI or architecture files change.

## Verification plan

1. Run the Scanning expansion tests.
2. Run existing Football IQ module, curriculum and progression tests.
3. Confirm Scanning reports three available missions and 15 total minutes.
4. Confirm each mission resolves by ID and category.
5. Confirm `transition-scan` remains native.
6. Confirm the two new pathway entries use documented generic fallback.
7. Confirm the other six modules and existing routes remain unchanged.
