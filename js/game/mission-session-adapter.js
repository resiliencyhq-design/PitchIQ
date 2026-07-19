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
  if (missionId !== "scan-first") return null;
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

export function nextMissionCue(drill) {
  if (drill?.adapterId !== "scan-first-v1") return null;
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

export function missionScoreForResult(cue, correct, reactionMs = null) {
  if (cue?.adapterId !== "scan-first-v1") return null;
  const weight = Number(cue.scoringWeight || 1);
  const accuracyPoints = correct ? Math.round(100 * weight) : 0;
  const reactionBonus = correct && Number.isFinite(reactionMs)
    ? Math.max(0, Math.round((1800 - reactionMs) / 20))
    : 0;
  return {
    missionId: "scan-first",
    accuracyPoints,
    reactionBonus,
    total: accuracyPoints + reactionBonus,
  };
}
