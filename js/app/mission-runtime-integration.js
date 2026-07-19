import { resolveMissionIntegration } from "../../src/missions/runtime-integration.js";

const ADAPTIVE_CURRENT_KEY = "pitchiq.adaptiveTraining.current.v1";
const ACTIVE_RUNTIME_KEY = "pitchiq.missionRuntime.active.v1";
let currentIntegration = null;

function readSelection(storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage?.getItem?.(ADAPTIVE_CURRENT_KEY) || "null");
    return value?.mission?.id ? value : null;
  } catch {
    return null;
  }
}

function persistIntegration(integration, storage = globalThis.sessionStorage) {
  try {
    storage?.setItem?.(ACTIVE_RUNTIME_KEY, JSON.stringify({
      missionId: integration.missionId,
      constructId: integration.constructId,
      adapterStatus: integration.adapterStatus,
      adapterId: integration.adapter?.adapterId || null,
      runtimeVersion: integration.runtime.runtimeVersion,
      enabledCapabilities: integration.runtime.enabledCapabilities.map((item) => item.id),
    }));
  } catch {}
}

export function activateCurrentMissionRuntime(selection = readSelection()) {
  if (!selection) {
    currentIntegration = null;
    return null;
  }

  try {
    currentIntegration = resolveMissionIntegration(selection);
    persistIntegration(currentIntegration);
    globalThis.PitchIQMissionRuntime = currentIntegration;
    document.documentElement.dataset.missionId = currentIntegration.missionId;
    document.documentElement.dataset.missionAdapter = currentIntegration.adapterStatus;
    return currentIntegration;
  } catch (error) {
    console.error("[PitchIQ mission runtime]", error);
    currentIntegration = null;
    return null;
  }
}

function decorateTrainingScreen() {
  const training = document.querySelector("#training");
  if (!training) return;
  const integration = currentIntegration || activateCurrentMissionRuntime();
  if (!integration) return;

  training.dataset.missionId = integration.missionId;
  training.dataset.missionAdapter = integration.adapterStatus;

  const missionTitle = training.querySelector("[data-mission-title], .training-mission-title");
  if (missionTitle) missionTitle.textContent = integration.missionTitle;

  const liveRep = training.querySelector(".live-rep");
  if (liveRep) {
    liveRep.dataset.missionId = integration.missionId;
    liveRep.dataset.missionAdapter = integration.adapterStatus;
    liveRep.dataset.cueProfile = integration.adapter?.cueProfile || "generic";
    liveRep.dataset.scoringProfile = integration.adapter?.scoringProfile || "generic";
  }
}

function handleMissionStart(event) {
  if (!event.target.closest?.('[data-action="start-mission-training"]')) return;
  activateCurrentMissionRuntime();
  queueMicrotask(decorateTrainingScreen);
}

if (typeof document !== "undefined") {
  document.addEventListener("click", handleMissionStart, true);
  const app = document.getElementById("app");
  if (app) {
    new MutationObserver(() => queueMicrotask(decorateTrainingScreen)).observe(app, {
      childList: true,
      subtree: true,
    });
  }
  window.addEventListener("pageshow", () => {
    activateCurrentMissionRuntime();
    decorateTrainingScreen();
  });
  activateCurrentMissionRuntime();
}

export { ACTIVE_RUNTIME_KEY, ADAPTIVE_CURRENT_KEY, readSelection };
