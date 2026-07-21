import { readSelection } from "./mission-runtime-integration.js?v=sprint-h8-adaptive-mission-hub-20260721";
import { primaryFootballIqRecommendation } from "./football-iq-recommendations-w1-5.js?v=sprint-h8-adaptive-mission-hub-20260721";
import { FOOTBALL_IQ_CATEGORY_LABELS } from "../data/football-iq-missions.js?v=sprint-h8-adaptive-mission-hub-20260721";
import { getFootballIqProgress } from "./football-iq-progression-w1-4.js?v=sprint-h8-adaptive-mission-hub-20260721";

const HOME_SELECTOR = "#home";
const CARD_SELECTOR = ".home-mock-mission";
const STYLE_ID = "pitchiq-home-adaptive-mission-h8-css";
const STYLE_HREF = "css/home-adaptive-mission-h8.css?v=sprint-h8-adaptive-mission-hub-20260721";
const FALLBACK_MISSION = Object.freeze({
  id: "technical-foundation",
  title: "Build your technical foundation",
  world: "Technical Training",
  focus: "Touch, control and confident repetition",
  minutes: 8,
  xp: 20,
  route: "training",
  source: "fallback",
});

function ensureStylesheet() {
  let link = document.getElementById(STYLE_ID);
  if (!link) {
    link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.getAttribute("href") !== STYLE_HREF) link.setAttribute("href", STYLE_HREF);
}

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isComplete(selection) {
  const state = text(selection?.status || selection?.state || selection?.mission?.status).toLowerCase();
  return selection?.completed === true || selection?.mission?.completed === true || ["complete", "completed", "done"].includes(state);
}

function activeMission(selection = readSelection()) {
  if (!selection?.mission?.id || isComplete(selection)) return null;
  const mission = selection.mission;
  const world = text(mission.world || mission.domain || mission.categoryLabel, "Today's Training");
  return {
    id: mission.id,
    title: text(mission.title || mission.name, "Continue your mission"),
    world,
    focus: text(mission.coachingFocus || mission.focus || mission.description || selection.reason, "Continue building the habit from your current mission."),
    minutes: number(mission.minutes || mission.durationMinutes || selection.minutes, 8),
    xp: number(mission.xp || mission.xpReward || selection.xp, 20),
    route: "training",
    source: "active",
    progress: number(selection.progress || mission.progress, 0),
  };
}

function recommendedFootballIqMission() {
  try {
    const mission = primaryFootballIqRecommendation();
    if (!mission?.id) return null;
    const progress = getFootballIqProgress();
    const saved = progress?.missions?.[mission.id] || {};
    return {
      id: mission.id,
      title: text(mission.title, "Football IQ mission"),
      world: `Football IQ · ${FOOTBALL_IQ_CATEGORY_LABELS[mission.category] || "Development"}`,
      focus: text(mission.recommendationReason || mission.description, "Train the next Football IQ habit recommended for you."),
      minutes: number(mission.minutes, 8),
      xp: number(mission.xp, 20),
      route: "football-iq",
      source: "recommended",
      best: number(saved.personalBest, 0),
      completed: Boolean(saved.completed),
    };
  } catch (error) {
    console.warn("[PitchIQ H8] Football IQ recommendation unavailable", error);
    return null;
  }
}

export function resolveHomeMission() {
  return activeMission() || recommendedFootballIqMission() || FALLBACK_MISSION;
}

function statusCopy(mission) {
  if (mission.source === "active") return mission.progress > 0 ? `${Math.min(100, mission.progress)}% in progress` : "Mission in progress";
  if (mission.best > 0) return `Personal best ${mission.best}%`;
  if (mission.completed) return "Ready to improve";
  return mission.source === "recommended" ? "Recommended for you" : "Ready to begin";
}

function actionMarkup(mission) {
  if (mission.route === "football-iq") {
    return `<button type="button" class="home-adaptive-mission-action" data-h8-open-football-iq="${mission.id}">Start Mission <span aria-hidden="true">→</span></button>`;
  }
  const label = mission.source === "active" ? "Continue Mission" : "Start Mission";
  return `<button type="button" class="home-adaptive-mission-action" data-route="training" data-action="start-mission-training">${label} <span aria-hidden="true">→</span></button>`;
}

function missionMarkup(mission) {
  const progress = mission.source === "active" && mission.progress > 0
    ? `<div class="home-adaptive-mission-progress" aria-label="Mission progress"><i style="width:${Math.min(100, mission.progress)}%"></i></div>`
    : "";
  return `<div class="home-adaptive-mission-heading"><div><span>Today's Mission</span><small>${mission.world}</small></div><b>${statusCopy(mission)}</b></div>
    <h2>${mission.title}</h2>
    <p>${mission.focus}</p>
    <div class="home-adaptive-mission-meta"><span>${mission.minutes} min</span><span>${mission.xp} XP</span><span>${mission.source === "active" ? "Resume" : mission.source === "recommended" ? "Adaptive" : "Foundation"}</span></div>
    ${progress}
    ${actionMarkup(mission)}`;
}

export function applyHomeAdaptiveMission(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const card = home?.querySelector?.(CARD_SELECTOR);
  if (!home || !card) return false;

  ensureStylesheet();
  const mission = resolveHomeMission();
  const signature = JSON.stringify([mission.id, mission.source, mission.progress || 0, mission.best || 0, mission.title, mission.focus]);
  if (card.dataset.h8MissionSignature === signature) return true;

  card.dataset.h8MissionSignature = signature;
  card.dataset.h8MissionSource = mission.source;
  card.dataset.h8MissionId = mission.id;
  card.classList.add("home-adaptive-mission-h8");
  card.setAttribute("aria-label", `Today's Mission: ${mission.title}`);
  card.innerHTML = missionMarkup(mission);
  home.dataset.adaptiveMissionHub = "h8";
  return true;
}

function openFootballIqMission(id) {
  if (!id) return;
  window.location.hash = `football-iq-mission/${encodeURIComponent(id)}`;
}

function refresh() {
  applyHomeAdaptiveMission(document);
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const button = event.target.closest?.("[data-h8-open-football-iq]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openFootballIqMission(button.dataset.h8OpenFootballIq);
  }, true);

  const app = document.getElementById("app");
  if (app) new MutationObserver(() => queueMicrotask(refresh)).observe(app, { childList: true, subtree: false });
  ["pageshow", "pitchiq:football-iq-progress", "pitchiq:assessment-readiness", "pitchiq:mission-complete"].forEach(name => window.addEventListener(name, refresh));
  window.addEventListener("storage", event => {
    if (["pitchiq.adaptiveTraining.current.v1", "pitchiq.adaptiveMission.v1"].includes(event.key)) refresh();
  });
  refresh();
}

export { FALLBACK_MISSION };
