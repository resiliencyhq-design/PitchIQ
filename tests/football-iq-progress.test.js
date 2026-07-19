import test from "node:test";
import assert from "node:assert/strict";
import { buildFootballIQProgress, compareFootballIQProfiles, evidenceConfidence } from "../src/progress/football-iq-progress.js";

const profile = (date, awareness, decisionQuality) => ({
  assessmentDate: date,
  integratedFIQ: { score: Math.round((awareness + decisionQuality) / 2) },
  constructs: {
    awareness: { score: awareness },
    decisionQuality: { score: decisionQuality },
  },
});

test("orders assessment history newest first and compares formal profiles", () => {
  const older = profile("2026-06-01T00:00:00.000Z", 60, 65);
  const newer = profile("2026-07-01T00:00:00.000Z", 68, 70);
  const progress = buildFootballIQProgress({ profiles: [older, newer] });
  assert.equal(progress.current, newer);
  assert.equal(progress.previous, older);
  assert.equal(progress.changes.find(item => item.id === "awareness").delta, 8);
  assert.equal(progress.changes.find(item => item.id === "decisionQuality").delta, 5);
});

test("does not invent deltas when a construct lacks formal scores", () => {
  const changes = compareFootballIQProfiles(profile("2026-07-01", 70, 75), { constructs: {} });
  assert.equal(changes.every(item => item.delta === null), true);
});

test("maps evidence quality to player-facing confidence states", () => {
  assert.equal(evidenceConfidence({ ready: true }).label, "Assessment Ready");
  assert.equal(evidenceConfidence({ summary: { evidenceQuality: 0.75 } }).label, "High");
  assert.equal(evidenceConfidence({ summary: { evidenceQuality: 0.5 } }).label, "Moderate");
  assert.equal(evidenceConfidence({ summary: { evidenceQuality: 0.2 } }).label, "Building");
});
