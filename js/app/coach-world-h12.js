import { coachSnapshot, refreshCoachMemory } from "./coach-intelligence-h12.js?v=sprint-h12-coach-intelligence-20260721";

function escapeHtml(value){ return String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
function metric(label,value,suffix=""){ return `<div><strong>${escapeHtml(value)}${suffix}</strong><span>${escapeHtml(label)}</span></div>`; }

export function renderCoachWorld(root=document){
  const app=root.querySelector?.("#app")||root;
  if(!app) return false;
  const {profile,recommendation,memory}=coachSnapshot();
  const mental=recommendation.mental;
  app.innerHTML=`<section id="coach-world" class="coach-world">
    <header class="coach-topbar"><button type="button" data-coach-back aria-label="Back">‹</button><div><span>PitchIQ Academy</span><strong>Coach Intelligence</strong></div><em>H12</em></header>
    <main class="coach-content">
      <section class="coach-hero"><span>Your adaptive coach</span><h1>One clear direction.<br><em>Built from your game.</em></h1><p>${escapeHtml(recommendation.reason)}</p></section>
      <section class="coach-stats">${metric("Readiness",profile.readiness||"—",profile.readiness?"%":"")}${metric("Sessions",profile.completed)}${metric("Reflections",profile.reflections.total)}</section>
      <article class="coach-card coach-primary">
        <div class="coach-kicker"><span>Today’s coaching plan</span><small>${escapeHtml(recommendation.focus)}</small></div>
        <h2>${escapeHtml(recommendation.mission.title)}</h2>
        <p>${escapeHtml(recommendation.reason)}</p>
        <div class="coach-meta"><span>${recommendation.mission.minutes} min</span><span>${recommendation.mission.xp} XP</span><span>Adaptive</span></div>
        <button type="button" data-coach-start="${escapeHtml(recommendation.mission.id)}" data-route="${escapeHtml(recommendation.mission.route)}">Start recommended mission <span>→</span></button>
      </article>
      <section class="coach-grid">
        <article class="coach-card"><div class="coach-kicker"><span>Mental support</span><small>${escapeHtml(mental?.skill||"focus")}</small></div><h3>${escapeHtml(mental?.title||"Stay in the moment")}</h3><p>${escapeHtml(mental?.cue||"Notice one useful cue, then commit to the next action.")}</p><button type="button" data-coach-open="mindiq-world">Open MindIQ</button></article>
        <article class="coach-card"><div class="coach-kicker"><span>Reflection prompt</span><small>After training</small></div><h3>Turn the rep into learning</h3><p>${escapeHtml(recommendation.reflectionPrompt)}</p><button type="button" data-coach-open="reflect-world">Open Reflect</button></article>
      </section>
      <section class="coach-plan"><header><span>Your development plan</span><small>Updated from your latest evidence</small></header>
        <article><strong>7-day focus</strong><p>${escapeHtml(recommendation.weeklyGoal)}</p></article>
        <article><strong>4-week theme</strong><p>${escapeHtml(recommendation.fourWeekTheme)}</p></article>
        <article><strong>Coaching memory</strong><p>${memory.updatedAt?`Coach memory has ${Object.keys(memory.strengths).length} strength theme(s) and ${Object.keys(memory.priorities).length} priority theme(s).`:"Complete a mission, reflection or check-in to begin your coaching memory."}</p></article>
      </section>
      <p class="coach-safety">Performance coaching only. Coach Intelligence supports football development and does not diagnose mental-health conditions.</p>
    </main></section>`;
  app.querySelector("[data-coach-back]")?.addEventListener("click",()=>{ location.hash="home"; });
  app.querySelectorAll("[data-coach-open]").forEach(button=>button.addEventListener("click",()=>{ location.hash=button.dataset.coachOpen; }));
  app.querySelector("[data-coach-start]")?.addEventListener("click",event=>{
    const button=event.currentTarget;
    refreshCoachMemory();
    location.hash=button.dataset.route==="football-iq"?`football-iq-mission/${encodeURIComponent(button.dataset.coachStart)}`:"training";
  });
  document.getElementById("nav")?.setAttribute("hidden","");
  return true;
}
