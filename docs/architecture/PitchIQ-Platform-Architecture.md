# PitchIQ Platform Architecture

**Status:** Canonical architecture specification  
**Version:** 1.0  
**Scope:** PitchIQ platform responsibilities, boundaries, and data flow

## 1. Purpose

PitchIQ separates engagement, measurement, personalised development, and coach-facing analysis into distinct engines.

This separation prevents motivational rewards from being mistaken for capability scores and keeps future features aligned to a clear responsibility.

The governing platform principle is:

> Players are motivated through game mechanics, measured through evidence, developed through personalised coaching, and supported through coach intelligence.

## 2. Platform Model

PitchIQ is organised around four engines:

1. **Game Engine** — engagement and progression
2. **Football IQ Engine** — evidence-based measurement
3. **Coaching Intelligence Engine** — personalised development
4. **Coach Intelligence Engine** — coach and academy insight

The first three engines form the core player-development loop. Coach Intelligence is the future coach-facing layer built on the same evidence model.

```text
                 PitchIQ Platform

            Game Engine
          XP • Levels • Rewards
                  │
                  ▼
          Evidence Collection
                  │
                  ▼
      Football IQ Engine
   Measure • Validate • Profile
                  │
                  ▼
     Coaching Intelligence
     Personalise Development
                  │
          ┌───────┴────────┐
          ▼                ▼
     Player App     Coach Intelligence
```

## 3. Engine One — Game Engine

### Purpose

Make training enjoyable, reinforce effort, support habit formation, and encourage players to return.

### Owns

- XP
- Levels
- streaks
- missions
- achievements
- rewards
- unlocks
- cosmetic progression
- completion feedback

### Example outputs

- Scan Training: `+80 XP`
- Ball Juggling: `+120 XP`
- Daily streak: `+50 XP`
- Mission completed
- Level increased

### Primary question

> How much did I train and participate?

### Does not

- calculate Football IQ
- change construct scores
- determine assessment confidence
- treat XP as evidence of capability
- create coach-facing capability conclusions

## 4. Engine Two — Football IQ Engine

### Purpose

Measure football intelligence from valid, traceable evidence.

### Owns

- item-evidence scoring
- construct scoring
- Awareness
- Game Reading
- Decision Quality
- Adaptability
- Use of Space
- Integrated Football IQ
- confidence bands
- Match Challenge indicators
- Match Mentality inference
- minimum-evidence rules
- scenario-diversity checks
- scoring-version contracts

### Primary question

> What does the available evidence show about the player's football intelligence?

### Does not

- award XP
- increase levels
- unlock rewards
- use engagement rewards as capability evidence
- prescribe training by itself

### Evidence principles

- Scores are derived from observations, not rewards.
- Confidence is reported separately from capability.
- Integrated Football IQ is emitted only when minimum evidence requirements are met.
- Raw observations remain separate from derived scores.
- Outputs are versioned and explainable.

## 5. Engine Three — Coaching Intelligence Engine

### Purpose

Use the player's evidence-based profile to guide what they should train next.

### Uses

- Football IQ profile
- confidence levels
- evidence gaps
- training history
- position
- age and developmental stage
- goals
- recent performance patterns

### Produces

- recommended training
- skill priorities
- adaptive difficulty
- weekly development plans
- reassessment timing
- progression pathways
- targeted reinforcement

### Primary question

> What should this player train next to improve?

### Does not

- redefine Football IQ scores
- alter evidence to make recommendations appear stronger
- treat XP as proof of mastery
- award rewards directly

## 6. Engine Four — Coach Intelligence Engine

### Status

Future platform layer.

### Purpose

Support coaches, parents, teams, academies, and researchers with longitudinal development insight.

### Future capabilities

- squad dashboards
- team trends
- player-development reports
- evidence-confidence views
- intervention and programme evaluation
- cohort patterns
- player comparisons with appropriate safeguards
- development alerts
- academy analytics
- research exports

### Primary question

> What does the evidence show across players, squads, and development programmes?

### Safeguards

- Player comparisons must not be confused with age norms unless norms have been formally developed and validated.
- Rankings and percentiles are not produced without an approved normative framework.
- Coach-facing conclusions must preserve score confidence and evidence limitations.

## 7. How Training and Assessment Interact

A training activity may produce two distinct outputs:

