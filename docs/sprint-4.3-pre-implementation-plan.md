# PRE-IMPLEMENTATION PLAN

## 1. Objective

Transform the existing PitchIQ Training experience from a single combined screen into an in-route staged flow:

```text
Training Home
↓
Choose Drill
↓
Choose Difficulty
↓
Session Preview
↓
Live Session
↓
Results
↓
Claim Reward
```

The objective is UX improvement only. The implementation should preserve existing Training functionality: drill selection, session creation, cues, manual answers, voice option where currently supported, scoring, combo, XP/progression, analytics logging, daily completion, and reward flow.

## 2. Scope

### Included

- Add a small Training-stage controller inside the existing `training` route.
- Render the correct Training stage using the existing `renderTraining()` pattern.
- Reuse current route/navigation approach with `data-action`, `data-route`, `data-drill`, and `data-answer`.
- Reuse existing UI styles: `.glass`, `.tile`, `.stat`, `.drill-card`, `.actions`, and existing button classes.
- Preserve existing session, scoring, XP, analytics, and reward logic.
- Keep all seven stages inside the existing `training` route.
- Show drill title, description, duration, and skill focus in Choose Drill.
- Show Easy, Medium, and Hard choices with short explanations.
- Show drill, difficulty, duration, goal, and available points/reward estimate in Session Preview.
- Show cue, instruction, time, score, combo, and complete-session action in Live Session.
- Show drill, difficulty, simple performance summary, and earned XP/reward in Results.
- Show Claim Reward confirmation and return to Training Home.

### Explicitly excluded

- No new global routes for each Training stage.
- No React migration.
- No new framework.
- No new dependencies.
- No new project.
- No localStorage schema changes.
- No build configuration changes.
- No unrelated route or feature modifications.
- No camera service changes.
- No voice service changes.
- No global progression/scoring rewrite.
- No broad CSS refactor.

## 3. Files to modify

### `js/app/routes.js`

Why it must change:

- It owns the existing `renderTraining(state)` markup.
- The Training UI must render different stage screens inside the existing route.

What will change:

- Extend `renderTraining()` to accept Training UI context from `main.js`.
- Render the seven Training stages using existing template-string route rendering.
- Preserve existing Live Session element IDs required by current Training logic:
  - `time`
  - `score`
  - `combo`
  - `cue`
  - `instruction`
- Use existing visual patterns rather than introducing new components.
- Keep all stage controls as `data-action` buttons handled by `main.js`.

### `js/app/main.js`

Why it must change:

- It currently owns Training state, selected drill, active session, timer, scoring, cue progression, and action handling.
- It must control transitions between the seven internal Training stages.

What will change:

- Add minimal transient Training UI state, likely:
  - current Training stage
  - selected difficulty
  - result summary or last completed session data
- Add Training-specific `data-action` handling for:
  - open Choose Drill
  - select difficulty
  - preview session
  - start live session
  - finish to results
  - continue to claim reward
  - claim reward and return to Training Home
- Preserve existing `startTraining()`, `correct()`, `wrong()`, `manualAnswer()`, `nextCue()`, and XP/progression behavior as much as possible.
- Adjust `finishTraining()` so it records completion and moves to the Training Results stage rather than immediately routing to the global Reward screen.
- Keep any reward claiming compatible with existing reward/progression behavior.

### `js/game/session.js`

Why it may change:

- Only required if Easy/Medium/Hard must influence actual session difficulty in a way that cannot safely be handled in `main.js`.

What will change if needed:

- Add a backwards-compatible optional parameter to `createSession()`.
- Preserve existing defaults and exports.
- Avoid changing cue pools, drill selection defaults, or existing session result shape.

Preferred outcome:

- Do not modify this file unless the implementation cannot honestly support difficulty selection without it.

### `js/data/drills.js`

Why it may change:

- Choose Drill requires description and skill focus.
- Existing drill metadata may already support this.

What will change if needed:

- Add only display-safe metadata to existing drill objects.
- Do not alter drill IDs, durations, position eligibility, cue pools, or difficulty values unless explicitly approved.

Preferred outcome:

- Do not modify if existing metadata is sufficient.

### `css/style.css`

Why it may change:

- Existing styles may be enough, but staged Training may need minor layout spacing.

What will change if needed:

- Add Training-specific CSS only.
- No modification to global shared styles such as `.glass`, `.tile`, `.stat`, `button`, `.screen`, `.nav`, or `.actions`.

Preferred outcome:

- Avoid CSS changes unless the staged screens are unusable with existing classes.

## 4. Files NOT modified

