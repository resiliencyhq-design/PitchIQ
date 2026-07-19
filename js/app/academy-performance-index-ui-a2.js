import { getAcademyPerformanceIndex } from "./academy-performance-index-a2.js?v=a2-performance-index-20260719";

const STYLE_ID="pitchiq-academy-performance-index-a2-css";
if(!document.getElementById(STYLE_ID)){
  const link=document.createElement("link");
  link.id=STYLE_ID;
  link.rel="stylesheet";
  link.href="css/academy-performance-index-a2.css?v=a2-performance-index-20260719";
  document.head.appendChild(link);
}

function component(item){
  return `<li class="academy-index-component ${item.available?"is-ready":"is-building"}"><div><span>${item.label}</span><small>${item.available?"Measured from current academy evidence":"More evidence required"}</small></div><strong>${item.available?`${item.score}%`:"—"}</strong></li>`;
}

export function renderAcademyPerformanceIndex(){
  const profile=document.querySelector("[data-academy-profile]");
  if(!profile)return false;
  const content=profile.querySelector(".academy-profile-content");
  if(!content)return false;
  const index=getAcademyPerformanceIndex();
  let panel=content.querySelector("[data-academy-performance-index]");
  if(!panel){
    panel=document.createElement("section");
    panel.className="academy-profile-card academy-performance-index";
    panel.dataset.academyPerformanceIndex="true";
    const hero=content.querySelector(".academy-profile-hero");
    hero?.insertAdjacentElement("afterend",panel);
  }
  const signature=JSON.stringify(index);
  if(panel.dataset.signature===signature)return true;
  panel.dataset.signature=signature;
  panel.dataset.indexState=index.state;
  panel.innerHTML=`<div class="academy-index-heading"><div><span>ACADEMY PERFORMANCE INDEX</span><h2>${index.label}</h2></div><div class="academy-index-score" aria-label="Academy Performance Index ${index.score||0}">${index.score||"—"}</div></div><p>${index.message}</p><div class="academy-index-evidence"><strong>${index.evidence.label}</strong><span>${index.coverage.activeDomains} of ${index.coverage.totalDomains} worlds connected · ${index.coverage.activities} recent activities</span></div><ul>${index.components.map(component).join("")}</ul><small class="academy-index-note">The index only uses recorded PitchIQ activity. Missing physical, match and confidence measures are not estimated.</small>`;
  return true;
}

const refresh=()=>queueMicrotask(renderAcademyPerformanceIndex);
new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("hashchange",refresh);
window.addEventListener("pageshow",refresh);
window.addEventListener("pitchiq:football-iq-complete",refresh);
window.addEventListener("pitchiq:technical-complete",refresh);
renderAcademyPerformanceIndex();
