import { createMissionContract, MISSION_LIFECYCLE } from "./mission-contract.js";

export const MISSION_STORE_KEY = "pitchiq.mission.current.v1";
export const MISSION_HISTORY_KEY = "pitchiq.mission.history.v1";

function safeRead(storage, key, fallback) {
  try {
    const value = JSON.parse(storage?.getItem?.(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(storage, key, value) {
  storage?.setItem?.(key, JSON.stringify(value));
  return value;
}

export function readCurrentMission(storage = globalThis.localStorage) {
  const value = safeRead(storage, MISSION_STORE_KEY, null);
  if (!value) return null;
  try {
    return createMissionContract(value);
  } catch {
    return null;
  }
}

export function writeCurrentMission(mission, storage = globalThis.localStorage) {
  const normalized = createMissionContract(mission);
  safeWrite(storage, MISSION_STORE_KEY, normalized);
  return normalized;
}

export function clearCurrentMission(storage = globalThis.localStorage) {
  storage?.removeItem?.(MISSION_STORE_KEY);
}

export function readMissionHistory(storage = globalThis.localStorage) {
  const history = safeRead(storage, MISSION_HISTORY_KEY, []);
  return Array.isArray(history) ? history : [];
}

export function appendMissionHistory(entry, storage = globalThis.localStorage) {
  const history = readMissionHistory(storage);
  const next = [...history, Object.freeze({ ...entry })].slice(-100);
  safeWrite(storage, MISSION_HISTORY_KEY, next);
  return next;
}

export function transitionMission(nextLifecycle, patch = {}, storage = globalThis.localStorage) {
  const current = readCurrentMission(storage);
  if (!current) throw new Error("No current mission is available to transition");

  const next = createMissionContract({
    ...current,
    ...patch,
    lifecycle: nextLifecycle,
    activity: { ...current.activity, ...(patch.activity || {}) },
    reward: { ...current.reward, ...(patch.reward || {}) },
    metadata: { ...current.metadata, ...(patch.metadata || {}) },
    objectives: patch.objectives || current.objectives,
    assignedAt: current.assignedAt,
    updatedAt: Date.now(),
  });

  writeCurrentMission(next, storage);
  appendMissionHistory({
    missionId: next.id,
    lifecycle: next.lifecycle,
    at: next.updatedAt,
  }, storage);

  return next;
}

export function assignMission(mission, storage = globalThis.localStorage) {
  const assigned = createMissionContract({
    ...mission,
    lifecycle: MISSION_LIFECYCLE.ASSIGNED,
    assignedAt: mission.assignedAt || Date.now(),
    updatedAt: Date.now(),
  });
  writeCurrentMission(assigned, storage);
  appendMissionHistory({ missionId: assigned.id, lifecycle: assigned.lifecycle, at: assigned.updatedAt }, storage);
  return assigned;
}
