const STORAGE_KEY = "pitchiq.coachingIntelligence.v1";

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

export function saveCoachingIntelligence(output, { storage } = {}) {
  if (!output?.playerId || !output?.sourceAssessmentId || !output?.generatedAt) {
    throw new TypeError("A valid Coaching Intelligence output is required.");
  }

  const target = resolveStorage(storage);
  const records = readAll(target).filter((item) => !(
    item.playerId === output.playerId &&
    item.sourceAssessmentId === output.sourceAssessmentId &&
    item.generatedAt === output.generatedAt
  ));
  records.push(output);
  target.setItem(STORAGE_KEY, JSON.stringify(records));
  return output;
}

export function listCoachingIntelligence(playerId, { storage } = {}) {
  return readAll(resolveStorage(storage))
    .filter((item) => !playerId || item.playerId === playerId)
    .sort((a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt));
}

export function getLatestCoachingIntelligence(playerId, { storage } = {}) {
  return listCoachingIntelligence(playerId, { storage })[0] ?? null;
}

export { STORAGE_KEY as COACHING_INTELLIGENCE_STORAGE_KEY };
