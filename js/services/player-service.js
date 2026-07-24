import { loadState, normalizeState, stateStore } from "./storage.js";

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
  const nextPlayer = normalizePlayer({
    ...current,
    name: current.name || legacy.name,
    number: current.number || legacy.number,
    position: current.position || legacy.position,
    style: current.style || legacy.style,
    avatar: current.avatar || legacy.avatar
  });

  const next = stateStore.update(draft => {
    draft.profile = nextPlayer;
  }, { source: "player-legacy-migration" });
  localStorage.setItem(MIGRATION_KEY, "true");
  writeCompatibilityKeys(nextPlayer, Boolean(nextPlayer.name && nextPlayer.position));
  return next;
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
  const current = loadCanonicalState();
  const nextPlayer = normalizePlayer({ ...current.profile, ...patch });
  stateStore.update(draft => {
    draft.profile = nextPlayer;
  }, { source: "player-update" });
  writeCompatibilityKeys(nextPlayer, options.onboardingComplete);
  window.dispatchEvent(new CustomEvent("pitchiq:player-updated", { detail: { player: clone(nextPlayer) } }));
  return clone(nextPlayer);
}

function completeOnboarding(patch = {}) {
  return updatePlayer({ ...patch, createdAt: patch.createdAt ?? Date.now() }, { onboardingComplete: true });
}

function resetPlayer() {
  Object.values(LEGACY_KEYS).forEach(key => localStorage.removeItem(key));
  localStorage.removeItem(MIGRATION_KEY);
  const nextPlayer = normalizePlayer({});
  stateStore.update(draft => {
    draft.profile = nextPlayer;
  }, { source: "player-reset" });
  window.dispatchEvent(new CustomEvent("pitchiq:player-reset"));
  return clone(nextPlayer);
}

export const PlayerService = Object.freeze({
  getPlayer,
  updatePlayer,
  completeOnboarding,
  resetPlayer,
  migrateLegacyPlayer: () => migrateLegacyPlayer(loadState())
});

export { getPlayer, updatePlayer, completeOnboarding, resetPlayer, migrateLegacyPlayer };