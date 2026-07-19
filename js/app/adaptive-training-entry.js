const ADAPTIVE_SELECTION_KEY = "pitchiqAdaptiveTrainingSelection";
const ADAPTIVE_HISTORY_KEY = "pitchiqAdaptiveMissionHistory";
const MAX_HISTORY = 12;

const DRILL_LABELS = Object.freeze({
  scanning: "Scanning",
  vision: "Vision",
  decision: "Decision",
  reaction: "Reaction",
  dual: "Dual Task",
  position: "Positioning",
});

let requestToken = 0;

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function playerProfile() {
  const intelligence = readJson("pitchiqFootballIQProfile", {});
  return {
    sourceAssessmentId: intelligence.sourceAssessmentId || null,
    priorities: Array.isArray(intelligence.priorities) ? intelligence.priorities : [],
    recentMissionIds: readJson(ADAPTIVE_HISTORY_KEY, []),
  };
}

function saveSelection(selection) {
  try {
    sessionStorage.setItem(ADAPTIVE_SELECTION_KEY, JSON.stringify(selection));
    const history = readJson(ADAPTIVE_HISTORY_KEY, []);
    const nextHistory = [...history, selection.mission.id].slice(-MAX_HISTORY);
    localStorage.setItem(ADAPTIVE_HISTORY_KEY, JSON.stringify(nextHistory));
  } catch (error) {
    console.warn("[PitchIQ adaptive training] Could not persist selection", error);
  }
}

function fallbackSelection() {
  return {
    mode: "fallback",
    sourceConstructId: "awareness",
    mission: {
      id: "fallback-scan-first",
      drillId: "scanning",
      title: "Scan First",
      description: "Check your surroundings before the next action.",
    },
    reason: "Default scanning mission used because adaptive selection was unavailable.",
  };
}

function waitForTrainingHome(token, attempts = 20) {
  if (token !== requestToken) return Promise.resolve(null);
  const screen = document.querySelector("#training.training-reactive");
  if (screen) return Promise.resolve(screen);
  if (attempts <= 0) return Promise.resolve(null);
  return new Promise((resolve) => {
    setTimeout(() => resolve(waitForTrainingHome(token, attempts - 1)), 50);
  });
}

export function applyAdaptiveMissionToTrainingScreen(screen, selection) {
  if (!screen || !selection?.mission) return false;
  const mission = selection.mission;
  const focus = DRILL_LABELS[mission.drillId] || "Football IQ";
  const topLabel = screen.querySelector(".reactive-top span");
  const phase = screen.querySelector(".reactive-phase");
  const cue = screen.querySelector(".reactive-cue");
  const feedback = screen.querySelector(".reactive-feedback");
  const start = screen.querySelector('[data-action="start-mission-training"]');

  screen.dataset.adaptiveMissionId = mission.id;
  screen.dataset.adaptiveMode = selection.mode || "balanced_evidence_building";
  if (topLabel) topLabel.textContent = `${focus} mission`;
  if (phase) phase.textContent = selection.mode === "personalised" ? "Your priority" : "Today's focus";
  if (cue) cue.textContent = mission.title.toUpperCase();
  if (feedback) feedback.textContent = mission.description;
  if (start) {
    start.setAttribute("aria-label", `Enter ${mission.title} live rep`);
    start.textContent = "ENTER LIVE REP →";
  }
  return true;
}

export async function selectAdaptiveMission() {
  try {
    const { AdaptiveTrainingEngine } = await import("../../src/training/adaptive-training-engine.js");
    return AdaptiveTrainingEngine.selectMission(playerProfile());
  } catch (error) {
    console.warn("[PitchIQ adaptive training] Falling back to Scan First", error);
    return fallbackSelection();
  }
}

async function activateForTrainingRoute() {
  const token = ++requestToken;
  const screenPromise = waitForTrainingHome(token);
  const selection = await selectAdaptiveMission();
  if (token !== requestToken) return;
  saveSelection(selection);
  const screen = await screenPromise;
  if (token !== requestToken || !screen) return;
  applyAdaptiveMissionToTrainingScreen(screen, selection);
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest?.('[data-route="training"]');
  if (routeButton) activateForTrainingRoute();
}, true);

window.addEventListener("hashchange", () => {
  if (location.hash.toLowerCase() === "#training") activateForTrainingRoute();
});
