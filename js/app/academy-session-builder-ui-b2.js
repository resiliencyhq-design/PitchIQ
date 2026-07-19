import { buildAcademySession } from "./academy-session-builder-b2.js?v=b2-session-builder-20260719";

const STYLE_ID="pitchiq-academy-session-builder-b2-css";
if(!document.getElementById(STYLE_ID)){const link=document.createElement("link");link.id=STYLE_ID;link.rel="stylesheet";link.href="css/academy-session-builder-b2.css?v=b2-session-builder-20260719";document.head.appendChild(link)}

function block(item){return `<li class="academy-session-block"><span>${item.order}</span><div><small>${item.purpose} · ${item.world}</small><strong>${item.title}</strong><p>${item.category} · ${item.minutes} min · Level ${item.difficulty}</p></div><button type="button" data-academy-session-open="${item.route}">Open →</button></li>`}

export function renderAcademySessionBuilder(){
  const profile=document.querySelector("[data-academy-profile]");
  if(!profile)return false;
  const content=profile.querySelector(".academy-profile-content");
  if(!content)return false;
  const session=buildAcademySession();
  let panel=content.querySelector("[data-academy-session-builder]");
  if(!panel){panel=document.createElement("section");panel.className="academy-profile-card academy-session-builder";panel.dataset.academySessionBuilder="true";content.appendChild(panel)}
  const signature=JSON.stringify(session);
  if(panel.dataset.signature===signature)return true;
  panel.dataset.signature=signature;
  panel.innerHTML=`<div class="academy-session-head"><div><span>PERSONALISED SESSION</span><h2>${session.title}</h2></div><div><strong>${session.totalMinutes}</strong><small>MIN</small></div></div><p>${session.message}</p>${session.blocks.length?`<ol>${session.blocks.map(block).join("")}</ol><div class="academy-session-summary"><span>${session.blocks.length} activities</span><span>~${session.totalXpEstimate} XP available</span><span>Unlocked content only</span></div>`:`<p>More training evidence is required before a session can be assembled.</p>`}`;
  return true;
}

document.addEventListener("click",event=>{const trigger=event.target.closest?.("[data-academy-session-open]");if(!trigger)return;event.preventDefault();window.location.hash=trigger.dataset.academySessionOpen},true);
const refresh=()=>queueMicrotask(renderAcademySessionBuilder);
new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("hashchange",refresh);window.addEventListener("pageshow",refresh);window.addEventListener("pitchiq:football-iq-complete",refresh);window.addEventListener("pitchiq:technical-complete",refresh);renderAcademySessionBuilder();