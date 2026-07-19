export const AI_COACH_VERSION = "1.0.0";

const LABELS = {
  scanning: "Scanning",
  decisionMaking: "Decision making",
  positioning: "Positioning",
  supportPlay: "Support play",
  defensiveAwareness: "Defensive awareness",
  communication: "Communication"
};

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function lowestConstruct(scores = {}) {
  const entries = Object.entries(scores)
    .map(([key, value]) => [key, safeNumber(value)])
    .filter(([, value]) => value !== null);
  if (!entries.length) return null;
  return entries.sort((a, b) => a[1] - b[1])[0][0];
}

export function buildAICoachRecommendation(input = {}) {
  const formalPriority = input.formalPriority || lowestConstruct(input.footballIQScores);
  const matchFocus = input.latestMatchEvidence?.summary?.recommendedFocus || null;
  const seasonFocus = input.weeklyPlan?.primaryFocus || null;
  const focus = formalPriority || matchFocus || seasonFocus || "scanning";
  const label = LABELS[focus] || String(focus).replace(/([A-Z])/g, " $1").trim();
  const readiness = Math.max(0, Math.min(1, Number(input.readinessScore) || 0));
  const evidenceCount = Math.max(0, Number(input.evidenceCount) || 0);

  return {
    version: AI_COACH_VERSION,
    focus,
    title: `Build ${label}`,
    message: evidenceCount
      ? `Your current evidence points to ${label.toLowerCase()} as the next coaching focus.`
      : `Start building evidence for ${label.toLowerCase()} through one focused training session.`,
    nextAction: readiness >= 0.75
      ? "Complete the recommended reassessment when you are ready."
      : `Complete a short ${label.toLowerCase()} mission and record what you noticed.`,
    evidenceCount,
    readiness,
    updatesFootballIQ: false,
    recommendationOnly: true,
    basis: {
      formalAssessment: Boolean(formalPriority),
      matchEvidence: Boolean(matchFocus),
      academyPlan: Boolean(seasonFocus)
    }
  };
}

export function buildAICoachGuardrails() {
  return Object.freeze({
    doesNotDiagnose: true,
    doesNotRankPlayers: true,
    doesNotModifyFootballIQ: true,
    requiresFormalReassessmentForScoreChange: true,
    recommendationsAreExplainable: true
  });
}
