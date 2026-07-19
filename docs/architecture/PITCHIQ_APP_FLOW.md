# PitchIQ App Flow

**Version:** 1.1  
**Status:** Locked product-flow architecture  
**Scope:** Player-facing journey across onboarding, orientation, formal assessment, development, training, progression and reassessment.

## Purpose

This document is the canonical source for the intended PitchIQ player journey.

It governs the order and relationship between:

- onboarding and Academy entry;
- Academy Orientation;
- formal Football IQ assessment;
- player profile and development guidance;
- daily training and progression;
- reassessment and long-term Academy development.

Subsystem documents remain authoritative for their own scoring, evidence, profile, coaching and training rules. This document governs how those systems are presented and connected in the product experience.

## Core product model

PitchIQ is organised around three player questions:

1. **Identity — Who are you as a player?**
2. **Discovery — How do you naturally see, read and solve the game?**
3. **Development — How do you improve through repeated training and evidence?**

These questions map to three distinct phases.

---

## Phase 1 — Join the Academy

### Objective

Complete a short first-launch journey that creates player identity, socialises the player into the Academy, teaches the essential app interactions, verifies device readiness and reaches Home without overloading the player.

### Locked sequence

1. Landing
2. Name
3. Squad Number
4. Favourite Position
5. Identity Complete
6. Academy Orientation
7. Academy Accepted
8. Choose Avatar
9. Home

### Player outcome

> I am officially part of PitchIQ Academy, I know how the experience works, and I am ready to play.

### Academy Orientation purpose

The Academy Orientation is not a formal assessment and must not feel like a test or gatekeeping experience.

Its purpose is to:

- welcome and socialise the player into PitchIQ Academy;
- introduce the Academy coach, guidance style and tone;
- teach essential app interactions through play;
- introduce camera positioning and ball recognition;
- introduce audio prompts and sound cues;
- introduce simple touch, swipe, hold or movement interactions where relevant;
- verify basic device, camera and audio readiness;
- collect limited baseline or calibration information quietly;
- award early completion, XP or a welcome achievement;
- build confidence, curiosity and momentum before Home.

### Experience rule

The player should finish the Orientation thinking:

> That was fun. I know how this works. Let’s play.

The player should not finish thinking:

> I hope I passed.

### Orientation format

The Orientation should be designed as a short collection of game-like micro-challenges rather than a conventional tutorial or formal test.

Each activity should normally:

- teach one app feature or interaction;
- last approximately 20–40 seconds;
- use immediate positive feedback;
- avoid visible pass/fail framing;
- celebrate completion;
- allow retry or recovery without penalty;
- collect only the minimum calibration or baseline information required.

Possible Orientation activities include:

1. **Welcome to the Academy** — short introduction to the Academy experience.
2. **Meet Your Coach** — hear an encouraging audio cue and learn how guidance will work.
3. **Camera Challenge** — help the camera locate the ball or playing space.
4. **Sound Challenge** — react to a whistle, voice cue or directional sound.
5. **Ball Warm-Up** — complete a few simple touches or juggles while the camera calibrates.
6. **First Scan** — locate a glowing teammate, target or space to introduce scanning.
7. **Orientation Complete** — receive a welcome reward and continue to Academy Accepted.

The final activity set may change through approved design sprints, but the Orientation purpose and boundaries remain locked.

### Architecture boundary

Academy Orientation belongs to onboarding and admission.

It may collect calibration, readiness and limited baseline data, but it must not generate or claim to generate the player’s formal Football IQ profile.

It must remain short, engaging, confidence-building and suitable for first-launch completion.

### Current implementation status

The existing landing, onboarding, identity, Academy trial, acceptance, avatar and Home architecture substantially supports this phase. Existing Academy trial terminology and routing may require future refactoring to align fully with the Academy Orientation model.

---

## Phase 2 — Discover Yourself

### Objective

Introduce the player to formal Football IQ assessment only after Academy entry and arrival at Home.

### Locked sequence

1. Home
2. Discover Your Game mission
3. Player Intelligence Assessment
4. Football IQ Profile
5. Strength Profile
6. Play Style or Archetype interpretation
7. Personalised Training Plan

