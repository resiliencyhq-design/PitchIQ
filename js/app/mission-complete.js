import { MISSION_LIFECYCLE } from "../../src/missions/mission-contract.js";
import { readCurrentMission, transitionMission } from "../../src/missions/mission-store.js";

const STYLE_ID = "pitchiq-mission-complete-css";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/mission-complete-pr5.css?v=mission-pr5-complete-20260724";
  document.head.appendChild(link);
}

export function completeCurrentMission(completion = {}, storage = globalThis.localStorage) {
  const mission = readCurrentMission(storage);
  if (!mission) throw new Error("No current mission is available to complete");
  if (mission.lifecycle === MISSION_LIFECYCLE.COMPLETED) return mission;
  if (mission.lifecycle !== MISSION_LIFECYCLE.RESULTS_READY) return mission;

  return transitionMission(MISSION_LIFECYCLE.COMPLETED, {
    metadata: {
      completedAt: Date.now(),
      completionRoute: "mission-complete",
      completionSummary: completion.summary || mission.metadata?.resultSummary || null,
      completionResultId: completion.resultId || mission.metadata?.resultId || null,
    },
  }, storage);
}

export function renderMissionComplete(mission) {
  const xp = mission.reward?.xp || 0;
  const reward = mission.reward?.label || "Mission progress";
  const objectives = (mission.objectives || []).map((objective, index) => `<li><span>✓</span><div><b>${escapeHtml(objective.label)}</b><small>${escapeHtml(objective.target)} ${escapeHtml(objective.unit)}</small></div></li>`).join("");
  const summary = mission.metadata?.completionSummary || mission.metadata?.resultSummary || "Mission objectives completed.";

  return `<section class="screen app mission-complete-screen active" id="mission-complete" data-mission-id="${escapeHtml(mission.id)}" data-mission-lifecycle="${escapeHtml(mission.lifecycle)}">
    <div class="mission-complete-wrap">
      <div class="mission-complete-badge" aria-hidden="true">✓</div>
      <span class="mission-complete-kicker">MISSION COMPLETE</span>
      <h1>${escapeHtml(mission.title)}</h1>
      <p>${escapeHtml(summary)}</p>
      <article class="mission-complete-reward"><span>XP EARNED</span><b>+${xp} XP</b><small>${escapeHtml(reward)}</small></article>
      <article class="mission-complete-objectives"><span>OBJECTIVES</span><ol>${objectives}</ol></article>
      <button type="button" class="primary mega mission-complete-home" data-mission-complete-home>RETURN HOME →</button>
    </div>
  </section>`;
}

function routeViaNav(route) {
  const button = document.querySelector(`#nav [data-route="${route}"]`);
  if (button) button.click();
}

function openMissionComplete() {
  const mission = completeCurrentMission();
  if (!mission || mission.lifecycle !== MISSION_LIFECYCLE.COMPLETED) return false;
  ensureStyle();
  const app = document.getElementById("app");
  if (!app) return false;
  app.innerHTML = renderMissionComplete(mission);
  document.getElementById("nav")?.classList.remove("visible");
  return true;
}

function syncResultsScreen(root = document) {
  const screen = root.querySelector?.("#results.screen.active, #results.active");
  if (!screen || screen.dataset.missionCompleteBound === "true") return false;

  const mission = readCurrentMission();
  if (!mission || mission.lifecycle !== MISSION_LIFECYCLE.RESULTS_READY) return false;

  const existing = screen.querySelector?.("[data-mission-complete-open]");
  if (existing) {
    screen.dataset.missionCompleteBound = "true";
    return true;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "primary mega mission-complete-open";
  button.dataset.missionCompleteOpen = "true";
  button.textContent = "COMPLETE MISSION →";
  screen.appendChild(button);
  screen.dataset.missionCompleteBound = "true";
  return true;
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const open = event.target.closest?.("[data-mission-complete-open]");
    if (open) {
      event.preventDefault();
      openMissionComplete();
      return;
    }

    const home = event.target.closest?.("[data-mission-complete-home]");
    if (home) {
      event.preventDefault();
      routeViaNav("home");
    }
  }, true);

  const observer = new MutationObserver(() => syncResultsScreen());
  const start = () => {
    syncResultsScreen();
    observer.observe(document.getElementById("app") || document.body, {
      childList: true,
      subtree: true,
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
}
