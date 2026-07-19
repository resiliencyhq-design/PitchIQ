import { CONSTRUCT_IDS, CONFIDENCE_BANDS } from "../scoring/contracts.js";

export const COACHING_INTELLIGENCE_VERSION = "1.0.0";

const CONSTRUCT_COPY = Object.freeze({
  awareness: {
    label: "Awareness",
    strength: "You are building a reliable habit of noticing useful information before the ball arrives.",
    priority: "Build earlier scanning so you can collect more useful information before your next action.",
    focus: "Scan before receiving and name the most important cue you noticed.",
  },
  gameReading: {
    label: "Game Reading",
    strength: "You are showing a growing ability to recognise patterns and anticipate what may happen next.",
    priority: "Practise reading the next likely action instead of reacting only after it happens.",
    focus: "Pause game situations and predict the next pass, run or pressure movement.",
  },
  decisionQuality: {
    label: "Decision Quality",
    strength: "You are selecting effective options across the situations measured so far.",
    priority: "Strengthen how you compare options and choose the most effective action for the situation.",
    focus: "Use a simple scan–options–choose routine before acting.",
  },
  adaptability: {
    label: "Adaptability",
    strength: "You are adjusting effectively when pressure, space or task demands change.",
    priority: "Practise changing your plan when pressure, space or the game picture changes.",
    focus: "Repeat the same situation with a changed rule, defender or time limit.",
  },
  useOfSpace: {
    label: "Use of Space",
    strength: "You are recognising and using valuable space for yourself and teammates.",
    priority: "Develop how you find, create and protect useful space before receiving the ball.",
    focus: "Check your shoulder, move off the defender’s line and arrive in space at the right time.",
  },
});

const CONFIDENCE_RANK = Object.freeze({
  [CONFIDENCE_BANDS.EMERGING]: 1,
  [CONFIDENCE_BANDS.DEVELOPING]: 2,
  [CONFIDENCE_BANDS.STRONG]: 3,
});

function assertProfile(profile) {
  if (!profile || typeof profile !== "object") throw new TypeError("A Football IQ profile is required.");
  if (!profile.playerId) throw new TypeError("Football IQ profile is missing playerId.");
  if (!profile.assessmentId) throw new TypeError("Football IQ profile is missing assessmentId.");
  if (!profile.constructs || typeof profile.constructs !== "object") {
    throw new TypeError("Football IQ profile is missing constructs.");
  }
  return profile;
}

function eligibleConstructs(profile) {
  return CONSTRUCT_IDS.map((constructId) => ({
    constructId,
    ...profile.constructs[constructId],
  })).filter((construct) => construct.eligible && Number.isFinite(construct.score));
}

function confidenceRank(confidence) {
  return CONFIDENCE_RANK[confidence] || 0;
}

function recommendationStrength(confidence) {
  if (confidence === CONFIDENCE_BANDS.STRONG) return "strong";
  if (confidence === CONFIDENCE_BANDS.DEVELOPING) return "provisional";
  return "withheld";
}

function byScoreDescending(a, b) {
  return b.score - a.score || confidenceRank(b.confidence) - confidenceRank(a.confidence) || a.constructId.localeCompare(b.constructId);
}

function byPriority(a, b) {
  return a.score - b.score || confidenceRank(b.confidence) - confidenceRank(a.confidence) || a.constructId.localeCompare(b.constructId);
}

function createStrength(construct) {
  const copy = CONSTRUCT_COPY[construct.constructId];
  return {
    constructId: construct.constructId,
    label: copy.label,
    score: construct.score,
    confidence: construct.confidence,
    statement: copy.strength,
    rationale: `${copy.label} was the highest eligible construct with ${construct.confidence.replaceAll("_", " ")}.`,
  };
}

function createPriority(construct) {
  const copy = CONSTRUCT_COPY[construct.constructId];
  return {
    constructId: construct.constructId,
    label: copy.label,
    score: construct.score,
    confidence: construct.confidence,
    recommendationStrength: recommendationStrength(construct.confidence),
    statement: copy.priority,
    focusArea: copy.focus,
    rationale: `${copy.label} is a comparatively lower eligible score and has enough evidence for a ${recommendationStrength(construct.confidence)} recommendation.`,
  };
}

