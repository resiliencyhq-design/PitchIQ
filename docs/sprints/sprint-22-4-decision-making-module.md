# Sprint 22.4 — Decision Making Module Expansion

## Purpose

Expand Decision Making from one mission into a complete three-mission Football IQ pathway using the locked Sprint 22.0 content framework.

## Module objective

Help players choose purposeful actions by comparing opportunity, pressure, support and risk, then updating the choice when the game picture changes.

## End-state competency

The player can identify realistic options, compare their likely value, commit within the available decision window and adapt when the original option closes.

## Mission pathway

### Foundation — Forward or Secure?

**ID:** `play-forward-or-secure`

Builds the first decision habit: check whether progression is genuinely available, then protect possession when the picture is closed.

### Developing — Choose the Best Option

**ID:** `choose-best-option`

Requires the player to compare several viable actions rather than selecting the first or nearest option automatically.

### Advanced — Change the Decision

**ID:** `change-the-decision`

Requires the player to update an intended action when pressure, movement or space changes late in the decision window.

## Content requirements

Each mission includes:

- progression stage;
- objectives;
- coaching prompt;
- success indicators;
- recognition, timing and decision-quality criteria;
- common mistakes;
- before, during and after feedback;
- match-transfer question;
- launch and runtime metadata.

## Runtime approach

All three missions use the existing generic mission runtime. No new lifecycle, timer, scoring, XP, evidence, persistence or navigation system is introduced.

## Registry approach

The three mission IDs are registered against the existing `decisionQuality` and `adaptability` constructs with capabilities already supported by the platform.

## Architecture guardrails

This sprint must not redesign:

- shared mission runtime;
- lifecycle;
- persistence;
- XP or rewards;
- adaptive recommendations;
- curriculum or assessment engines;
- Home or navigation;
- native adapters for unrelated missions.

## Acceptance criteria

- Decision Making contains exactly three core missions.
- Stages are Foundation, Developing and Advanced in order.
- Existing `play-forward-or-secure` ID remains stable.
- Every mission satisfies the Sprint 22.0 content contract.
- All mission IDs resolve through the registry.
- Generic runtime launch remains compatible with the current training route.
- Module aggregation reports three available missions and 16 total minutes.
- Focused regression tests cover content and runtime resolution.
- No shared architecture regression is introduced.

## Verification plan

Run the Decision Making module regression test and the existing mission registry/runtime suites. Confirm the branch changes remain limited to mission content, registry metadata, focused tests and this sprint document.
