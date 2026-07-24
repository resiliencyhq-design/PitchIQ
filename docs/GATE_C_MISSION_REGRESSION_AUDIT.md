# Gate C Mission Regression Audit

Status: **Ready for review**  
Scope: PRs 1–6, canonical mission architecture

## Locked canonical flow

`Home → Mission Brief → Activity → Results → Mission Complete → Home`

Canonical lifecycle:

`assigned → briefed → active → results_ready → completed`

Supported terminal alternative:

`abandoned`

## Automated regression coverage

The Gate C integration suite verifies that:

- Home creates the canonical daily mission when no active mission exists.
- Home preserves missions already in `assigned`, `briefed`, `active`, or `results_ready`.
- The Mission Brief advances only `assigned → briefed`.
- Start Mission advances `briefed → active`.
- Results advances only `active → results_ready`.
- Quick Results access cannot complete or advance an unstarted mission.
- Mission Complete advances only `results_ready → completed`.
- Completion metadata preserves the canonical result identity and summary.
- Returning Home replaces a completed mission with a new assigned mission.
- Repeated lifecycle actions are idempotent.
- Mission history records the canonical lifecycle order.
- Mission Brief and Mission Complete retain their required navigation actions.

## Regression boundary

Gate C intentionally does not change:

- approved Home layout or component ordering,
- Home hero, Football IQ ring, avatar or OVR panel,
- compact Today’s Mission tile presentation,
- quick Training behavior,
- Training scoring, timing, stages or activity runtime,
- Results scoring or existing visual presentation,
- Player,
- onboarding,
- Explore carousel,
- bottom navigation presentation,
- Lab and Academy modules.

## Architecture ownership

- `src/missions/mission-contract.js` — canonical mission shape and lifecycle constants.
- `src/missions/mission-store.js` — persistence, lifecycle transitions and history.
- `js/app/home-mission-tile.js` — Home mission assignment and replacement policy.
- `js/app/mission-brief.js` — universal briefing and activity start.
- `js/app/mission-results-handoff.js` — isolated Activity/Results lifecycle handoff.
- `js/app/mission-complete.js` — completion presentation and Home return.
- `tests/mission-flow-regression.test.js` — full Gate C integration contract.

## Manual device validation checklist

Before production lock, validate on the current iPhone target:

1. Open Home and select only the Today’s Mission CTA.
2. Confirm Mission Brief opens and the bottom navigation is hidden.
3. Return to Home from the brief and confirm the mission remains briefed.
4. Re-enter and start the mission.
5. Complete the existing activity without changes to its scoring or stage flow.
6. Confirm Results appears normally and exposes Complete Mission.
7. Confirm Complete Mission does not appear when Results is opened from the separate quick Results action without an active mission.
8. Open Mission Complete and verify title, XP, reward, objectives and summary.
9. Return Home and confirm the compact tile remains in its locked position and a new mission is assigned.
10. Confirm Training, Player, onboarding, Explore carousel and bottom navigation still open and return normally.

## Deployment note

Recent Vercel preview failures were caused by the free deployment daily limit. They were not evidence of a Gate C code or lifecycle failure. Build and device validation should be repeated when preview capacity is available.

## Lock recommendation

Gate C can be locked after:

- the repository test command passes,
- the production build passes,
- the manual device checklist passes,
- and no unrelated visual regression is observed.
