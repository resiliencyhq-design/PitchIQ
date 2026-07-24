import { resolveHomeMission } from "./home-mission-tile.js?v=hotfix-mission-card-pwa-entry-20260724";
import { prepareMissionBrief, renderMissionBrief } from "./mission-brief.js?v=hotfix-mission-card-pwa-entry-20260724";

const STYLE_ID = "pitchiq-mission-brief-css";

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/mission-brief-pr3.css?v=hotfix-mission-card-pwa-entry-20260724";
  document.head.appendChild(link);
}

function currentLevel() {
  try {
    const raw = JSON.parse(localStorage.getItem("pitchiqState") || localStorage.getItem("pitchiq_state") || "null");
    return Number(raw?.game?.level) || 1;
  } catch {
    return 1;
  }
}

function openMissionBrief() {
  resolveHomeMission({ game: { level: currentLevel() } });
  const mission = prepareMissionBrief();
  const app = document.getElementById("app");
  if (!app) return false;
  ensureStyle();
  app.innerHTML = renderMissionBrief(mission);
  document.getElementById("nav")?.classList.remove("visible");
  return true;
}

function markMissionCard(root = document) {
  const card = root.querySelector?.(".home-mock-mission");
  if (!card) return false;
  card.dataset.missionEntry = "current";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", "Open today's mission");
  return true;
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const card = event.target.closest?.(".home-mock-mission");
    if (!card) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openMissionBrief();
  }, true);

  document.addEventListener("keydown", event => {
    if (!["Enter", " "].includes(event.key)) return;
    const card = event.target.closest?.(".home-mock-mission");
    if (!card) return;
    event.preventDefault();
    openMissionBrief();
  }, true);

  const observer = new MutationObserver(() => markMissionCard());
  const start = () => {
    markMissionCard();
    observer.observe(document.getElementById("app") || document.body, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
}
