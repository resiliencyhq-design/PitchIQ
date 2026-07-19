# Sprint 22.0 — Football IQ Content Framework Lock

## Purpose

Define the instructional design contract for Football IQ module expansion before new mission content is added.

This sprint is documentation-only. It does not change the mission runtime, UI, routing, scoring, persistence, adaptive coach, curriculum, assessment or navigation architecture.

## Program target

Expand the current seven-module, seven-mission prototype into a coherent Football IQ learning curriculum with:

- seven learning modules;
- three core missions per module;
- Foundation, Developing and Advanced progression;
- consistent coaching and assessment language;
- content that plugs into the existing mission runtime and progression systems.

Target after Sprint 22.7: **21 core missions**.

## Locked module framework

Every Football IQ module must define the following fields before mission implementation begins.

### 1. Module learning objective

A concise statement describing what the player will learn to notice, understand or do.

### 2. End-state competency

An observable game behaviour demonstrating that the player can apply the learning under realistic pressure.

### 3. Three-stage progression

#### Foundation

- one clear learning cue;
- reduced information load;
- generous response time;
- obvious visual or positional clues;
- emphasis on correct recognition rather than speed.

#### Developing

- multiple relevant cues;
- moderate distraction or pressure;
- reduced response time;
- comparison of two plausible actions;
- emphasis on consistency and earlier recognition.

#### Advanced

- several simultaneous cues;
- realistic uncertainty and pressure;
- short decision windows;
- competing high-value options;
- emphasis on speed, accuracy and transfer to match situations.

### 4. Coaching philosophy

The short repeatable coaching principle used across the module. It must be actionable, age-appropriate and consistent with the existing module coaching prompt.

### 5. Success indicators

Observable behaviours used to judge meaningful learning, such as:

- information gathered before the ball arrives;
- relevant cue correctly identified;
- action selected before pressure closes;
- movement or communication occurs early enough to help the next play;
- correct decision repeated across multiple scenarios.

### 6. Assessment criteria

Each mission must assess at least three dimensions:

- **Recognition** — did the player identify the important cue or option?
- **Timing** — did the player respond early enough?
- **Decision quality** — was the selected action appropriate for the picture?

Where supported by the native mission runtime, missions may also assess consistency, scanning frequency, response time or risk management.

### 7. Common mistakes

Each mission specification must document predictable errors so that coaching feedback can be specific. Examples include:

- watching only the ball;
- scanning too late;
- choosing the first visible option;
- moving after rather than before the pass;
- communicating after the teammate has already acted;
- confusing speed with rushing.

### 8. Coach feedback templates

Every mission must provide feedback for three moments.

#### Before the mission

- one primary focus;
- one simple cue to remember;
- no more than one supporting instruction.

#### During the mission

- short corrective prompts;
- reinforcement of early information gathering;
- no abstract tactical lectures during active play.

#### After the mission

- strongest demonstrated behaviour;
- highest-value improvement priority;
- one transfer question connecting the mission to a real match.

## Locked module progression map

| Module | Foundation mission | Developing mission | Advanced mission | End-state competency |
|---|---|---|---|---|
| Awareness | Find the Third Player | See Beyond the Ball | Track Three Players | Maintains awareness of teammates, opponents and useful space beyond the immediate ball action. |
| Scanning | Scan Before Receiving | Scan While Moving | Scan During Transition | Gathers relevant information repeatedly before receiving, moving and reacting to transition. |
| Vision | Predict the Next Play | See the Weak Side | Spot the Overload | Recognises developing patterns and valuable options before they become obvious. |
| Decision Making | Forward or Secure | Risk vs Reward | First-Time Decision | Selects an appropriate action quickly while balancing opportunity, pressure and possession risk. |
| Positioning | Move Before the Pass | Create a Passing Lane | Arrive at the Right Time | Moves early into useful spaces that improve the next action for the player and teammates. |
| Anticipation | Read the Trigger | Predict the Bounce | Intercept Early | Uses body shape, ball flight and movement cues to act before the outcome is obvious. |
| Communication | Give Early Information | Trigger a Teammate | Lead the Press | Gives clear, early information that changes or improves a teammate’s action. |

## Mission content contract

Every new mission added in Sprints 22.1–22.7 must include:

- stable mission ID;
- title;
- module/category;
- progression stage;
- difficulty;
- XP value;
- estimated duration;
- player-facing description;
- three or more objectives;
- coaching prompt;
- success indicators;
- assessment criteria;
- common mistakes;
- before, during and after feedback copy;
- unlock rule where required;
- compatibility with the existing launch route and runtime adapter.

## Architecture guardrails

The following are locked for the content expansion program:

- existing Football IQ mission runtime;
- mission lifecycle events;
- progression persistence model;
- XP and Academy level integration;
- adaptive recommendation engine;
- module pages and routing;
- 12-week curriculum aggregation;
- assessment and benchmark aggregation;
- bottom navigation and home architecture.

A runtime or architecture change requires a separately approved technical sprint with a documented limitation and regression risk.

## Content quality rules

New missions must:

- train a distinct learning behaviour rather than rename an existing task;
- be understandable by a young player without coach interpretation;
- measure behaviour the player can influence;
- avoid claiming that app performance automatically transfers to match performance;
- include an explicit real-game transfer prompt;
- use concise football language;
- maintain progression from recognition to consistency to pressure-tested application.

## Sprint sequence

1. Sprint 22.1 — Awareness
2. Sprint 22.2 — Scanning
3. Sprint 22.3 — Vision
4. Sprint 22.4 — Decision Making
5. Sprint 22.5 — Positioning
6. Sprint 22.6 — Anticipation
7. Sprint 22.7 — Communication
8. Sprint 22.8 — Difficulty Progression
9. Sprint 22.9 — Coaching and Reflection System
10. Sprint 23.0 — Academy Progression

## Acceptance criteria

Sprint 22.0 is complete when:

- the seven-module progression map is documented;
- the Foundation, Developing and Advanced definitions are locked;
- mission content requirements are explicit;
- coaching, assessment and feedback standards are explicit;
- architecture guardrails are explicit;
- no runtime or UI files are changed;
- subsequent module sprints can be implemented without redefining instructional structure.

## Verification

Documentation-only change. Verify that the pull request contains this sprint specification and no application, runtime, style, route or test changes.
