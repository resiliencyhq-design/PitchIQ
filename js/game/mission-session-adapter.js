import { getCue } from "../data/cues.js";

export const ACTIVE_MISSION_RUNTIME_KEY = "pitchiq.missionRuntime.active.v1";
export const ADAPTIVE_CURRENT_KEY = "pitchiq.adaptiveTraining.current.v1";

const SCAN_FIRST_SEQUENCE = Object.freeze([
  "check", "left", "check", "red", "check", "right", "check", "blue",
]);

const SPOT_THE_CUE_PATTERNS = Object.freeze([
  Object.freeze(["red", "blue", "red"]),
  Object.freeze(["left", "right", "left"]),
  Object.freeze(["blue", "red", "blue"]),
  Object.freeze(["right", "left", "right"]),
]);

const PREDICT_NEXT_PATTERNS = Object.freeze([
  Object.freeze(["red", "blue", "red", "blue"]),
  Object.freeze(["left", "left", "right", "right"]),
  Object.freeze(["check", "left", "check", "right"]),
  Object.freeze(["turn", "drive", "turn", "drive"]),
]);

const READ_PRESSURE_SCENARIOS = Object.freeze([
  Object.freeze({ cues: ["check", "left", "right"], source: "single-defender", direction: "left", intensity: 1, bestResponse: "right" }),
  Object.freeze({ cues: ["check", "right", "left"], source: "single-defender", direction: "right", intensity: 1, bestResponse: "left" }),
  Object.freeze({ cues: ["red", "left", "drive"], source: "closing-lane", direction: "left", intensity: 2, bestResponse: "drive" }),
  Object.freeze({ cues: ["blue", "right", "turn"], source: "double-press", direction: "right", intensity: 3, bestResponse: "turn" }),
]);

const THIRD_PLAYER_SCENARIOS = Object.freeze([
  Object.freeze({ cues: ["check", "left", "right", "drive"], primaryOption: "left", secondaryOption: "right", thirdPlayerOption: "drive", blockedLanes: ["left"], pressureSource: "front" }),
  Object.freeze({ cues: ["check", "right", "left", "turn"], primaryOption: "right", secondaryOption: "left", thirdPlayerOption: "turn", blockedLanes: ["right"], pressureSource: "rear" }),
  Object.freeze({ cues: ["red", "left", "blue", "right"], primaryOption: "red", secondaryOption: "left", thirdPlayerOption: "right", blockedLanes: ["red", "left"], pressureSource: "left" }),
  Object.freeze({ cues: ["blue", "right", "red", "left"], primaryOption: "blue", secondaryOption: "right", thirdPlayerOption: "left", blockedLanes: ["blue", "right"], pressureSource: "right" }),
]);

const BREAK_THE_LINE_SCENARIOS = Object.freeze([
  Object.freeze({ cues: ["check", "left", "red", "drive"], defensiveLineShape: "flat-four", passingLaneState: "opens-central", receiverMovement: "checks-between-lines", pressureSource: "front", lineBreakingOption: "drive" }),
  Object.freeze({ cues: ["check", "right", "blue", "turn"], defensiveLineShape: "mid-block", passingLaneState: "opens-right-half-space", receiverMovement: "separates-right", pressureSource: "left", lineBreakingOption: "turn" }),
  Object.freeze({ cues: ["red", "left", "check", "right"], defensiveLineShape: "narrow-block", passingLaneState: "opens-wide-to-inside", receiverMovement: "diagonal-run", pressureSource: "centre", lineBreakingOption: "right" }),
  Object.freeze({ cues: ["blue", "right", "check", "left"], defensiveLineShape: "stepping-line", passingLaneState: "opens-left-channel", receiverMovement: "drops-then-spins", pressureSource: "right", lineBreakingOption: "left" }),
]);

function readJson(storage, key) {
  try {
    return JSON.parse(storage?.getItem?.(key) || "null");
  } catch {
    return null;
  }
}

export function activeMissionId(storage = globalThis.sessionStorage, fallbackStorage = globalThis.localStorage) {
  const runtime = readJson(storage, ACTIVE_MISSION_RUNTIME_KEY);
  if (runtime?.missionId) return runtime.missionId;
  return readJson(fallbackStorage, ADAPTIVE_CURRENT_KEY)?.mission?.id || null;
}

