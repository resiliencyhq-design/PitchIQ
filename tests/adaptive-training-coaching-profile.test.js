import test from "node:test";
import assert from "node:assert/strict";

import {
  adaptiveProfileFromCoachingIntelligence,
  resolveAdaptiveTrainingProfile,
} from "../src/coaching/adaptive-training-profile.js";
import { AdaptiveTrainingEngine } from "../src/training/adaptive-training-engine.js";

function memoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
}

function coachingOutput(overrides = {}) {
  return {
    coachingVersion: "1.0.0",
    sourceAssessmentId: "assessment-1",
    evidenceStatus: { state: "ready" },
    priorities: [{
      constructId: "decisionQuality",
      label: "Decision Quality",
      score: 61,
      confidence: "developing_confidence",
      recommendationStrength: "provisional",
    }],
    ...overrides,
  };
}

test("normalises reliable coaching priorities for adaptive selection", () => {
  const profile = adaptiveProfileFromCoachingIntelligence(coachingOutput(), {
    recentMissionIds: ["scan-first"],
  });

  assert.equal(profile.sourceAssessmentId, "assessment-1");
  assert.equal(profile.priorities[0].confidence, 0.7);
  assert.equal(profile.priorities[0].observations, 3);
  assert.deepEqual(profile.recentMissionIds, ["scan-first"]);

  const selection = AdaptiveTrainingEngine.selectMission(profile);
  assert.equal(selection.mode, "personalised");
  assert.equal(selection.sourceConstructId, "decisionQuality");
});

test("withholds priorities when Coaching Intelligence evidence is insufficient", () => {
  const profile = adaptiveProfileFromCoachingIntelligence(coachingOutput({
    evidenceStatus: { state: "insufficient_evidence" },
  }));
  const selection = AdaptiveTrainingEngine.selectMission(profile);

  assert.deepEqual(profile.priorities, []);
  assert.equal(selection.mode, "balanced_evidence_building");
});

test("builds and persists Coaching Intelligence from the latest Football IQ profile", () => {
  const footballIQProfile = {
    profileVersion: "1.0.0",
    assessmentId: "assessment-2",
    playerId: "Hugo",
    generatedAt: "2026-07-19T06:00:00.000Z",
    evidenceStatus: { state: "complete", missingConstructs: [] },
    constructs: {
      awareness: { score: 82, confidence: "strong_confidence", eligible: true },
      gameReading: { score: 74, confidence: "developing_confidence", eligible: true },
      decisionQuality: { score: 61, confidence: "developing_confidence", eligible: true },
      adaptability: { score: 66, confidence: "developing_confidence", eligible: true },
      useOfSpace: { score: 70, confidence: "developing_confidence", eligible: true },
    },
  };
  const storage = memoryStorage({
    "pitchiq.footballIQProfiles.v1": JSON.stringify([footballIQProfile]),
  });

  const profile = resolveAdaptiveTrainingProfile({
    playerId: "Hugo",
    recentMissionIds: [],
    storage,
  });

  assert.equal(profile.evidenceState, "ready");
  assert.equal(profile.sourceAssessmentId, "assessment-2");
  assert.equal(profile.priorities[0].constructId, "decisionQuality");
  assert.ok(storage.getItem("pitchiq.coachingIntelligence.v1"));
});