```text
Player completes Scan Training

        │
        ├──────────────► Game Engine
        │                  + XP
        │                  mission progress
        │                  streak progress
        │
        ▼
Evidence Store
        │
        ▼
Football IQ Engine
```

The player can receive immediate XP while the same interaction stores structured observations for later analysis.

These outputs must remain conceptually and technically separate.

Training evidence may contribute to a future Football IQ update only when:

- the interaction validly samples a Football IQ construct
- the observation contract is satisfied
- sufficient evidence has accumulated
- scenario-diversity and quality rules are met
- the scoring version is recorded

A training completion alone is not an assessment result.

## 8. Profile Update Principle

Football IQ should not fluctuate after every activity.

The platform should update or invite a profile refresh only when enough high-quality evidence has accumulated.

Example player-facing message:

> You have collected enough new evidence to update your Football IQ profile.

This protects the profile from noisy single-session changes and makes updates more meaningful.

## 9. Core Design Principles

The following principles are locked:

1. **XP never changes Football IQ.**
2. **Football IQ never awards XP.**
3. **Assessment scores are evidence-based.**
4. **Training may generate evidence, but completing training is not itself proof of mastery.**
5. **Confidence remains separate from capability.**
6. **Coaching recommendations are driven by evidence, goals, and developmental context.**
7. **Each engine has one primary responsibility.**
8. **The engines communicate through defined contracts rather than shared hidden logic.**
9. **Raw observations are preserved separately from derived outputs.**
10. **Scores, rules, and recommendations must be versioned.**
11. **No rankings, percentiles, or age norms are introduced without formal validation and approval.**
12. **Player-facing rewards must not imply psychometric validity.**

## 10. Engine Boundary Guide

When adding a feature, classify it using the following questions:

| Question | Engine |
|---|---|
| Does it reward participation or effort? | Game Engine |
| Does it calculate capability from evidence? | Football IQ Engine |
| Does it decide what the player should train next? | Coaching Intelligence Engine |
| Does it aggregate insights for coaches or academies? | Coach Intelligence Engine |

If a feature appears to belong to more than one engine, the responsibilities must be separated into explicit interfaces before implementation.

## 11. Data Flow and Ownership

### Game Engine data

Examples:

- XP ledger
- level
- streak state
- mission completion
- reward unlocks

### Evidence data

Examples:

- assessment observations
- training observations
- scenario family
- construct mapping
- completion status
- timestamps
- source and scoring version

### Football IQ outputs

Examples:

- item-evidence scores
- construct scores
- confidence
- Integrated Football IQ
- Match Challenge
- Match Mentality

### Coaching outputs

Examples:

- next-best activity
- training priority
- difficulty recommendation
- reassessment recommendation

Each data domain should have a clear owner and should not be mutated by another engine without an explicit contract.

## 12. Implementation Guardrails

Future sprints must preserve the following boundaries:

- The existing XP system for scanning, juggling, and other game activities remains independent of the Football IQ scoring module.
- UI components may display outputs from multiple engines but must label them clearly.
- A single screen must not visually imply that XP equals Football IQ.
- Football IQ scoring logic remains deterministic and testable.
- Coaching Intelligence consumes Football IQ outputs; it does not rewrite them.
- Coach Intelligence consumes player and cohort outputs; it does not silently change player scores.
- Changes to locked engine boundaries require an explicit architecture decision and version update to this document.

## 13. Roadmap Alignment

### Current foundation

- Game scoring and XP exist in training experiences.
- Football IQ scoring engine has been implemented as a standalone calculation module.

### Next integration stages

1. Connect completed assessment observations to the Football IQ Engine.
2. Store versioned scoring outputs separately from XP data.
3. Present Football IQ results at the end of an eligible assessment battery.
4. Add evidence accumulation from selected training activities where validity criteria are met.
5. Introduce player-facing profile refresh rules.
6. Build Coaching Intelligence recommendations from stable Football IQ outputs.
7. Add Coach Intelligence only after data governance and reporting requirements are approved.

## 14. Governance

This document is a living architecture specification, not a sprint note.

It may be updated when:

- a new engine responsibility is approved
- an engine boundary changes
- a new data contract is introduced
- governance or validation requirements change

Implementation work must not silently contradict this document. Material architectural changes require explicit Product Owner approval and an updated document version.
