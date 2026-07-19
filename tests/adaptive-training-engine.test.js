import test from "node:test";
import assert from "node:assert/strict";

import {
  AdaptiveTrainingEngine,
  EVIDENCE_THRESHOLDS,
  FOOTBALL_IQ_CONSTRUCTS,
  MISSION_CATALOG,
} from "../src/training/adaptive-training-engine.js";
import {
  ADAPTIVE_TRAINING_HISTORY_KEY,
  getRecentMissionIds,
  recordMission,
} from "../src/training/adaptive-training-history.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

function profile(overrides = {}) {
  return {
    sourceAssessmentId: "assessment-1",
    priorities: [{
      constructId: "decisionQuality",
      label: "Decision Quality",
      observations: EVIDENCE_THRESHOLDS.minimumObservations,
      confidence: EVIDENCE_THRESHOLDS.minimumConfidence,
      recommendationStrength: "provisional",
    }],
    ...overrides,
  };
}

test("catalog covers every Football IQ construct", () => {
  for (const constructId of FOOTBALL_IQ_CONSTRUCTS) {
    assert.ok(MISSION_CATALOG.some((mission) => mission.constructId === constructId));
  }
});

test("reliable evidence selects a personalised mission", () => {
  const selection = AdaptiveTrainingEngine.selectMission(profile());
  assert.equal(selection.mode, "personalised");
  assert.equal(selection.sourceConstructId, "decisionQuality");
  assert.equal(selection.sourceAssessmentId, "assessment-1");
  assert.ok(["decision", "reaction"].includes(selection.mission.drillId));
});

test("insufficient observations use balanced evidence collection", () => {
  const selection = AdaptiveTrainingEngine.selectMission(profile({
    priorities: [{
      constructId: "decisionQuality",
      observations: EVIDENCE_THRESHOLDS.minimumObservations - 1,
      confidence: 1,
    }],
  }));
  assert.equal(selection.mode, "balanced_evidence_building");
  assert.equal(selection.sourceConstructId, "awareness");
});

test("insufficient confidence uses balanced evidence collection", () => {
  const selection = AdaptiveTrainingEngine.selectMission(profile({
    priorities: [{
      constructId: "decisionQuality",
      observations: 99,
      confidence: EVIDENCE_THRESHOLDS.minimumConfidence - 0.01,
    }],
  }));
  assert.equal(selection.mode, "balanced_evidence_building");
});

test("withheld recommendations never trigger personalisation", () => {
  const selection = AdaptiveTrainingEngine.selectMission(profile({
    priorities: [{
      constructId: "decisionQuality",
      observations: 99,
      confidence: 1,
      recommendationStrength: "withheld",
    }],
  }));
  assert.equal(selection.mode, "balanced_evidence_building");
});

test("recent mission history rotates suitable missions", () => {
  const first = AdaptiveTrainingEngine.selectMission(profile());
  const second = AdaptiveTrainingEngine.selectMission(profile(), {
    recentMissionIds: [first.mission.id],
  });
  assert.notEqual(first.mission.id, second.mission.id);
  assert.equal(second.sourceConstructId, "decisionQuality");
});

test("balanced rotation moves to the least represented construct", () => {
  const selection = AdaptiveTrainingEngine.selectMission({}, {
    recentMissionIds: ["scan-first", "spot-the-cue"],
  });
  assert.equal(selection.sourceConstructId, "gameReading");
});

test("mission history persists in bounded order", () => {
  const storage = memoryStorage();
  recordMission("scan-first", { storage });
  recordMission("spot-the-cue", { storage });
  assert.deepEqual(getRecentMissionIds({ storage }), ["scan-first", "spot-the-cue"]);
  assert.equal(storage.getItem(ADAPTIVE_TRAINING_HISTORY_KEY), '["scan-first","spot-the-cue"]');
});
