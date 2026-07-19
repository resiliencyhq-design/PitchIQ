import { getCue } from "../data/cues.js";

export const ACTIVE_MISSION_RUNTIME_KEY = "pitchiq.missionRuntime.active.v1";
export const ADAPTIVE_CURRENT_KEY = "pitchiq.adaptiveTraining.current.v1";

const SCAN_FIRST_SEQUENCE = Object.freeze([
  "check",
  "left",
  "check",
  "red",
  "check",
  "right",
  "check",
  "blue",
]);

const SPOT_THE_CUE_PATTERNS = Object.freeze([
  Object.freeze(["red", "blue", "red"]),
  Object.freeze(["left", "right", "left"]),
  Object.freeze(["blue", "red", "blue"]),
  Object.freeze(["right", "left", "right"]),
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
    return {
      id: "mission-scan-first-v1",
      name: "Scan First",
      seconds: 45,
      difficulty: 1,
      cuePool: [...SCAN_FIRST_SEQUENCE],
      missionId,
      adapterId: "scan-first-v1",
      scoringProfile: "accuracy-reaction",
      sequenceIndex: 0,
    };
  }

  if (missionId === "spot-the-cue") {
    return {
      id: "mission-spot-the-cue-v1",
      name: "Spot the Cue",
      seconds: 45,
      difficulty: 1,
      cuePool: SPOT_THE_CUE_PATTERNS.flat(),
      missionId,
      adapterId: "spot-the-cue-v1",
      scoringProfile: "accuracy-reaction-sequence",
      patternIndex: 0,
      patternStep: 0,
    };
  }

  return null;
}

function nextScanFirstCue(drill) {
  const pool = drill.cuePool?.length ? drill.cuePool : SCAN_FIRST_SEQUENCE;
  const index = Number.isInteger(drill.sequenceIndex) ? drill.sequenceIndex : 0;
  const cueId = pool[index % pool.length];
  drill.sequenceIndex = index + 1;
  const base = getCue(cueId);
  return {
    ...base,
    missionId: "scan-first",
    adapterId: "scan-first-v1",
    scoringWeight: base.type === "scan" ? 1.25 : 1,
    presentedAt: Date.now(),
  };
}

function nextSpotTheCue(drill) {
  const patternIndex = Number.isInteger(drill.patternIndex) ? drill.patternIndex : 0;
  const pattern = SPOT_THE_CUE_PATTERNS[patternIndex % SPOT_THE_CUE_PATTERNS.length];
  const patternStep = Number.isInteger(drill.patternStep) ? drill.patternStep : 0;
  const step = patternStep % pattern.length;
  const cueId = pattern[step];
  const sequenceComplete = step === pattern.length - 1;

  drill.patternStep = step + 1;
  if (sequenceComplete) {
    drill.patternStep = 0;
    drill.patternIndex = patternIndex + 1;
  }

  return {
    ...getCue(cueId),
    missionId: "spot-the-cue",
    adapterId: "spot-the-cue-v1",
    patternIndex,
    sequencePosition: step + 1,
    sequenceLength: pattern.length,
    sequenceComplete,
    scoringWeight: sequenceComplete ? 1.35 : 1,
    presentedAt: Date.now(),
  };
}

export function nextMissionCue(drill) {
  if (drill?.adapterId === "scan-first-v1") return nextScanFirstCue(drill);
  if (drill?.adapterId === "spot-the-cue-v1") return nextSpotTheCue(drill);
  return null;
}

export function missionScoreForResult(cue, correct, reactionMs = null) {
  if (cue?.adapterId !== "scan-first-v1" && cue?.adapterId !== "spot-the-cue-v1") return null;

  const weight = Number(cue.scoringWeight || 1);
  const accuracyPoints = correct ? Math.round(100 * weight) : 0;
  const reactionBonus = correct && Number.isFinite(reactionMs)
    ? Math.max(0, Math.round((1800 - reactionMs) / 20))
    : 0;
  const sequenceCompletionBonus = correct && cue.adapterId === "spot-the-cue-v1" && cue.sequenceComplete
    ? 50
    : 0;

  return {
    missionId: cue.missionId,
    accuracyPoints,
    reactionBonus,
    sequenceCompletionBonus,
    total: accuracyPoints + reactionBonus + sequenceCompletionBonus,
  };
}
