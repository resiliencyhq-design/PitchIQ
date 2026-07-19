import test from "node:test";
import assert from "node:assert/strict";

import { selectAdaptiveMission } from "../src/training/adaptive-training.js";
import {
  ADAPTIVE_TRAINING_HISTORY_KEY,
  getRecentMissionIds,
  recordAdaptiveMission,
} from "../src/training/adaptive-training-storage.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
  };
}

function coaching({ constructId = "decisionQuality", state = "ready", strength = "provisional" } = {}) {
  return {
    sourceAssessmentId: "assessment-1",
    evidenceStatus: { state },
    priorities: state === "ready" ? [{ constructId, label: "Decision Quality", recommendationStrength: strength }] : [],
  };
}

test("ready coaching evidence selects a mission from the first reliable priority", () => {
  const selection = selectAdaptiveMission({ coachingIntelligence: coaching() });

  assert.equal(selection.mode, "personalised");
  assert.equal(selection.sourceConstructId, "decisionQuality");
  assert.equal(selection.mission.drillId, "decision");
  assert.equal(selection.sourceAssessmentId, "assessment-1");
});

test("insufficient evidence uses a balanced evidence-building mission", () => {
  const selection = selectAdaptiveMission({ coachingIntelligence: coaching({ state: "insufficient_evidence" }) });

  assert.equal(selection.mode, "balanced_evidence_building");
  assert.equal(selection.sourceConstructId, "awareness");
  assert.ok(selection.mission.id);
});

test("withheld recommendations do not trigger personalisation", () => {
  const selection = selectAdaptiveMission({ coachingIntelligence: coaching({ strength: "withheld" }) });

  assert.equal(selection.mode, "balanced_evidence_building");
});

test("recent mission history rotates between suitable missions", () => {
  const first = selectAdaptiveMission({ coachingIntelligence: coaching() });
  const second = selectAdaptiveMission({
    coachingIntelligence: coaching(),
    recentMissionIds: [first.mission.id],
  });

  assert.notEqual(first.mission.id, second.mission.id);
  assert.equal(second.sourceConstructId, "decisionQuality");
});

test("mission history persists in bounded order", () => {
  const storage = memoryStorage();
  recordAdaptiveMission("scan-first", { storage });
  recordAdaptiveMission("spot-the-cue", { storage });

  assert.deepEqual(getRecentMissionIds({ storage }), ["scan-first", "spot-the-cue"]);
  assert.equal(storage.getItem(ADAPTIVE_TRAINING_HISTORY_KEY), '["scan-first","spot-the-cue"]');
});
