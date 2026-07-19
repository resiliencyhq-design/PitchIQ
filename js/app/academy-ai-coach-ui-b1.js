import { getAcademyAICoachPlan } from "./academy-ai-coach-b1.js?v=b1-academy-ai-coach-20260719";

const STYLE_ID="pitchiq-academy-ai-coach-b1-css";
if(!document.getElementById(STYLE_ID)){const link=document.createElement("link");link.id=STYLE_ID;link.rel="stylesheet";link.href="css/academy-ai-coach-b1.css?v=b1-academy-ai-coach-20260719";document.head.appendChild(link)}

function coachMarkup(plan,compact=false){
  return `<div class="academy-coach-identity"><span aria-hidden="true">IQ</span><div><small>${plan.coach.name}</small><strong>${plan.coach.role}</strong></div></div><p class="academy-coach-state">${plan.personalised?"PERSONALISED COACHING":"EVIDENCE-BUILDING COACHING"}</p><h2>${plan.title}</h2><p>${plan.message}</p><p class="academy-coach-encouragement">${plan.encouragement}</p>${compact?"":`<div class="academy-coach-performance"><span>Academy Index</span><strong>${plan.performance.score||"—"}</strong><small>${plan.performance.label} · ${plan.performance.evidence}</small></div>`}<div class="academy-coach-next"><small>NEXT ACTION</small><strong>${plan.nextAction}</strong></div><small class="academy-coach-evidence">${plan.evidenceNote}</small>`;
}

export function renderAcademyCoach(){
  const plan=getAcademyAICoachPlan();
  const profile=document.querySelector("[data-academy-profile]");
  if(profile){const content=profile.querySelector(".academy-profile-content");let panel=content?.querySelector("[data-academy-ai-coach]");if(content&&!panel){panel=document.createElement("section");panel.className="academy-profile-card academy-ai-coach";panel.dataset.academyAiCoach="true";const radar=content.querySelector("[data-academy-skill-radar]");(radar||content.querySelector("[data-academy-performance-index]")||content.querySelector(".academy-profile-hero"))?.insertAdjacentElement("afterend",panel)}if(panel){const signature=JSON.stringify(plan);if(panel.dataset.signature!==signature){panel.dataset.signature=signature;panel.dataset.coachState=plan.state;panel.innerHTML=`${coachMarkup(plan)}<button type="button" data-ai-coach-start-training>Start recommended training →</button>`}}}
  const home=document.querySelector("#home.active,#home");
  if(home){let card=home.querySelector("[data-academy-coach-home]");if(!card){card=document.createElement("article");card.className="academy-coach-home";card.dataset.academyCoachHome="true";const target=home.querySelector(".home-adaptive-recommendation,.home-mock-mission,.home-v7-grid");target?.insertAdjacentElement(target.classList.contains("home-v7-grid")?"afterbegin":"afterend",card)}if(card){const signature=JSON.stringify(plan);if(card.dataset.signature!==signature){card.dataset.signature=signature;card.innerHTML=`${coachMarkup(plan,true)}<button type="button" data-open-academy-profile>View coaching plan →</button>`}}}
  window.PitchIQAcademyCoach.current=plan;
  return Boolean(profile||home);
}

function refresh(){queueMicrotask(renderAcademyCoach)}
document.addEventListener("click",event=>{if(!event.target.closest?.("[data-ai-coach-start-training]"))return;event.preventDefault();document.querySelector('#nav [data-route="training"]')?.click()},true);
new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("hashchange",refresh);window.addEventListener("pageshow",refresh);window.addEventListener("pitchiq:football-iq-complete",refresh);window.addEventListener("pitchiq:technical-complete",refresh);renderAcademyCoach();