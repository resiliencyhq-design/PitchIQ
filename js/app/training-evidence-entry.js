import { createTrainingEvidence, calculateAssessmentReadiness } from "../../src/evidence/training-evidence.js";
import { saveTrainingEvidence, listTrainingEvidence } from "../../src/evidence/training-evidence-storage.js";

const PLAYER_NAME_KEY = "pitchiqPlayerName";
const READINESS_EVENT = "pitchiq:assessment-readiness";

function playerId() {
  return localStorage.getItem(PLAYER_NAME_KEY) || "local-player";
}

function currentMission() {
  for (const key of ["pitchiq.adaptiveTraining.current.v1", "pitchiq.adaptiveMission.v1"]) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      if (value) return value.mission || value;
    } catch {}
  }
  return null;
}

function assessmentDate() {
  try {
    const records = JSON.parse(localStorage.getItem("pitchiq.footballIQProfiles.v1") || "[]");
    const latest = Array.isArray(records)
      ? [...records].sort((a, b) => Date.parse(b.generatedAt || b.assessedAt || 0) - Date.parse(a.generatedAt || a.assessedAt || 0))[0]
      : null;
    return latest?.generatedAt || latest?.assessedAt || null;
  } catch {
    return null;
  }
}

function publishReadiness() {
  const readiness = calculateAssessmentReadiness(listTrainingEvidence(playerId()), {
    lastAssessmentAt: assessmentDate(),
  });
  window.dispatchEvent(new CustomEvent(READINESS_EVENT, { detail: readiness }));
  localStorage.setItem("pitchiq.assessmentReadiness.v1", JSON.stringify(readiness));
  return readiness;
}

function recordCompletedSession() {
  const mission = currentMission();
  const record = createTrainingEvidence({
    playerId: playerId(),
    sessionId: `training-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    missionId: mission?.id || null,
    constructId: mission?.constructId || null,
    drillId: mission?.drillId || document.querySelector("[data-selected-drill]")?.dataset.selectedDrill || "general",
    durationSeconds: 45,
    completionRate: 1,
    completedAt: new Date().toISOString(),
  });
  saveTrainingEvidence(record);
  publishReadiness();
}

function readinessCard(readiness) {
  const card = document.createElement("div");
  card.className = "glass tile training-evidence-readiness";
  card.dataset.trainingEvidenceReadiness = "true";
  card.innerHTML = readiness.ready
    ? `<span class="kicker">Assessment ready</span><b>Recheck your Football IQ</b><small>${readiness.message}</small>`
    : `<span class="kicker">Evidence building</span><b>${readiness.summary.sessions} sessions recorded</b><small>${readiness.message}</small>`;
  return card;
}

function renderReadiness() {
  const screen = document.querySelector("#training, [data-training-screen]");
  if (!screen || screen.querySelector("[data-training-evidence-readiness]")) return;
  const readiness = publishReadiness();
  const target = screen.querySelector(".ux-actions") || screen;
  target.appendChild(readinessCard(readiness));
}

document.addEventListener("click", (event) => {
  const action = event.target.closest?.("[data-action]")?.dataset.action;
  if (action === "finish-live-session") {
    setTimeout(recordCompletedSession, 0);
  }
  if (event.target.closest?.('[data-route="training"]')) {
    setTimeout(renderReadiness, 50);
  }
}, true);

window.addEventListener("load", () => setTimeout(renderReadiness, 100));
window.addEventListener(READINESS_EVENT, () => {
  document.querySelector("[data-training-evidence-readiness]")?.remove();
  renderReadiness();
});
