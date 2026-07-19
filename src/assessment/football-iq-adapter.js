import { assertObservation } from "../scoring/contracts.js";
import { scorePlayerProfile } from "../scoring/engine.js";
import { createFootballIQProfile } from "../profile/football-iq-profile.js";
import { saveFootballIQProfile } from "../profile/football-iq-storage.js";
import { createFootballIQDeveloperSnapshot } from "../profile/football-iq-debug.js";

function validateObservationSet(observations, { playerId, label }) {
  if (!Array.isArray(observations)) throw new TypeError(`${label} must be an array.`);

  return observations.map((observation) => {
    assertObservation(observation);
    if (observation.playerId !== playerId) {
      throw new RangeError(`${label} contains evidence for another player.`);
    }
    return { ...observation };
  });
}

export function validateAssessmentEvidence(payload) {
  if (!payload || typeof payload !== "object") {
    throw new TypeError("Assessment evidence payload must be an object.");
  }

  const {
    assessmentId,
    playerId,
    completedAt,
    observations = [],
    matchChallengeObservations = [],
  } = payload;

  if (!assessmentId) throw new TypeError("assessmentId is required.");
  if (!playerId) throw new TypeError("playerId is required.");

  const completionDate = new Date(completedAt);
  if (!completedAt || Number.isNaN(completionDate.getTime())) {
    throw new TypeError("completedAt must be a valid date.");
  }

  return {
    assessmentId,
    playerId,
    completedAt: completionDate.toISOString(),
    observations: validateObservationSet(observations, { playerId, label: "observations" }),
    matchChallengeObservations: validateObservationSet(matchChallengeObservations, {
      playerId,
      label: "matchChallengeObservations",
    }),
  };
}

export function generateFootballIQProfileFromAssessment(payload, { now = new Date() } = {}) {
  const evidence = validateAssessmentEvidence(payload);
  const scoringResult = scorePlayerProfile({
    observations: evidence.observations,
    matchChallengeObservations: evidence.matchChallengeObservations,
    now,
  });
  const profile = createFootballIQProfile({
    assessmentId: evidence.assessmentId,
    playerId: evidence.playerId,
    assessmentDate: evidence.completedAt,
    scoringResult,
    generatedAt: now,
  });

  return {
    evidence,
    scoringResult,
    profile,
    developerSnapshot: createFootballIQDeveloperSnapshot({ evidence, scoringResult, profile }),
  };
}

export function completeAssessmentAndPersistFootballIQ(
  payload,
  { now = new Date(), storage } = {},
) {
  const result = generateFootballIQProfileFromAssessment(payload, { now });
  saveFootballIQProfile(result.profile, { storage });
  return result;
}