function mentalityFocus(profile) {
  const dimensions = profile.matchMentality?.dimensions;
  if (!dimensions || typeof dimensions !== "object") return [];

  return Object.entries(dimensions)
    .filter(([, value]) => ["emerging", "developing"].includes(value?.band))
    .slice(0, 2)
    .map(([dimensionId, value]) => ({
      type: "match_mentality",
      dimensionId,
      band: value.band,
      statement: `Keep developing ${dimensionId.replace(/([A-Z])/g, " $1").toLowerCase()} as a trainable match skill.`,
      rationale: `The current Match Mentality band is ${value.band}; this is supporting context, not a fixed player label.`,
    }));
}

function transferFocus(profile) {
  if (profile.matchChallenge?.indicator !== "transfers_inconsistently") return [];
  return [{
    type: "match_transfer",
    statement: "Practise the priority skill under changing pressure, time and space so it transfers more consistently into game-like situations.",
    rationale: "The Match Challenge indicator shows inconsistent transfer under more game-like conditions.",
  }];
}

export function createCoachingIntelligence({ footballIQProfile, generatedAt = new Date() }) {
  const profile = assertProfile(footballIQProfile);
  const eligible = eligibleConstructs(profile);
  const reliable = eligible.filter((construct) => confidenceRank(construct.confidence) >= 2);
  const evidenceReady = eligible.length >= 3 && reliable.length >= 2;

  if (!evidenceReady) {
    return {
      coachingVersion: COACHING_INTELLIGENCE_VERSION,
      playerId: profile.playerId,
      sourceAssessmentId: profile.assessmentId,
      sourceProfileVersion: profile.profileVersion,
      generatedAt: new Date(generatedAt).toISOString(),
      evidenceStatus: {
        state: "insufficient_evidence",
        eligibleConstructs: eligible.map((construct) => construct.constructId),
        reliableConstructs: reliable.map((construct) => construct.constructId),
        reason: "At least three eligible constructs and two with developing or strong confidence are required.",
      },
      strengths: [],
      priorities: [],
      focusAreas: [],
      rationale: ["Recommendations were withheld to avoid coaching from weak or incomplete evidence."],
      nextAssessmentNeed: {
        missingConstructs: profile.evidenceStatus?.missingConstructs || CONSTRUCT_IDS.filter((id) => !eligible.some((item) => item.constructId === id)),
        message: "Complete more varied Football IQ challenges to strengthen the evidence base.",
      },
    };
  }

  const rankedStrengths = [...reliable].sort(byScoreDescending);
  const strongest = rankedStrengths[0];
  const priorityCandidates = [...reliable]
    .filter((construct) => construct.constructId !== strongest.constructId)
    .sort(byPriority)
    .slice(0, 2);
  const priorities = priorityCandidates.map(createPriority);
  const contextualFocus = [...transferFocus(profile), ...mentalityFocus(profile)];

  return {
    coachingVersion: COACHING_INTELLIGENCE_VERSION,
    playerId: profile.playerId,
    sourceAssessmentId: profile.assessmentId,
    sourceProfileVersion: profile.profileVersion,
    generatedAt: new Date(generatedAt).toISOString(),
    evidenceStatus: {
      state: "ready",
      eligibleConstructs: eligible.map((construct) => construct.constructId),
      reliableConstructs: reliable.map((construct) => construct.constructId),
    },
    strengths: [createStrength(strongest)],
    priorities,
    focusAreas: [
      ...priorities.map((priority) => ({
        type: "construct",
        constructId: priority.constructId,
        label: priority.label,
        statement: priority.focusArea,
        recommendationStrength: priority.recommendationStrength,
      })),
      ...contextualFocus,
    ],
    rationale: [
      "Priorities are based on relative profile patterns, not low scores alone.",
      "Only eligible constructs with developing or strong confidence were used.",
      "Match Mentality and Match Challenge provide context but do not alter Football IQ scores.",
    ],
    nextAssessmentNeed: profile.evidenceStatus?.missingConstructs?.length
      ? {
          missingConstructs: profile.evidenceStatus.missingConstructs,
          message: "Collect evidence for the remaining constructs before increasing recommendation certainty.",
        }
      : null,
  };
}
