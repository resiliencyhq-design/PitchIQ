import { MISSION_LIFECYCLE } from "../../src/missions/mission-contract.js";
import { readCurrentMission, transitionMission } from "../../src/missions/mission-store.js";

const STYLE_ID = "pitchiq-mission-brief-css";

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
  link.href = "css/mission-brief-pr3.css?v=mission-pr3-universal-brief-20260724";
  document.head.appendChild(link);
}

export function prepareMissionBrief(storage = globalThis.localStorage) {
  const mission = readCurrentMission(storage);
  if (!mission) throw new Error("No current mission is available for briefing");
  if (mission.lifecycle === MISSION_LIFECYCLE.ASSIGNED) {
    return transitionMission(MISSION_LIFECYCLE.BRIEFED, {}, storage);
  }
  return mission;
}

export function beginBriefedMission(storage = globalThis.localStorage) {
  const mission = readCurrentMission(storage);
  if (!mission) throw new Error("No current mission is available to begin");
  if ([MISSION_LIFECYCLE.ASSIGNED, MISSION_LIFECYCLE.BRIEFED].includes(mission.lifecycle)) {
    return transitionMission(MISSION_LIFECYCLE.ACTIVE, {}, storage);
  }
  return mission;
}

export function renderMissionBrief(mission) {
  const objectives = mission.objectives.map((objective, index) => `<li><span>${index + 1}</span><div><b>${escapeHtml(objective.label)}</b><small>Target: ${escapeHtml(objective.target)} ${escapeHtml(objective.unit)}</small></div></li>`).join("");
  const reward = mission.reward?.label || (mission.reward?.xp ? `${mission.reward.xp} XP` : "Mission progress");
  return `<section class="screen app mission-brief-screen active" id="mission-brief" data-mission-id="${escapeHtml(mission.id)}" data-mission-lifecycle="${escapeHtml(mission.lifecycle)}">
    <div class="mission-brief-wrap">
      <header class="mission-brief-top"><button type="button" data-mission-brief-back aria-label="Back to Home">←</button><span>MISSION BRIEF</span><i aria-hidden="true"></i></header>
      <article class="mission-brief-hero">
        <span>${escapeHtml(mission.category)}</span>
        <h1>${escapeHtml(mission.title)}</h1>
        <p>${escapeHtml(mission.purpose || "Complete the mission objectives and build your game intelligence.")}</p>
      </article>
      <article class="mission-brief-card"><span>YOUR OBJECTIVES</span><ol>${objectives}</ol></article>
      <article class="mission-brief-reward"><div><span>MISSION REWARD</span><b>${escapeHtml(reward)}</b><small>${mission.reward?.xp || 0} XP available</small></div>${mission.artwork ? `<img src="${escapeHtml(mission.artwork)}" alt="">` : ""}</article>
      <button type="button" class="primary mega mission-brief-start" data-mission-brief-start>START MISSION →</button>
    </div>
  </section>`;
}

function routeViaNav(route) {
  const button = document.querySelector(`#nav [data-route="${route}"]`);
  if (button) button.click();
}

function openMissionBrief() {
  const mission = prepareMissionBrief();
  ensureStyle();
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = renderMissionBrief(mission);
  document.getElementById("nav")?.classList.remove("visible");
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const entry = event.target.closest?.("[data-mission-entry='current']");
    if (entry) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openMissionBrief();
      return;
    }

    const back = event.target.closest?.("[data-mission-brief-back]");
    if (back) {
      event.preventDefault();
      routeViaNav("home");
      return;
    }

    const start = event.target.closest?.("[data-mission-brief-start]");
    if (start) {
      event.preventDefault();
      beginBriefedMission();
      routeViaNav("training");
    }
  }, true);
}
