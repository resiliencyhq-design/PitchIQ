import { createCoachingIntelligence } from "./coaching-intelligence.js";
import {
  getLatestCoachingIntelligence,
  saveCoachingIntelligence,
} from "./coaching-intelligence-storage.js";
import { getLatestFootballIQProfile } from "../profile/football-iq-storage.js";

export const COACHING_CONFIDENCE_MAP = Object.freeze({
  strong_confidence: { confidence: 0.9, observations: 5 },
  developing_confidence: { confidence: 0.7, observations: 3 },
  emerging_evidence: { confidence: 0.3, observations: 1 },
});

function priorityForAdaptiveTraining(priority) {
  const evidence = COACHING_CONFIDENCE_MAP[priority?.confidence] || {
    confidence: 0,
    observations: 0,
  };

  return {
    constructId: priority?.constructId,
    label: priority?.label,
    recommendationStrength: priority?.recommendationStrength || "withheld",
    confidence: evidence.confidence,
    observations: evidence.observations,
    score: priority?.score,
    statement: priority?.statement,
    focusArea: priority?.focusArea,
  };
}

export function adaptiveProfileFromCoachingIntelligence(coachingIntelligence, options = {}) {
  const recentMissionIds = Array.isArray(options.recentMissionIds)
    ? options.recentMissionIds
    : [];
  const ready = coachingIntelligence?.evidenceStatus?.state === "ready";

  return {
    sourceAssessmentId: coachingIntelligence?.sourceAssessmentId || null,
    coachingVersion: coachingIntelligence?.coachingVersion || null,
    evidenceState: coachingIntelligence?.evidenceStatus?.state || "unavailable",
    priorities: ready
      ? (coachingIntelligence.priorities || []).map(priorityForAdaptiveTraining)
      : [],
    recentMissionIds,
  };
}

export function resolveAdaptiveTrainingProfile({ playerId, recentMissionIds = [], storage } = {}) {
  const footballIQProfile = getLatestFootballIQProfile(playerId, { storage });
  if (!footballIQProfile) {
    return adaptiveProfileFromCoachingIntelligence(null, { recentMissionIds });
  }

  let coachingIntelligence = getLatestCoachingIntelligence(footballIQProfile.playerId, { storage });
  if (coachingIntelligence?.sourceAssessmentId !== footballIQProfile.assessmentId) {
    coachingIntelligence = createCoachingIntelligence({ footballIQProfile });
    saveCoachingIntelligence(coachingIntelligence, { storage });
  }

  return adaptiveProfileFromCoachingIntelligence(coachingIntelligence, { recentMissionIds });
}
