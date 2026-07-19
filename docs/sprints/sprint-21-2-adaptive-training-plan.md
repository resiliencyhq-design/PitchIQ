# Sprint 21.2 — Adaptive Training Plan

## Objective

Turn persistent Football IQ progress into a clear, player-specific sequence of next missions.

## Scope

- rank unlocked missions using completion, personal best, attempts, recency, module balance and XP opportunity;
- identify the player's current priority module;
- generate a three-mission adaptive training plan with total training time;
- explain why the priority and each mission were selected;
- show the plan in the Football IQ library;
- show a focused coaching recommendation inside each module;
- retain the existing Home recommendation and mission launch flow.

## Architecture

The recommendation layer reads the existing mission registry and persistent progression store. It does not modify native runtimes, scoring algorithms or navigation.

`progress store -> adaptive plan -> library/module coaching UI -> existing mission detail -> existing training route`

## Acceptance criteria

- recommendations use actual saved mission results;
- lower personal-best scores receive improvement priority;
- untrained and under-trained modules are surfaced;
- locked missions remain excluded;
- the plan recalculates after every mission completion;
- the player sees a rationale, ordered mission sequence and estimated duration;
- module pages receive a contextual Coach Focus card;
- existing Home, Results, Player and bottom navigation remain unchanged.

## Verification

Regression tests cover plan generation, low-score prioritisation and locked-mission exclusion.