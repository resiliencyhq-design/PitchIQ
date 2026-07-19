# PitchIQ Football IQ Scoring Engine v1.0

**Status:** Sprint 12.0 foundation  
**Purpose:** Define how assessment evidence becomes a defensible Football IQ and Match Mentality profile without prematurely hard-coding unvalidated norms.

## 1. Design principles

1. **Construct purity** — each standalone assessment primarily scores its locked construct.
2. **Evidence before labels** — report observable performance and confidence, not fixed ability judgements.
3. **Developmental use** — every score must connect to training and reassessment.
4. **Transparent calculation** — every profile value must be traceable to source observations.
5. **No false precision** — provisional scores must be clearly identified until reliability and norms are established.
6. **Age-fair interpretation** — raw performance may be compared only with validated age bands once sufficient data exists.
7. **Multiple evidence points** — no construct is considered stable from a single item or isolated attempt.

## 2. Locked construct map

| Mission | Primary construct | Profile contribution |
|---|---|---|
| Radar Scan | Awareness | Primary evidence for Awareness |
| Read the Play | Game Reading | Primary evidence for Game Reading |
| Best Option | Decision Quality | Primary evidence for Decision Quality |
| Chaos Mode | Adaptability | Primary evidence for Adaptability |
| Space Master | Use of Space | Primary evidence for Use of Space |
| Match Challenge | Integrated FIQ | Cross-construct validation and transfer evidence |

Match Challenge does not create a sixth construct.

## 3. Observation model

Each scored item records:

- `assessmentId`
- `constructId`
- `itemId`
- `attemptId`
- `playerId`
- `timestamp`
- `accuracy` from 0 to 1
- `quality` from 0 to 1
- `responseTimeMs`
- `difficulty` from 0 to 1
- `representativeness` from 0 to 1
- `completionState`
- `behaviouralEvents`
- `scoringVersion`

The engine retains raw observations. Derived scores can therefore be recalculated when the scoring model is updated.

## 4. Item evidence score

The first implementation uses a transparent provisional model:

`itemEvidence = accuracy × 0.55 + quality × 0.35 + efficiency × 0.10`

Where:

- `accuracy` reflects whether the player recognised or selected an appropriate football response.
- `quality` reflects the tactical value of that response on a spectrum rather than a binary right/wrong judgement.
- `efficiency` is a bounded response-time indicator calculated relative to the item's designed response window.

Difficulty and representativeness are retained as metadata in v1.0. They must not inflate a score until validated calibration data exists.

## 5. Construct score

A construct score is calculated only when minimum evidence requirements are met.

### Minimum evidence threshold

- At least 6 completed representative items.
- At least 2 distinct scenario families.
- No more than 50% of evidence from one scenario family.

### Calculation

`constructRaw = weighted mean of valid itemEvidence`

In v1.0, all valid items within the construct have equal weight. Item-response weighting may be introduced only after empirical validation.

The displayed score is:

`constructScore = round(constructRaw × 100)`

Range: 0–100.

## 6. Evidence confidence

A score and its confidence are separate outputs.

Confidence is based on:

- evidence volume,
- scenario diversity,
- completion quality,
- score consistency,
- recency.

Provisional confidence bands:

| Band | Meaning |
|---|---|
| Emerging evidence | Insufficient observations for a stable interpretation |
| Developing confidence | Enough evidence for a useful coaching indication |
| Strong confidence | Diverse and consistent evidence across representative scenarios |

The UI must never hide low confidence behind a precise-looking score.

## 7. Integrated Football IQ

Overall Football IQ is not a simple total that allows one strong construct to erase a major development need.

The provisional integrated score uses the mean of available construct scores, subject to all five constructs meeting minimum evidence requirements:

`FIQ = mean(Awareness, Game Reading, Decision Quality, Adaptability, Use of Space)`

Match Challenge contributes a separate **integration indicator** rather than an additional sixth score.

### Integration indicator

Match Challenge compares expected performance from the five construct scores with performance in integrated scenarios.

Possible interpretations:

- **Transfers strongly** — integrated performance is consistent with or exceeds the construct profile.
- **Transfers inconsistently** — individual skills are present but are not yet applied consistently together.
- **More evidence needed** — insufficient Match Challenge observations.

No numerical transfer multiplier is applied in v1.0.

## 8. Match Mentality inference

Match Mentality is inferred from behaviour across attempts, not from correctness alone.

### Locked dimensions

- Persistence
- Recovery
- Learning
- Composure
- Consistency

### Behavioural evidence examples

| Dimension | Observable evidence |
|---|---|
| Persistence | completes difficult sequences, continues after errors, avoids premature exit |
| Recovery | next-response quality after an error or setback |
| Learning | improvement after feedback or repeated scenario structure |
| Composure | response stability under time pressure or increasing complexity |
| Consistency | variability across comparable items and sessions |

Match Mentality outputs use descriptive bands in v1.0:

- Emerging
- Developing
- Consistent
- Strong

The engine must store the underlying behavioural events and rule results used to create each band.

## 9. Age and developmental interpretation

Age normalisation is deliberately deferred until PitchIQ has sufficient representative data.

Before validated norms exist:

- show the player's own profile,
- compare the player with their previous attempts,
- report strengths and development priorities,
- do not claim percentile rank,
- do not compare players publicly,
- do not describe scores as diagnostic.

Future norms must consider chronological age, football experience, playing context and sample representativeness.

## 10. Player profile output

The scoring engine returns:

- five construct scores,
- confidence for each construct,
- integrated FIQ score when eligible,
- Match Challenge integration indicator,
- five Match Mentality bands,
- evidence count and recency,
- two strengths,
- one or two development priorities,
- recommended training links,
- scoring version.

Player-facing feedback follows:

1. Celebrate
2. Explain
3. Improve
4. Inspire

## 11. Versioning and governance

Every derived result includes `scoringVersion`.

Changes to weights, thresholds, confidence rules, norms or interpretation language require:

1. documented rationale,
2. validation evidence,
3. version increment,
4. regression tests,
5. Product Owner approval.

Historical raw observations remain unchanged.

## 12. Explicit exclusions for v1.0

Sprint 12.0 does not introduce:

- age percentiles,
- player rankings,
- leaderboards,
- diagnostic labels,
- opaque AI-generated scores,
- a sixth Match Challenge construct,
- permanent production weights without validation.

## 13. Definition of done

The foundation is complete when:

- construct mapping is explicit,
- raw evidence is separated from derived scores,
- confidence is reported independently,
- Match Mentality rules are behaviour-based,
- age normalisation is safely deferred,
- the output contract is versioned,
- future implementation can be tested deterministically.
