# Sprint 12.6C — Post-training Coach Reflection

## Objective
Add a short, optional PitchIQ Coach reflection after Live Rep without changing Football IQ scores, assessment outcomes or XP.

## Experience
- Trigger after the existing `finish-live-session` action.
- Repeat the completed adaptive mission title.
- Ask one simple noticing question.
- Offer three age-appropriate responses: `I noticed it`, `Sometimes`, and `Still learning`.
- Give a brief non-judgemental coach response.
- Allow the player to skip.

## Stored coaching context
Reflections are stored separately under:
- `pitchiq.coachReflection.current.v1`
- `pitchiq.coachReflection.history.v1`

Each record stores the mission, focus, response and timestamp. Records explicitly declare `assessmentImpact: false` and `xpImpact: false`.

## Architecture safeguards
- Adaptive mission selection is unchanged.
- Results navigation remains authoritative.
- Reflection loading is optional and cannot block Results.
- Reflections do not modify Football IQ scores, assessment evidence, readiness or XP.
- No coaching memory logic is introduced in this sprint.

## Validation
1. Complete a Live Rep.
2. Confirm the reflection names the same mission.
3. Test each response and confirm supportive coach language.
4. Test Skip reflection.
5. Confirm Results remains accessible.
6. Confirm no duplicate reflection or navigation loop.
