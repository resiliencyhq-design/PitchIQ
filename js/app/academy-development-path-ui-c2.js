import { getAcademyDevelopmentPath } from "./academy-development-path-c2.js?v=c2-development-path-20260720";
const STYLE_ID="pitchiq-academy-development-path-c2-css";
if(!document.getElementById(STYLE_ID)){const link=document.createElement("link");link.id=STYLE_ID;link.rel="stylesheet";link.href="css/academy-development-path-c2.css?v=c2-development-path-20260720";document.head.appendChild(link)}
const milestone=item=>`<li><div><strong>${item.label}</strong><small>${item.detail}</small></div><span>${item.progress}%</span><i><b style="width:${item.progress}%"></b></i></li>`;
export function renderAcademyDevelopmentPath(){
  const profile=document.querySelector("[data-academy-profile]");if(!profile)return false;
  const content=profile.querySelector(".academy-profile-content");if(!content)return false;
  const path=getAcademyDevelopmentPath();let panel=content.querySelector("[data-academy-development-path]");
  if(!panel){panel=document.createElement("section");panel.className="academy-profile-card academy-development-path";panel.dataset.academyDevelopmentPath="true";content.appendChild(panel)}
  const signature=JSON.stringify(path);if(panel.dataset.signature===signature)return true;panel.dataset.signature=signature;
  panel.innerHTML=`<div class="academy-development-head"><div><span>LONG-TERM DEVELOPMENT</span><h2>Academy Level ${path.academyLevel} · ${path.stage}</h2></div><div><strong>${path.indexScore}</strong><small>INDEX</small></div></div><div class="academy-development-summary"><p><b>${path.trend.label}</b>${path.trend.delta?` · ${path.trend.delta>0?"+":""}${path.trend.delta} trend`:""}</p><p>${path.forecast.message}</p><small>${path.forecast.confidence} forecast confidence · ${path.evidence.label}</small></div><div class="academy-development-focus"><div><small>STRENGTH</small><strong>${path.strongest?.label||"Building evidence"}</strong></div><div><small>PRIORITY</small><strong>${path.priority?.label||"Complete more training"}</strong></div></div><ol>${path.milestones.map(milestone).join("")}</ol>`;return true;
}
const refresh=()=>queueMicrotask(renderAcademyDevelopmentPath);
new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("hashchange",refresh);window.addEventListener("pageshow",refresh);window.addEventListener("pitchiq:football-iq-progress",refresh);window.addEventListener("pitchiq:technical-progress",refresh);renderAcademyDevelopmentPath();