### Player outcome

> Now I understand how I naturally play and what I should develop next.

### Product rule

The formal Football IQ assessment is not a generic onboarding hurdle. It is the first major Academy mission after entry.

The player should have already:

- joined the Academy;
- completed Academy Orientation;
- selected an avatar;
- reached Home;
- seen enough of the product to understand why the assessment matters.

### Existing supporting systems

The current architecture already contains most of the underlying capability:

- formal assessment evidence contracts;
- Football IQ scoring;
- five-construct profile generation;
- persisted assessment history;
- player-facing Football IQ Results;
- Coaching Intelligence strengths and development priorities;
- My Development experience;
- adaptive mission selection;
- Academy weekly planning.

### Remaining orchestration gap

The current architecture does not yet enforce one coordinated first-time discovery journey from Home.

A future implementation sprint must add an orchestration layer that:

- detects that Academy entry and Orientation are complete;
- detects that no formal Football IQ profile exists;
- presents Discover Your Game as the primary first Home mission;
- launches the formal assessment;
- routes completion into profile reveal;
- presents strengths, development priorities and first training plan;
- records discovery completion so later Home visits enter normal daily development.

---

## Phase 3 — Daily Development

### Objective

Create an ongoing loop in which training builds evidence, evidence informs coaching, and reassessment measures formal change.

### Ongoing experience

- Today's Mission
- Scanning and awareness training
- Game-reading challenges
- Decision-quality challenges
- Adaptability challenges
- Use-of-space challenges
- Ball mastery and Auto Juggler activities
- XP, levels, streaks, unlocks and rewards
- Football IQ progress
- My Development
- Academy weekly plan
- Training evidence
- Reassessment readiness
- Formal reassessment

### Player outcome

> I am improving every day.

### Scientific and product boundary

Training activity may build evidence and inform readiness, engagement, recommendations and Academy progression.

Training activity must not directly rewrite or inflate formal Football IQ scores.

Formal Football IQ change is calculated only through approved formal assessment or reassessment evidence.

---

## Experience separation

PitchIQ contains two distinct introductory and assessment concepts.

### Academy Orientation

**Purpose:** welcome, socialisation, feature learning, device readiness, calibration and confidence-building.  
**Timing:** Phase 1, before Academy Accepted.  
**Expected duration:** short, approximately 2–3 minutes in total.  
**Experience:** playful, game-like, encouraging and low-pressure.  
**Primary outcome:** the player understands the app, feels part of the Academy and is ready to continue.

The Orientation may collect limited operational information such as:

- camera permission and camera readiness;
- ball or body detection readiness;
- audio playback readiness;
- interaction comprehension;
- simple calibration signals;
- limited baseline observations.

These signals are not formal Football IQ scores.

### Formal Football IQ Assessment

**Purpose:** generate the player's defensible Football IQ profile and development guidance.  
**Timing:** Phase 2, after Home entry.  
**Expected duration:** long enough to collect valid evidence across the required constructs.  
**Primary outcomes:**

- Football IQ profile;
- construct scores and confidence states;
- established strengths;
- development priorities;
- player-facing guidance;
- personalised training focus;
- future reassessment baseline.

Academy Orientation and formal Football IQ assessment must not be merged casually in routing, copy, storage, scoring or UI naming.

---

## Required player journey states

The implementation should eventually expose one authoritative journey-state model rather than relying on unrelated screen flags.

Minimum states:

- `new_player`
- `identity_in_progress`
- `academy_orientation_in_progress`
- `academy_orientation_complete`
- `academy_joined`
- `football_iq_assessment_due`
- `football_iq_assessment_in_progress`
- `football_iq_profile_ready`
- `discovery_reveal_in_progress`
- `daily_development_active`
- `reassessment_ready`

### Required distinctions

The system must be able to distinguish:

- identity created versus Orientation started;
- Orientation complete versus Academy joined;
- Academy joined versus formally Football IQ assessed;
- formal profile created versus profile revealed to the player;
- training evidence building versus formal reassessment ready.

---

## Route and screen responsibilities

