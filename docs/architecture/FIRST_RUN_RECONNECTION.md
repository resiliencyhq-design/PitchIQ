# First-Run Architecture Consolidation

**Status:** Implementation contract  
**Scope:** Reconnect approved first-run screens under one authoritative owner without rebuilding approved UI.

## Canonical sequence

1. Landing
2. Name
3. Squad Number
4. Favourite Position
5. Know Your Strengths
6. Academy Induction
7. Meet Your Coach
8. Meet the Camera
9. Practice
10. Sign Your Player Contract and collect parent/guardian email
11. Choose Avatar
12. Choose Player Style
13. Home

## Ownership rule

`FirstRunController` is the only owner of:

- current first-run step;
- step order;
- route entry and route protection;
- resume after refresh or app closure;
- completion state;
- repair of incomplete identity state;
- reset of first-run state.

Screens own presentation and local validation only. A screen reports completion and must not hard-code its successor.

## Current audit findings

The live application currently exposes only one `onboard` route with three internal panels. The final `save-profile` interaction persists identity and routes directly to Home. Therefore the approved post-position screens are not presently connected to the live first-run walkthrough.

The repository also contains older architecture language for Identity Complete, Academy Orientation, Academy Accepted and Avatar. Those terms must be mapped to the approved sequence above rather than creating a second competing journey.

## Reconnection requirements

- Preserve all approved screen layouts and assets discovered during implementation.
- Map each existing screen/module to one canonical first-run step.
- Add only missing screens or missing required fields after confirming no reusable implementation exists.
- Contract email must be labelled as parent/guardian email unless Product Owner approves another account model.
- Camera denial or unavailable hardware must provide recovery and must not permanently trap the player.
- Practice is low pressure and does not create formal Football IQ scores.
- Avatar does not complete first run; Player Style is the final personalisation step.
- Home remains inaccessible to a new player until all required first-run steps are complete.
- Existing completed players must be migrated safely and must not be forced through first run again.
- Player Reset must clear canonical first-run state and all known legacy onboarding locks.

## State contract

```js
{
  version: 1,
  status: "not_started" | "in_progress" | "complete",
  currentStep: "landing" | "name" | "number" | "position" |
    "know-your-strengths" | "academy-induction" | "meet-your-coach" |
    "meet-the-camera" | "practice" | "player-contract" | "avatar" |
    "player-style" | "complete",
  completedSteps: [],
  completedAt: null
}
```

## Acceptance tests

1. A new player sees every canonical step once in order.
2. Refreshing or closing at every step resumes at the correct unfinished step.
3. A completed player enters Home on subsequent launches.
4. Home, Training, Results and Player cannot be opened before first-run completion.
5. Reset Player returns to Landing and clears legacy onboarding locks.
6. Existing completed users are preserved through migration.
7. Camera permission denial has a supported recovery path.
8. Practice data is excluded from formal Football IQ scoring.
9. Contract email validation and acceptance are persisted.
10. Avatar completion routes to Player Style, not Home.
11. Player Style completion marks first run complete and enters Home.
12. iPhone Safari and desktop follow the same sequence.
