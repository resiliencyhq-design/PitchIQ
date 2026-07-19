const STORAGE_KEY = "pitchiq.adaptiveTrainingHistory.v1";
const MAX_HISTORY = 12;

function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof globalThis !== "undefined" && globalThis.localStorage) return globalThis.localStorage;
  throw new Error("No storage implementation is available.");
}

export function getRecentMissionIds({ storage, limit = MAX_HISTORY } = {}) {
  const raw = resolveStorage(storage).getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string").slice(-limit) : [];
  } catch {
    return [];
  }
}

export function recordAdaptiveMission(missionId, { storage } = {}) {
  if (!missionId) throw new TypeError("A missionId is required.");
  const target = resolveStorage(storage);
  const history = [...getRecentMissionIds({ storage: target, limit: MAX_HISTORY - 1 }), missionId];
  target.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
}

export { STORAGE_KEY as ADAPTIVE_TRAINING_HISTORY_KEY };