export function createMissionDrill(missionId) {
  if (missionId === "scan-first") {
    return { id: "mission-scan-first-v1", name: "Scan First", seconds: 45, difficulty: 1, cuePool: [...SCAN_FIRST_SEQUENCE], missionId, adapterId: "scan-first-v1", scoringProfile: "accuracy-reaction", sequenceIndex: 0 };
  }
  if (missionId === "spot-the-cue") {
    return { id: "mission-spot-the-cue-v1", name: "Spot the Cue", seconds: 45, difficulty: 1, cuePool: SPOT_THE_CUE_PATTERNS.flat(), missionId, adapterId: "spot-the-cue-v1", scoringProfile: "accuracy-reaction-sequence", patternIndex: 0, patternStep: 0 };
  }
  if (missionId === "predict-next") {
    return { id: "mission-predict-next-v1", name: "Predict the Next Play", seconds: 45, difficulty: 1, cuePool: PREDICT_NEXT_PATTERNS.flat(), missionId, adapterId: "predict-next-v1", scoringProfile: "prediction-accuracy-reaction-confidence", patternIndex: 0, patternStep: 0 };
  }
  if (missionId === "read-pressure") {
    return { id: "mission-read-pressure-v1", name: "Read the Pressure", seconds: 45, difficulty: 1, cuePool: READ_PRESSURE_SCENARIOS.flatMap((scenario) => scenario.cues), missionId, adapterId: "read-pressure-v1", scoringProfile: "pressure-recognition-decision-reaction", scenarioIndex: 0, scenarioStep: 0 };
  }
  if (missionId === "find-third-player") {
    return { id: "mission-find-third-player-v1", name: "Find the Third Player", seconds: 45, difficulty: 1, cuePool: THIRD_PLAYER_SCENARIOS.flatMap((scenario) => scenario.cues), missionId, adapterId: "find-third-player-v1", scoringProfile: "third-player-identification-scanning-reaction", scenarioIndex: 0, scenarioStep: 0 };
  }
  if (missionId === "break-the-line") {
    return { id: "mission-break-the-line-v1", name: "Break the Line", seconds: 45, difficulty: 1, cuePool: BREAK_THE_LINE_SCENARIOS.flatMap((scenario) => scenario.cues), missionId, adapterId: "break-the-line-v1", scoringProfile: "line-breaking-recognition-progression-reaction", scenarioIndex: 0, scenarioStep: 0 };
  }
  return null;
}

function nextScanFirstCue(drill) {
  const pool = drill.cuePool?.length ? drill.cuePool : SCAN_FIRST_SEQUENCE;
  const index = Number.isInteger(drill.sequenceIndex) ? drill.sequenceIndex : 0;
  const cueId = pool[index % pool.length];
  drill.sequenceIndex = index + 1;
  const base = getCue(cueId);
  return { ...base, missionId: "scan-first", adapterId: "scan-first-v1", scoringWeight: base.type === "scan" ? 1.25 : 1, presentedAt: Date.now() };
}

function nextSpotTheCue(drill) {
  const patternIndex = Number.isInteger(drill.patternIndex) ? drill.patternIndex : 0;
  const pattern = SPOT_THE_CUE_PATTERNS[patternIndex % SPOT_THE_CUE_PATTERNS.length];
  const patternStep = Number.isInteger(drill.patternStep) ? drill.patternStep : 0;
  const step = patternStep % pattern.length;
  const cueId = pattern[step];
  const sequenceComplete = step === pattern.length - 1;
  drill.patternStep = step + 1;
  if (sequenceComplete) { drill.patternStep = 0; drill.patternIndex = patternIndex + 1; }
  return { ...getCue(cueId), missionId: "spot-the-cue", adapterId: "spot-the-cue-v1", patternIndex, sequencePosition: step + 1, sequenceLength: pattern.length, sequenceComplete, scoringWeight: sequenceComplete ? 1.35 : 1, presentedAt: Date.now() };
}

