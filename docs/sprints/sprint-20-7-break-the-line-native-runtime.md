# Sprint 20.7 — Break the Line Native Runtime

## Purpose

Promote **Break the Line** from the generic mission fallback to a dedicated Football IQ runtime.

## Runtime

- Mission ID: `break-the-line`
- Adapter ID: `break-the-line-v1`
- Cue profile: `defensive-line-passing-lane-progression`
- Scoring profile: `line-breaking-recognition-progression-reaction`

## Scenario model

The runtime provides deterministic four-stage scenarios describing:

- defensive line shape;
- passing-lane state;
- receiver movement;
- pressure source;
- line-breaking opportunity;
- expected progressive decision.

The final cue in each sequence represents the actionable line-breaking opportunity.

## Scoring

Mission scoring rewards:

- correct response accuracy;
- reaction speed;
- line-breaking recognition;
- progressive decision-making;
- passing-lane identification;
- scanning evidence.

## Safety boundary

This sprint changes only mission runtime registration, mission-session behaviour, tests and documentation. It does not change onboarding, Home, navigation, routing or previously implemented native missions.

## Acceptance

- `break-the-line-v1` is registered as native;
- deterministic line-breaking scenarios are emitted;
- defensive shape, lane, movement and decision evidence is attached;
- mission-specific scoring is returned;
- existing five native runtimes remain unchanged;
- remaining missions continue to use explicit generic fallback behaviour.
