# Sprint 12.6D — Progressive Coaching Memory

## Objective
Use accumulated player reflections and verified training evidence to make PitchIQ Coach language feel continuous across sessions without changing mission selection, Football IQ scores, assessment outcomes or XP.

## Scope
- Resolve coaching memory for the currently selected adaptive mission.
- Prefer the latest valid reflection for the same football focus.
- Use completed training evidence only when no valid reflection exists.
- Add one short continuity message to the pre-training coach brief.
- Retain generic first-time language when no relevant history exists.

## Memory stages
- `new_focus`: no relevant reflection or completed evidence.
- `reinforce`: the player previously selected “I noticed it”.
- `repeat_cue`: the player previously selected “Sometimes”.
- `support`: the player previously selected “Still learning”.
- `evidence_only`: verified completed training exists without a reflection.

## Architecture safeguards
- The adaptive engine remains the sole recommendation authority.
- Coaching memory cannot change the selected mission.
- Reflection history remains coaching context, not assessment evidence.
- Training evidence is read-only in this sprint.
- Football IQ, readiness, assessment and XP logic are unchanged.
- The existing optional pre-training brief loader remains isolated.

## Acceptance criteria
- The brief only references history from the same focus.
- The latest valid reflection takes priority over older responses.
- Skipped reflections are ignored.
- Missing or malformed history produces safe first-time language.
- No unsupported claims of performance or improvement are generated.
- Live Rep remains accessible if memory resolution fails.