function nextPredictNextCue(drill) {
  const patternIndex = Number.isInteger(drill.patternIndex) ? drill.patternIndex : 0;
  const pattern = PREDICT_NEXT_PATTERNS[patternIndex % PREDICT_NEXT_PATTERNS.length];
  const patternStep = Number.isInteger(drill.patternStep) ? drill.patternStep : 0;
  const step = patternStep % pattern.length;
  const predictionRequired = step === pattern.length - 1;
  const cueId = pattern[step];
  drill.patternStep = step + 1;
  if (predictionRequired) { drill.patternStep = 0; drill.patternIndex = patternIndex + 1; }
  return { ...getCue(cueId), missionId: "predict-next", adapterId: "predict-next-v1", patternIndex, sequencePosition: step + 1, sequenceLength: pattern.length, contextCue: !predictionRequired, predictionRequired, expectedPrediction: predictionRequired ? cueId : null, scoringWeight: predictionRequired ? 1.5 : 0.5, presentedAt: Date.now() };
}

function nextReadPressureCue(drill) {
  const scenarioIndex = Number.isInteger(drill.scenarioIndex) ? drill.scenarioIndex : 0;
  const scenario = READ_PRESSURE_SCENARIOS[scenarioIndex % READ_PRESSURE_SCENARIOS.length];
  const scenarioStep = Number.isInteger(drill.scenarioStep) ? drill.scenarioStep : 0;
  const step = scenarioStep % scenario.cues.length;
  const decisionRequired = step === scenario.cues.length - 1;
  const cueId = scenario.cues[step];
  drill.scenarioStep = step + 1;
  if (decisionRequired) { drill.scenarioStep = 0; drill.scenarioIndex = scenarioIndex + 1; }
  return {
    ...getCue(cueId),
    missionId: "read-pressure",
    adapterId: "read-pressure-v1",
    scenarioIndex,
    sequencePosition: step + 1,
    sequenceLength: scenario.cues.length,
    pressureSource: scenario.source,
    pressureDirection: scenario.direction,
    pressureIntensity: scenario.intensity,
    contextCue: !decisionRequired,
    decisionRequired,
    expectedDecision: decisionRequired ? scenario.bestResponse : null,
    scoringWeight: decisionRequired ? 1 + scenario.intensity * 0.2 : 0.5,
    presentedAt: Date.now(),
  };
}

function nextThirdPlayerCue(drill) {
  const scenarioIndex = Number.isInteger(drill.scenarioIndex) ? drill.scenarioIndex : 0;
  const scenario = THIRD_PLAYER_SCENARIOS[scenarioIndex % THIRD_PLAYER_SCENARIOS.length];
  const scenarioStep = Number.isInteger(drill.scenarioStep) ? drill.scenarioStep : 0;
  const step = scenarioStep % scenario.cues.length;
  const decisionRequired = step === scenario.cues.length - 1;
  const cueId = scenario.cues[step];
  drill.scenarioStep = step + 1;
  if (decisionRequired) { drill.scenarioStep = 0; drill.scenarioIndex = scenarioIndex + 1; }
  return {
    ...getCue(cueId),
    missionId: "find-third-player",
    adapterId: "find-third-player-v1",
    scenarioIndex,
    sequencePosition: step + 1,
    sequenceLength: scenario.cues.length,
    primaryOption: scenario.primaryOption,
    secondaryOption: scenario.secondaryOption,
    thirdPlayerOption: scenario.thirdPlayerOption,
    blockedLanes: [...scenario.blockedLanes],
    pressureSource: scenario.pressureSource,
    passingLaneAvailable: decisionRequired,
    contextCue: !decisionRequired,
    decisionRequired,
    expectedDecision: decisionRequired ? scenario.thirdPlayerOption : null,
    scoringWeight: decisionRequired ? 1.6 : 0.5,
    presentedAt: Date.now(),
  };
}

function nextBreakTheLineCue(drill) {
  const scenarioIndex = Number.isInteger(drill.scenarioIndex) ? drill.scenarioIndex : 0;
  const scenario = BREAK_THE_LINE_SCENARIOS[scenarioIndex % BREAK_THE_LINE_SCENARIOS.length];
  const scenarioStep = Number.isInteger(drill.scenarioStep) ? drill.scenarioStep : 0;
  const step = scenarioStep % scenario.cues.length;
  const decisionRequired = step === scenario.cues.length - 1;
  const cueId = scenario.cues[step];
  drill.scenarioStep = step + 1;
  if (decisionRequired) { drill.scenarioStep = 0; drill.scenarioIndex = scenarioIndex + 1; }
  return {
    ...getCue(cueId),
    missionId: "break-the-line",
    adapterId: "break-the-line-v1",
    scenarioIndex,
    sequencePosition: step + 1,
    sequenceLength: scenario.cues.length,
    defensiveLineShape: scenario.defensiveLineShape,
    passingLaneState: scenario.passingLaneState,
    receiverMovement: scenario.receiverMovement,
    pressureSource: scenario.pressureSource,
    lineBreakingOpportunity: decisionRequired,
    progressiveDecision: decisionRequired,
    contextCue: !decisionRequired,
    decisionRequired,
    expectedDecision: decisionRequired ? scenario.lineBreakingOption : null,
    scoringWeight: decisionRequired ? 1.7 : 0.5,
    presentedAt: Date.now(),
  };
}

