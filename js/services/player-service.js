import { loadState, saveState, normalizeState } from "./storage.js";

const LEGACY_KEYS = Object.freeze({
  name: "pitchiqPlayerName",
  number: "pitchiqJerseyNumber",
  position: "pitchiqSelectedPosition",
  style: "pitchiqPlayerStyle",
  avatar: "pitchiqPlayerAvatar",
  onboardingComplete: "pitchiqOnboardingComplete"
});

const MIGRATION_KEY = "pitchiqPlayerServiceMigrationV1";

function clone(value) {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

function readLegacyPlayer() {
  return {
    name: localStorage.getItem(LEGACY_KEYS.name) || "",
    number: localStorage.getItem(LEGACY_KEYS.number) || "1",
    position: localStorage.getItem(LEGACY_KEYS.position) || "",
    style: localStorage.getItem(LEGACY_KEYS.style) || "Creator",
    avatar: localStorage.getItem(LEGACY_KEYS.avatar) || "default"
  };
}

function normalizePlayer(player = {}) {
  return {
    name: String(player.name || ""),
    number: String(player.number || "1"),
    position: String(player.position || ""),
    style: String(player.style || "Creator"),
    avatar: String(player.avatar || "default"),
    goal: String(player.goal || "React faster"),
    createdAt: player.createdAt ?? null
  };
}

function writeCompatibilityKeys(player, onboardingComplete = null) {
  localStorage.setItem(LEGACY_KEYS.name, player.name);
  localStorage.setItem(LEGACY_KEYS.number, player.number);
  localStorage.setItem(LEGACY_KEYS.position, player.position);
  localStorage.setItem(LEGACY_KEYS.style, player.style);
  localStorage.setItem(LEGACY_KEYS.avatar, player.avatar);
  if (typeof onboardingComplete === "boolean") {
    localStorage.setItem(LEGACY_KEYS.onboardingComplete, onboardingComplete ? "true" : "false");
  }
}

function migrateLegacyPlayer(state) {
  const normalized = normalizeState(state);
  const legacy = readLegacyPlayer();
  const current = normalizePlayer(normalized.profile);

  normalized.profile = normalizePlayer({
    ...current,
    name: current.name || legacy.name,
    number: current.number || legacy.number,
    position: current.position || legacy.position,
    style: current.style || legacy.style,
    avatar: current.avatar || legacy.avatar
  });

  localStorage.setItem(MIGRATION_KEY, "true");
  writeCompatibilityKeys(normalized.profile, Boolean(normalized.profile.name && normalized.profile.position));
  saveState(normalized);
  return normalized;
}

function loadCanonicalState() {
  const loaded = normalizeState(loadState());
  if (localStorage.getItem(MIGRATION_KEY) !== "true") {
    return migrateLegacyPlayer(loaded);
  }
  return loaded;
}

function getPlayer() {
  return clone(loadCanonicalState().profile);
}

function updatePlayer(patch = {}, options = {}) {
  const state = loadCanonicalState();
  const nextPlayer = normalizePlayer({ ...state.profile, ...patch });
  state.profile = nextPlayer;
  saveState(state);
  writeCompatibilityKeys(nextPlayer, options.onboardingComplete);
  window.dispatchEvent(new CustomEvent("pitchiq:player-updated", { detail: { player: clone(nextPlayer) } }));
  return clone(nextPlayer);
}

function completeOnboarding(patch = {}) {
  const player = updatePlayer({ ...patch, createdAt: patch.createdAt ?? Date.now() }, { onboardingComplete: true });
  return player;
}

function resetPlayer() {
  const state = loadCanonicalState();
  state.profile = normalizePlayer({});
  saveState(state);
  Object.values(LEGACY_KEYS).forEach(key => localStorage.removeItem(key));
  localStorage.removeItem(MIGRATION_KEY);
  window.dispatchEvent(new CustomEvent("pitchiq:player-reset"));
  return clone(state.profile);
}

export const PlayerService = Object.freeze({
  getPlayer,
  updatePlayer,
  completeOnboarding,
  resetPlayer,
  migrateLegacyPlayer: () => migrateLegacyPlayer(loadState())
});

export { getPlayer, updatePlayer, completeOnboarding, resetPlayer, migrateLegacyPlayer };
