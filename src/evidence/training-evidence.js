export const TRAINING_EVIDENCE_VERSION = "1.0.0";

const DAY_MS = 24 * 60 * 60 * 1000;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function createTrainingEvidence({
  playerId,
  sessionId,
  missionId = null,
  constructId = null,
  drillId,
  durationSeconds = 0,
  completionRate = 1,
  accuracy = null,
  confidence = null,
  completedAt = new Date().toISOString(),
} = {}) {
  if (!playerId || !sessionId || !drillId) {
    throw new TypeError("playerId, sessionId and drillId are required.");
  }

  const completion = clamp(completionRate);
  const measuredAccuracy = accuracy == null ? null : clamp(accuracy);
  const confidenceScore = confidence == null
    ? clamp(0.35 + completion * 0.35 + (measuredAccuracy ?? 0.5) * 0.3)
    : clamp(confidence);

  return {
    evidenceVersion: TRAINING_EVIDENCE_VERSION,
    playerId,
    sessionId,
    missionId,
    constructId,
    drillId,
    durationSeconds: Math.max(0, Math.round(Number(durationSeconds) || 0)),
    completionRate: completion,
    accuracy: measuredAccuracy,
    confidence: confidenceScore,
    completedAt,
    source: "training",
  };
}

export function summariseTrainingEvidence(records = []) {
  const valid = records.filter((record) => record?.source === "training");
  const sessions = valid.length;
  const totalDurationSeconds = valid.reduce((sum, item) => sum + (item.durationSeconds || 0), 0);
  const averageConfidence = sessions
    ? valid.reduce((sum, item) => sum + clamp(item.confidence), 0) / sessions
    : 0;
  const constructs = unique(valid.map((item) => item.constructId));
  const drills = unique(valid.map((item) => item.drillId));
  const activeDays = unique(valid.map((item) => String(item.completedAt || "").slice(0, 10))).length;

  const repetition = clamp(sessions / 5);
  const consistency = clamp(activeDays / 3);
  const variability = clamp(Math.max(constructs.length, drills.length) / 3);
  const evidenceQuality = clamp(
    averageConfidence * 0.4 + repetition * 0.25 + consistency * 0.2 + variability * 0.15,
  );

  return {
    sessions,
    totalDurationSeconds,
    averageConfidence,
    constructs,
    drills,
    activeDays,
    evidenceQuality,
  };
}

export function calculateAssessmentReadiness(records = [], {
  now = new Date(),
  lastAssessmentAt = null,
  minimumSessions = 3,
  minimumActiveDays = 2,
  minimumQuality = 0.58,
  minimumDaysSinceAssessment = 7,
} = {}) {
  const summary = summariseTrainingEvidence(records);
  const daysSinceAssessment = lastAssessmentAt
    ? Math.max(0, (now.getTime() - new Date(lastAssessmentAt).getTime()) / DAY_MS)
    : Infinity;

  const checks = {
    enoughSessions: summary.sessions >= minimumSessions,
    enoughActiveDays: summary.activeDays >= minimumActiveDays,
    enoughQuality: summary.evidenceQuality >= minimumQuality,
    enoughTimeElapsed: daysSinceAssessment >= minimumDaysSinceAssessment,
  };
  const ready = Object.values(checks).every(Boolean);

  return {
    state: ready ? "ready" : "building",
    ready,
    checks,
    summary,
    daysSinceAssessment,
    message: ready
      ? "You have built enough training evidence. It is time to reassess your Football IQ."
      : "Keep completing varied missions to build stronger evidence for your next assessment.",
  };
}
