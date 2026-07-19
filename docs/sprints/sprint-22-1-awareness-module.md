# Sprint 22.1 — Awareness Module Expansion

## Purpose

Deliver the first complete three-mission Football IQ learning pathway using the locked Sprint 22.0 content contract and existing platform architecture.

## Module objective

Help players notice teammates, opponents and useful space beyond the immediate ball action before the game demands a decision.

## End-state competency

The player maintains awareness of multiple relevant players and spaces, identifies options beyond the ball, and recognises how the next pass may change the picture.

## Mission pathway

### 1. Foundation — Find the Third Player

**Learning behaviour:** Look beyond the nearest passing option and identify the player who becomes available after the next pass.

**Primary focus:** See the next connection, not only the first pass.

**Success indicators:**
- identifies the third-player option;
- notices when the direct lane is blocked;
- responds before the passing lane closes;
- repeats the correct recognition across scenarios.

### 2. Developing — See Beyond the Ball

**Learning behaviour:** Shift attention away from the immediate ball action to recognise off-ball movement, support and emerging space.

**Primary focus:** Check what is changing away from the ball.

**Success indicators:**
- identifies a relevant off-ball movement cue;
- distinguishes useful movement from distraction;
- recognises the space created by player movement;
- selects the best emerging option consistently.

### 3. Advanced — Track Three Players

**Learning behaviour:** Maintain awareness of three relevant players while the ball and pressure picture changes.

**Primary focus:** Keep the ball, pressure and support picture connected.

**Success indicators:**
- tracks three relevant players across a changing sequence;
- identifies which movement changes the next action;
- updates the preferred option when pressure changes;
- responds accurately within a shorter decision window.

## Mission content requirements

Each mission must define:
- stable mission ID;
- Awareness category;
- progression stage;
- difficulty, XP and duration;
- player-facing description;
- at least three objectives;
- coaching prompt;
- success indicators;
- recognition, timing and decision-quality assessment criteria;
- common mistakes;
- before, during and after coaching copy;
- real-game transfer question;
- launch compatibility with the current mission runtime.

## Proposed mission IDs

- `find-third-player`
- `see-beyond-ball`
- `track-three-players`

Existing IDs must not be renamed where they are already referenced by progression, runtime, tests or stored player data.

## Technical scope

Expected implementation areas:
- Awareness mission definitions;
- module mission list and progression metadata;
- launch and fallback compatibility;
- adaptive recommendation compatibility;
- curriculum and benchmark aggregation compatibility;
- focused regression tests;
- sprint documentation.

## Architecture guardrails

This sprint must not redesign:
- the mission runtime;
- lifecycle events;
- progression persistence;
- XP or Academy level logic;
- adaptive recommendation architecture;
- module routing;
- curriculum engine;
- benchmark engine;
- home or bottom navigation.

A native adapter may only be added where the existing runtime contract supports it without changing shared architecture. Otherwise, the mission must use the approved generic fallback and document the limitation.

## Acceptance criteria

Sprint 22.1 is complete when:
- the Awareness module contains exactly three core missions;
- the missions clearly represent Foundation, Developing and Advanced progression;
- each mission satisfies the Sprint 22.0 content contract;
- all three missions appear on the Awareness module page;
- available missions launch without a broken route;
- progress, mastery, recommendations, curriculum and benchmarks still calculate correctly;
- existing mission IDs and stored progress remain compatible;
- tests cover mission count, progression stages, metadata completeness and launch compatibility;
- no unrelated UI or architecture files are changed.

## Verification plan

1. Run the Football IQ module and progression tests.
2. Confirm Awareness reports three missions.
3. Confirm each mission resolves by ID and category.
4. Confirm mission stages are ordered Foundation, Developing and Advanced.
5. Launch each available mission and verify native or documented fallback runtime resolution.
6. Complete a mission and confirm progress refreshes without errors.
7. Confirm other six modules and existing mission routes are unchanged.
