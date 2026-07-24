import test from "node:test";
import assert from "node:assert/strict";
import { assignMission, readCurrentMission, transitionMission } from "../src/missions/mission-store.js";
import { MISSION_LIFECYCLE, MISSION_TYPES } from "../src/missions/mission-contract.js";
import { completeCurrentMission, renderMissionComplete } from "../js/app/mission-complete.js";

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
    id: "mission-complete-test",
    type: MISSION_TYPES.FOOTBALL_IQ,
    title: "Scan First",
    category: "Awareness",
    activity: { adapterId: "scan-v1", route: "training" },
    objectives: [{ id: "scan", label: "Scan 20 cues", target: 20, unit: "cues" }],
    reward: { xp: 120, label: "Elite Boots" },
  };
}

test("results_ready missions transition to completed with metadata", () => {
  const storage = memoryStorage();
  assignMission(mission(), storage);
  transitionMission(MISSION_LIFECYCLE.ACTIVE, {}, storage);
  transitionMission(MISSION_LIFECYCLE.RESULTS_READY, {
    metadata: { resultId: "result-42", resultSummary: "Strong awareness" },
  }, storage);

  const completed = completeCurrentMission({}, storage);

  assert.equal(completed.lifecycle, MISSION_LIFECYCLE.COMPLETED);
  assert.equal(completed.metadata.completionResultId, "result-42");
  assert.equal(completed.metadata.completionSummary, "Strong awareness");
  assert.equal(completed.metadata.completionRoute, "mission-complete");
  assert.equal(typeof completed.metadata.completedAt, "number");
});

test("non-results_ready missions are not completed", () => {
  const storage = memoryStorage();
  assignMission(mission(), storage);

  const unchanged = completeCurrentMission({}, storage);

  assert.equal(unchanged.lifecycle, MISSION_LIFECYCLE.ASSIGNED);
  assert.equal(readCurrentMission(storage).lifecycle, MISSION_LIFECYCLE.ASSIGNED);
});

test("mission completion is idempotent", () => {
  const storage = memoryStorage();
  assignMission(mission(), storage);
  transitionMission(MISSION_LIFECYCLE.ACTIVE, {}, storage);
  transitionMission(MISSION_LIFECYCLE.RESULTS_READY, {}, storage);

  const first = completeCurrentMission({ resultId: "result-42" }, storage);
  const second = completeCurrentMission({ resultId: "result-99" }, storage);

  assert.equal(second.lifecycle, MISSION_LIFECYCLE.COMPLETED);
  assert.equal(second.metadata.completionResultId, first.metadata.completionResultId);
  assert.equal(second.metadata.completedAt, first.metadata.completedAt);
});

test("renders mission title, objectives, reward and Home action", () => {
  const storage = memoryStorage();
  assignMission(mission(), storage);
  transitionMission(MISSION_LIFECYCLE.ACTIVE, {}, storage);
  transitionMission(MISSION_LIFECYCLE.RESULTS_READY, {}, storage);

  const html = renderMissionComplete(completeCurrentMission({}, storage));

  assert.match(html, /MISSION COMPLETE/);
  assert.match(html, /Scan First/);
  assert.match(html, /Scan 20 cues/);
  assert.match(html, /\+120 XP/);
  assert.match(html, /RETURN HOME/);
});
