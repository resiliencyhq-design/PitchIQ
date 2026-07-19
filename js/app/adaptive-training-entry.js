import { getLatestCoachingIntelligence } from "../../src/coaching/coaching-intelligence-storage.js";
import { selectAdaptiveMission } from "../../src/training/adaptive-training.js";
import { getRecentMissionIds, recordAdaptiveMission } from "../../src/training/adaptive-training-storage.js";

let decoratedScreen = null;

function resolveSelection() {
  let coachingIntelligence = null;
  let recentMissionIds = [];
  try {
    coachingIntelligence = getLatestCoachingIntelligence();
    recentMissionIds = getRecentMissionIds();
  } catch {
    // Storage can be unavailable in privacy-restricted contexts. Balanced selection remains safe.
  }
  return selectAdaptiveMission({ coachingIntelligence, recentMissionIds });
}

function decorateTrainingScreen() {
  const screen = document.querySelector("#training.ux-screen.active");
  if (!screen || screen === decoratedScreen) return;

  const hero = screen.querySelector(".ux-hero");
  const title = hero?.querySelector("h1");
  const description = hero?.querySelector("p");
  const start = hero?.querySelector('[data-action="quick-start-training"], [data-select-drill]');
  if (!hero || !title || !description || !start) return;

  const selection = resolveSelection();
  const { mission } = selection;
  decoratedScreen = screen;

  hero.dataset.adaptiveMode = selection.mode;
  hero.dataset.missionId = mission.id;
  title.textContent = mission.title;
  description.textContent = mission.description;

  const kicker = hero.querySelector(".kicker");
  if (kicker) kicker.textContent = "Today's Mission";

  start.removeAttribute("data-action");
  start.dataset.selectDrill = mission.drillId;
  start.dataset.adaptiveMissionId = mission.id;
  start.textContent = "Start Mission";
}

document.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-adaptive-mission-id]");
  if (!button) return;
  try {
    recordAdaptiveMission(button.dataset.adaptiveMissionId);
  } catch {
    // Training remains usable if history cannot be persisted.
  }
}, true);

const observer = new MutationObserver(decorateTrainingScreen);
const app = document.getElementById("app");
if (app) observer.observe(app, { childList: true, subtree: true });
decorateTrainingScreen();
