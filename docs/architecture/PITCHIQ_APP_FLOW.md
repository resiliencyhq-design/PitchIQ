# PitchIQ App Flow

**Version:** 1.0  
**Status:** Locked product-flow architecture  
**Scope:** Player-facing journey across onboarding, assessment, development, training, progression and reassessment.

## Purpose

This document is the canonical source for the intended PitchIQ player journey.

It governs the order and relationship between:

- onboarding and Academy entry;
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

Complete a short first-launch journey that creates player identity, verifies Academy entry and reaches Home without overloading the player.

### Locked sequence

1. Landing
2. Name
3. Squad Number
4. Favourite Position
5. Identity Complete
6. Academy Entry Assessment
7. Academy Accepted
8. Choose Avatar
9. Home

### Player outcome

> I am officially part of PitchIQ Academy.

### Architecture boundary

The Academy Entry Assessment belongs to onboarding and admission. It must remain short, engaging and suitable for first-launch completion.

It must not be treated as the full formal Football IQ assessment unless a future approved architecture revision explicitly changes this rule.

### Current implementation status

The existing landing, onboarding, identity, Academy trial, acceptance, avatar and Home architecture substantially supports this phase.

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
- selected an avatar;
- reached Home;
- seen enough of the product to understand why the assessment matters.

### Existing supporting systems

The current architecture already contains most of the underlying capability:

- formal assessment evidence contracts;
- Football IQ scoring;
- five construct profile generation;
- persisted assessment history;
- player-facing Football IQ Results;
- Coaching Intelligence strengths and development priorities;
- My Development experience;
- adaptive mission selection;
- Academy weekly planning.

### Remaining orchestration gap

The current architecture does not yet enforce one coordinated first-time discovery journey from Home.

A future implementation sprint must add an orchestration layer that:

- detects that Academy entry is complete;
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

## Assessment separation

PitchIQ contains two distinct assessment concepts.

### Academy Entry Assessment

**Purpose:** onboarding, admission, baseline setup or calibration.  
**Timing:** Phase 1, before Academy Accepted.  
**Expected duration:** short.  
**Primary outcome:** Academy entry and initial setup.

### Formal Football IQ Assessment

**Purpose:** generate the player's defensible Football IQ profile and development guidance.  
**Timing:** Phase 2, after Home entry.  
**Expected duration:** long enough to collect valid evidence across the required constructs.  
**Primary outcomes:**

- Football IQ profile;
- construct scores and confidence states;
- established strength;
- development priorities;
- player-facing guidance;
- personalised training focus;
- future reassessment baseline.

These two concepts must not be merged casually in routing, copy, storage or UI naming.

---

## Required player journey states

The implementation should eventually expose one authoritative journey-state model rather than relying on unrelated screen flags.

Minimum states:

- `new_player`
- `identity_in_progress`
- `academy_entry_in_progress`
- `academy_joined`
- `football_iq_assessment_due`
- `football_iq_assessment_in_progress`
- `football_iq_profile_ready`
- `discovery_reveal_in_progress`
- `daily_development_active`
- `reassessment_ready`

### Required distinctions

The system must be able to distinguish:

- identity created versus Academy joined;
- Academy joined versus formal Football IQ assessed;
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
- Academy Entry Assessment;
- acceptance;
- avatar selection.

They must not become the long-term location of the formal Football IQ assessment.

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

- no dedicated Discover Your Game Home state;
- no single first-major-mission orchestration layer;
- no complete route from first formal assessment through profile reveal and personalised plan;
- no single authoritative journey-state contract;
- Academy Entry Assessment and formal Football IQ assessment require stronger naming and routing separation.

---

## Implementation constraints

Future sprints must preserve these boundaries:

1. Do not move the full formal Football IQ assessment into first-launch onboarding without explicit Product Owner approval.
2. Do not treat XP, engagement or training completion as formal Football IQ score change.
3. Do not create a second scoring source in Home, Results, Training, Player or Coach views.
4. Do not duplicate Coaching Intelligence rules inside UI modules.
5. Do not create competing journey flags without defining how they map to the authoritative player journey state.
6. Do not block normal app startup while loading assessment, adaptive training or reporting modules.
7. Preserve safe fallbacks when formal assessment evidence is incomplete.

---

## Recommended next implementation sprint

### App Flow Orchestration Foundation

Objectives:

- define the authoritative journey-state contract;
- map existing storage and completion signals into that contract;
- add the Discover Your Game first Home mission;
- connect formal assessment completion to profile reveal;
- activate normal daily development only after discovery completion;
- preserve all existing scoring, training, evidence and onboarding boundaries.

This should be an orchestration and routing sprint, not a rebuild of the assessment, scoring or coaching engines.

---

## Governance

**Locked flow:**

- Phase 1 — Join the Academy
- Phase 2 — Discover Yourself
- Phase 3 — Daily Development

Changes to the order, purpose or assessment separation described here require explicit Product Owner approval and a version update to this document.
