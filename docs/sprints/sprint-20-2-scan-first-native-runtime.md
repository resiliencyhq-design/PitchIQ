# Sprint 20.2 — Scan First Native Runtime

## Purpose

Make `Scan First` the first adaptive Football IQ mission to control the live cue task through the mission capability architecture.

## Delivered

- native `scan-first-v1` session adapter;
- deterministic scan/action cue sequence;
- scan-specific evidence weighting;
- accuracy and reaction scoring contract;
- session metadata for mission, adapter and scoring profile;
- safe fallback to the existing generic drill engine for unimplemented missions;
- regression coverage for selection, sequencing, scoring and fallback behaviour.

## Runtime behaviour

`Scan First` now uses this repeating structure:

1. CHECK / scan cue;
2. actionable colour or direction cue;
3. CHECK / scan cue;
4. next actionable cue.

This is deliberately different from the previous random generic cue pool and reinforces the football habit of scanning before acting.

## Scope boundary

This sprint does not claim that the other nine missions are implemented. They continue to use the explicit generic fallback until their own native adapters are built.

Reaction scoring is defined in the adapter contract. A later evidence-persistence slice can store the calculated mission score alongside the existing session result payload without changing the adapter architecture.
