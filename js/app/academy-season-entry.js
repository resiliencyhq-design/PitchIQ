import { buildAcademySeason } from "../../src/season/academy-season.js";

const PROFILE_KEY = "pitchiq.footballIQProfiles.v1";
const READINESS_KEY = "pitchiq.assessmentReadiness.v1";
const JOINED_KEY = "pitchiq.academyJoinedAt.v1";
const REVIEWS_KEY = "pitchiq.academyWeeklyReviews.v1";

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}

function seasonModel() {
  const profiles = readJson(PROFILE_KEY, []);
  const readiness = readJson(READINESS_KEY, null);
  const joinedAt = localStorage.getItem(JOINED_KEY) || profiles[0]?.assessmentDate || new Date().toISOString();
  if (!localStorage.getItem(JOINED_KEY)) localStorage.setItem(JOINED_KEY, joinedAt);
  return buildAcademySeason({
    profile: [...profiles].sort((a, b) => Date.parse(b.assessmentDate || b.generatedAt || 0) - Date.parse(a.assessmentDate || a.generatedAt || 0))[0] || null,
    profiles,
    evidenceSummary: readiness?.summary || {},
    joinedAt,
    weeklyReviews: readJson(REVIEWS_KEY, []),
  });
}

function renderHomeSeason() {
  const home = document.querySelector("#home, [data-home-screen]");
  if (!home || home.querySelector("[data-academy-season]")) return;
  const season = seasonModel();
  const { completedSessions, targetSessions } = season.plan.progress;
  const card = document.createElement("section");
  card.className = "glass tile academy-season-card";
  card.dataset.academySeason = "true";
  card.innerHTML = `<span class="kicker">THIS WEEK</span><div class="academy-season-heading"><h2>${season.plan.primary.label}</h2><b>${season.level.label}</b></div><p>${season.plan.objective}</p><div class="academy-season-progress"><span style="width:${Math.round(completedSessions / targetSessions * 100)}%"></span></div><div class="academy-season-meta"><span>${completedSessions}/${targetSessions} sessions</span><span>${season.report.consistency} consistency</span></div><small>${season.report.coachMessage}</small><button class="primary" data-route="results">VIEW ACADEMY REPORT</button>`;
  (home.querySelector(".home-main, .ux-actions, main") || home).appendChild(card);
}

function renderSeasonReport() {
  const results = document.querySelector("#results.fiq-results");
  if (!results || results.querySelector("[data-academy-report]")) return;
  const season = seasonModel();
  const section = document.createElement("section");
  section.className = "academy-season-report";
  section.dataset.academyReport = "true";
  section.innerHTML = `<header><span>ACADEMY SEASON</span><h2>Your weekly development plan</h2><p>Academy progress rewards participation and consistency. It never changes your Football IQ score.</p></header><div class="academy-season-focus"><article><span>Primary focus</span><b>${season.plan.primary.label}</b></article><article><span>Secondary focus</span><b>${season.plan.secondary.label}</b></article><article><span>Academy level</span><b>${season.level.label}</b></article></div><div class="academy-season-missions"><h3>Recommended missions</h3>${season.plan.recommendedMissions.map((mission, index) => `<div><b>${index + 1}</b><span>${mission.title}</span></div>`).join("")}</div><div class="academy-season-review"><span>COACH REVIEW</span><p>${season.report.coachMessage}</p><small>Next priority: ${season.report.nextPriority}</small></div><div class="academy-season-timeline"><h3>Season timeline</h3>${season.timeline.map((item) => `<div><span>${new Date(item.at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span><b>${item.title}</b></div>`).join("") || "<p>Your first milestone will appear here.</p>"}</div>`;
  const closing = results.querySelector(".fiq-closing");
  if (closing) closing.before(section); else results.querySelector(".fiq-results-wrap")?.appendChild(section);
}

function render() { renderHomeSeason(); renderSeasonReport(); }
document.addEventListener("click", (event) => {
  if (event.target.closest?.('[data-route="home"], [data-route="results"]')) setTimeout(render, 80);
}, true);
window.addEventListener("pitchiq:assessment-readiness", () => {
  document.querySelector("[data-academy-season]")?.remove();
  render();
});
window.addEventListener("load", () => setTimeout(render, 150));
const app = document.getElementById("app");
if (app) new MutationObserver(() => requestAnimationFrame(render)).observe(app, { childList: true, subtree: false });
