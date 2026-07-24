import { StateStore } from "./state-store.js";

const KEY = "pitchiq_integrated_v1";

const DEFAULT_NOTIFICATION_PREFERENCES = {
  trainingEnabled: false,
  trainingTime: "18:00",
  trainingDays: [1, 2, 3, 4, 5],
  rewardAlerts: true,
  levelUpAlerts: true,
  streakAlerts: true,
  permissionStatus: "default",
};

const defaults = {
  profile: { name: "", number: "1", position: "Winger", style: "Creator", avatar: "default", goal: "React faster", createdAt: null },
  firstRun: { version: 1, status: "not_started", currentStep: "landing", completedSteps: [], completedAt: null },
  game: { xp: 0, level: 1, streak: 1, coins: 0, dailyDone: false, packOpened: false, unlocked: [], lastXp: 0, bestCombo: 0, trainingSeconds: 0, lastResult: null },
  analytics: { sessions: [], bestReaction: null, reactionHistory: [], weeklyXp: [0, 0, 0, 0, 0, 0, 0] },
  settings: { sound: true, haptics: true, reduceMotion: false, highContrast: false, cameraPreference: "environment" },
  notifications: {
    preferences: DEFAULT_NOTIFICATION_PREFERENCES,
    items: [],
    rewardSnapshot: { level: 1, unlocked: [] },
    trainingSnapshot: { sessionIds: [], bestAccuracy: 0, bestCombo: 0, bestScore: 0, weeklyXpMilestones: [] },
  },
};

const LEGACY_SEEDED_WEEKLY_XP = [80, 140, 220, 180, 310, 120, 0];

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

  state.firstRun ||= {};
  state.firstRun.version = 1;
  state.firstRun.status ||= "not_started";
  state.firstRun.currentStep ||= "landing";
  state.firstRun.completedSteps = Array.isArray(state.firstRun.completedSteps) ? state.firstRun.completedSteps : [];
  state.firstRun.completedAt ??= null;

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

  state.notifications ||= {};
  state.notifications.preferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(state.notifications.preferences && typeof state.notifications.preferences === "object" ? state.notifications.preferences : {}),
  };
  state.notifications.preferences.trainingDays = Array.isArray(state.notifications.preferences.trainingDays)
    ? state.notifications.preferences.trainingDays
    : [...DEFAULT_NOTIFICATION_PREFERENCES.trainingDays];
  state.notifications.items = Array.isArray(state.notifications.items) ? state.notifications.items : [];
  state.notifications.rewardSnapshot = state.notifications.rewardSnapshot && typeof state.notifications.rewardSnapshot === "object"
    ? state.notifications.rewardSnapshot
    : { level: 1, unlocked: [] };
  state.notifications.rewardSnapshot.unlocked = Array.isArray(state.notifications.rewardSnapshot.unlocked)
    ? state.notifications.rewardSnapshot.unlocked
    : [];
  state.notifications.trainingSnapshot = state.notifications.trainingSnapshot && typeof state.notifications.trainingSnapshot === "object"
    ? state.notifications.trainingSnapshot
    : { sessionIds: [], bestAccuracy: 0, bestCombo: 0, bestScore: 0, weeklyXpMilestones: [] };
  state.notifications.trainingSnapshot.sessionIds = Array.isArray(state.notifications.trainingSnapshot.sessionIds)
    ? state.notifications.trainingSnapshot.sessionIds
    : [];
  state.notifications.trainingSnapshot.weeklyXpMilestones = Array.isArray(state.notifications.trainingSnapshot.weeklyXpMilestones)
    ? state.notifications.trainingSnapshot.weeklyXpMilestones
    : [];

  return state;
}

const stateStore = new StateStore({
  key: KEY,
  version: 1,
  defaults,
  normalize: normalizeState,
});

export function loadState() {
  return stateStore.load();
}

export function saveState(state) {
  stateStore.replace(state, { source: "storage-compat-save" });
}

export function resetState() {
  stateStore.reset({ source: "storage-compat-reset" });
}

export { stateStore };