export const SCORING_VERSION = "1.0.0";

export const CONSTRUCT_IDS = Object.freeze([
  "awareness",
  "gameReading",
  "decisionQuality",
  "adaptability",
  "useOfSpace",
]);

export const CONFIDENCE_BANDS = Object.freeze({
  EMERGING: "emerging_evidence",
  DEVELOPING: "developing_confidence",
  STRONG: "strong_confidence",
});

export const TRANSFER_INDICATORS = Object.freeze({
  STRONG: "transfers_strongly",
  INCONSISTENT: "transfers_inconsistently",
  MORE_EVIDENCE: "more_evidence_needed",
});

export const MENTALITY_BANDS = Object.freeze({
  EMERGING: "emerging",
  DEVELOPING: "developing",
  CONSISTENT: "consistent",
  STRONG: "strong",
});

export const MINIMUM_EVIDENCE = Object.freeze({
  completedItems: 6,
  scenarioFamilies: 2,
  maximumFamilyShare: 0.5,
});

export function clamp01(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(1, Math.max(0, numeric));
}

export function assertObservation(observation) {
  if (!observation || typeof observation !== "object") {
    throw new TypeError("Observation must be an object.");
  }

  for (const field of ["assessmentId", "constructId", "itemId", "attemptId", "playerId"]) {
    if (!observation[field]) throw new TypeError(`Observation is missing ${field}.`);
  }

  if (!CONSTRUCT_IDS.includes(observation.constructId) && observation.constructId !== "integratedFIQ") {
    throw new RangeError(`Unknown constructId: ${observation.constructId}`);
  }

  return observation;
}
