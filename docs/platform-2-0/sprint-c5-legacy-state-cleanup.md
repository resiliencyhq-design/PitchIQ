# Platform 2.0 — Sprint C5: Legacy State Cleanup

## Objective

Close the State Authority phase by classifying remaining compatibility keys, removing only demonstrably obsolete ownership paths, and preserving any keys still required by first-run repair or older feature runtimes.

## Current canonical owners

- `pitchiq_integrated_v1` — versioned StateStore envelope
- `state.profile` — canonical player identity
- `state.firstRun` — canonical first-run progression
- `state.notifications` — canonical notification preferences, history and snapshots

## Compatibility keys still present

### Player compatibility

- `pitchiqPlayerName`
- `pitchiqJerseyNumber`
- `pitchiqSelectedPosition`
- `pitchiqPlayerStyle`
- `pitchiqPlayerAvatar`
- `pitchiqOnboardingComplete`
- `pitchiqPlayerServiceMigrationV1`

These remain migration-only or compatibility-write keys. They are not the canonical player source.

### First-run repair dependencies

- `pitchiqPlayerContract`
- `pitchiqGuardianEmail`
- `pitchiqAcademyAvatar`
- `pitchiqPlayerStyle`

These remain required because first-run repair still validates contract, guardian, avatar and style completion against them.

### Session-only compatibility locks

- `pitchiq-onboarding-step`
- `pitchiq-number-flow-lock`
- `pitchiq-onboarding-lock`

These are reset-time cleanup keys. They should remain until the corresponding legacy onboarding listeners are proven retired by automated regression coverage.

### Developer-only preferences

- `pitchiq-dev-open`
- `pitchiqDevBorderEnabled`

These are intentional developer settings and are outside player-state migration scope.

## Cleanup decisions

1. Canonical reads must prefer StateStore.
2. Legacy player keys may be imported only when the migration marker is absent.
3. Legacy first-run payloads are imported once and then removed.
4. Notification legacy keys are imported once and then removed.
5. Player compatibility writes remain temporarily because older modules may still consume them.
6. Contract, guardian, Academy avatar and style keys remain until their producing modules move into StateStore.
7. Reset must clear canonical state plus all registered compatibility keys in one orchestrated path.
8. No compatibility key should be removed solely because code search returns no result; runtime regression evidence is required.

## Remaining architectural risks

- Main reset still coordinates several owners sequentially rather than through one dedicated reset transaction service.
- `FirstRunController.repair()` still reads independent contract, guardian and Academy compatibility values.
- PlayerService still dual-writes identity keys for compatibility.
- Some feature modules may be loaded dynamically and therefore may not appear reliably in indexed code search.

## Exit criteria

Sprint C is complete when:

- canonical profile, first-run and notification state are stored in StateStore;
- legacy first-run and notification payloads migrate once;
- remaining player and Academy keys are explicitly classified;
- reset clears all currently registered state owners and compatibility locks;
- no compatibility owner is removed without regression evidence;
- follow-up retirement work is deferred to a versioned deprecation sprint backed by the Reliability Harness.

## Regression gate

1. Fresh install starts at Landing.
2. Mid-onboarding refresh resumes at the correct step.
3. Returning player opens Home.
4. Player identity persists after reload.
5. Legacy player identity migrates without data loss.
6. Legacy first-run state migrates once.
7. Notification state migrates and persists.
8. Reset returns to Landing and removes player identity.
9. Protected routes remain blocked before completion.
10. Contract, guardian, avatar and player-style repair still works.
11. Training progression and Results state remain intact.
12. No duplicate state-change event is emitted for one transaction.

## Exit decision

The State Authority architecture is complete after this audit and cleanup boundary. Physical removal of retained compatibility keys should occur only after automated browser regression evidence confirms their producers and consumers have been migrated.
