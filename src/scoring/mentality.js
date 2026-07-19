import { MENTALITY_BANDS, SCORING_VERSION } from "./contracts.js";

const DIMENSION_EVENTS = Object.freeze({
  persistence: ["sequence_completed", "continued_after_error", "premature_exit"],
  recovery: ["strong_response_after_error", "weak_response_after_error"],
  learning: ["improved_after_feedback", "repeated_error_after_feedback"],
  composure: ["stable_under_pressure", "destabilised_under_pressure"],
  consistency: ["consistent_response", "high_variability"],
});

function normaliseEvent(event) {
  if (typeof event === "string") return { type: event, value: 1 };
  return { type: event?.type, value: Number.isFinite(Number(event?.value)) ? Number(event.value) : 1 };
}

function bandFromRate(rate, evidenceCount) {
  if (evidenceCount < 3) return MENTALITY_BANDS.EMERGING;
  if (rate >= 0.8 && evidenceCount >= 6) return MENTALITY_BANDS.STRONG;
  if (rate >= 0.65) return MENTALITY_BANDS.CONSISTENT;
  if (rate >= 0.4) return MENTALITY_BANDS.DEVELOPING;
  return MENTALITY_BANDS.EMERGING;
}

function scoreDimension(events, [positiveA, positiveB, negative]) {
  const relevant = events.filter((event) => [positiveA, positiveB, negative].includes(event.type));
  const positive = relevant
    .filter((event) => event.type === positiveA || event.type === positiveB)
    .reduce((sum, event) => sum + event.value, 0);
  const negativeTotal = relevant
    .filter((event) => event.type === negative)
    .reduce((sum, event) => sum + event.value, 0);
  const total = positive + negativeTotal;
  const rate = total === 0 ? 0 : positive / total;

  return {
    band: bandFromRate(rate, relevant.length),
    positiveEvidence: Number(positive.toFixed(3)),
    negativeEvidence: Number(negativeTotal.toFixed(3)),
    evidenceCount: relevant.length,
    positiveRate: Number(rate.toFixed(3)),
  };
}

export function inferMatchMentality(observations) {
  const events = observations.flatMap((observation) =>
    (observation.behaviouralEvents ?? []).map(normaliseEvent),
  );

  const dimensions = Object.fromEntries(
    Object.entries(DIMENSION_EVENTS).map(([dimension, eventTypes]) => [
      dimension,
      scoreDimension(events, eventTypes),
    ]),
  );

  return {
    dimensions,
    behaviouralEventCount: events.length,
    scoringVersion: SCORING_VERSION,
  };
}
