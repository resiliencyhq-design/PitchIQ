import { CONSTRUCT_IDS } from "../scoring/contracts.js";

export const FOOTBALL_IQ_PROFILE_VERSION = "1.0.0";

function constructSnapshot(result) {
  return {
    score: result?.score ?? null,
    rawScore: result?.rawScore ?? null,
    confidence: result?.confidence ?? null,
    eligible: Boolean(result?.evidenceThreshold?.eligible),
    evidenceThreshold: result?.evidenceThreshold ?? null,
  };
}

export function createFootballIQProfile({
  assessmentId,
  playerId,
  assessmentDate,
  scoringResult,
  generatedAt = new Date(),
}) {
  if (!assessmentId) throw new TypeError("assessmentId is required.");
  if (!playerId) throw new TypeError("playerId is required.");
  if (!scoringResult || typeof scoringResult !== "object") {
    throw new TypeError("scoringResult is required.");
  }

  const constructs = Object.fromEntries(
    CONSTRUCT_IDS.map((constructId) => [
      constructId,
      constructSnapshot(scoringResult.constructs?.[constructId]),
    ]),
  );

  const eligibleConstructs = CONSTRUCT_IDS.filter(
    (constructId) => constructs[constructId].eligible,
  );
  const integratedEligible = Boolean(scoringResult.integratedFIQ?.eligible);

  return {
    profileVersion: FOOTBALL_IQ_PROFILE_VERSION,
    scoringVersion: scoringResult.scoringVersion,
    assessmentId,
    playerId,
    assessmentDate: new Date(assessmentDate).toISOString(),
    generatedAt: new Date(generatedAt).toISOString(),
    evidenceStatus: {
      state: integratedEligible ? "complete" : "insufficient_evidence",
      eligibleConstructs,
      missingConstructs: CONSTRUCT_IDS.filter(
        (constructId) => !constructs[constructId].eligible,
      ),
    },
    constructs,
    integratedFIQ: scoringResult.integratedFIQ,
    confidence: Object.fromEntries(
      CONSTRUCT_IDS.map((constructId) => [
        constructId,
        constructs[constructId].confidence,
      ]),
    ),
    matchChallenge: scoringResult.matchChallenge,
    matchMentality: scoringResult.matchMentality,
  };
}
