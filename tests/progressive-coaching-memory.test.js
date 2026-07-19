import test from "node:test";
import assert from "node:assert/strict";
import { resolveProgressiveCoachingMemory } from "../src/coaching/progressive-coaching-memory.js";

const selection = { mission: { id: "scan-1", drillId: "scanning", title: "Scan First" } };

test("reinforces a cue the player previously noticed", () => {
  const memory = resolveProgressiveCoachingMemory({
    selection,
    reflections: [{ focusId: "scanning", responseId: "noticed", createdAt: "2026-07-19T10:00:00Z" }]
  });
  assert.equal(memory.stage, "reinforce");
  assert.match(memory.message, /Last time you noticed/);
});

test("supports a focus marked as still learning", () => {
  const memory = resolveProgressiveCoachingMemory({
    selection,
    reflections: [{ focusId: "scanning", responseId: "learning", createdAt: "2026-07-19T10:00:00Z" }]
  });
  assert.equal(memory.stage, "support");
  assert.equal(memory.changesFootballIQ, false);
  assert.equal(memory.changesXP, false);
});

test("uses verified training evidence without claiming reflection", () => {
  const memory = resolveProgressiveCoachingMemory({
    selection,
    trainingEvidence: [{ missionId: "scan-1", drillId: "scanning", completedAt: "2026-07-19T10:00:00Z" }]
  });
  assert.equal(memory.stage, "evidence_only");
  assert.equal(memory.latestResponseId, null);
  assert.equal(memory.changesRecommendation, false);
});