### Onboarding routes

Responsible for:

- name;
- squad number;
- position;
- identity confirmation;
- Academy Orientation;
- acceptance;
- avatar selection.

They must not become the long-term location of the formal Football IQ assessment.

### Academy Orientation

Responsible for:

- player welcome and socialisation;
- camera and audio introduction;
- feature familiarisation;
- safe permission requests;
- simple calibration and readiness checks;
- short micro-games;
- positive completion feedback;
- transition to Academy Accepted.

It must not own formal Football IQ scoring, profile generation or development-priority logic.

### Home

Responsible for presenting the correct next chapter:

- Discover Your Game when Academy entry is complete but no formal profile exists;
- Today's Mission when daily development is active;
- reassessment prompt when evidence readiness is satisfied;
- Academy progress and current development focus.

### Results

Responsible for formal Football IQ outputs and progress:

- profile;
- construct scores;
- confidence and evidence states;
- assessment history;
- change across formal assessments;
- My Development access.

### Training

Responsible for:

- today's selected mission;
- adaptive or balanced mission recommendations;
- live training entry;
- training evidence capture;
- readiness feedback.

### Player

Responsible for stable identity and long-term player representation, not duplicate assessment scoring.

### Lab

Responsible for experimental or specialist tools such as Auto Juggler. Lab activities may contribute valid evidence only where an approved evidence contract exists.

---

## Existing architecture alignment

### Already aligned

- Phase 1 first-launch sequence is substantially implemented.
- Football IQ scoring and profile systems exist.
- Football IQ Results exists.
- My Development exists.
- adaptive Training exists.
- training evidence and readiness exist.
- Academy weekly planning and progress exist.
- reassessment history exists.

### Not yet fully aligned

- existing Academy trial naming does not yet fully reflect Academy Orientation;
- no dedicated Orientation state contract;
- no dedicated Discover Your Game Home state;
- no single first-major-mission orchestration layer;
- no complete route from first formal assessment through profile reveal and personalised plan;
- no single authoritative journey-state contract;
- Orientation and formal Football IQ assessment require stronger naming, routing and storage separation.

---

## Implementation constraints

Future sprints must preserve these boundaries:

1. Do not present Academy Orientation as a high-stakes test or pass/fail assessment.
2. Do not generate formal Football IQ scores from Orientation calibration or tutorial activity.
3. Do not move the full formal Football IQ assessment into first-launch onboarding without explicit Product Owner approval.
4. Do not treat XP, engagement or training completion as formal Football IQ score change.
5. Do not create a second scoring source in Home, Results, Training, Player or Coach views.
6. Do not duplicate Coaching Intelligence rules inside UI modules.
7. Do not create competing journey flags without defining how they map to the authoritative player journey state.
8. Do not block normal app startup while loading Orientation, assessment, adaptive training or reporting modules.
9. Preserve safe fallbacks when camera, audio or assessment evidence is incomplete.
10. Preserve retry, skip or recovery behaviour for device permissions and calibration failures where approved by product design.

---

## Recommended next implementation sprint

### Academy Orientation Definition and App Flow Orchestration

Objectives:

- audit current Academy trial screens, copy, routing and state;
- map reusable trial activities into the Academy Orientation model;
- define the approved Orientation micro-game sequence;
- define camera, audio, permission and fallback requirements;
- define the authoritative journey-state contract;
- map existing storage and completion signals into that contract;
- add the Discover Your Game first Home mission;
- connect formal assessment completion to profile reveal;
- activate normal daily development only after discovery completion;
- preserve all existing scoring, training, evidence and onboarding boundaries.

This should begin as an audit and orchestration sprint, not a rebuild of the assessment, scoring or coaching engines.

---

## Governance

**Locked flow:**

- Phase 1 — Join the Academy
- Phase 2 — Discover Yourself
- Phase 3 — Daily Development

**Locked terminology:**

- Academy Orientation — playful onboarding, feature familiarisation and calibration.
- Formal Football IQ Assessment — evidence-based player intelligence profiling after Home.

Changes to the order, purpose, terminology or separation described here require explicit Product Owner approval and a version update to this document.
