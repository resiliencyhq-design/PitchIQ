import { FOOTBALL_IQ_CATEGORY_LABELS, FOOTBALL_IQ_MISSIONS, missionById, missionsForView, relatedMissions } from "../data/football-iq-missions.js?v=w1-3-mission-detail-20260719";

const LIBRARY_STYLE_ID = "pitchiq-football-iq-library-w1-1-css";
if(!document.getElementById(LIBRARY_STYLE_ID)){
  const link = document.createElement("link");
  link.id = LIBRARY_STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/football-iq-library-w1-1.css?v=w1-2-mission-cards-20260719";
  document.head.appendChild(link);
}
const DETAIL_STYLE_ID = "pitchiq-football-iq-mission-detail-w1-3-css";
if(!document.getElementById(DETAIL_STYLE_ID)){
  const link = document.createElement("link");
  link.id = DETAIL_STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/football-iq-mission-detail-w1-3.css?v=w1-3-mission-detail-20260719";
  document.head.appendChild(link);
}

const APP = document.getElementById("app");
const NAV = document.getElementById("nav");
const LIBRARY_ROUTE = "football-iq-library";
const DETAIL_ROUTE = "football-iq-mission";
const CATEGORIES = [
  ["awareness", "Awareness", "◉"],
  ["scanning", "Scanning", "◎"],
  ["vision", "Vision", "◇"],
  ["decision", "Decision Making", "↯"],
  ["positioning", "Positioning", "⌖"],
  ["anticipation", "Anticipation", "≫"],
  ["communication", "Communication", "◌"],
];
let activeTab = "recommended";
let activeCategory = "";

