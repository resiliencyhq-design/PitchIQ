import { buildDynamicDifficultyPlan } from "./academy-dynamic-difficulty-b3.js?v=b3-dynamic-difficulty-20260719";

const STYLE_ID="pitchiq-academy-dynamic-difficulty-b3-css";
if(!document.getElementById(STYLE_ID)){const link=document.createElement("link");link.id=STYLE_ID;link.rel="stylesheet";link.href="css/academy-dynamic-difficulty-b3.css?v=b3-dynamic-difficulty-20260719";document.head.appendChild(link)}

function row(block){const arrow=block.direction==="up"?"↑":block.direction==="down"?"↓":"→";return `<li class="academy-difficulty-row is-${block.direction}"><span>${arrow}</span><div><small>${block.world} · ${block.label}</small><strong>${block.title}</strong><p>${block.reason}</p></div><b>Level ${block.difficulty}${block.changed?` → ${block.targetDifficulty}`:""}</b></li>`}

export function renderAcademyDynamicDifficulty(){
  const profile=document.querySelector("[data-academy-profile]");
  if(!profile)return false;
  const content=profile.querySelector(".academy-profile-content");
  if(!content)return false;
  const plan=buildDynamicDifficultyPlan();
  let panel=content.querySelector("[data-academy-dynamic-difficulty]");
  if(!panel){panel=document.createElement("section");panel.className="academy-profile-card academy-dynamic-difficulty";panel.dataset.academyDynamicDifficulty="true";content.appendChild(panel)}
  const signature=JSON.stringify(plan);
  if(panel.dataset.signature===signature)return true;
  panel.dataset.signature=signature;panel.dataset.difficultyState=plan.state;
  panel.innerHTML=`<div class="academy-difficulty-head"><div><span>DYNAMIC DIFFICULTY</span><h2>${plan.title}</h2></div><strong>${plan.changed}</strong></div><p>${plan.message}</p>${plan.blocks.length?`<ul>${plan.blocks.map(row).join("")}</ul>`:`<p>Complete a Football IQ mission or Technical drill to start adapting session challenge.</p>`}<small class="academy-difficulty-note">Adjustments are recommendations only, limited to one level, and never change assessment scores or unlock restricted content.</small>`;
  return true;
}

const refresh=()=>queueMicrotask(renderAcademyDynamicDifficulty);
new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("hashchange",refresh);window.addEventListener("pageshow",refresh);window.addEventListener("pitchiq:football-iq-progress",refresh);window.addEventListener("pitchiq:technical-progress",refresh);renderAcademyDynamicDifficulty();