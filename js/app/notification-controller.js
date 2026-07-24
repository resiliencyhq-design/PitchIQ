const PREFERENCES_KEY = "pitchiqNotificationPreferences";
const NOTIFICATIONS_KEY = "pitchiqNotifications";
const REWARD_SNAPSHOT_KEY = "pitchiqRewardNotificationSnapshot";
const TRAINING_SNAPSHOT_KEY = "pitchiqTrainingNotificationSnapshot";

const DEFAULT_PREFERENCES = Object.freeze({
  trainingEnabled: false,
  trainingTime: "18:00",
  trainingDays: [1, 2, 3, 4, 5],
  rewardAlerts: true,
  levelUpAlerts: true,
  streakAlerts: true,
  permissionStatus: "default",
});

function safeParse(value, fallback) {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function readPreferences() {
  const saved = safeParse(localStorage.getItem(PREFERENCES_KEY), {});
  return { ...DEFAULT_PREFERENCES, ...saved };
}

function writePreferences(preferences) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

function readNotifications() {
  const saved = safeParse(localStorage.getItem(NOTIFICATIONS_KEY), []);
  return Array.isArray(saved) ? saved : [];
}

function writeNotifications(notifications) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function dayButton(day, label, selectedDays) {
  const selected = selectedDays.includes(day);
  return `<button type="button" class="notification-day${selected ? " is-selected" : ""}" data-notification-day="${day}" aria-pressed="${selected}">${label}</button>`;
}

function relativeTime(createdAt) {
  const timestamp = Number(createdAt);
  if (!Number.isFinite(timestamp)) return "";
  const delta = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function notificationIcon(type) {
  if (type === "reward") return "🎁";
  if (type === "level") return "🏆";
  if (type === "streak") return "🔥";
  if (type === "training") return "⚽";
  if (type === "personal-best") return "🎯";
  if (type === "weekly") return "📈";
  if (type === "mindiq") return "🧠";
  if (type === "coach") return "👤";
  if (type === "mission") return "📋";
  if (type === "achievement") return "🏅";
  return "📣";
}

function notificationItem(item) {
  const time = relativeTime(item.createdAt);
  return `<button type="button" class="notification-item${item.read ? "" : " is-unread"}" data-notification-id="${escapeHtml(item.id)}" data-notification-action="${escapeHtml(item.action || "")}"><span>${notificationIcon(item.type)}</span><span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.body || "")}</small>${time ? `<em>${escapeHtml(time)}</em>` : ""}</span></button>`;
}

function formatTime(value = "18:00") {
  const [hourValue, minute = "00"] = String(value).split(":");
  const hour = Number(hourValue);
  if (!Number.isFinite(hour)) return value;
  const suffix = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute}${suffix}`;
}

function finiteNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
}

export class NotificationController {
  constructor({ getState, goto, onChange } = {}) {
    this.getState = getState || (() => ({}));
    this.goto = goto || (() => {});
    this.onChange = onChange || (() => {});
    this.preferences = readPreferences();
    this.notifications = readNotifications();
    this.open = false;
    this.dirty = false;
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleDocumentChange = this.handleDocumentChange.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleTrainingComplete = this.handleTrainingComplete.bind(this);
    document.addEventListener("click", this.handleDocumentClick);
    document.addEventListener("change", this.handleDocumentChange);
    document.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("pitchiq:training-complete", this.handleTrainingComplete);
  }

  getBellState() {
    const unread = this.notifications.filter((item) => !item.read);
    if (unread.some((item) => item.type === "reward")) return "reward";
    if (unread.some((item) => item.type === "streak")) return "streak";
    return unread.length ? "unread" : "default";
  }

  getUnreadCount() {
    return this.notifications.filter((item) => !item.read).length;
  }

  getViewModel() {
    return { bellState: this.getBellState(), unreadCount: this.getUnreadCount(), isOpen: this.open };
  }

  createNotification({ id, type = "system", title, body = "", action = "", createdAt = Date.now() }) {
    if (!id || this.notifications.some((item) => item.id === id)) return false;
    this.notifications.unshift({ id, type, title, body, action, createdAt, read: false });
    this.notifications = this.notifications.slice(0, 40);
    writeNotifications(this.notifications);
    this.onChange();
    return true;
  }

  syncProgression() {
    const state = this.getState() || {};
    const level = Number(state.game?.level || 1);
    const unlocked = Array.isArray(state.game?.unlocked) ? state.game.unlocked : [];
    const snapshot = safeParse(localStorage.getItem(REWARD_SNAPSHOT_KEY), { level, unlocked: [] });
    if (this.preferences.levelUpAlerts && level > Number(snapshot.level || 1)) {
      this.createNotification({ id: `level-${level}`, type: "level", title: `Level ${level} reached`, body: "Your player level has increased.", action: "open-player" });
    }
    if (this.preferences.rewardAlerts) {
      unlocked.filter((rewardId) => !snapshot.unlocked.includes(rewardId)).forEach((rewardId) => {
        this.createNotification({ id: `reward-${rewardId}`, type: "reward", title: "New reward unlocked", body: "A new reward is waiting for you.", action: "open-rewards" });
      });
    }
    localStorage.setItem(REWARD_SNAPSHOT_KEY, JSON.stringify({ level, unlocked }));
  }

  handleTrainingComplete(event) {
    const detail = event.detail || {};
    const summary = detail.summary || {};
    const session = detail.session || {};
    const sessionId = String(session.id || summary.endedAt || "");
    if (!sessionId) return;

    const snapshot = safeParse(localStorage.getItem(TRAINING_SNAPSHOT_KEY), { sessionIds: [], bestAccuracy: 0, bestCombo: 0, bestScore: 0, weeklyXpMilestones: [] });
    const sessionIds = Array.isArray(snapshot.sessionIds) ? snapshot.sessionIds.map(String) : [];
    if (sessionIds.includes(sessionId) || this.notifications.some((item) => item.id === `training-${sessionId}`)) return;

    const results = Array.isArray(session.results) ? session.results : [];
    const correct = results.filter((result) => result?.correct).length;
    const derivedAccuracy = results.length ? Math.round((correct / results.length) * 100) : 0;
    const derivedXp = results.reduce((total, result) => total + finiteNumber(result?.xpAwarded), 0);
    const accuracy = finiteNumber(summary.accuracy, derivedAccuracy);
    const combo = finiteNumber(summary.combo, session.combo);
    const score = finiteNumber(summary.score, session.score);
    const xp = finiteNumber(summary.xp, summary.xpEarned, session.xp, derivedXp);
    const title = accuracy >= 80 ? "Strong training rep" : combo >= 5 ? "Combo milestone" : "Training complete";
    const bodyParts = [];
    if (accuracy > 0) bodyParts.push(`${accuracy}% accuracy`);
    if (combo > 0) bodyParts.push(`best combo x${combo}`);
    if (xp > 0) bodyParts.push(`+${xp} XP`);
    if (!bodyParts.length && score > 0) bodyParts.push(`${score} points`);

    const created = this.createNotification({
      id: `training-${sessionId}`,
      type: "training",
      title,
      body: bodyParts.join(" • ") || "Your latest rep is ready to review.",
      action: "open-results",
      createdAt: summary.endedAt || session.endedAt || Date.now(),
    });
    if (!created) return;

    const bestAccuracy = finiteNumber(snapshot.bestAccuracy);
    const bestCombo = finiteNumber(snapshot.bestCombo);
    const bestScore = finiteNumber(snapshot.bestScore);
    if ((accuracy > bestAccuracy && accuracy >= 70) || (combo > bestCombo && combo >= 4) || (score > bestScore && score > 0)) {
      const metric = accuracy > bestAccuracy && accuracy >= 70 ? `${accuracy}% accuracy` : combo > bestCombo && combo >= 4 ? `combo x${combo}` : `${score} points`;
      this.createNotification({ id: `personal-best-${sessionId}`, type: "personal-best", title: "New personal best", body: `${metric} is your new benchmark.`, action: "open-results", createdAt: summary.endedAt || Date.now() });
    }

    const state = this.getState() || {};
    const weeklyXp = Array.isArray(state.analytics?.weeklyXp) ? state.analytics.weeklyXp.reduce((total, value) => total + finiteNumber(value), 0) : 0;
    const milestone = [100, 250, 500, 1000].filter((value) => weeklyXp >= value).at(-1) || 0;
    const milestones = Array.isArray(snapshot.weeklyXpMilestones) ? snapshot.weeklyXpMilestones : [];
    if (milestone && !milestones.includes(milestone)) {
      this.createNotification({ id: `weekly-xp-${milestone}`, type: "weekly", title: `${milestone} weekly XP`, body: "Your training consistency is building momentum.", action: "open-player" });
      milestones.push(milestone);
    }

    localStorage.setItem(TRAINING_SNAPSHOT_KEY, JSON.stringify({
      sessionIds: [sessionId, ...sessionIds].slice(0, 40),
      bestAccuracy: Math.max(bestAccuracy, accuracy),
      bestCombo: Math.max(bestCombo, combo),
      bestScore: Math.max(bestScore, score),
      weeklyXpMilestones: milestones.slice(-8),
    }));
  }

  createStreakReminder({ streak = 0, id = "streak-expiry" } = {}) {
    if (!this.preferences.streakAlerts || streak <= 0) return false;
    return this.createNotification({ id, type: "streak", title: `${streak}-day streak at risk`, body: "Complete a short training rep today to keep it alive.", action: "open-training" });
  }

  createActivityEvent({ id, type = "system", title, body = "", action = "" } = {}) {
    return this.createNotification({ id, type, title, body, action });
  }

  markAllRead() {
    if (!this.notifications.some((item) => !item.read)) return false;
    this.notifications = this.notifications.map((item) => ({ ...item, read: true }));
    writeNotifications(this.notifications);
    this.renderSheet();
    this.onChange();
    return true;
  }

  dismissNotification(id) {
    const next = this.notifications.filter((item) => item.id !== id);
    if (next.length === this.notifications.length) return false;
    this.notifications = next;
    writeNotifications(this.notifications);
    this.renderSheet();
    this.onChange();
    return true;
  }

  markDirty() {
    if (this.dirty) return;
    this.dirty = true;
    const save = document.querySelector("[data-action='save-notifications']");
    if (save) save.disabled = false;
  }

  openCentre() {
    this.open = true;
    this.dirty = false;
    this.renderSheet();
    document.body.classList.add("notification-centre-open");
  }

  closeCentre({ force = false } = {}) {
    if (this.dirty && !force && !window.confirm("Discard notification changes?")) return false;
    const wasOpen = this.open || Boolean(document.getElementById("notificationCentre"));
    this.open = false;
    this.dirty = false;
    document.getElementById("notificationCentre")?.remove();
    document.body.classList.remove("notification-centre-open");
    if (wasOpen) this.onChange();
    return true;
  }

  markRead(id) {
    let changed = false;
    this.notifications = this.notifications.map((item) => {
      if (item.id !== id || item.read) return item;
      changed = true;
      return { ...item, read: true };
    });
    if (changed) writeNotifications(this.notifications);
    return changed;
  }

  savePreferencesFromSheet() {
    const root = document.getElementById("notificationCentre");
    if (!root) return;
    const selectedDays = [...root.querySelectorAll("[data-notification-day].is-selected")].map((button) => Number(button.dataset.notificationDay));
    this.preferences = {
      ...this.preferences,
      trainingEnabled: Boolean(root.querySelector("[name='trainingEnabled']")?.checked),
      trainingTime: root.querySelector("[name='trainingTime']")?.value || "18:00",
      trainingDays: selectedDays,
      rewardAlerts: Boolean(root.querySelector("[name='rewardAlerts']")?.checked),
      levelUpAlerts: Boolean(root.querySelector("[name='levelUpAlerts']")?.checked),
      streakAlerts: Boolean(root.querySelector("[name='streakAlerts']")?.checked),
    };
    writePreferences(this.preferences);
    const message = this.preferences.trainingEnabled ? `Training reminder set for ${formatTime(this.preferences.trainingTime)}` : "Notification preferences saved";
    window.dispatchEvent(new CustomEvent("pitchiq:toast", { detail: { message } }));
    this.dirty = false;
    this.closeCentre({ force: true });
  }

  async requestPermission() {
    if (!("Notification" in window)) return;
    const status = await Notification.requestPermission();
    this.preferences = { ...this.preferences, permissionStatus: status };
    writePreferences(this.preferences);
    this.renderSheet();
  }

  handleDocumentClick(event) {
    const bell = event.target.closest?.("[data-action='open-notifications']");
    if (bell) { event.preventDefault(); event.stopPropagation(); this.openCentre(); return; }
    if (event.target.closest?.("[data-action='close-notifications']")) { event.preventDefault(); this.closeCentre(); return; }
    if (event.target.closest?.("[data-action='save-notifications']")) { event.preventDefault(); this.savePreferencesFromSheet(); return; }
    if (event.target.closest?.("[data-action='request-notification-permission']")) { event.preventDefault(); this.requestPermission(); return; }
    if (event.target.closest?.("[data-action='mark-all-notifications-read']")) { event.preventDefault(); this.markAllRead(); return; }
    const dismiss = event.target.closest?.("[data-action='dismiss-notification']");
    if (dismiss) { event.preventDefault(); event.stopPropagation(); this.dismissNotification(dismiss.dataset.notificationId); return; }
    const day = event.target.closest?.("[data-notification-day]");
    if (day) {
      event.preventDefault();
      day.classList.toggle("is-selected");
      day.setAttribute("aria-pressed", String(day.classList.contains("is-selected")));
      this.markDirty();
      return;
    }
    const item = event.target.closest?.("[data-notification-id]");
    if (item) {
      event.preventDefault();
      this.markRead(item.dataset.notificationId);
      const action = item.dataset.notificationAction;
      this.closeCentre({ force: true });
      if (action === "open-player") this.goto("player");
      if (action === "open-rewards" || action === "open-results") this.goto("results");
      if (action === "open-training") this.goto("training");
    }
  }

  handleDocumentChange(event) {
    if (!event.target.closest?.("#notificationCentre")) return;
    if (event.target.matches?.("[name='trainingEnabled']")) {
      document.getElementById("notificationTrainingControls")?.toggleAttribute("data-disabled", !event.target.checked);
    }
    this.markDirty();
  }

  handleKeydown(event) {
    if (event.key === "Escape" && this.open) this.closeCentre();
  }

  renderSheet() {
    document.getElementById("notificationCentre")?.remove();
    const permissionAvailable = "Notification" in window;
    const permissionStatus = permissionAvailable ? Notification.permission : "unsupported";
    const recent = this.notifications.slice(0, 10);
    const unreadCount = this.getUnreadCount();
    const sheet = document.createElement("div");
    sheet.id = "notificationCentre";
    sheet.className = "notification-centre";
    sheet.innerHTML = `<button class="notification-backdrop" data-action="close-notifications" aria-label="Close notifications"></button><section class="notification-sheet" role="dialog" aria-modal="true" aria-labelledby="notificationCentreTitle" tabindex="-1"><div class="notification-handle" aria-hidden="true"></div><header><div><span>PitchIQ</span><h2 id="notificationCentreTitle">Notifications</h2></div><button type="button" data-action="close-notifications" aria-label="Close">×</button></header><div class="notification-section"><div class="notification-setting-row"><span><b>⚽ Training reminder</b><small>Choose when PitchIQ reminds you to train.</small></span><label class="notification-switch"><input type="checkbox" name="trainingEnabled" ${this.preferences.trainingEnabled ? "checked" : ""}><i></i></label></div><div id="notificationTrainingControls" class="notification-training-controls" ${this.preferences.trainingEnabled ? "" : "data-disabled"}><label>Training time<input type="time" name="trainingTime" value="${escapeHtml(this.preferences.trainingTime)}"></label><div class="notification-days" aria-label="Reminder days">${dayButton(1, "M", this.preferences.trainingDays)}${dayButton(2, "T", this.preferences.trainingDays)}${dayButton(3, "W", this.preferences.trainingDays)}${dayButton(4, "T", this.preferences.trainingDays)}${dayButton(5, "F", this.preferences.trainingDays)}${dayButton(6, "S", this.preferences.trainingDays)}${dayButton(0, "S", this.preferences.trainingDays)}</div></div></div><div class="notification-section notification-toggles"><label><span><b>🎁 Reward unlocks</b><small>Highlight the bell when a reward is ready.</small></span><input type="checkbox" name="rewardAlerts" ${this.preferences.rewardAlerts ? "checked" : ""}></label><label><span><b>🏆 Level ups</b><small>Show XP level milestones.</small></span><input type="checkbox" name="levelUpAlerts" ${this.preferences.levelUpAlerts ? "checked" : ""}></label><label><span><b>🔥 Streak reminder</b><small>Remind me before my streak expires.</small></span><input type="checkbox" name="streakAlerts" ${this.preferences.streakAlerts ? "checked" : ""}></label></div><div class="notification-section"><div class="notification-permission"><span><b>iPhone notifications</b><small>${permissionStatus === "granted" ? "Enabled on this device." : permissionStatus === "denied" ? "Blocked in device settings." : permissionStatus === "unsupported" ? "Not supported in this browser." : "Enable device alerts after installing PitchIQ to the Home Screen."}</small></span>${permissionAvailable && permissionStatus === "default" ? '<button type="button" data-action="request-notification-permission">Enable</button>' : ""}</div></div><div class="notification-section notification-inbox"><div class="notification-inbox-heading"><h3>Recent activity</h3>${unreadCount ? '<button type="button" data-action="mark-all-notifications-read">Mark all read</button>' : ""}</div>${recent.length ? recent.map((item) => `<div class="notification-item-wrap">${notificationItem(item)}<button type="button" class="notification-dismiss" data-action="dismiss-notification" data-notification-id="${escapeHtml(item.id)}" aria-label="Dismiss ${escapeHtml(item.title)}">×</button></div>`).join("") : '<div class="notification-empty">No notifications yet.</div>'}</div><div class="notification-save-dock"><button type="button" class="notification-save" data-action="save-notifications" disabled>Save changes</button></div></section>`;
    document.body.appendChild(sheet);
    sheet.querySelector(".notification-sheet")?.focus?.();
  }

  reset() {
    localStorage.removeItem(PREFERENCES_KEY);
    localStorage.removeItem(NOTIFICATIONS_KEY);
    localStorage.removeItem(REWARD_SNAPSHOT_KEY);
    localStorage.removeItem(TRAINING_SNAPSHOT_KEY);
    this.preferences = readPreferences();
    this.notifications = [];
    this.closeCentre({ force: true });
  }
}
