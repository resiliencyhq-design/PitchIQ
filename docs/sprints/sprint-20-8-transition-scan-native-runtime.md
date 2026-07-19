# Sprint 20.8 — Transition Scan Native Runtime

## Purpose

Implement `Transition Scan` as the seventh adaptive Football IQ mission with a dedicated native runtime.

## Native adapter

- Mission: `transition-scan`
- Adapter: `transition-scan-v1`
- Cue profile: `possession-change-scan-threat-lane`
- Scoring profile: `transition-recognition-early-scan-decision-reaction`

## Runtime behaviour

The mission uses deterministic attacking and defensive transition scenarios. Each scenario records:

- transition type;
- possession state;
- immediate or continuing scan timing;
- first visual target;
- available passing lanes;
- defensive threats;
- threat identification;
- final decision requirement;
- expected action;
- presentation timestamp for reaction latency.

## Scoring

The mission-specific score can reward:

- correct transition recognition;
- immediate scanning;
- correct final transition decision;
- defensive threat identification;
- scan evidence;
- reaction speed.

Incorrect responses receive no mission-specific or reaction points.

## Safety boundaries

This sprint does not change:

- onboarding;
- Home;
- routing;
- navigation;
- the existing six native mission runtimes.

Unimplemented missions continue to resolve through the explicit generic fallback.

## Acceptance criteria

- [x] `transition-scan-v1` registered as native.
- [x] Deterministic attacking and defensive transition scenarios.
- [x] Transition, possession, scan, lane and threat metadata.
- [x] Mission-specific scoring.
- [x] Runtime integration.
- [x] Regression tests.
- [x] Sprint documentation.
- [x] Existing native adapters preserved.
- [x] Remaining missions stay generic fallbacks.
