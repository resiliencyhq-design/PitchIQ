const STORAGE_KEY = "pitchiq.trainingEvidence.v1";

function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof globalThis !== "undefined" && globalThis.localStorage) return globalThis.localStorage;
  throw new Error("No storage implementation is available.");
}

function readAll(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTrainingEvidence(record, { storage } = {}) {
  if (!record?.playerId || !record?.sessionId || !record?.completedAt) {
    throw new TypeError("A valid training evidence record is required.");
  }
  const target = resolveStorage(storage);
  const records = readAll(target).filter((item) => item.sessionId !== record.sessionId);
  records.push(record);
  target.setItem(STORAGE_KEY, JSON.stringify(records));
  return record;
}

export function listTrainingEvidence(playerId, { storage } = {}) {
  return readAll(resolveStorage(storage))
    .filter((item) => !playerId || item.playerId === playerId)
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
}

export function clearTrainingEvidence(playerId, { storage } = {}) {
  const target = resolveStorage(storage);
  const remaining = readAll(target).filter((item) => item.playerId !== playerId);
  target.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

export { STORAGE_KEY as TRAINING_EVIDENCE_STORAGE_KEY };
