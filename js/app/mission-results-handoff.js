import { MISSION_LIFECYCLE } from "../../src/missions/mission-contract.js";
import { readCurrentMission, transitionMission } from "../../src/missions/mission-store.js";

export function markMissionResultsReady(result = {}, storage = globalThis.localStorage) {
  const mission = readCurrentMission(storage);
  if (!mission || mission.lifecycle !== MISSION_LIFECYCLE.ACTIVE) return mission;

  return transitionMission(MISSION_LIFECYCLE.RESULTS_READY, {
    metadata: {
      resultReadyAt: Date.now(),
      resultRoute: "results",
      resultId: result.id || result.resultId || null,
      resultSummary: result.summary || null,
    },
  }, storage);
}

function resultPayloadFromScreen(screen) {
  return {
    id: screen?.dataset?.resultId || null,
    summary: screen?.dataset?.resultSummary || null,
  };
}

function syncResultsScreen(root = document) {
  const screen = root.querySelector?.("#results.screen.active, #results.active");
  if (!screen || screen.dataset.missionHandoff === "results-ready") return false;

  const mission = markMissionResultsReady(resultPayloadFromScreen(screen));
  if (mission?.lifecycle !== MISSION_LIFECYCLE.RESULTS_READY) return false;

  screen.dataset.missionId = mission.id;
  screen.dataset.missionLifecycle = mission.lifecycle;
  screen.dataset.missionHandoff = "results-ready";
  return true;
}

if (typeof document !== "undefined") {
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
