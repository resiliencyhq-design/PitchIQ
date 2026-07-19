import test from "node:test";
import assert from "node:assert/strict";

import {
  CONFIDENCE_BANDS,
  MENTALITY_BANDS,
  TRANSFER_INDICATORS,
  calculateItemEvidence,
  scoreConstruct,
  scorePlayerProfile,
} from "../src/scoring/engine.js";

const NOW = new Date("2026-07-19T00:00:00.000Z");

function observation({
  constructId = "awareness",
  item = 1,
  family = item <= 3 ? "family-a" : "family-b",
  accuracy = 0.8,
  quality = 0.75,
  efficiency = 0.5,
  events = [],
} = {}) {
  return {
    assessmentId: constructId === "integratedFIQ" ? "match-challenge" : `assessment-${constructId}`,
    constructId,
    itemId: `${constructId}-${item}`,
    attemptId: `attempt-${constructId}-${item}`,
    playerId: "player-1",
    timestamp: "2026-07-18T00:00:00.000Z",
    accuracy,
    quality,
    efficiency,
    responseTimeMs: 1200,
    responseWindowMs: 1500,
    difficulty: 0.5,
    representativeness: 0.8,
    scenarioFamily: family,
    completionState: "completed",
    behaviouralEvents: events,
    scoringVersion: "1.0.0",
  };
}

function constructObservations(constructId, count = 6) {
  return Array.from({ length: count }, (_, index) =>
    observation({ constructId, item: index + 1 }),
  );
}

test("item evidence follows the locked 55/35/10 formula", () => {
  const result = calculateItemEvidence(observation({
    accuracy: 1,
    quality: 0.8,
    efficiency: 0.6,
  }));

  assert.equal(result.score, 0.89);
  assert.deepEqual(result.components, { accuracy: 1, quality: 0.8, efficiency: 0.6 });
});

test("construct score is withheld when scenario diversity rules fail", () => {
  const observations = Array.from({ length: 6 }, (_, index) =>
    observation({ item: index + 1, family: "one-family" }),
  );
  const result = scoreConstruct("awareness", observations, { now: NOW });

  assert.equal(result.score, null);
  assert.equal(result.confidence, CONFIDENCE_BANDS.EMERGING);
  assert.ok(result.evidenceThreshold.reasons.includes("insufficient_scenario_diversity"));
  assert.ok(result.evidenceThreshold.reasons.includes("scenario_family_overrepresented"));
});

test("eligible construct returns deterministic score and separate confidence", () => {
  const result = scoreConstruct("awareness", constructObservations("awareness"), { now: NOW });

  assert.equal(result.score, 75);
  assert.equal(result.rawScore, 0.7525);
  assert.equal(result.confidence, CONFIDENCE_BANDS.DEVELOPING);
  assert.equal(result.evidenceThreshold.eligible, true);
});

test("integrated FIQ is withheld until all five constructs qualify", () => {
  const result = scorePlayerProfile({
    observations: constructObservations("awareness"),
    now: NOW,
  });

  assert.equal(result.integratedFIQ.score, null);
  assert.equal(result.integratedFIQ.reason, "all_five_constructs_required");
});

test("complete profile returns integrated FIQ and Match Challenge transfer", () => {
  const constructIds = [
    "awareness",
    "gameReading",
    "decisionQuality",
    "adaptability",
    "useOfSpace",
  ];
  const observations = constructIds.flatMap((constructId) => constructObservations(constructId));
  const matchChallengeObservations = constructObservations("integratedFIQ");

  const result = scorePlayerProfile({ observations, matchChallengeObservations, now: NOW });

  assert.equal(result.integratedFIQ.score, 75);
  assert.equal(result.integratedFIQ.eligible, true);
  assert.equal(result.matchChallenge.indicator, TRANSFER_INDICATORS.STRONG);
  assert.equal(result.scoringVersion, "1.0.0");
});

test("Match Mentality is inferred from stored behavioural events", () => {
  const events = [
    "continued_after_error",
    "continued_after_error",
    "sequence_completed",
    "sequence_completed",
    "continued_after_error",
    "sequence_completed",
    "premature_exit",
  ];
  const observations = events.map((event, index) => observation({
    item: index + 1,
    family: index < 4 ? "family-a" : "family-b",
    events: [event],
  }));

  const result = scorePlayerProfile({ observations, now: NOW });

  assert.equal(result.matchMentality.dimensions.persistence.band, MENTALITY_BANDS.STRONG);
  assert.equal(result.matchMentality.dimensions.persistence.positiveEvidence, 6);
  assert.equal(result.matchMentality.dimensions.persistence.negativeEvidence, 1);
});
