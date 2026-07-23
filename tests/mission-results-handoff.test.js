import test from "node:test";
import assert from "node:assert/strict";
import { assignMission, readCurrentMission, transitionMission } from "../src/missions/mission-store.js";
import { MISSION_LIFECYCLE, MISSION_TYPES } from "../src/missions/mission-contract.js";
import { markMissionResultsReady } from "../js/app/mission-results-handoff.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
}

function mission() {
  return {
    id: "results-handoff-test",
    type: MISSION_TYPES.FOOTBALL_IQ,
    title: "Scan First",
    category: "Awareness",
    activity: { adapterId: "scan-v1", route: "training" },
    objectives: [{ id: "scan", label: "Scan 20 cues", target: 20, unit: "cues" }],
    reward: { xp: 120, label: "Elite Boots" },
  };
}

test("active missions transition to results_ready with result metadata", () => {
  const storage = memoryStorage();
  assignMission(mission(), storage);
  transitionMission(MISSION_LIFECYCLE.ACTIVE, {}, storage);

  const ready = markMissionResultsReady({ id: "result-42", summary: "Strong awareness" }, storage);

  assert.equal(ready.lifecycle, MISSION_LIFECYCLE.RESULTS_READY);
  assert.equal(ready.metadata.resultId, "result-42");
  assert.equal(ready.metadata.resultSummary, "Strong awareness");
  assert.equal(ready.metadata.resultRoute, "results");
});

test("non-active missions are not advanced by Results rendering", () => {
  const storage = memoryStorage();
  assignMission(mission(), storage);

  const unchanged = markMissionResultsReady({ id: "result-42" }, storage);

  assert.equal(unchanged.lifecycle, MISSION_LIFECYCLE.ASSIGNED);
  assert.equal(readCurrentMission(storage).lifecycle, MISSION_LIFECYCLE.ASSIGNED);
});

test("results_ready handoff is idempotent", () => {
  const storage = memoryStorage();
  assignMission(mission(), storage);
  transitionMission(MISSION_LIFECYCLE.ACTIVE, {}, storage);
  const first = markMissionResultsReady({ id: "result-42" }, storage);
  const second = markMissionResultsReady({ id: "result-99" }, storage);

  assert.equal(second.lifecycle, MISSION_LIFECYCLE.RESULTS_READY);
  assert.equal(second.metadata.resultId, first.metadata.resultId);
});
