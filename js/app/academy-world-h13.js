import { academySnapshot, completeAcademyItem, createAcademyReview } from "./academy-mission-system-h13.js?v=sprint-h13-academy-mission-system-20260721";

function esc(value){return String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]);}
function render(){
  const app=document.getElementById("app");if(!app)return;
  const state=academySnapshot();const percent=Math.round((state.weeklyCompleted/state.items.length)*100)||0;
  app.innerHTML=`<section id="academy-world" class="academy-world-h13">
    <header><button type="button" data-academy-back>← Home</button><span>PitchIQ Academy</span><small>Your persistent development journey</small></header>
    <article class="academy-hero"><div><span>Current pathway</span><h1>${esc(state.pathway.title)}</h1><p>${esc(state.pathway.focus)}</p></div><strong>${esc(state.season.title)}</strong></article>
    <section class="academy-progress"><div><span>This week</span><b>${state.weeklyCompleted}/${state.items.length} complete</b></div><i><em style="width:${percent}%"></em></i><small>Next unlock: ${esc(state.nextUnlock.title)}${state.nextUnlock.remaining?` · ${state.nextUnlock.remaining} evidence points`:""}</small></section>
    <article class="academy-coach"><span>Coach message</span><h2>${esc(state.coach.recommendation.focus)}</h2><p>${esc(state.coach.recommendation.reason)}</p></article>
    <section class="academy-plan"><header><span>Weekly Academy plan</span><small>Complete in any order</small></header>${state.items.map(item=>`<button type="button" data-academy-item="${esc(item.id)}" data-route-target="${esc(item.route)}" class="${item.completed?"is-complete":""}"><b>${item.completed?"✓":"○"}</b><span>${esc(item.title)}<small>${esc(item.type.replace("-"," "))}</small></span><em>→</em></button>`).join("")}</section>
    <section class="academy-season"><div><span>Season progress</span><b>${state.seasonProgress}%</b></div><i><em style="width:${state.seasonProgress}%"></em></i><small>Season progression uses completed missions, quality, reflection and readiness—not XP alone.</small></section>
    <button type="button" class="academy-review-action" data-academy-review>Generate Coach Review</button>
    <p class="academy-safety">Development guidance only. This system does not provide clinical or diagnostic conclusions.</p>
  </section>`;
}
export function mountAcademyWorld(){render();}
if(typeof document!=="undefined")document.addEventListener("click",event=>{
  const back=event.target.closest?.("[data-academy-back]");if(back){location.hash="home";return;}
  const review=event.target.closest?.("[data-academy-review]");if(review){const item=createAcademyReview();review.textContent=`Review saved · ${item.nextFocus}`;return;}
  const item=event.target.closest?.("[data-academy-item]");if(!item)return;completeAcademyItem(item.dataset.academyItem);location.hash=item.dataset.routeTarget;});