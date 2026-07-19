# Sprint 20.4 — Predict the Next Play Native Runtime

## Goal

Replace the generic cue fallback for `predict-next` with the third native Football IQ mission runtime.

## Native behaviour

The runtime presents four-step patterns. The first three cues establish the context and the fourth cue is marked as the prediction target.

Initial pattern set:

- red → blue → red → predict blue
- left → left → right → predict right
- check → left → check → predict right
- turn → drive → turn → predict drive

Each cue carries pattern position metadata. Prediction cues additionally expose `predictionRequired` and `expectedPrediction` evidence fields.

## Scoring

The mission uses a dedicated `prediction-accuracy-reaction-confidence` profile:

- weighted prediction accuracy;
- response-speed bonus;
- anticipation bonus on correct prediction targets;
- optional bounded confidence multiplier;
- context cues remain lower-weight evidence.

## Architecture

- registers `predict-next-v1` in the mission runtime integration layer;
- reuses the existing mission session sidecar;
- preserves `scan-first-v1` and `spot-the-cue-v1` unchanged;
- leaves all other missions on explicit generic fallback;
- does not alter onboarding, Home, routing or navigation.

## Verification

Regression coverage confirms:

- native adapter registration;
- deterministic pattern order;
- context-to-prediction transition metadata;
- anticipation, speed and confidence scoring;
- preservation of prior native adapters and generic fallback behaviour.
