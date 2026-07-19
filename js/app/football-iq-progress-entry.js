import { buildFootballIQProgress } from "../../src/progress/football-iq-progress.js";

const PROFILE_KEY = "pitchiq.footballIQProfiles.v1";
const READINESS_KEY = "pitchiq.assessmentReadiness.v1";

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function model() {
  return buildFootballIQProgress({
    profiles: readJson(PROFILE_KEY, []),
    readiness: readJson(READINESS_KEY, null),
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function scoreDelta(change) {
  if (change.delta == null) return "—";
  if (change.delta > 0) return `▲ +${change.delta}`;
  if (change.delta < 0) return `▼ ${change.delta}`;
  return "No change";
}

function renderHomeProgress() {
  const home = document.querySelector("#home, [data-home-screen]");
  if (!home || home.querySelector("[data-football-iq-progress-card]")) return;
  const progress = model();
  const readiness = progress.readiness;
  const summary = readiness?.summary || {};
  const card = document.createElement("section");
  card.className = "glass tile fiq-progress-card";
  card.dataset.footballIqProgressCard = "true";
  card.innerHTML = `<span class="kicker">Football IQ progress</span>
    <h2>${progress.confidence.label}</h2>
    <div class="fiq-progress-meter"><span style="width:${Math.round((summary.evidenceQuality || 0) * 100)}%"></span></div>
    <div class="fiq-progress-stats"><span><b>${summary.sessions || 0}</b> sessions</span><span><b>${summary.activeDays || 0}</b> active days</span></div>
    <p>${readiness?.ready ? "Your evidence is strong enough for a new formal assessment." : "Complete varied missions to strengthen the evidence behind your next assessment."}</p>
    <button class="primary" data-route="results">VIEW PROGRESS</button>`;
  const target = home.querySelector(".home-main, .ux-actions, main") || home;
  target.appendChild(card);
}

function renderResultsProgress() {
  const results = document.querySelector("#results.fiq-results");
  if (!results || results.querySelector("[data-football-iq-history]")) return;
  const progress = model();
  const dimensions = progress.changes.map((change) => `<article><span>${change.label}</span><b>${scoreDelta(change)}</b></article>`).join("");
  const history = progress.history.map((profile, index) => `<li><b>Assessment ${progress.history.length - index}</b><span>${formatDate(profile.assessmentDate || profile.generatedAt || profile.assessedAt)}</span><strong>${Number.isFinite(profile?.integratedFIQ?.score) ? profile.integratedFIQ.score : "—"}</strong></li>`).join("");
  const section = document.createElement("section");
  section.className = "fiq-progress-experience";
  section.dataset.footballIqHistory = "true";
  section.innerHTML = `<header><span>YOUR DEVELOPMENT</span><h2>${progress.previous ? "Changes since your last assessment" : "Your Football IQ starting point"}</h2><p>${progress.previous ? "Improvement is shown only from formal assessment evidence." : "Complete another assessment later to unlock comparison insights."}</p></header>
    <div class="fiq-change-grid">${dimensions}</div>
    <div class="fiq-history"><h3>Assessment timeline</h3><ol>${history || "<li><span>No completed assessment history yet.</span></li>"}</ol></div>
    <div class="fiq-reassessment ${progress.readiness?.ready ? "is-ready" : "is-building"}"><span>${progress.confidence.label}</span><p>${progress.readiness?.message || "Training evidence will show when reassessment is appropriate."}</p>${progress.readiness?.ready ? '<button class="primary mega" data-route="home">START REASSESSMENT</button>' : ""}</div>`;
  const closing = results.querySelector(".fiq-closing");
  if (closing) closing.before(section); else results.querySelector(".fiq-results-wrap")?.appendChild(section);
}

function renderProgress() {
  renderHomeProgress();
  renderResultsProgress();
}

document.addEventListener("click", event => {
  if (event.target.closest?.('[data-route="home"], [data-route="results"]')) setTimeout(renderProgress, 60);
}, true);
window.addEventListener("pitchiq:assessment-readiness", () => {
  document.querySelector("[data-football-iq-progress-card]")?.remove();
  renderProgress();
});
window.addEventListener("load", () => setTimeout(renderProgress, 120));

const app = document.getElementById("app");
if (app) new MutationObserver(() => requestAnimationFrame(renderProgress)).observe(app, { childList: true, subtree: false });
