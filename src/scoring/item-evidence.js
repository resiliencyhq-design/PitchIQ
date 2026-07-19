import { assertObservation, clamp01 } from "./contracts.js";

export const ITEM_WEIGHTS = Object.freeze({
  accuracy: 0.55,
  quality: 0.35,
  efficiency: 0.1,
});

export function calculateEfficiency(responseTimeMs, responseWindowMs) {
  const time = Number(responseTimeMs);
  const window = Number(responseWindowMs);
  if (!Number.isFinite(time) || !Number.isFinite(window) || window <= 0) return 0;
  return clamp01(1 - Math.max(0, time - window) / window);
}

export function calculateItemEvidence(observation) {
  assertObservation(observation);

  const accuracy = clamp01(observation.accuracy);
  const quality = clamp01(observation.quality);
  const efficiency = observation.efficiency == null
    ? calculateEfficiency(observation.responseTimeMs, observation.responseWindowMs)
    : clamp01(observation.efficiency);

  const score =
    accuracy * ITEM_WEIGHTS.accuracy +
    quality * ITEM_WEIGHTS.quality +
    efficiency * ITEM_WEIGHTS.efficiency;

  return {
    itemId: observation.itemId,
    attemptId: observation.attemptId,
    constructId: observation.constructId,
    scenarioFamily: observation.scenarioFamily ?? "unspecified",
    score: Number(score.toFixed(6)),
    components: { accuracy, quality, efficiency },
  };
}
