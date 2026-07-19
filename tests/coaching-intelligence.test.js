import test from "node:test";
import assert from "node:assert/strict";

import { createCoachingIntelligence } from "../src/coaching/coaching-intelligence.js";
import {
  getLatestCoachingIntelligence,
  saveCoachingIntelligence,
} from "../src/coaching/coaching-intelligence-storage.js";
import { createCoachingIntelligenceDebugSnapshot } from "../src/coaching/coaching-intelligence-debug.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
}

function construct(score, confidence = "developing_confidence", eligible = true) {
  return { score, confidence, eligible };
}

function profile(overrides = {}) {
  return {
    profileVersion: "1.0.0",
    assessmentId: "assessment-1",
    playerId: "player-1",
    evidenceStatus: { state: "complete", missingConstructs: [] },
    constructs: {
      awareness: construct(82, "strong_confidence"),
      gameReading: construct(74),
      decisionQuality: construct(61),
      adaptability: construct(66),
      useOfSpace: construct(70),
    },
    matchChallenge: { indicator: "transfers_inconsistently" },
    matchMentality: {
      dimensions: {
        persistence: { band: "developing" },
        recoveryAfterError: { band: "emerging" },
      },
    },
    ...overrides,
  };
}

test("creates explainable strength and priorities from reliable evidence", () => {
  const output = createCoachingIntelligence({
    footballIQProfile: profile(),
    generatedAt: new Date("2026-07-19T06:00:00.000Z"),
  });

  assert.equal(output.evidenceStatus.state, "ready");
  assert.equal(output.strengths[0].constructId, "awareness");
  assert.deepEqual(output.priorities.map((item) => item.constructId), ["decisionQuality", "adaptability"]);
  assert.ok(output.focusAreas.some((item) => item.type === "match_transfer"));
  assert.ok(output.focusAreas.some((item) => item.type === "match_mentality"));
  assert.match(output.rationale.join(" "), /not low scores alone/i);
});

test("withholds recommendations when evidence is insufficient", () => {
  const incomplete = profile({
    evidenceStatus: { state: "insufficient_evidence", missingConstructs: ["decisionQuality", "adaptability", "useOfSpace"] },
    constructs: {
      awareness: construct(82, "developing_confidence"),
      gameReading: construct(74, "emerging_evidence"),
      decisionQuality: construct(null, null, false),
      adaptability: construct(null, null, false),
      useOfSpace: construct(null, null, false),
    },
  });

  const output = createCoachingIntelligence({ footballIQProfile: incomplete });

  assert.equal(output.evidenceStatus.state, "insufficient_evidence");
  assert.deepEqual(output.strengths, []);
  assert.deepEqual(output.priorities, []);
  assert.ok(output.nextAssessmentNeed);
});

test("emerging evidence is not used for priority generation", () => {
  const input = profile();
  input.constructs.decisionQuality = construct(40, "emerging_evidence");

  const output = createCoachingIntelligence({ footballIQProfile: input });

  assert.ok(!output.priorities.some((item) => item.constructId === "decisionQuality"));
  assert.ok(output.evidenceStatus.eligibleConstructs.includes("decisionQuality"));
  assert.ok(!output.evidenceStatus.reliableConstructs.includes("decisionQuality"));
});

test("persists versioned output and returns latest for player", () => {
  const storage = memoryStorage();
  const first = createCoachingIntelligence({
    footballIQProfile: profile(),
    generatedAt: new Date("2026-07-19T06:00:00.000Z"),
  });
  const second = createCoachingIntelligence({
    footballIQProfile: profile({ assessmentId: "assessment-2" }),
    generatedAt: new Date("2026-07-20T06:00:00.000Z"),
  });

  saveCoachingIntelligence(first, { storage });
  saveCoachingIntelligence(second, { storage });

  assert.equal(getLatestCoachingIntelligence("player-1", { storage }).sourceAssessmentId, "assessment-2");
});

test("debug snapshot validates architecture state", () => {
  const output = createCoachingIntelligence({ footballIQProfile: profile() });
  const snapshot = createCoachingIntelligenceDebugSnapshot(output);

  assert.equal(snapshot.valid, true);
  assert.equal(snapshot.summary.evidenceState, "ready");
  assert.equal(snapshot.summary.strengthCount, 1);
  assert.equal(snapshot.summary.priorityCount, 2);
});