- `index.html`
- `package.json`
- `manifest.json`
- `css/tokens.css`
- `js/services/storage.js`
- `js/services/camera.js`
- `js/services/voice.js`
- `js/game/progression.js`
- `js/game/scoring.js`
- localStorage schema
- global routing architecture
- build configuration
- unrelated route renderers unless unavoidable due to shared imports

## 5. Architecture impact

The proposed implementation is compatible with the existing PitchIQ Production Baseline v0.4.2 architecture because:

- It keeps the vanilla JS/Vite-style app.
- It keeps the existing `index.html` app shell and module entry.
- It keeps manual route rendering through `js/app/routes.js`.
- It keeps the existing `training` route rather than adding route complexity.
- It uses existing `data-action` and `data-route` event binding patterns.
- It keeps Training state transient in `main.js`.
- It avoids localStorage schema changes.
- It avoids dependency and build changes.
- It reuses existing scoring, XP, rewards, analytics, and UI patterns.

Architecture impact is limited to a small internal Training stage state machine.

## 6. Risks

### Regression risks

- Existing Training logic may expect certain DOM IDs during a live session.
- `finishTraining()` currently routes directly to Reward, so changing it could affect daily completion expectations.

Mitigation:

- Keep required Live Session IDs unchanged.
- Preserve scoring, `completeDaily()`, XP award, analytics logging, and timer clearing before showing Results.

### Routing risks

- New Training stages could accidentally be implemented as global routes.
- Back/forward behavior could conflict with existing `goto()`/`render()` flow.

Mitigation:

- Keep all stages inside `training`.
- Use internal Training stage state and re-render `training`.
- Do not modify `VALID_ROUTES` unless explicitly required, which is not expected.

### State risks

- Persistent state schema changes could break existing saved users.
- Timer state could leak between stages.

Mitigation:

- Keep stage state transient in `main.js`.
- Do not modify `js/services/storage.js`.
- Clear timers through existing Training completion/ephemeral logic.

### Styling risks

- Global CSS changes could regress Home, Camera, Player, Career, or Analytics.

Mitigation:

- Prefer existing classes.
- Add only scoped Training-specific styles if necessary.
- Do not alter global class definitions.

## 7. Verification plan

After implementation, verify:

### Navigation

- App boots without recovery screen.
- Splash/onboarding/home still render.
- Home → Training works.
- Bottom navigation still works for Home, Training, Camera, Career, and Player.
- No invalid route warnings caused by Training stages.

### Training flow

- Training Home renders.
- Choose Drill stage opens.
- Drill list shows title, description, duration, and skill focus.
- Drill selection works.
- Choose Difficulty shows Easy, Medium, Hard with explanations.
- Difficulty selection works.
- Session Preview shows drill, difficulty, duration, goal, and reward/points estimate where supported.
- Live Session starts.
- Live Session shows cue, instruction, time, score, combo, and complete-session action.
- Results stage appears after completion.
- Results show completed drill, difficulty, simple performance summary, and earned XP/reward.
- Claim Reward stage confirms reward and returns to Training Home.

### Scoring

- Correct manual answer awards XP.
- Wrong/missed answer resets combo and adjusts score as currently designed.
- Cue advances after answers.
- Combo and best combo update.

### XP/progression

- `addXP()` still updates XP and last XP.
- Weekly XP still updates.
- Level-up behavior still works.

### Rewards

- `completeDaily()` still runs after completing a session.
- Claim Reward remains compatible with existing reward/progression behavior.
- Global Reward route is not broken.

### Console/runtime

- No red console errors.
- No missing DOM node errors for `cue`, `instruction`, `time`, `score`, or `combo`.
- No module import/export errors.
- No boot watchdog display.

### Commands/static checks

- Inspect `package.json` for scripts.
- Run any available scripts if present.
- If no scripts exist, perform static checks of imports/exports, route/action names, and manual Vite app flow checks.

## 8. Confidence (0–100)

Confidence: 91

The current app already contains the key Training primitives: drills, sessions, cues, manual scoring, XP/progression, analytics logging, and reward completion. The work is primarily a controlled UX/state-flow change. The main risk is that Training logic lives in the global app controller, so the implementation must be narrowly scoped and careful with existing DOM IDs and action handlers.

## 9. Supervisor Summary

This plan proposes a minimal, compatible Sprint 4.3 implementation that keeps the staged Training flow inside the existing `training` route. It avoids architecture changes, avoids new dependencies, preserves existing scoring/progression/reward systems, and limits changes primarily to `js/app/routes.js` and `js/app/main.js`.

Waiting for CTO approval: YES
