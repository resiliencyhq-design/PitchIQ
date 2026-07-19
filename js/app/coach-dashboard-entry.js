import { buildPlayerCoachSummary } from "../../src/coaching/coach-dashboard.js";
import { buildAcademySeason } from "../../src/season/academy-season.js";

const PROFILE_KEY = "pitchiq.footballIQProfiles.v1";
const READINESS_KEY = "pitchiq.assessmentReadiness.v1";
const PLAYER_NAME_KEYS = ["pitchiq.playerName", "playerName", "academyPlayerName"];

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}

function playerName() {
  for (const key of PLAYER_NAME_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return "Player";
}

function dashboardModel() {
  const profiles = readJson(PROFILE_KEY, []);
  const profile = [...profiles].sort((a, b) => Date.parse(b.assessmentDate || b.generatedAt || 0) - Date.parse(a.assessmentDate || a.generatedAt || 0))[0] || null;
  const readiness = readJson(READINESS_KEY, null);
  const evidenceSummary = readiness?.summary || {};
  const season = buildAcademySeason({ profile, profiles, evidenceSummary });
  return buildPlayerCoachSummary({ playerName: playerName(), profile, evidenceSummary: { ...evidenceSummary, ready: readiness?.ready }, season });
}

function renderCoachDashboard() {
  const results = document.querySelector("#results.fiq-results");
  if (!results || results.querySelector("[data-coach-dashboard]")) return;
  const model = dashboardModel();
  const section = document.createElement("section");
  section.className = "coach-dashboard";
  section.dataset.coachDashboard = "true";
  section.innerHTML = `<header><span>COACH VIEW</span><h2>${model.playerName} development snapshot</h2><p>A coaching interpretation of formal assessment and training evidence. This view never changes Football IQ scores.</p></header><div class="coach-dashboard-grid"><article><span>Development priority</span><b>${model.priority.label}</b><small>${model.intervention.rationale}</small></article><article><span>Current strength</span><b>${model.strength.label}</b><small>Use this strength to support the next development focus.</small></article><article><span>Training evidence</span><b>${model.engagement.sessions} sessions</b><small>${model.engagement.activeDays} active days · ${Math.round(model.engagement.evidenceQuality * 100)}% quality</small></article><article><span>Assessment status</span><b>${model.reassessmentReady ? "Ready to reassess" : "Building evidence"}</b><small>${model.academyLevel}</small></article></div><div class="coach-intervention"><span>RECOMMENDED INTERVENTION</span><h3>${model.intervention.title}</h3><p>${model.intervention.action}</p></div><div class="coach-constructs"><h3>Football IQ constructs</h3>${model.constructs.map(item => `<div><span>${item.label}</span><b>${item.score ?? "—"}</b></div>`).join("")}</div>`;
  const closing = results.querySelector(".fiq-closing");
  if (closing) closing.before(section); else results.querySelector(".fiq-results-wrap")?.appendChild(section);
}

function render() { renderCoachDashboard(); }
document.addEventListener("click", event => { if (event.target.closest?.('[data-route="results"]')) setTimeout(render, 100); }, true);
window.addEventListener("load", () => setTimeout(render, 180));
const app = document.getElementById("app");
if (app) new MutationObserver(() => requestAnimationFrame(render)).observe(app, { childList: true, subtree: false });
