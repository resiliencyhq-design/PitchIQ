import test from "node:test";
import assert from "node:assert/strict";
import {
  createMissionContract,
  isMissionContract,
  MISSION_LIFECYCLE,
  MISSION_TYPES,
} from "../src/missions/mission-contract.js";
import {
  assignMission,
  clearCurrentMission,
  readCurrentMission,
  readMissionHistory,
  transitionMission,
} from "../src/missions/mission-store.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
}

function sampleMission() {
  return {
    id: "scan-first",
    type: MISSION_TYPES.FOOTBALL_IQ,
    title: "Scan First",
    category: "Awareness",
    purpose: "Build an earlier scan before receiving the ball.",
    activity: {
      adapterId: "scan-first-v1",
      route: "training",
      moduleId: "scan-cue",
    },
    objectives: [{ id: "cues", label: "Scan 20 cues", target: 20, unit: "cues" }],
    reward: { xp: 120, rewardId: "academy-boots", label: "Elite Boots" },
  };
}

test("creates a frozen canonical mission contract", () => {
  const mission = createMissionContract(sampleMission());
  assert.equal(mission.lifecycle, MISSION_LIFECYCLE.ASSIGNED);
  assert.equal(mission.activity.adapterId, "scan-first-v1");
  assert.equal(mission.objectives[0].target, 20);
  assert.equal(Object.isFrozen(mission), true);
  assert.equal(isMissionContract(mission), true);
});

test("rejects incomplete or unsupported missions", () => {
  assert.throws(() => createMissionContract({}), /Mission type/);
  assert.throws(() => createMissionContract({ ...sampleMission(), type: "unknown" }), /Unsupported mission type/);
  assert.throws(() => createMissionContract({ ...sampleMission(), activity: {} }), /adapterId/);
});

test("assigns, reads and transitions the current mission", () => {
  const storage = memoryStorage();
  const assigned = assignMission(sampleMission(), storage);
  assert.equal(assigned.lifecycle, MISSION_LIFECYCLE.ASSIGNED);
  assert.equal(readCurrentMission(storage)?.id, "scan-first");

  const briefed = transitionMission(MISSION_LIFECYCLE.BRIEFED, {}, storage);
  assert.equal(briefed.lifecycle, MISSION_LIFECYCLE.BRIEFED);

  const completed = transitionMission(MISSION_LIFECYCLE.COMPLETED, {
    metadata: { resultId: "result-1" },
  }, storage);
  assert.equal(completed.metadata.resultId, "result-1");
  assert.equal(readMissionHistory(storage).length, 3);

  clearCurrentMission(storage);
  assert.equal(readCurrentMission(storage), null);
});