function hashParts(){
  const raw = window.location.hash.replace(/^#/, "");
  const [route, id=""] = raw.split("/");
  return { route:route.toLowerCase(), id:decodeURIComponent(id) };
}
function isLibraryRoute(){ return hashParts().route === LIBRARY_ROUTE; }
function isDetailRoute(){ return hashParts().route === DETAIL_ROUTE; }
function stars(value){ return `${"★".repeat(value)}${"☆".repeat(Math.max(0,5-value))}`; }
function showWorldShell(){
  document.body.classList.remove("pitchiq-splash-active", "pitchiq-immersive-active");
  document.querySelector(".app-shell")?.classList.remove("pitchiq-immersive-active");
  NAV?.classList.add("visible");
}

function missionCard(mission, compact=false){
  const category = FOOTBALL_IQ_CATEGORY_LABELS[mission.category] || "Football IQ";
  const locked = mission.status === "locked";
  const completed = mission.status === "completed";
  const status = locked ? `Unlock at Level ${mission.unlockLevel || 2}` : completed ? `Best ${mission.personalBest || 0}%` : mission.recommended ? "Recommended" : "Available";
  return `<article class="fiq-mission-card${locked ? " is-locked" : ""}${completed ? " is-completed" : ""}${compact ? " is-compact" : ""}" data-fiq-mission="${mission.id}">
    <div class="fiq-mission-card-head"><span>${category}</span><small>${status}</small></div>
    <h3>${mission.title}</h3>
    <p>${mission.description}</p>
    <div class="fiq-mission-card-meta"><span>${stars(mission.difficulty)}</span><span>${mission.xp} XP</span><span>${mission.minutes} MIN</span></div>
    <button type="button" ${locked ? "disabled" : `data-fiq-open-mission="${mission.id}"`} aria-label="${locked ? `${mission.title} locked` : `Open ${mission.title}`}">${locked ? "Locked" : completed ? "View mission →" : "View mission →"}</button>
  </article>`;
}

function renderMissionList(){
  const panel = APP?.querySelector?.("[data-fiq-panel]");
  if(!panel) return;
  const missions = missionsForView(activeTab, activeCategory);
  const title = activeCategory ? FOOTBALL_IQ_CATEGORY_LABELS[activeCategory] : activeTab === "recommended" ? "Recommended Today" : activeTab === "browse" ? "All Missions" : activeTab === "completed" ? "Completed Missions" : "Locked Missions";
  const clear = activeCategory ? `<button type="button" class="fiq-category-clear" data-fiq-category-clear>All categories</button>` : "";
  panel.innerHTML = `<div class="fiq-library-section-head"><span>${title}</span><small>${missions.length} mission${missions.length === 1 ? "" : "s"}</small></div>${clear}<div class="fiq-mission-grid">${missions.map(mission=>missionCard(mission)).join("") || `<div class="fiq-mission-empty"><strong>No missions here yet</strong><p>Complete more Football IQ training to build this collection.</p></div>`}</div><div class="fiq-library-section-head"><span>Mission Categories</span><small>7 skills</small></div><div class="fiq-library-categories">${CATEGORIES.map(([id,label,icon])=>`<button type="button" class="${activeCategory === id ? "active" : ""}" data-fiq-category="${id}"><b>${icon}</b><span>${label}</span><small>${FOOTBALL_IQ_MISSIONS.filter(mission=>mission.category===id).length} mission</small><i>→</i></button>`).join("")}</div>`;
}

function renderLibrary(){
  if(!APP || !isLibraryRoute()) return false;
  showWorldShell();
  APP.innerHTML = `<section class="screen app active fiq-library-shell" data-football-iq-library>
    <header class="fiq-library-topbar">
      <button type="button" class="fiq-library-back" data-fiq-library-home aria-label="Back to Home">←</button>
      <div><span>PitchIQ Academy</span><strong>Football IQ Training</strong></div>
      <span class="fiq-library-level">LEVEL 1</span>
    </header>
    <main class="fiq-library-content">
      <section class="fiq-library-hero">
        <span class="fiq-library-kicker">Mission Library</span>
        <h1>Train your<br><em>football brain.</em></h1>
        <p>Build the habits that help you see more, decide earlier and play faster.</p>
      </section>
      <nav class="fiq-library-tabs" aria-label="Mission library filters">
        ${["recommended","browse","completed","locked"].map(tab=>`<button class="${activeTab===tab?"active":""}" type="button" data-fiq-tab="${tab}">${tab.charAt(0).toUpperCase()+tab.slice(1)}</button>`).join("")}
      </nav>
      <section class="fiq-library-panel" data-fiq-panel></section>
    </main>
  </section>`;
  renderMissionList();
  return true;
}

function progressMarkup(mission){
  const completed = mission.status === "completed";
  const attempts = Number(mission.attempts || 0);
  return `<div class="fiq-detail-progress">
    <div><small>Previous best</small><strong>${completed ? `${mission.personalBest || 0}%` : "First attempt"}</strong></div>
    <div><small>Attempts</small><strong>${attempts || "None yet"}</strong></div>
    <div><small>Completed</small><strong>${completed ? "Yes" : "Not yet"}</strong></div>
    <div><small>Last played</small><strong>${mission.lastPlayed || "Not recorded"}</strong></div>
  </div>`;
}

function renderMissionDetail(){
  if(!APP || !isDetailRoute()) return false;
  const mission = missionById(hashParts().id);
  if(!mission){ window.location.hash = LIBRARY_ROUTE; return false; }
  showWorldShell();
  const category = FOOTBALL_IQ_CATEGORY_LABELS[mission.category] || "Football IQ";
  const related = relatedMissions(mission);
  const locked = mission.status === "locked";
  APP.innerHTML = `<section class="screen app active fiq-detail-shell" data-football-iq-detail="${mission.id}">
    <header class="fiq-detail-topbar">
      <button type="button" class="fiq-detail-back" data-fiq-detail-back aria-label="Back to Mission Library">←</button>
      <div><span>PitchIQ Academy</span><strong>Football IQ Training</strong></div>
      <span class="fiq-detail-level">LEVEL 1</span>
    </header>
    <main class="fiq-detail-content">
      <section class="fiq-detail-hero">
        <span class="fiq-detail-category">${category}</span>
        <h1>${mission.title}</h1>
        <p>${mission.description}</p>
      </section>
      <section class="fiq-detail-meta" aria-label="Mission information">
        <div class="fiq-detail-stat"><small>Estimated time</small><strong>${mission.minutes} min</strong></div>
        <div class="fiq-detail-stat"><small>XP reward</small><strong>${mission.xp} XP</strong></div>
        <div class="fiq-detail-stat"><small>Difficulty</small><strong>${stars(mission.difficulty)}</strong></div>
        <div class="fiq-detail-stat"><small>Category</small><strong>${category}</strong></div>
      </section>
      <section class="fiq-detail-panel"><h2>You will learn to:</h2><ul class="fiq-detail-objectives">${(mission.objectives || []).map(objective=>`<li>${objective}</li>`).join("")}</ul></section>
      <section class="fiq-detail-panel"><h2>Your progress</h2>${progressMarkup(mission)}</section>
      ${locked ? `<section class="fiq-detail-locked"><strong>Mission locked</strong><p>Reach Academy Level ${mission.unlockLevel || 2} to unlock this mission.</p></section>` : `<button type="button" class="fiq-detail-start" data-fiq-start-mission="${mission.id}">Start Mission</button>`}
      <section class="fiq-detail-panel fiq-detail-related"><h2>Next recommended</h2>${related.map(item=>missionCard(item,true)).join("") || `<p>No related missions available yet.</p>`}</section>
    </main>
  </section>`;
  return true;
}

function renderCurrentFootballIqRoute(){
  if(isLibraryRoute()) return renderLibrary();
  if(isDetailRoute()) return renderMissionDetail();
  return false;
}
function returnHome(){
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  document.querySelector('#nav [data-route="home"]')?.click();
}
function openMission(id){
  if(!missionById(id) || missionById(id)?.status === "locked") return;
  window.location.hash = `${DETAIL_ROUTE}/${encodeURIComponent(id)}`;
  renderMissionDetail();
}
function activateTab(button){
  activeTab = button.dataset.fiqTab || "recommended";
  activeCategory = "";
  APP?.querySelectorAll?.("[data-fiq-tab]").forEach(tab => tab.classList.toggle("active", tab === button));
  renderMissionList();
}
function launchMission(){
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  document.querySelector('#nav [data-route="training"]')?.click();
}

document.addEventListener("click", event => {
  const homeCard = event.target.closest?.('[data-home-adaptive-recommendation] [data-route="training"]');
  if(homeCard){ event.preventDefault(); event.stopImmediatePropagation(); window.location.hash = LIBRARY_ROUTE; renderLibrary(); return; }
  const homeButton = event.target.closest?.("[data-fiq-library-home]");
  if(homeButton){ event.preventDefault(); returnHome(); return; }
  const detailBack = event.target.closest?.("[data-fiq-detail-back]");
  if(detailBack){ event.preventDefault(); window.location.hash = LIBRARY_ROUTE; renderLibrary(); return; }
  const missionButton = event.target.closest?.("[data-fiq-open-mission]");
  if(missionButton){ event.preventDefault(); event.stopImmediatePropagation(); openMission(missionButton.dataset.fiqOpenMission); return; }
  const start = event.target.closest?.("[data-fiq-start-mission]");
  if(start){ event.preventDefault(); event.stopImmediatePropagation(); launchMission(); return; }
  const tab = event.target.closest?.("[data-fiq-tab]");
  if(tab){ event.preventDefault(); activateTab(tab); return; }
  const category = event.target.closest?.("[data-fiq-category]");
  if(category){ event.preventDefault(); activeCategory = category.dataset.fiqCategory || ""; activeTab = "browse"; APP?.querySelectorAll?.("[data-fiq-tab]").forEach(tabButton=>tabButton.classList.toggle("active",tabButton.dataset.fiqTab==="browse")); renderMissionList(); return; }
  const clear = event.target.closest?.("[data-fiq-category-clear]");
  if(clear){ event.preventDefault(); activeCategory = ""; renderMissionList(); }
}, true);

window.addEventListener("hashchange", renderCurrentFootballIqRoute);
window.addEventListener("pageshow", renderCurrentFootballIqRoute);
renderCurrentFootballIqRoute();
