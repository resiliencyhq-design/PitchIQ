export const AI_COACH_VERSION = "1.1.0";

export const AI_COACH_IDENTITY = Object.freeze({
  id: "pitchiq-coach",
  name: "PitchIQ Coach",
  shortName: "Coach",
  role: "Your Football IQ coach",
  tone: Object.freeze([
    "encouraging",
    "clear",
    "age-appropriate",
    "evidence-aware",
    "non-judgemental"
  ])
});

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

function labelForFocus(focus) {
  return LABELS[focus] || String(focus).replace(/([A-Z])/g, " $1").trim();
}

export function buildCoachLanguage({ focus = "scanning", evidenceCount = 0, personalised = false } = {}) {
  const label = labelForFocus(focus);
  const lowerLabel = label.toLowerCase();

  return Object.freeze({
    eyebrow: AI_COACH_IDENTITY.role,
    title: personalised ? `Let’s build ${label}` : `Today’s focus: ${label}`,
    message: personalised
      ? `Your current Football IQ evidence suggests ${lowerLabel} is a useful next focus.`
      : `Let’s use one short mission to build more evidence about ${lowerLabel}.`,
    encouragement: evidenceCount > 0
      ? "Keep noticing what happens before the ball arrives."
      : "There is no pressure to get it perfect. Notice one thing and build from there.",
    evidenceNote: personalised
      ? "This recommendation uses your current Football IQ evidence."
      : "This is an evidence-building recommendation, not a judgement of ability."
  });
}

export function buildAICoachRecommendation(input = {}) {
  const formalPriority = input.formalPriority || lowestConstruct(input.footballIQScores);
  const matchFocus = input.latestMatchEvidence?.summary?.recommendedFocus || null;
  const seasonFocus = input.weeklyPlan?.primaryFocus || null;
  const focus = formalPriority || matchFocus || seasonFocus || "scanning";
  const label = labelForFocus(focus);
  const readiness = Math.max(0, Math.min(1, Number(input.readinessScore) || 0));
  const evidenceCount = Math.max(0, Number(input.evidenceCount) || 0);
  const personalised = Boolean(formalPriority && evidenceCount > 0);
  const language = buildCoachLanguage({ focus, evidenceCount, personalised });

  return {
    version: AI_COACH_VERSION,
    coach: AI_COACH_IDENTITY,
    focus,
    label,
    personalised,
    title: language.title,
    message: language.message,
    encouragement: language.encouragement,
    evidenceNote: language.evidenceNote,
    nextAction: readiness >= 0.75
      ? "Complete the recommended reassessment when you feel ready."
      : `Try one short ${label.toLowerCase()} mission and notice what changes.`,
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
    doesNotClaimObservationWithoutEvidence: true,
    requiresFormalReassessmentForScoreChange: true,
    recommendationsAreExplainable: true,
    reflectionsAreNotAssessmentScores: true
  });
}
