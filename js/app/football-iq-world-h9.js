import { footballIqAssessment } from "./football-iq-assessment-s21-4.js?v=sprint-h9-football-iq-world-20260721";
import { footballIqSeason } from "./football-iq-curriculum-s21-3.js?v=sprint-h9-football-iq-world-20260721";
import { adaptiveFootballIqPlan, footballIqActivity } from "./football-iq-recommendations-w1-5.js?v=sprint-h9-football-iq-world-20260721";
import { getFootballIqProgress, formatFootballIqDate } from "./football-iq-progression-w1-4.js?v=sprint-h9-football-iq-world-20260721";
import { FOOTBALL_IQ_CATEGORY_LABELS } from "../data/football-iq-missions.js?v=sprint-h9-football-iq-world-20260721";

const STYLE_ID = "pitchiq-football-iq-world-h9-css";
const STYLE_HREF = "css/football-iq-world-h9.css?v=sprint-h9-football-iq-world-20260721";

function ensureStylesheet(){
  let link = document.getElementById(STYLE_ID);
  if(!link){
    link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if(link.getAttribute("href") !== STYLE_HREF) link.setAttribute("href", STYLE_HREF);
}

function escapeHtml(value){
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;"
  })[character]);
}

function insightItems(items, empty){
  if(!items?.length) return `<span class="fiq-h9-empty">${escapeHtml(empty)}</span>`;
  return items.map(item => `<button type="button" data-fiq-open-module="${escapeHtml(item.id)}"><span>${escapeHtml(item.label)}</span><b>${Number(item.score || 0)}%</b></button>`).join("");
}

function recentResults(progress){
  return Object.entries(progress.missions || {})
    .filter(([,item]) => item?.attempts || item?.completed)
    .map(([id,item]) => ({ id, ...item }))
    .sort((a,b) => Date.parse(b.lastPlayed || 0) - Date.parse(a.lastPlayed || 0))
    .slice(0,3);
}

function resultMarkup(results){
  if(!results.length) return `<div class="fiq-h9-empty-state"><strong>Your results will appear here</strong><p>Complete a Football IQ mission to begin building your benchmark.</p></div>`;
  return results.map(item => `<article><div><span>${escapeHtml(item.title || item.id)}</span><small>${item.lastPlayed ? escapeHtml(formatFootballIqDate(item.lastPlayed)) : "Recorded"}</small></div><b>${Number(item.personalBest || 0)}%</b></article>`).join("");
}

function dashboardMarkup(){
  const progress = getFootballIqProgress();
  const assessment = footballIqAssessment(progress);
  const season = footballIqSeason(progress);
  const plan = adaptiveFootballIqPlan(progress, 3);
  const activity = footballIqActivity(progress);
  const next = plan.missions?.[0] || null;
  const activePhase = season.activePhase;
  const results = recentResults(progress);
  const nextCategory = next ? FOOTBALL_IQ_CATEGORY_LABELS[next.category] || "Football IQ" : "Football IQ";

  return `<section class="fiq-h9-dashboard" data-fiq-h9-dashboard>
    <div class="fiq-h9-score-card">
      <div><span>Football IQ benchmark</span><strong>${assessment.score}</strong><small>${escapeHtml(assessment.band)} · ${escapeHtml(assessment.badge)} badge</small></div>
      <div class="fiq-h9-score-meta"><b>Level ${Number(progress.level || 1)}</b><b>${assessment.seasonPercent}% season</b><b>${activity.readiness}</b></div>
    </div>

    <section class="fiq-h9-coach-card">
      <div class="fiq-h9-section-heading"><div><span>Adaptive Coach</span><h2>Your best next mission</h2></div><small>Updates after every mission</small></div>
      ${next ? `<div class="fiq-h9-next-mission"><div><small>${escapeHtml(nextCategory)} · ${Number(next.minutes || 0)} min · ${Number(next.xp || 0)} XP</small><h3>${escapeHtml(next.title)}</h3><p>${escapeHtml(next.recommendationReason || plan.rationale)}</p></div><button type="button" data-fiq-open-mission="${escapeHtml(next.id)}">View mission →</button></div>` : `<div class="fiq-h9-empty-state"><strong>Your first mission is ready</strong><p>Browse the module library to begin building your Football IQ profile.</p></div>`}
    </section>

    <section class="fiq-h9-insights">
      <article><div class="fiq-h9-section-heading"><div><span>Performance insight</span><h2>Strengths</h2></div></div><div class="fiq-h9-insight-list">${insightItems(assessment.strengths, "Complete missions to identify your strongest areas.")}</div></article>
      <article><div class="fiq-h9-section-heading"><div><span>Development focus</span><h2>Priorities</h2></div></div><div class="fiq-h9-insight-list">${insightItems(assessment.priorities, "Your development priorities will appear after your first results.")}</div></article>
    </section>

    <section class="fiq-h9-pathway">
      <div class="fiq-h9-section-heading"><div><span>12-week pathway</span><h2>${escapeHtml(season.title)}</h2></div><strong>${season.percent}%</strong></div>
      <p>${escapeHtml(season.subtitle)}</p>
      <div class="fiq-h9-pathway-track"><i style="width:${Math.max(0, Math.min(100, Number(season.percent || 0)))}%"></i></div>
      <div class="fiq-h9-pathway-meta"><b>${activePhase ? `Current: ${escapeHtml(activePhase.title)}` : "Season complete"}</b><span>${Number(season.completedPhases || 0)} of ${season.phases?.length || 0} phases complete</span></div>
    </section>

    <section class="fiq-h9-results">
      <div class="fiq-h9-section-heading"><div><span>Recent performance</span><h2>Results and personal bests</h2></div><button type="button" data-fiq-tab="completed">View completed</button></div>
      <div class="fiq-h9-result-list">${resultMarkup(results)}</div>
    </section>
  </section>`;
}

export function applyFootballIqWorldDashboard(root=document){
  const library = root.querySelector?.("[data-football-iq-library]");
  const content = library?.querySelector?.(".fiq-library-content");
  const hero = content?.querySelector?.(".fiq-library-hero");
  if(!library || !content || !hero) return false;

  ensureStylesheet();
  let dashboard = content.querySelector("[data-fiq-h9-dashboard]");
  const markup = dashboardMarkup();
  if(!dashboard){
    hero.insertAdjacentHTML("afterend", markup);
    dashboard = content.querySelector("[data-fiq-h9-dashboard]");
  } else if(dashboard.dataset.signature !== markup){
    dashboard.outerHTML = markup;
    dashboard = content.querySelector("[data-fiq-h9-dashboard]");
  }
  if(dashboard) dashboard.dataset.signature = markup;
  library.dataset.footballIqWorld = "h9";
  document.documentElement.dataset.footballIqWorld = "h9";
  return true;
}

let scheduled = false;
function refresh(){
  if(scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    applyFootballIqWorldDashboard(document);
  });
}

if(typeof document !== "undefined"){
  const app = document.getElementById("app");
  if(app) new MutationObserver(refresh).observe(app, { childList:true, subtree:false });
  window.addEventListener("hashchange", refresh);
  window.addEventListener("pageshow", refresh);
  window.addEventListener("pitchiq:football-iq-progress", refresh);
  refresh();
}
