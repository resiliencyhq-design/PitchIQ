import { TECHNICAL_CATEGORIES, TECHNICAL_CATEGORY_LABELS, TECHNICAL_TRAINING_DRILLS } from "../data/technical-training-drills.js?v=w2-1-technical-library-20260719";

const ROUTE = "technical-training-library";
const STYLE_ID = "pitchiq-technical-training-library-w2-1-css";
const APP = document.getElementById("app");
const NAV = document.getElementById("nav");
let activeTab = "recommended";
let activeCategory = "";

if(!document.getElementById(STYLE_ID)){
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/technical-training-library-w2-1.css?v=w2-1-technical-library-20260719";
  document.head.appendChild(link);
}

function isRoute(){ return window.location.hash.replace(/^#/, "").split("/")[0] === ROUTE; }
function stars(value){ return `${"★".repeat(value)}${"☆".repeat(Math.max(0, 5-value))}`; }
function showShell(){
  document.body.classList.remove("pitchiq-splash-active", "pitchiq-immersive-active");
  document.querySelector(".app-shell")?.classList.remove("pitchiq-immersive-active");
  NAV?.classList.add("visible");
}
function visibleDrills(){
  let drills = activeCategory ? TECHNICAL_TRAINING_DRILLS.filter(item => item.category === activeCategory) : [...TECHNICAL_TRAINING_DRILLS];
  if(activeTab === "recommended") drills = drills.filter(item => item.featured || item.status === "available").slice(0,3);
  if(activeTab === "completed") drills = drills.filter(item => item.status === "completed");
  if(activeTab === "locked") drills = drills.filter(item => item.status === "locked");
  if(activeTab === "browse") drills = drills.filter(item => item.status !== "locked");
  return drills;
}
function drillCard(drill){
  const locked = drill.status === "locked";
  return `<article class="technical-drill-card${locked ? " is-locked" : ""}">
    <div class="technical-drill-head"><span>${TECHNICAL_CATEGORY_LABELS[drill.category]}</span><small>${locked ? `Unlock at Level ${drill.unlockLevel || 2}` : drill.featured ? "Featured" : "Available"}</small></div>
    <h3>${drill.title}</h3><p>${drill.description}</p>
    <div class="technical-drill-meta"><span>${stars(drill.difficulty)}</span><span>${drill.xp} XP</span><span>${drill.minutes} MIN</span></div>
    <button type="button" ${locked ? "disabled" : `data-technical-start="${drill.id}"`}>${locked ? "Locked" : "Start drill →"}</button>
  </article>`;
}
function renderPanel(){
  const panel = APP?.querySelector?.("[data-technical-panel]");
  if(!panel) return;
  const drills = visibleDrills();
  const title = activeCategory ? TECHNICAL_CATEGORY_LABELS[activeCategory] : activeTab === "recommended" ? "Recommended Training" : activeTab === "browse" ? "All Drills" : activeTab === "completed" ? "Completed Drills" : "Locked Drills";
  panel.innerHTML = `<div class="technical-section-head"><span>${title}</span><small>${drills.length} drill${drills.length === 1 ? "" : "s"}</small></div>
    ${activeCategory ? `<button type="button" class="technical-category-clear" data-technical-clear>All categories</button>` : ""}
    <div class="technical-drill-grid">${drills.map(drillCard).join("") || `<div class="technical-empty"><strong>No drills here yet</strong><p>More technical sessions will appear as the academy expands.</p></div>`}</div>
    <div class="technical-section-head"><span>Training Categories</span><small>10 skills</small></div>
    <div class="technical-category-grid">${TECHNICAL_CATEGORIES.map(id => `<button type="button" class="${activeCategory === id ? "active" : ""}" data-technical-category="${id}"><b>⚽</b><span>${TECHNICAL_CATEGORY_LABELS[id]}</span><i>→</i></button>`).join("")}</div>`;
}
export function renderTechnicalTrainingLibrary(){
  if(!APP || !isRoute()) return false;
  showShell();
  APP.innerHTML = `<section class="screen app active technical-library-shell" data-technical-training-library>
    <header class="technical-library-topbar"><button type="button" data-technical-home aria-label="Back to Home">←</button><div><span>PitchIQ Academy</span><strong>Technical Training</strong></div><span class="technical-level">LEVEL 1</span></header>
    <main class="technical-library-content">
      <section class="technical-library-hero"><span>Drill Library</span><h1>Train the ball.<br><em>Own the moment.</em></h1><p>Build touch, control and confidence through short, focused technical sessions.</p></section>
      <nav class="technical-library-tabs" aria-label="Technical drill filters">${["recommended","browse","completed","locked"].map(tab => `<button type="button" class="${activeTab === tab ? "active" : ""}" data-technical-tab="${tab}">${tab.charAt(0).toUpperCase()+tab.slice(1)}</button>`).join("")}</nav>
      <section data-technical-panel></section>
    </main>
  </section>`;
  renderPanel();
  return true;
}
function returnHome(){
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  document.querySelector('#nav [data-route="home"]')?.click();
}
function startExistingTraining(){
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  document.querySelector('#nav [data-route="training"]')?.click();
}
document.addEventListener("click", event => {
  const homeWorld = event.target.closest?.('[data-home-world="technical-training"]');
  if(homeWorld){ event.preventDefault(); event.stopImmediatePropagation(); window.location.hash = ROUTE; renderTechnicalTrainingLibrary(); return; }
  if(event.target.closest?.("[data-technical-home]")){ event.preventDefault(); returnHome(); return; }
  const tab = event.target.closest?.("[data-technical-tab]");
  if(tab){ event.preventDefault(); activeTab = tab.dataset.technicalTab || "recommended"; activeCategory = ""; renderTechnicalTrainingLibrary(); return; }
  const category = event.target.closest?.("[data-technical-category]");
  if(category){ event.preventDefault(); activeCategory = category.dataset.technicalCategory || ""; activeTab = "browse"; renderTechnicalTrainingLibrary(); return; }
  if(event.target.closest?.("[data-technical-clear]")){ event.preventDefault(); activeCategory = ""; renderPanel(); return; }
  if(event.target.closest?.("[data-technical-start]")){ event.preventDefault(); event.stopImmediatePropagation(); startExistingTraining(); }
}, true);
window.addEventListener("hashchange", renderTechnicalTrainingLibrary);
window.addEventListener("pageshow", renderTechnicalTrainingLibrary);
renderTechnicalTrainingLibrary();
