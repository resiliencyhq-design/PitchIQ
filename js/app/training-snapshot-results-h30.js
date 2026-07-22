import { loadState, normalizeState } from "../services/storage.js";
import { xpNeed } from "../game/progression.js";

const RESULTS_SELECTOR = "#results";
const WRAP_SELECTOR = ".results-v2-wrap";
const SNAPSHOT_CLASS = "results-training-snapshot";

function completedTrainingSeconds(state) {
  return (state.analytics?.sessions || []).reduce(
    (total, session) => total + (session.durationSeconds || 45),
    0,
  );
}

function trainingStats(state) {
  const sessions = state.analytics?.sessions || [];
  const attempts = sessions.reduce(
    (total, session) => total + (Array.isArray(session.results) ? session.results.length : 0),
    0,
  );
  const correct = sessions.reduce(
    (total, session) => total + (Array.isArray(session.results)
      ? session.results.filter(result => result.correct).length
      : 0),
    0,
  );
  const savedResult = state.game?.lastResult;
  const accuracy = attempts
    ? Math.round((correct / attempts) * 100)
    : (savedResult?.attempts ? savedResult.accuracy : null);
  const seconds = Math.max(state.game?.trainingSeconds || 0, completedTrainingSeconds(state));

  return {
    reps: sessions.length,
    timeMinutes: Math.floor(seconds / 60),
    bestCombo: state.game?.bestCombo || 0,
    accuracy,
    xp: state.game?.xp || 0,
    level: state.game?.level || 1,
  };
}

function metric(label, value, icon) {
  return `<div class="performance-snapshot-metric"><span aria-hidden="true">${icon}</span><small>${label}</small><b>${value}</b></div>`;
}

function snapshotMarkup(state) {
  const stats = trainingStats(state);
  const need = xpNeed(stats.level);
  const progress = Math.min(100, Math.round((stats.xp / Math.max(1, need)) * 100));
  const accuracy = Number.isFinite(stats.accuracy) ? `${stats.accuracy}%` : "--";

  return `<article class="${SNAPSHOT_CLASS}" data-performance-snapshot="results" aria-label="Training performance snapshot">
    <header class="performance-snapshot-header"><span>Training Snapshot</span><div class="performance-snapshot-hero"><strong>${accuracy}</strong><small>Accuracy</small></div></header>
    <div class="performance-snapshot-grid">
      ${metric("Reps", stats.reps, "↗")}
      ${metric("Time", `${stats.timeMinutes}m`, "◷")}
      ${metric("Combo", stats.bestCombo, "⌁")}
      ${metric("XP Earned", stats.xp, "XP")}
      ${metric("PitchIQ Level", stats.level, "▮")}
      ${metric("Weekly Trend", "Building", "▲")}
    </div>
    <footer class="performance-snapshot-progress"><span>XP Progress</span><div class="xpbar"><i style="width:${progress}%"></i></div><b>${stats.xp} / ${need} XP</b></footer>
  </article>`;
}

export function applyResultsTrainingSnapshot(root = document) {
  const results = root.querySelector?.(RESULTS_SELECTOR);
  const wrap = results?.querySelector?.(WRAP_SELECTOR);
  if (!results || !wrap) return false;

  const existing = wrap.querySelector(`.${SNAPSHOT_CLASS}`);
  const state = normalizeState(loadState());
  const markup = snapshotMarkup(state);

  if (existing) {
    existing.outerHTML = markup;
  } else {
    const hero = wrap.querySelector(".results-v2-hero");
    hero ? hero.insertAdjacentHTML("afterend", markup) : wrap.insertAdjacentHTML("afterbegin", markup);
  }

  results.dataset.trainingSnapshot = "h30-results";
  return true;
}

function refreshResultsSnapshot() {
  applyResultsTrainingSnapshot(document);
}

if (typeof document !== "undefined") {
  const app = document.getElementById("app");
  if (app) {
    new MutationObserver(() => queueMicrotask(refreshResultsSnapshot)).observe(app, {
      childList: true,
      subtree: false,
    });
  }
  window.addEventListener("pageshow", refreshResultsSnapshot);
  refreshResultsSnapshot();
}
