import { SCORING_VERSION, TRANSFER_INDICATORS } from "./contracts.js";
import { calculateItemEvidence } from "./item-evidence.js";
import { evaluateEvidenceThreshold } from "./constructs.js";

export function calculateIntegratedFIQ(constructResults) {
  const results = Object.values(constructResults);
  const eligible = results.length === 5 && results.every((result) => result.score != null);

  return {
    score: eligible
      ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
      : null,
    eligible,
    reason: eligible ? null : "all_five_constructs_required",
    scoringVersion: SCORING_VERSION,
  };
}

export function evaluateMatchChallenge(observations, constructResults) {
  const threshold = evaluateEvidenceThreshold(observations);
  const expectedScores = Object.values(constructResults)
    .map((result) => result.rawScore)
    .filter((score) => score != null);

  if (!threshold.eligible || expectedScores.length !== 5) {
    return {
      indicator: TRANSFER_INDICATORS.MORE_EVIDENCE,
      expectedPerformance: null,
      observedPerformance: null,
      difference: null,
      evidenceThreshold: threshold,
      scoringVersion: SCORING_VERSION,
    };
  }

  const completed = observations.filter((item) => item.completionState === "completed");
  const observedPerformance = completed
    .map(calculateItemEvidence)
    .reduce((sum, item) => sum + item.score, 0) / completed.length;
  const expectedPerformance = expectedScores.reduce((sum, score) => sum + score, 0) / expectedScores.length;
  const difference = observedPerformance - expectedPerformance;

  return {
    indicator: difference >= -0.05
      ? TRANSFER_INDICATORS.STRONG
      : TRANSFER_INDICATORS.INCONSISTENT,
    expectedPerformance: Number(expectedPerformance.toFixed(6)),
    observedPerformance: Number(observedPerformance.toFixed(6)),
    difference: Number(difference.toFixed(6)),
    evidenceThreshold: threshold,
    scoringVersion: SCORING_VERSION,
  };
}
