import test from "node:test";
import assert from "node:assert/strict";

import {
  completeAssessmentAndPersistFootballIQ,
  generateFootballIQProfileFromAssessment,
  validateAssessmentEvidence,
} from "../src/assessment/football-iq-adapter.js";
import {
  getLatestFootballIQProfile,
  listFootballIQProfiles,
} from "../src/profile/football-iq-storage.js";

const NOW = new Date("2026-07-19T00:00:00.000Z");
const CONSTRUCT_IDS = [
  "awareness",
  "gameReading",
  "decisionQuality",
  "adaptability",
  "useOfSpace",
];

function observation(constructId, item, playerId = "player-1") {
  return {
    assessmentId: `assessment-${constructId}`,
    constructId,
    itemId: `${constructId}-${item}`,
    attemptId: `attempt-${constructId}-${item}`,
    playerId,
    timestamp: "2026-07-18T00:00:00.000Z",
    accuracy: 0.8,
    quality: 0.75,
    efficiency: 0.5,
    responseTimeMs: 1200,
    responseWindowMs: 1500,
    difficulty: 0.5,
    representativeness: 0.8,
    scenarioFamily: item <= 3 ? "family-a" : "family-b",
    completionState: "completed",
    behaviouralEvents: [],
    scoringVersion: "1.0.0",
  };
}

function completeEvidence() {
  return CONSTRUCT_IDS.flatMap((constructId) =>
    Array.from({ length: 6 }, (_, index) => observation(constructId, index + 1)),
  );
}

function payload(observations = completeEvidence()) {
  return {
    assessmentId: "football-iq-profile-snapshot-1",
    playerId: "player-1",
    completedAt: "2026-07-18T12:00:00.000Z",
    observations,
    matchChallengeObservations: [],
  };
}

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

test("adapter creates a complete versioned profile from eligible evidence", () => {
  const result = generateFootballIQProfileFromAssessment(payload(), { now: NOW });

  assert.equal(result.profile.profileVersion, "1.0.0");
  assert.equal(result.profile.scoringVersion, "1.0.0");
  assert.equal(result.profile.evidenceStatus.state, "complete");
  assert.equal(result.profile.evidenceStatus.eligibleConstructs.length, 5);
  assert.equal(result.profile.integratedFIQ.score, 75);
  assert.equal(result.profile.constructs.awareness.score, 75);
  assert.equal(result.profile.confidence.awareness, "developing_confidence");
});

test("integrated Football IQ is withheld when evidence is insufficient", () => {
  const result = generateFootballIQProfileFromAssessment(
    payload(Array.from({ length: 6 }, (_, index) => observation("awareness", index + 1))),
    { now: NOW },
  );

  assert.equal(result.profile.evidenceStatus.state, "insufficient_evidence");
  assert.deepEqual(result.profile.evidenceStatus.eligibleConstructs, ["awareness"]);
  assert.equal(result.profile.evidenceStatus.missingConstructs.length, 4);
  assert.equal(result.profile.integratedFIQ.score, null);
});

test("completion persists profile history without touching another subsystem", () => {
  const storage = memoryStorage();
  const result = completeAssessmentAndPersistFootballIQ(payload(), { now: NOW, storage });

  assert.equal(listFootballIQProfiles("player-1", { storage }).length, 1);
  assert.deepEqual(getLatestFootballIQProfile("player-1", { storage }), result.profile);
});

test("adapter rejects evidence belonging to another player", () => {
  const invalid = payload([observation("awareness", 1, "player-2")]);

  assert.throws(
    () => validateAssessmentEvidence(invalid),
    /another player/,
  );
});
