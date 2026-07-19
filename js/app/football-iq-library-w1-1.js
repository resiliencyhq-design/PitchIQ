import { FOOTBALL_IQ_CATEGORY_LABELS, FOOTBALL_IQ_MISSIONS, missionsForView } from "../data/football-iq-missions.js?v=w1-2-mission-cards-20260719";

const STYLE_ID = "pitchiq-football-iq-library-w1-1-css";
if(!document.getElementById(STYLE_ID)){
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/football-iq-library-w1-1.css?v=w1-2-mission-cards-20260719";
  document.head.appendChild(link);
}

const APP = document.getElementById("app");
const NAV = document.getElementById("nav");
const ROUTE = "football-iq-library";
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

function activeRoute(){ return window.location.hash.replace(/^#/, "").toLowerCase(); }
function isLibraryRoute(){ return activeRoute() === ROUTE; }
function stars(value){ return `${"★".repeat(value)}${"☆".repeat(Math.max(0,5-value))}`; }

function missionCard(mission){
  const category = FOOTBALL_IQ_CATEGORY_LABELS[mission.category] || "Football IQ";
  const locked = mission.status === "locked";
  const completed = mission.status === "completed";
  const status = locked ? `Unlock at Level ${mission.unlockLevel || 2}` : completed ? `Best ${mission.personalBest || 0}%` : mission.recommended ? "Recommended" : "Available";
  return `<article class="fiq-mission-card${locked ? " is-locked" : ""}${completed ? " is-completed" : ""}" data-fiq-mission="${mission.id}">
    <div class="fiq-mission-card-head"><span>${category}</span><small>${status}</small></div>
    <h3>${mission.title}</h3>
    <p>${mission.description}</p>
    <div class="fiq-mission-card-meta"><span>${stars(mission.difficulty)}</span><span>${mission.xp} XP</span><span>${mission.minutes} MIN</span></div>
    <button type="button" ${locked ? "disabled" : `data-route="${mission.launchRoute}"`} aria-label="${locked ? `${mission.title} locked` : `Open ${mission.title}`}">${locked ? "Locked" : completed ? "Play again →" : "Continue →"}</button>
  </article>`;
}

function renderMissionList(){
  const panel = APP?.querySelector?.("[data-fiq-panel]");
  if(!panel) return;
  const missions = missionsForView(activeTab, activeCategory);
  const title = activeCategory ? FOOTBALL_IQ_CATEGORY_LABELS[activeCategory] : activeTab === "recommended" ? "Recommended Today" : activeTab === "browse" ? "All Missions" : activeTab === "completed" ? "Completed Missions" : "Locked Missions";
  const clear = activeCategory ? `<button type="button" class="fiq-category-clear" data-fiq-category-clear>All categories</button>` : "";
  panel.innerHTML = `<div class="fiq-library-section-head"><span>${title}</span><small>${missions.length} mission${missions.length === 1 ? "" : "s"}</small></div>${clear}<div class="fiq-mission-grid">${missions.map(missionCard).join("") || `<div class="fiq-mission-empty"><strong>No missions here yet</strong><p>Complete more Football IQ training to build this collection.</p></div>`}</div><div class="fiq-library-section-head"><span>Mission Categories</span><small>7 skills</small></div><div class="fiq-library-categories">${CATEGORIES.map(([id,label,icon])=>`<button type="button" class="${activeCategory === id ? "active" : ""}" data-fiq-category="${id}"><b>${icon}</b><span>${label}</span><small>${FOOTBALL_IQ_MISSIONS.filter(mission=>mission.category===id).length} mission</small><i>→</i></button>`).join("")}</div>`;
}

function renderLibrary(){
  if(!APP || !isLibraryRoute()) return false;
  document.body.classList.remove("pitchiq-splash-active", "pitchiq-immersive-active");
  document.querySelector(".app-shell")?.classList.remove("pitchiq-immersive-active");
  NAV?.classList.add("visible");
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

function returnHome(){
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  document.querySelector('#nav [data-route="home"]')?.click();
}

function activateTab(button){
  activeTab = button.dataset.fiqTab || "recommended";
  activeCategory = "";
  APP?.querySelectorAll?.("[data-fiq-tab]").forEach(tab => tab.classList.toggle("active", tab === button));
  renderMissionList();
}

document.addEventListener("click", event => {
  const homeCard = event.target.closest?.('[data-home-adaptive-recommendation] [data-route="training"]');
  if(homeCard){ event.preventDefault(); event.stopImmediatePropagation(); window.location.hash = ROUTE; renderLibrary(); return; }
  const homeButton = event.target.closest?.("[data-fiq-library-home]");
  if(homeButton){ event.preventDefault(); returnHome(); return; }
  const tab = event.target.closest?.("[data-fiq-tab]");
  if(tab){ event.preventDefault(); activateTab(tab); return; }
  const category = event.target.closest?.("[data-fiq-category]");
  if(category){ event.preventDefault(); activeCategory = category.dataset.fiqCategory || ""; activeTab = "browse"; APP?.querySelectorAll?.("[data-fiq-tab]").forEach(tabButton=>tabButton.classList.toggle("active",tabButton.dataset.fiqTab==="browse")); renderMissionList(); return; }
  const clear = event.target.closest?.("[data-fiq-category-clear]");
  if(clear){ event.preventDefault(); activeCategory = ""; renderMissionList(); }
}, true);

window.addEventListener("hashchange", renderLibrary);
window.addEventListener("pageshow", renderLibrary);
renderLibrary();
