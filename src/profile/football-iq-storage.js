const STORAGE_KEY = "pitchiq.footballIQProfiles.v1";

function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }
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

export function saveFootballIQProfile(profile, { storage } = {}) {
  if (!profile?.playerId || !profile?.assessmentId) {
    throw new TypeError("A valid Football IQ profile is required.");
  }

  const target = resolveStorage(storage);
  const profiles = readAll(target);
  const withoutDuplicate = profiles.filter(
    (item) => !(
      item.playerId === profile.playerId &&
      item.assessmentId === profile.assessmentId &&
      item.generatedAt === profile.generatedAt
    ),
  );

  withoutDuplicate.push(profile);
  target.setItem(STORAGE_KEY, JSON.stringify(withoutDuplicate));
  return profile;
}

export function listFootballIQProfiles(playerId, { storage } = {}) {
  const target = resolveStorage(storage);
  return readAll(target)
    .filter((profile) => !playerId || profile.playerId === playerId)
    .sort((a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt));
}

export function getLatestFootballIQProfile(playerId, { storage } = {}) {
  return listFootballIQProfiles(playerId, { storage })[0] ?? null;
}

export { STORAGE_KEY as FOOTBALL_IQ_PROFILE_STORAGE_KEY };
