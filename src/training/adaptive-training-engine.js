export const ADAPTIVE_TRAINING_VERSION = "1.0.0";

export const FOOTBALL_IQ_CONSTRUCTS = Object.freeze([
  "awareness",
  "gameReading",
  "decisionQuality",
  "adaptability",
  "useOfSpace",
]);

export const EVIDENCE_THRESHOLDS = Object.freeze({
  minimumObservations: 3,
  minimumConfidence: 0.6,
});

export const MISSION_CATALOG = Object.freeze([
  { id: "scan-first", constructId: "awareness", drillId: "scanning", title: "Scan First", description: "Check your surroundings before the next action." },
  { id: "spot-the-cue", constructId: "awareness", drillId: "vision", title: "Spot the Cue", description: "Notice the most useful information as early as possible." },
  { id: "predict-next", constructId: "gameReading", drillId: "vision", title: "Predict the Next Play", description: "Read the pattern and anticipate what may happen next." },
  { id: "read-pressure", constructId: "gameReading", drillId: "dual", title: "Read the Pressure", description: "Identify where pressure is coming from before choosing." },
  { id: "best-option", constructId: "decisionQuality", drillId: "decision", title: "Choose the Best Option", description: "Compare the options and select the most effective action." },
  { id: "fast-choice", constructId: "decisionQuality", drillId: "reaction", title: "Decide Under Pressure", description: "Make a clear decision while time is limited." },
  { id: "change-the-plan", constructId: "adaptability", drillId: "dual", title: "Change the Plan", description: "Adjust when the situation changes unexpectedly." },
  { id: "new-picture", constructId: "adaptability", drillId: "reaction", title: "Solve a New Picture", description: "Respond effectively when the cues or rules change." },
  { id: "find-space", constructId: "useOfSpace", drillId: "position", title: "Find the Space", description: "Recognise useful space before moving or receiving." },
  { id: "create-space", constructId: "useOfSpace", drillId: "position", title: "Create the Space", description: "Move to open a better option for yourself or a teammate." },
]);

function normaliseHistory(history = []) {
  return Array.isArray(history) ? history.filter((id) => typeof id === "string") : [];
}

function missionsForConstruct(constructId) {
  return MISSION_CATALOG.filter((mission) => mission.constructId === constructId);
}

function chooseLeastRecent(candidates, history) {
  if (!candidates.length) return null;
  const recent = normaliseHistory(history);
  const unseen = candidates.find((candidate) => !recent.includes(candidate.id));
  if (unseen) return unseen;
  return [...candidates].sort((a, b) => recent.lastIndexOf(a.id) - recent.lastIndexOf(b.id))[0];
}

function balancedConstruct(history) {
  const recent = normaliseHistory(history);
  const counts = Object.fromEntries(FOOTBALL_IQ_CONSTRUCTS.map((id) => [id, 0]));

  for (const missionId of recent) {
    const mission = MISSION_CATALOG.find((item) => item.id === missionId);
    if (mission && mission.constructId in counts) counts[mission.constructId] += 1;
  }

  return [...FOOTBALL_IQ_CONSTRUCTS].sort((a, b) => {
    return counts[a] - counts[b]
      || FOOTBALL_IQ_CONSTRUCTS.indexOf(a) - FOOTBALL_IQ_CONSTRUCTS.indexOf(b);
  })[0];
}

function reliablePriority(playerProfile, thresholds) {
  const priorities = Array.isArray(playerProfile?.priorities) ? playerProfile.priorities : [];
  return priorities.find((priority) => {
    return FOOTBALL_IQ_CONSTRUCTS.includes(priority?.constructId)
      && Number(priority?.observations || 0) >= thresholds.minimumObservations
      && Number(priority?.confidence || 0) >= thresholds.minimumConfidence
      && priority?.recommendationStrength !== "withheld";
  }) || null;
}

export function selectMission(playerProfile = {}, options = {}) {
  const history = normaliseHistory(options.recentMissionIds || playerProfile.recentMissionIds);
  const thresholds = {
    ...EVIDENCE_THRESHOLDS,
    ...(options.thresholds || {}),
  };

  const priority = reliablePriority(playerProfile, thresholds);
  const constructId = priority?.constructId || balancedConstruct(history);
  const mission = chooseLeastRecent(missionsForConstruct(constructId), history);

  if (!mission) {
    throw new Error(`No adaptive mission is configured for construct: ${constructId}`);
  }

  return {
    selectionVersion: ADAPTIVE_TRAINING_VERSION,
    mode: priority ? "personalised" : "balanced_evidence_building",
    sourceConstructId: constructId,
    sourceAssessmentId: playerProfile?.sourceAssessmentId || null,
    mission: { ...mission },
    reason: priority
      ? `Selected from the current ${priority.label || constructId} development priority.`
      : "Selected for balanced evidence collection while reliable player evidence is still building.",
  };
}

export const AdaptiveTrainingEngine = Object.freeze({
  selectMission,
});
