import test from "node:test";
import assert from "node:assert/strict";
import {
  createTrainingEvidence,
  summariseTrainingEvidence,
  calculateAssessmentReadiness,
} from "../src/evidence/training-evidence.js";
import {
  saveTrainingEvidence,
  listTrainingEvidence,
} from "../src/evidence/training-evidence-storage.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

function record(day, constructId = "awareness", drillId = "scanning") {
  return createTrainingEvidence({
    playerId: "player-1",
    sessionId: `session-${day}-${constructId}`,
    constructId,
    drillId,
    durationSeconds: 240,
    completionRate: 1,
    accuracy: 0.8,
    completedAt: `2026-07-${String(day).padStart(2, "0")}T10:00:00.000Z`,
  });
}

test("creates bounded structured training evidence", () => {
  const evidence = createTrainingEvidence({
    playerId: "p1",
    sessionId: "s1",
    drillId: "vision",
    completionRate: 2,
    accuracy: -1,
  });
  assert.equal(evidence.completionRate, 1);
  assert.equal(evidence.accuracy, 0);
  assert.ok(evidence.confidence >= 0 && evidence.confidence <= 1);
  assert.equal(evidence.source, "training");
});

test("summarises repetition consistency and variability", () => {
  const summary = summariseTrainingEvidence([
    record(1),
    record(2, "decisionQuality", "decision"),
    record(3, "useOfSpace", "position"),
  ]);
  assert.equal(summary.sessions, 3);
  assert.equal(summary.activeDays, 3);
  assert.equal(summary.constructs.length, 3);
  assert.ok(summary.evidenceQuality > 0.5);
});

test("reassessment readiness requires quality time and repeated evidence", () => {
  const records = [
    record(10),
    record(12, "decisionQuality", "decision"),
    record(14, "useOfSpace", "position"),
    record(15, "adaptability", "dual"),
    record(16, "gameReading", "vision"),
  ];
  const readiness = calculateAssessmentReadiness(records, {
    now: new Date("2026-07-19T10:00:00.000Z"),
    lastAssessmentAt: "2026-07-01T10:00:00.000Z",
  });
  assert.equal(readiness.ready, true);
  assert.equal(readiness.state, "ready");
});

test("training evidence persistence de-duplicates sessions", () => {
  const storage = memoryStorage();
  saveTrainingEvidence(record(1), { storage });
  saveTrainingEvidence({ ...record(1), confidence: 0.9 }, { storage });
  const records = listTrainingEvidence("player-1", { storage });
  assert.equal(records.length, 1);
  assert.equal(records[0].confidence, 0.9);
});
