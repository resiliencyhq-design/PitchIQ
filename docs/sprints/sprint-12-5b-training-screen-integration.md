# Sprint 12.5B — Training Screen Integration

## Objective
Load adaptive mission selection only after the player enters Training.

## Behaviour
- The application boots exactly as before.
- Entering Training dynamically loads the passive Sprint 12.5A engine.
- The Training landing screen shows the selected focus, mission title and coaching prompt.
- Mission history is bounded to 12 selections for balanced rotation.
- Reliable Football IQ priorities can produce a personalised mission.
- Any loading or selection failure falls back to **Scan First**.

## Safeguards
- No adaptive-engine import during app startup.
- No routing, onboarding, Home, Results, Player, XP or live-session controller changes.
- Existing live-rep action remains intact.
- Integration errors are caught and cannot block app rendering.

## Scope boundary
This sprint updates the Training landing experience. It does not yet remap the established live-rep controller to every adaptive mission category; that remains a separate validated integration step.
