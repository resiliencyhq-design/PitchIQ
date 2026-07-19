# Sprint 12.6A — AI Coach Language and Identity

## Objective

Establish one consistent, age-appropriate and evidence-aware coaching identity before adding pre-training briefs, reflections or coaching memory.

## Locked identity

- Name: **PitchIQ Coach**
- Role: **Your Football IQ coach**
- Tone: encouraging, clear, age-appropriate, evidence-aware and non-judgemental

## Language rules

- Personalised language is used only when formal priority evidence and evidence count are available.
- Missing or limited evidence produces evidence-building language rather than a player judgement.
- The coach does not claim it watched, saw or understood an action unless supporting evidence exists.
- Recommendations are framed as useful next focuses, not weaknesses or rankings.
- Improvement is never claimed without evidence.
- Football IQ scores change only through the formal reassessment process.

## Changes

- Added a locked `AI_COACH_IDENTITY` contract.
- Added reusable `buildCoachLanguage()` output for future Home, Training and Results integrations.
- Updated the existing Home AI Coach card to show the coach identity and recommendation mode.
- Added explicit guardrails for unsupported observation claims and assessment-score separation.
- Added isolated visual treatment and cache-key updates.
- Added tests for identity, fallback language, personalised language and guardrails.

## Architecture safeguards

- No changes to adaptive mission selection.
- No changes to assessment scoring, XP, onboarding or routing.
- No coaching memory introduced in this sprint.
- No pre-training or post-training flow changes.
- The existing optional AI Coach loader remains the integration point.

## Acceptance checks

1. Home shows **PitchIQ Coach — Your Football IQ coach** consistently.
2. Players without sufficient evidence see an evidence-building focus.
3. Players with supported evidence see careful personalised language.
4. Language does not say the coach watched the player or that the player improved.
5. Existing Home navigation and adaptive recommendation remain unchanged.
