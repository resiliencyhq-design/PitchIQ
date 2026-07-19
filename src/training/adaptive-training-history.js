export const ADAPTIVE_TRAINING_HISTORY_KEY = "pitchiq.adaptiveTrainingHistory.v1";
export const MAX_ADAPTIVE_HISTORY = 12;

function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof globalThis !== "undefined" && globalThis.localStorage) return globalThis.localStorage;
  throw new Error("No storage implementation is available.");
}

export function getRecentMissionIds({ storage, limit = MAX_ADAPTIVE_HISTORY } = {}) {
  const target = resolveStorage(storage);
  const raw = target.getItem(ADAPTIVE_TRAINING_HISTORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === "string").slice(-limit)
      : [];
  } catch {
    return [];
  }
}

export function recordMission(missionId, { storage } = {}) {
  if (!missionId || typeof missionId !== "string") {
    throw new TypeError("A string missionId is required.");
  }

  const target = resolveStorage(storage);
  const history = [
    ...getRecentMissionIds({ storage: target, limit: MAX_ADAPTIVE_HISTORY - 1 }),
    missionId,
  ];
  target.setItem(ADAPTIVE_TRAINING_HISTORY_KEY, JSON.stringify(history));
  return history;
}

export function clearMissionHistory({ storage } = {}) {
  const target = resolveStorage(storage);
  target.removeItem?.(ADAPTIVE_TRAINING_HISTORY_KEY);
}
