# PitchIQ Academy Orientation

**Version:** 1.0  
**Status:** Approved experience specification  
**Parent architecture:** `docs/architecture/PITCHIQ_APP_FLOW.md`

## Purpose

Academy Orientation is the player's first guided experience after identity creation.

It is not a formal assessment and must not feel like a test, trial or gatekeeping activity. Its purpose is to welcome the player, socialise them into PitchIQ Academy, introduce the coach and app tools, and build confidence before Home.

The intended player reaction is:

> That was fun. I know how this works. Let's play.

## Product boundary

Academy Orientation:

- belongs to Phase 1 — Join the Academy;
- introduces camera, audio and core interaction patterns;
- uses short, forgiving, game-like activities;
- may capture device-readiness and calibration information;
- may award introductory XP or a completion badge;
- does not generate or modify formal Football IQ scores;
- does not determine whether the player is good enough to enter the Academy.

The formal Football IQ Assessment remains a separate Phase 2 experience launched after Home through Discover Your Game.

## Experience principles

Every Orientation activity should:

1. teach one app feature or interaction;
2. take approximately 20–40 seconds;
3. celebrate completion rather than grade performance;
4. avoid visible pass/fail states;
5. provide a safe fallback when camera, audio or permissions are unavailable;
6. use football language and game-like feedback;
7. preserve the player's momentum from identity creation into Academy entry.

## Locked first-launch sequence

1. Identity Complete
2. Welcome to the Academy
3. Meet Your Coach
4. Camera Finder
5. Quick Reaction Challenge
6. Orientation Complete
7. Academy Accepted
8. Choose Avatar
9. Home

## Screen specifications

### 1. Welcome to the Academy

**Purpose:** Introduce the chapter and explain what is about to happen without presenting it as a test.

**Recommended copy:**

- Kicker: `Welcome to PitchIQ Academy`
- Heading: `Let's Get You Match Ready`
- Body: `Meet your coach, learn the PitchIQ tools and play a few quick challenges.`
- CTA: `Enter the Academy →`

The existing player identity strip should remain visible and continue to show the selected name, squad number and position.

The preview should communicate:

- Meet Your Coach
- Learn the Camera
- Play Mini Challenges

### 2. Meet Your Coach

**Purpose:** Introduce audio guidance and explain that the coach provides cues during training.

The player should be able to play or replay a short welcome message. A visual cue must be available when audio is muted or unavailable.

**Example coach message:**

> Welcome. I'll guide you through each challenge. Listen for my call.

**CTA:** `I can hear you →`

### 3. Camera Finder

**Purpose:** Introduce camera permission, phone positioning and framing as a playful setup challenge.

**Recommended framing:**

- Heading: `Help PitchIQ Find Your Training Space`
- Prompt: `Point the camera toward the ground and step back until the frame lights up.`

Suggested feedback states:

- Searching
- Almost there
- More light needed
- Space found

Camera denial or failure must not trap the player. A clear continue-without-camera path must remain available.

### 4. Quick Reaction Challenge

**Purpose:** Introduce audio-led or visual interaction through a lightweight football-themed game.

An MVP challenge may use three targets and ask the player to tap left, centre or right in response to a coach cue. It should use only a few rounds and provide encouraging feedback.

No Football IQ score is produced.

### 5. Orientation Complete

**Recommended copy:**

- Kicker: `Orientation complete`
- Heading: `YOU'RE READY`
- Body: `You know the tools. Your coach is ready. Welcome to PitchIQ Academy.`
- CTA: `Continue →`

The player may receive introductory XP or an Orientation badge. This reward must be clearly separate from formal assessment scoring.

### 6. Academy Accepted

Academy Accepted remains the ceremonial conclusion to Phase 1. It signifies belonging and completion of the welcome journey, not passing a performance threshold.

Recommended language should celebrate readiness and membership rather than claiming the player earned admission through assessment performance.

## Narrative rules

Phase 1 player-facing copy must not use:

- assessment;
- trial;
- test;
- pass or fail;
- prove yourself;
- earn your place through performance;
- Football IQ score or profile language.

Preferred language includes:

- Orientation;
- welcome;
- get ready;
- meet your coach;
- learn the tools;
- mini challenge;
- warm-up;
- camera finder;
- ready for the Academy.

Internal legacy route and file names may remain temporarily during controlled migration, provided they do not leak into the player-facing experience.

## Data and scoring boundary

Orientation may record:

- permission status;
- camera availability;
- audio availability;
- framing readiness;
- device responsiveness;
- whether the player understood the interaction;
- Orientation completion state.

Orientation must not:

- create construct scores;
- alter Football IQ scores;
- create a formal strengths profile;
- classify play style or archetype;
- substitute for formal assessment evidence.

## Completion and fallback states

The future authoritative journey model should distinguish:

- `academy_orientation_not_started`
- `academy_orientation_in_progress`
- `academy_orientation_complete`
- `academy_joined`

Camera or audio failure may be recorded as an availability state but must not prevent Orientation completion.

## Implementation stages

### Sprint 11A — Narrative and route simplification

- replace Phase 1 assessment language;
- remove the assessment-selection menu;
- introduce the guided Orientation preview;
- preserve current internal routes and completion wiring;
- preserve Academy Accepted, Avatar and Home transitions.

### Sprint 11B — Orientation micro-games

- add coach/audio familiarisation;
- add camera finder and permission fallback;
- add one lightweight reaction challenge;
- record Orientation completion separately from formal scoring.

## Acceptance criteria

- No player-facing assessment or trial terminology remains in Phase 1.
- No wording implies performance determines Academy admission.
- The player identity strip remains accurate.
- The experience previews coach, camera and mini challenges.
- Academy Accepted remains reachable.
- Avatar selection still leads reliably to Home.
- Existing returning-player startup remains unchanged.
- No formal Football IQ score is created or modified.
- The experience remains usable on a real iPhone.

## Governance

This document is authoritative for the Academy Orientation experience. Changes to its purpose, scoring boundary or place in the player journey require Product Owner approval and a version update.