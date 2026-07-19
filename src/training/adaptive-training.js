export const ADAPTIVE_TRAINING_VERSION = "1.0.0";

export const MISSION_CATALOG = Object.freeze([
  { id: "scan-first", constructId: "awareness", drillId: "scanning", title: "Scan First", description: "Check your surroundings before the next action.", theme: "Scan earlier" },
  { id: "spot-the-cue", constructId: "awareness", drillId: "vision", title: "Spot the Cue", description: "Notice the most useful information as early as possible.", theme: "Notice key cues" },
  { id: "predict-next", constructId: "gameReading", drillId: "vision", title: "Predict the Next Play", description: "Read the pattern and anticipate what may happen next.", theme: "Recognise patterns" },
  { id: "read-pressure", constructId: "gameReading", drillId: "dual", title: "Read the Pressure", description: "Identify where pressure is coming from before choosing.", theme: "Read pressure" },
  { id: "best-option", constructId: "decisionQuality", drillId: "decision", title: "Choose the Best Option", description: "Compare the options and select the most effective action.", theme: "Choose effectively" },
  { id: "fast-choice", constructId: "decisionQuality", drillId: "reaction", title: "Decide Under Pressure", description: "Make a clear decision while time is limited.", theme: "Play under pressure" },
  { id: "change-the-plan", constructId: "adaptability", drillId: "dual", title: "Change the Plan", description: "Adjust when the situation changes unexpectedly.", theme: "Adapt quicker" },
  { id: "new-picture", constructId: "adaptability", drillId: "reaction", title: "Solve a New Picture", description: "Respond effectively when the cues or rules change.", theme: "Respond to change" },
  { id: "find-space", constructId: "useOfSpace", drillId: "position", title: "Find the Space", description: "Recognise useful space before moving or receiving.", theme: "Find useful space" },
  { id: "create-space", constructId: "useOfSpace", drillId: "position", title: "Create the Space", description: "Move to open a better option for yourself or a teammate.", theme: "Create space" },
]);

const BALANCED_ORDER = ["awareness", "gameReading", "decisionQuality", "adaptability", "useOfSpace"];

function normaliseHistory(history = []) {
  return Array.isArray(history) ? history.filter((id) => typeof id === "string") : [];
}

function candidatesForConstruct(constructId) {
  return MISSION_CATALOG.filter((mission) => mission.constructId === constructId);
}

function chooseLeastRecent(candidates, history) {
  const recent = normaliseHistory(history);
  const unseen = candidates.find((candidate) => !recent.includes(candidate.id));
  if (unseen) return unseen;
  return [...candidates].sort((a, b) => recent.lastIndexOf(a.id) - recent.lastIndexOf(b.id))[0];
}

function balancedConstruct(history) {
  const recent = normaliseHistory(history);
  const counts = Object.fromEntries(BALANCED_ORDER.map((id) => [id, 0]));
  for (const missionId of recent) {
    const mission = MISSION_CATALOG.find((item) => item.id === missionId);
    if (mission && mission.constructId in counts) counts[mission.constructId] += 1;
  }
  return [...BALANCED_ORDER].sort((a, b) => counts[a] - counts[b] || BALANCED_ORDER.indexOf(a) - BALANCED_ORDER.indexOf(b))[0];
}

export function selectAdaptiveMission({ coachingIntelligence, recentMissionIds = [] } = {}) {
  const evidenceReady = coachingIntelligence?.evidenceStatus?.state === "ready";
  const priority = evidenceReady
    ? coachingIntelligence.priorities?.find((item) => item?.constructId && item.recommendationStrength !== "withheld")
    : null;
  const constructId = priority?.constructId || balancedConstruct(recentMissionIds);
  const candidates = candidatesForConstruct(constructId);
  const mission = chooseLeastRecent(candidates, recentMissionIds);

  return {
    selectionVersion: ADAPTIVE_TRAINING_VERSION,
    mode: priority ? "personalised" : "balanced_evidence_building",
    sourceConstructId: constructId,
    sourceAssessmentId: coachingIntelligence?.sourceAssessmentId || null,
    mission: { ...mission },
    rationale: priority
      ? `Selected from the current ${priority.label || constructId} development priority.`
      : "Selected from a balanced rotation while more reliable evidence is collected.",
  };
}
