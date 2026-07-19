import { MINIMUM_EVIDENCE, SCORING_VERSION } from "./contracts.js";
import { calculateItemEvidence } from "./item-evidence.js";
import { calculateConfidenceMetrics, classifyConfidence } from "./confidence.js";

export function evaluateEvidenceThreshold(observations) {
  const completed = observations.filter((item) => item.completionState === "completed");
  const familyCounts = completed.reduce((counts, item) => {
    const family = item.scenarioFamily ?? "unspecified";
    counts[family] = (counts[family] ?? 0) + 1;
    return counts;
  }, {});
  const scenarioFamilies = Object.keys(familyCounts).length;
  const maximumFamilyShare = completed.length
    ? Math.max(...Object.values(familyCounts)) / completed.length
    : 1;

  const eligible =
    completed.length >= MINIMUM_EVIDENCE.completedItems &&
    scenarioFamilies >= MINIMUM_EVIDENCE.scenarioFamilies &&
    maximumFamilyShare <= MINIMUM_EVIDENCE.maximumFamilyShare;

  return {
    eligible,
    completedItems: completed.length,
    scenarioFamilies,
    maximumFamilyShare: Number(maximumFamilyShare.toFixed(3)),
    reasons: [
      completed.length < MINIMUM_EVIDENCE.completedItems ? "insufficient_completed_items" : null,
      scenarioFamilies < MINIMUM_EVIDENCE.scenarioFamilies ? "insufficient_scenario_diversity" : null,
      maximumFamilyShare > MINIMUM_EVIDENCE.maximumFamilyShare ? "scenario_family_overrepresented" : null,
    ].filter(Boolean),
  };
}

export function scoreConstruct(constructId, observations, options = {}) {
  const relevant = observations.filter((item) => item.constructId === constructId);
  const threshold = evaluateEvidenceThreshold(relevant);
  const completed = relevant.filter((item) => item.completionState === "completed");
  const itemEvidence = completed.map(calculateItemEvidence);
  const raw = itemEvidence.length
    ? itemEvidence.reduce((sum, item) => sum + item.score, 0) / itemEvidence.length
    : null;
  const confidenceMetrics = calculateConfidenceMetrics({
    observations: relevant,
    itemEvidence,
    eligible: threshold.eligible,
    now: options.now ?? new Date(),
  });

  return {
    constructId,
    score: threshold.eligible && raw != null ? Math.round(raw * 100) : null,
    rawScore: threshold.eligible && raw != null ? Number(raw.toFixed(6)) : null,
    confidence: classifyConfidence(confidenceMetrics),
    confidenceMetrics,
    evidenceThreshold: threshold,
    itemEvidence,
    scoringVersion: SCORING_VERSION,
  };
}
