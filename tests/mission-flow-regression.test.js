import test from "node:test";
import assert from "node:assert/strict";
import { MISSION_LIFECYCLE } from "../src/missions/mission-contract.js";
import {
  readCurrentMission,
  readMissionHistory,
} from "../src/missions/mission-store.js";
import {
  HOME_MISSION_ID,
  missionTileAttributes,
  resolveHomeMission,
} from "../js/app/home-mission-tile.js";
import {
  beginBriefedMission,
  prepareMissionBrief,
  renderMissionBrief,
} from "../js/app/mission-brief.js";
import { markMissionResultsReady } from "../js/app/mission-results-handoff.js";
import {
  completeCurrentMission,
  renderMissionComplete,
} from "../js/app/mission-complete.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
}

function appState(level = 3) {
  return {
    game: { level },
  };
}

test("Gate C canonical flow completes and Home assigns the next mission", () => {
  const storage = memoryStorage();

  const assigned = resolveHomeMission(appState(), storage);
  assert.equal(assigned.id, HOME_MISSION_ID);
  assert.equal(assigned.lifecycle, MISSION_LIFECYCLE.ASSIGNED);
  assert.match(missionTileAttributes(assigned), /data-mission-lifecycle="assigned"/);

  const briefed = prepareMissionBrief(storage);
  assert.equal(briefed.lifecycle, MISSION_LIFECYCLE.BRIEFED);
  assert.match(renderMissionBrief(briefed), /data-mission-lifecycle="briefed"/);

  const active = beginBriefedMission(storage);
  assert.equal(active.lifecycle, MISSION_LIFECYCLE.ACTIVE);

  const resultsReady = markMissionResultsReady({
    id: "regression-result-1",
    summary: "Full flow passed",
  }, storage);
  assert.equal(resultsReady.lifecycle, MISSION_LIFECYCLE.RESULTS_READY);
  assert.equal(resultsReady.metadata.resultId, "regression-result-1");

  const completed = completeCurrentMission({}, storage);
  assert.equal(completed.lifecycle, MISSION_LIFECYCLE.COMPLETED);
  assert.equal(completed.metadata.completionResultId, "regression-result-1");
  assert.match(renderMissionComplete(completed), /RETURN HOME/);

  const next = resolveHomeMission(appState(), storage);
  assert.equal(next.id, HOME_MISSION_ID);
  assert.equal(next.lifecycle, MISSION_LIFECYCLE.ASSIGNED);
  assert.ok(next.updatedAt >= completed.updatedAt);
  assert.equal(readCurrentMission(storage).lifecycle, MISSION_LIFECYCLE.ASSIGNED);
});

test("Home preserves every in-progress mission lifecycle", () => {
  const storage = memoryStorage();
  resolveHomeMission(appState(), storage);

  const briefed = prepareMissionBrief(storage);
  assert.equal(resolveHomeMission(appState(), storage).lifecycle, briefed.lifecycle);

  const active = beginBriefedMission(storage);
  assert.equal(resolveHomeMission(appState(), storage).lifecycle, active.lifecycle);

  const ready = markMissionResultsReady({}, storage);
  assert.equal(resolveHomeMission(appState(), storage).lifecycle, ready.lifecycle);
});

test("quick Results access cannot advance a mission that was not started", () => {
  const storage = memoryStorage();
  resolveHomeMission(appState(), storage);

  const unchanged = markMissionResultsReady({ id: "should-not-bind" }, storage);
  assert.equal(unchanged.lifecycle, MISSION_LIFECYCLE.ASSIGNED);
  assert.equal(unchanged.metadata.resultId, undefined);
});

test("the lifecycle history records the canonical order", () => {
  const storage = memoryStorage();
  resolveHomeMission(appState(), storage);
  prepareMissionBrief(storage);
  beginBriefedMission(storage);
  markMissionResultsReady({}, storage);
  completeCurrentMission({}, storage);

  const states = readMissionHistory(storage).map(entry => entry.lifecycle);
  assert.deepEqual(states, [
    MISSION_LIFECYCLE.ASSIGNED,
    MISSION_LIFECYCLE.BRIEFED,
    MISSION_LIFECYCLE.ACTIVE,
    MISSION_LIFECYCLE.RESULTS_READY,
    MISSION_LIFECYCLE.COMPLETED,
  ]);
});

test("repeated lifecycle actions remain idempotent", () => {
  const storage = memoryStorage();
  resolveHomeMission(appState(), storage);

  const firstBrief = prepareMissionBrief(storage);
  const secondBrief = prepareMissionBrief(storage);
  assert.equal(secondBrief.updatedAt, firstBrief.updatedAt);

  const firstActive = beginBriefedMission(storage);
  const secondActive = beginBriefedMission(storage);
  assert.equal(secondActive.updatedAt, firstActive.updatedAt);

  const firstReady = markMissionResultsReady({ id: "first-result" }, storage);
  const secondReady = markMissionResultsReady({ id: "second-result" }, storage);
  assert.equal(secondReady.metadata.resultId, firstReady.metadata.resultId);

  const firstComplete = completeCurrentMission({}, storage);
  const secondComplete = completeCurrentMission({ resultId: "replacement" }, storage);
  assert.equal(secondComplete.metadata.completedAt, firstComplete.metadata.completedAt);
  assert.equal(secondComplete.metadata.completionResultId, firstComplete.metadata.completionResultId);
});
