const KEY = "pitchiq_integrated_v1";

const defaults = {
  profile: { name: "", number: "1", position: "Winger", style: "Creator", avatar: "default", goal: "React faster", createdAt: null },
  game: { xp: 0, level: 1, streak: 1, coins: 0, dailyDone: false, packOpened: false, unlocked: [], lastXp: 0, bestCombo: 0, trainingSeconds: 0, lastResult: null },
  analytics: { sessions: [], bestReaction: null, reactionHistory: [], weeklyXp: [0, 0, 0, 0, 0, 0, 0] },
  settings: { sound: true, haptics: true, reduceMotion: false, highContrast: false, cameraPreference: "environment" }
};

const LEGACY_SEEDED_WEEKLY_XP = [80, 140, 220, 180, 310, 120, 0];

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return normalizeState(deepMerge(defaults, parsed));
  } catch (error) {
    console.warn("[PitchIQ storage] Corrupt localStorage recovered", error);
    localStorage.removeItem(KEY);
    return normalizeState(structuredCloneSafe(defaults));
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(normalizeState(state)));
  } catch (error) {
    console.warn("[PitchIQ storage] Save failed", error);
  }
}

export function resetState() {
  localStorage.removeItem(KEY);
}

export function normalizeState(input) {
  const state = input && typeof input === "object" ? input : {};
  state.profile ||= {};
  state.profile.name ||= "";
  state.profile.number ||= localStorage.getItem("pitchiqJerseyNumber") || "1";
  state.profile.position ||= "Winger";
  state.profile.style ||= localStorage.getItem("pitchiqPlayerStyle") || "Creator";
  state.profile.avatar ||= localStorage.getItem("pitchiqPlayerAvatar") || "default";
  state.profile.goal ||= "React faster";
  state.profile.createdAt ??= null;

  state.game ||= {};
  state.game.xp ??= 0;
  state.game.level ??= 1;
  state.game.streak ??= 1;
  state.game.coins ??= 0;
  state.game.dailyDone ??= false;
  state.game.packOpened ??= false;
  state.game.unlocked = Array.isArray(state.game.unlocked) ? state.game.unlocked : [];
  state.game.lastXp ??= 0;
  state.game.bestCombo ??= 0;
  state.game.trainingSeconds ??= 0;
  state.game.lastResult = state.game.lastResult && typeof state.game.lastResult === "object" ? state.game.lastResult : null;

  state.analytics ||= {};
  state.analytics.sessions = Array.isArray(state.analytics.sessions) ? state.analytics.sessions : [];
  state.analytics.bestReaction ??= null;
  state.analytics.reactionHistory = Array.isArray(state.analytics.reactionHistory) ? state.analytics.reactionHistory : [];
  state.analytics.weeklyXp = Array.isArray(state.analytics.weeklyXp) && state.analytics.weeklyXp.length
    ? state.analytics.weeklyXp
    : [0, 0, 0, 0, 0, 0, 0];
  if (LEGACY_SEEDED_WEEKLY_XP.every((xp, index) => state.analytics.weeklyXp[index] === xp)) {
    state.analytics.weeklyXp = [0, 0, 0, 0, 0, 0, 0];
  }

  state.settings ||= {};
  state.settings.sound ??= true;
  state.settings.haptics ??= true;
  state.settings.reduceMotion ??= false;
  state.settings.highContrast ??= false;
  state.settings.cameraPreference ||= "environment";

  return state;
}

function structuredCloneSafe(value) {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

function deepMerge(base, override) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  if (!override || typeof override !== "object") return out;
  for (const key of Object.keys(override)) {
    const baseValue = base ? base[key] : undefined;
    const overrideValue = override[key];
    out[key] = overrideValue && typeof overrideValue === "object" && !Array.isArray(overrideValue)
      ? deepMerge(baseValue || {}, overrideValue)
      : overrideValue;
  }
  return out;
}
