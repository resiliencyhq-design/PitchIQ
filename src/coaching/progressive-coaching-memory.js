export const COACHING_MEMORY_VERSION = "1.0.0";

const VALID_REFLECTIONS = new Set(["noticed", "sometimes", "learning"]);

function recentForFocus(records = [], focusId) {
  return records
    .filter(record => record?.focusId === focusId && VALID_REFLECTIONS.has(record?.responseId))
    .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
}

function evidenceForFocus(records = [], mission = {}) {
  return records.filter(record => {
    if (!record) return false;
    if (mission.id && record.missionId === mission.id) return true;
    return Boolean(mission.drillId && record.drillId === mission.drillId);
  });
}

export function resolveProgressiveCoachingMemory({ selection, reflections = [], trainingEvidence = [] } = {}) {
  const mission = selection?.mission || {};
  const focusId = mission.drillId || null;
  const relevantReflections = recentForFocus(reflections, focusId);
  const relevantEvidence = evidenceForFocus(trainingEvidence, mission);
  const latest = relevantReflections[0] || null;

  let stage = "new_focus";
  let message = "This is a fresh coaching focus. Notice one useful moment and build from there.";

  if (latest?.responseId === "noticed") {
    stage = "reinforce";
    message = "Last time you noticed this cue. Look for the same moment again and make it easier to recognise.";
  } else if (latest?.responseId === "sometimes") {
    stage = "repeat_cue";
    message = "Last time you noticed this sometimes. Keep the same cue so you get another clear chance to spot it.";
  } else if (latest?.responseId === "learning") {
    stage = "support";
    message = "You marked this as still learning last time. Keep the action simple and focus on one clear attempt.";
  } else if (relevantEvidence.length > 0) {
    stage = "evidence_only";
    message = "You have completed this type of mission before. Use today’s rep to add another clear piece of evidence.";
  }

  return Object.freeze({
    version: COACHING_MEMORY_VERSION,
    stage,
    message,
    focusId,
    missionId: mission.id || null,
    reflectionCount: relevantReflections.length,
    evidenceCount: relevantEvidence.length,
    latestResponseId: latest?.responseId || null,
    changesRecommendation: false,
    changesFootballIQ: false,
    changesXP: false
  });
}
