import { getReflections, reflectionSummary, updateReflection } from "./reflection-engine-h10.js?v=sprint-h10-reflect-world-20260721";

const APP = document.getElementById("app");
const NAV = document.getElementById("nav");
const ROUTE = "reflect-world";
const STYLE_ID = "pitchiq-reflect-world-h10-css";

function ensureStyle(){
  if(document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/reflect-world-h10.css?v=sprint-h10-reflect-world-20260721";
  document.head.appendChild(link);
}

function isRoute(){ return window.location.hash.replace(/^#/, "").split("/")[0] === ROUTE; }
function escapeHtml(value=""){ return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char])); }
function formatDate(value){
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recent session" : date.toLocaleDateString(undefined, { weekday:"short", day:"numeric", month:"short" });
}
function confidenceDots(value){ return Array.from({ length:5 }, (_,i)=>`<i class="${i < value ? "active" : ""}"></i>`).join(""); }

function reflectionCard(item, featured=false){
  return `<article class="reflect-card${featured ? " reflect-card-featured" : ""}" data-reflection-id="${escapeHtml(item.id)}">
    <div class="reflect-card-head"><span>${formatDate(item.completedAt)}</span><small>${item.reviewed ? "Reviewed" : "Ready to reflect"}</small></div>
    <h3>${escapeHtml(item.missionTitle)}</h3>
    <div class="reflect-score"><strong>${item.score}%</strong><span>Session score</span></div>
    <section><small>What went well</small><p>${escapeHtml(item.strength)}</p></section>
    <section><small>Next focus</small><p>${escapeHtml(item.focus)}</p></section>
    <blockquote>${escapeHtml(item.coachingInsight)}</blockquote>
    <div class="reflect-confidence"><span>Confidence</span><div>${confidenceDots(item.confidence)}</div></div>
    ${featured ? `<label class="reflect-note"><span>Your note</span><textarea data-reflection-note placeholder="What did you notice?">${escapeHtml(item.note)}</textarea></label><button type="button" class="reflect-save" data-reflection-save>${item.reviewed ? "Update reflection" : "Save reflection"}</button>` : ""}
  </article>`;
}

function emptyState(){
  return `<section class="reflect-empty"><span>◎</span><h2>Your first reflection will appear here</h2><p>Complete a Football IQ or Technical Training mission. PitchIQ will turn the result into one strength, one focus and one coaching insight.</p><button type="button" data-reflect-training>Start training</button></section>`;
}

export function renderReflectWorld(){
  if(!APP || !isRoute()) return false;
  ensureStyle();
  document.body.classList.remove("pitchiq-splash-active", "pitchiq-immersive-active");
  NAV?.classList.add("visible");
  const entries = getReflections();
  const summary = reflectionSummary(entries);
  const current = entries.find(item => !item.reviewed) || entries[0] || null;
  const recent = entries.filter(item => item.id !== current?.id).slice(0,5);

  APP.innerHTML = `<section class="screen app active reflect-world" data-reflect-world>
    <header class="reflect-topbar"><button type="button" data-reflect-home aria-label="Back to Home">←</button><div><span>PitchIQ Academy</span><strong>Reflect</strong></div><em>${summary.streak} day streak</em></header>
    <main class="reflect-content">
      <section class="reflect-hero"><span>See. Calm. Improve.</span><h1>Turn every session<br><em>into learning.</em></h1><p>Notice what worked, choose one next step and carry it into your next game.</p></section>
      <section class="reflect-stats" aria-label="Reflection progress"><div><strong>${summary.pending}</strong><span>Ready</span></div><div><strong>${summary.thisWeek}</strong><span>This week</span></div><div><strong>${summary.averageConfidence || "–"}</strong><span>Confidence</span></div></section>
      ${current ? `<section class="reflect-section"><header><div><span>Today's reflection</span><small>${current.reviewed ? "Latest completed reflection" : "Complete this to strengthen the learning"}</small></div></header>${reflectionCard(current, true)}</section>` : emptyState()}
      ${recent.length ? `<section class="reflect-section reflect-history"><header><div><span>Reflection journal</span><small>Your recent learning moments</small></div></header>${recent.map(item=>reflectionCard(item)).join("")}</section>` : ""}
    </main>
  </section>`;
  return true;
}

function returnHome(){
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  document.querySelector('#nav [data-route="home"]')?.click();
}

function saveFeatured(button){
  const card = button.closest("[data-reflection-id]");
  const id = card?.dataset.reflectionId;
  if(!id) return;
  const note = card.querySelector("[data-reflection-note]")?.value || "";
  updateReflection(id, { note, reviewed:true });
  renderReflectWorld();
}

document.addEventListener("click", event => {
  const home = event.target.closest?.("[data-reflect-home]");
  if(home){ event.preventDefault(); returnHome(); return; }
  const save = event.target.closest?.("[data-reflection-save]");
  if(save){ event.preventDefault(); saveFeatured(save); return; }
  const training = event.target.closest?.("[data-reflect-training]");
  if(training){ event.preventDefault(); window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`); document.querySelector('#nav [data-route="training"]')?.click(); }
}, true);

window.addEventListener("hashchange", renderReflectWorld);
window.addEventListener("pageshow", renderReflectWorld);
window.addEventListener("pitchiq:reflections-updated", renderReflectWorld);
renderReflectWorld();
