# Platform 2.0 — Sprint C1 State Ownership Audit

## Objective

Map the current PitchIQ persistence landscape before introducing a versioned central state store. This sprint is documentation-only and does not change runtime behaviour.

## Current canonical state

### Integrated application state

Key: `pitchiq_integrated_v1`

Owner: `js/services/storage.js`

Shape:

- `profile`
- `game`
- `analytics`
- `settings`

Readers/writers:

- `loadState()` reads and normalises the key.
- `saveState()` writes the complete normalised object.
- `resetState()` removes the key.
- `js/app/main.js` holds an in-memory copy and persists it after renders and state changes.

Risk:

The integrated state is canonical for most game data, but profile defaults still read legacy keys during normalisation. This means a reset can be repopulated from compatibility keys unless every related owner clears them in the correct order.

## Player identity ownership

Primary service: `js/services/player-service.js`

### Legacy compatibility keys

- `pitchiqPlayerName`
- `pitchiqJerseyNumber`
- `pitchiqSelectedPosition`
- `pitchiqPlayerStyle`
- `pitchiqPlayerAvatar`
- `pitchiqOnboardingComplete`
- `pitchiqPlayerServiceMigrationV1`

Current behaviour:

- PlayerService reads integrated state.
- On first migration it reads legacy identity keys and merges them into the integrated profile.
- Every player update writes both integrated state and compatibility keys.
- Reset clears the compatibility keys and migration marker, then rewrites an empty profile into integrated state.

Risk:

Player identity currently has dual-write ownership. The integrated profile and compatibility keys can diverge, and migration can reintroduce stale values if reset or startup ordering changes.

## First-run ownership

Primary key: `pitchiqFirstRun`

Owner: `js/app/controllers/first-run-controller.js`

Schema:

- `version`
- `status`
- `currentStep`
- `completedSteps`
- `completedAt`

Repair dependencies:

- canonical player profile
- `pitchiqJerseyNumber`
- `pitchiqSelectedPosition`
- `pitchiqPlayerContract`
- `pitchiqGuardianEmail`
- `pitchiqAcademyAvatar`
- `pitchiqPlayerStyle`

Risk:

First-run progression is versioned but stored separately from the integrated application state. Its repair function reads several legacy feature keys directly, so onboarding completion remains dependent on multiple independent persistence owners.

## Main runtime session state

Owner: `js/app/main.js`

### sessionStorage keys

- `pitchiq-dev-open`
- `pitchiq-onboarding-step`
- `pitchiq-number-flow-lock`
- `pitchiq-onboarding-lock`

### localStorage keys used directly

- `pitchiqDevBorderEnabled`

Current behaviour:

- Developer panel state and visual border preference are managed directly by the main runtime.
- Reset removes three onboarding session locks explicitly.

Risk:

The reset contract is partly encoded in `main.js` rather than one persistence owner. New session locks could be added without being included in reset.

## Notification ownership

Owner: `js/app/notification-controller.js`

Keys:

- `pitchiqNotificationPreferences`
- `pitchiqNotifications`
- `pitchiqRewardNotificationSnapshot`
- `pitchiqTrainingNotificationSnapshot`

Current behaviour:

- Preferences, notification history and progression snapshots are each persisted independently.
- The controller reads and writes localStorage directly.
- Reset is invoked by the main runtime through `notifications.reset()`.

Risk:

Notification persistence is isolated from the integrated state and has its own reset/migration contract. Progression snapshots depend on game state but are not updated atomically with it.

## State ownership matrix

| Domain | Current primary owner | Persistent source | Secondary/compatibility owners | Reset owner |
|---|---|---|---|---|
| Core game/profile/settings | `storage.js` + `main.js` | `pitchiq_integrated_v1` | PlayerService compatibility keys | `resetState()` plus PlayerService |
| Player identity | `PlayerService` | integrated profile | six legacy keys + migration marker | `PlayerService.resetPlayer()` |
| First run | `FirstRunController` | `pitchiqFirstRun` | contract, guardian, avatar, style and identity keys | `FirstRunController.reset()` |
| Training runtime | `TrainingController` + main state | integrated game/analytics | transient controller state | `training.home()` plus integrated reset |
| Notifications | `NotificationController` | four notification keys | reads game progression | `NotificationController.reset()` |
| Developer/session UI | `main.js` | sessionStorage/localStorage | none | partial explicit cleanup |
| Academy/Lab feature state | feature modules | feature-specific keys | first-run repair reads some values | feature-specific or global reset paths |

## Confirmed architectural problems

1. There is no single persistence authority.
2. Player identity is written to both canonical and compatibility storage.
3. First-run completion is stored separately and repaired from several unrelated keys.
4. Reset is an orchestration sequence across multiple services rather than one atomic operation.
5. Startup hydration reads from both canonical and legacy stores.
6. Feature controllers can write localStorage directly without schema registration.
7. There is no global schema version covering all persistent domains.
8. There is no central key registry or ownership enforcement.
9. State updates and dependent notification snapshots are not atomic.
10. Corrupt-state recovery exists only for the integrated key, not for all feature stores.

## Target architecture

Introduce one versioned `StateStore` with these boundaries:

- one root schema version;
- domain slices for profile, first run, game, analytics, settings, notifications and feature preferences;
- one hydration and migration pipeline;
- one atomic reset contract;
- typed/default normalisation per slice;
- controlled compatibility-key mirroring during migration only;
- state-change events published after committed updates;
- feature services consume the store instead of localStorage directly.

## Recommended migration sequence

### C2 — StateStore foundation

- Add a key registry and versioned root schema.
- Wrap the existing integrated key without changing feature behaviour.
- Add read, update, subscribe and reset APIs.
- Preserve all current compatibility keys.

### C3 — Player and first-run migration

- Move PlayerService to the StateStore profile slice.
- Move FirstRunController to the first-run slice.
- Make startup hydration deterministic.
- Keep legacy reads as one-way migrations only.

### C4 — Notifications and feature preferences

- Move notification preferences, history and snapshots into registered slices.
- Migrate Academy and Lab preferences progressively.

### C5 — Atomic reset and legacy retirement

- Replace orchestrated reset calls with one store reset transaction.
- Clear registered session keys through the same reset policy.
- Remove compatibility dual writes after reliability-harness validation.

## Regression gates for Sprint C

1. Fresh install enters Landing.
2. First run resumes at the exact saved step after refresh.
3. Returning player opens Home.
4. Reset clears profile, first run, training state and notification state.
5. Reset cannot be repopulated by legacy keys.
6. Existing users migrate without losing player identity, XP, analytics or settings.
7. Corrupt state recovers safely.
8. Notification preferences persist across reloads.
9. Academy and Lab preferences remain intact during staged migration.
10. No feature writes unregistered localStorage keys after final cleanup.

## C1 exit decision

The audit confirms that PitchIQ is ready for a staged StateStore migration. Runtime changes should begin with C2 and must preserve compatibility until automated regression evidence proves each legacy owner can be retired.
