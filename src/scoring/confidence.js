import { CONFIDENCE_BANDS, clamp01 } from "./contracts.js";

function standardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function calculateConfidenceMetrics({ observations, itemEvidence, eligible, now = new Date() }) {
  const completed = observations.filter((item) => item.completionState === "completed");
  const families = new Set(completed.map((item) => item.scenarioFamily ?? "unspecified"));
  const completionQuality = observations.length === 0 ? 0 : completed.length / observations.length;
  const consistency = clamp01(1 - standardDeviation(itemEvidence.map((item) => item.score)) / 0.5);

  const timestamps = completed
    .map((item) => new Date(item.timestamp).getTime())
    .filter(Number.isFinite);
  const latest = timestamps.length ? Math.max(...timestamps) : null;
  const recencyDays = latest == null ? null : Math.max(0, (now.getTime() - latest) / 86400000);

  return {
    evidenceCount: completed.length,
    scenarioDiversity: families.size,
    completionQuality: Number(completionQuality.toFixed(3)),
    consistency: Number(consistency.toFixed(3)),
    recencyDays: recencyDays == null ? null : Number(recencyDays.toFixed(1)),
    eligible,
  };
}

export function classifyConfidence(metrics) {
  if (!metrics.eligible) return CONFIDENCE_BANDS.EMERGING;

  const strong =
    metrics.evidenceCount >= 12 &&
    metrics.scenarioDiversity >= 3 &&
    metrics.completionQuality >= 0.9 &&
    metrics.consistency >= 0.8 &&
    metrics.recencyDays != null &&
    metrics.recencyDays <= 30;

  return strong ? CONFIDENCE_BANDS.STRONG : CONFIDENCE_BANDS.DEVELOPING;
}