export function nextMissionCue(drill) {
  if (drill?.adapterId === "scan-first-v1") return nextScanFirstCue(drill);
  if (drill?.adapterId === "spot-the-cue-v1") return nextSpotTheCue(drill);
  if (drill?.adapterId === "predict-next-v1") return nextPredictNextCue(drill);
  if (drill?.adapterId === "read-pressure-v1") return nextReadPressureCue(drill);
  if (drill?.adapterId === "find-third-player-v1") return nextThirdPlayerCue(drill);
  if (drill?.adapterId === "break-the-line-v1") return nextBreakTheLineCue(drill);
  return null;
}

export function missionScoreForResult(cue, correct, reactionMs = null, evidence = {}) {
  if (!["scan-first-v1", "spot-the-cue-v1", "predict-next-v1", "read-pressure-v1", "find-third-player-v1", "break-the-line-v1"].includes(cue?.adapterId)) return null;
  const weight = Number(cue.scoringWeight || 1);
  const accuracyPoints = correct ? Math.round(100 * weight) : 0;
  const reactionBonus = correct && Number.isFinite(reactionMs) ? Math.max(0, Math.round((1800 - reactionMs) / 20)) : 0;
  const sequenceCompletionBonus = correct && cue.adapterId === "spot-the-cue-v1" && cue.sequenceComplete ? 50 : 0;
  const anticipationBonus = correct && cue.adapterId === "predict-next-v1" && cue.predictionRequired ? 75 : 0;
  const pressureRecognitionBonus = correct && cue.adapterId === "read-pressure-v1" ? Number(cue.pressureIntensity || 1) * 20 : 0;
  const pressureDecisionBonus = correct && cue.adapterId === "read-pressure-v1" && cue.decisionRequired ? 60 : 0;
  const thirdPlayerBonus = correct && cue.adapterId === "find-third-player-v1" && cue.decisionRequired ? 90 : 0;
  const laneRecognitionBonus = correct && cue.adapterId === "find-third-player-v1" && cue.passingLaneAvailable ? 40 : 0;
  const lineBreakingBonus = correct && cue.adapterId === "break-the-line-v1" && cue.lineBreakingOpportunity ? 100 : 0;
  const progressiveDecisionBonus = correct && cue.adapterId === "break-the-line-v1" && cue.progressiveDecision ? 60 : 0;
  const passingLaneBonus = correct && cue.adapterId === "break-the-line-v1" && cue.passingLaneState ? 40 : 0;
  const scanCount = Number(evidence?.scanCount);
  const scanningBonus = ["find-third-player-v1", "break-the-line-v1"].includes(cue.adapterId) && Number.isFinite(scanCount) ? Math.max(0, Math.min(50, Math.round(scanCount * 10))) : 0;
  const confidence = Number(evidence?.confidence);
  const confidenceMultiplier = cue.adapterId === "predict-next-v1" && Number.isFinite(confidence) ? Math.max(0.5, Math.min(1.25, confidence)) : 1;
  const subtotal = accuracyPoints + reactionBonus + sequenceCompletionBonus + anticipationBonus + pressureRecognitionBonus + pressureDecisionBonus + thirdPlayerBonus + laneRecognitionBonus + lineBreakingBonus + progressiveDecisionBonus + passingLaneBonus + scanningBonus;
  return { missionId: cue.missionId, accuracyPoints, reactionBonus, sequenceCompletionBonus, anticipationBonus, pressureRecognitionBonus, pressureDecisionBonus, thirdPlayerBonus, laneRecognitionBonus, lineBreakingBonus, progressiveDecisionBonus, passingLaneBonus, scanningBonus, confidenceMultiplier, total: Math.round(subtotal * confidenceMultiplier) };
}
