const STYLE_ID = "pitchiq-football-iq-library-w1-1-css";
if(!document.getElementById(STYLE_ID)){
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/football-iq-library-w1-1.css?v=w1-1-mission-library-shell-20260719";
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

function activeRoute(){ return window.location.hash.replace(/^#/, "").toLowerCase(); }
function isLibraryRoute(){ return activeRoute() === ROUTE; }

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
        <button class="active" type="button" data-fiq-tab="recommended">Recommended</button>
        <button type="button" data-fiq-tab="browse">Browse</button>
        <button type="button" data-fiq-tab="completed">Completed</button>
        <button type="button" data-fiq-tab="locked">Locked</button>
      </nav>
      <section class="fiq-library-panel" data-fiq-panel>
        <div class="fiq-library-section-head"><span>Recommended Today</span><small>Adaptive pick</small></div>
        <article class="fiq-library-featured">
          <span class="fiq-library-featured-tag">VISION</span>
          <h2>Predict the Next Play</h2>
          <p>Read the pattern and anticipate what may happen next.</p>
          <div><span>★★★★☆</span><span>15 XP</span><span>5 MIN</span></div>
          <button type="button" data-route="training">Continue →</button>
        </article>
        <div class="fiq-library-section-head"><span>Mission Categories</span><small>7 skills</small></div>
        <div class="fiq-library-categories">${CATEGORIES.map(([id,label,icon])=>`<button type="button" data-fiq-category="${id}"><b>${icon}</b><span>${label}</span><small>Explore missions</small><i>→</i></button>`).join("")}</div>
      </section>
    </main>
  </section>`;
  return true;
}

function returnHome(){
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  document.querySelector('#nav [data-route="home"]')?.click();
}

function activateTab(button){
  const tabs = APP?.querySelectorAll?.("[data-fiq-tab]") || [];
  tabs.forEach(tab => tab.classList.toggle("active", tab === button));
  const panel = APP?.querySelector?.("[data-fiq-panel]");
  if(panel) panel.dataset.activeTab = button.dataset.fiqTab;
}

document.addEventListener("click", event => {
  const homeCard = event.target.closest?.('[data-home-adaptive-recommendation] [data-route="training"]');
  if(homeCard){
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.hash = ROUTE;
    renderLibrary();
    return;
  }
  const homeButton = event.target.closest?.("[data-fiq-library-home]");
  if(homeButton){ event.preventDefault(); returnHome(); return; }
  const tab = event.target.closest?.("[data-fiq-tab]");
  if(tab){ event.preventDefault(); activateTab(tab); }
}, true);

window.addEventListener("hashchange", renderLibrary);
window.addEventListener("pageshow", renderLibrary);
renderLibrary();
