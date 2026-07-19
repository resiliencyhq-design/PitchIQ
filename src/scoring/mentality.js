import { MENTALITY_BANDS, SCORING_VERSION } from "./contracts.js";

const DIMENSION_EVENTS = Object.freeze({
  persistence: {
    positive: ["sequence_completed", "continued_after_error"],
    negative: ["premature_exit"],
  },
  recovery: {
    positive: ["strong_response_after_error"],
    negative: ["weak_response_after_error"],
  },
  learning: {
    positive: ["improved_after_feedback"],
    negative: ["repeated_error_after_feedback"],
  },
  composure: {
    positive: ["stable_under_pressure"],
    negative: ["destabilised_under_pressure"],
  },
  consistency: {
    positive: ["consistent_response"],
    negative: ["high_variability"],
  },
});

function normaliseEvent(event) {
  if (typeof event === "string") return { type: event, value: 1 };
  return {
    type: event?.type,
    value: Number.isFinite(Number(event?.value)) ? Number(event.value) : 1,
  };
}

function bandFromRate(rate, evidenceCount) {
  if (evidenceCount < 3) return MENTALITY_BANDS.EMERGING;
  if (rate >= 0.8 && evidenceCount >= 6) return MENTALITY_BANDS.STRONG;
  if (rate >= 0.65) return MENTALITY_BANDS.CONSISTENT;
  if (rate >= 0.4) return MENTALITY_BANDS.DEVELOPING;
  return MENTALITY_BANDS.EMERGING;
}

function scoreDimension(events, config) {
  const relevant = events.filter((event) =>
    [...config.positive, ...config.negative].includes(event.type),
  );
  const positive = relevant
    .filter((event) => config.positive.includes(event.type))
    .reduce((sum, event) => sum + event.value, 0);
  const negative = relevant
    .filter((event) => config.negative.includes(event.type))
    .reduce((sum, event) => sum + event.value, 0);
  const total = positive + negative;
  const rate = total === 0 ? 0 : positive / total;

  return {
    band: bandFromRate(rate, relevant.length),
    positiveEvidence: Number(positive.toFixed(3)),
    negativeEvidence: Number(negative.toFixed(3)),
    evidenceCount: relevant.length,
    positiveRate: Number(rate.toFixed(3)),
  };
}

export function inferMatchMentality(observations) {
  const events = observations.flatMap((observation) =>
    (observation.behaviouralEvents ?? []).map(normaliseEvent),
  );

  const dimensions = Object.fromEntries(
    Object.entries(DIMENSION_EVENTS).map(([dimension, config]) => [
      dimension,
      scoreDimension(events, config),
    ]),
  );

  return {
    dimensions,
    behaviouralEventCount: events.length,
    scoringVersion: SCORING_VERSION,
  };
}
