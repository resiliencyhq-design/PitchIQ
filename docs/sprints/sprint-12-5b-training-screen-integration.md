# Sprint 12.5B — Training Screen Integration

## Objective

Introduce adaptive mission selection only after the player explicitly enters Training, while preserving the stable application startup and current live-rep controls.

## Behaviour

1. Home and application startup remain unchanged.
2. A lightweight route listener is registered.
3. When the player selects Training, the adaptive engine is dynamically imported.
4. The engine selects either a balanced evidence-building mission or a reliable personalised priority.
5. The Training landing screen displays the selected focus, title and coaching prompt.
6. The selection and bounded history are persisted for rotation.
7. If loading or selection fails, the screen receives the default **Scan First** mission.

## Safety boundary

- The adaptive engine is not imported during application startup.
- No routing, onboarding, Home, Results, Player, XP or live-session controller code is changed.
- The existing `start-mission-training` action remains intact.
- Integration failures are caught and cannot block rendering.
- DOM updates occur only when `#training.training-reactive` exists.

## Scope note

This sprint connects adaptive selection to the Training landing experience. It deliberately does not rewrite the established live-rep controller. A later validated integration can map selected adaptive mission categories to specific live-rep drill IDs without placing new intelligence logic in the global bootstrap.

## Acceptance

- Entering Training shows an adaptive mission.
- Balanced rotation works while evidence is building.
- Reliable priorities can produce a personalised label.
- Failure produces Scan First rather than a blank screen.
- Home, Results and Player remain unchanged.
