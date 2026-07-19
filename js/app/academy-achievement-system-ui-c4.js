import { getAcademyAchievements } from "./academy-achievement-system-c4.js?v=c4-achievements-20260720";

const STYLE_ID="pitchiq-academy-achievements-c4-css";
if(!document.getElementById(STYLE_ID)){const link=document.createElement("link");link.id=STYLE_ID;link.rel="stylesheet";link.href="css/academy-achievement-system-c4.css?v=c4-achievements-20260720";document.head.appendChild(link)}

const card=item=>`<article class="academy-achievement ${item.earned?"is-earned":"is-building"}"><div class="academy-achievement-icon">${item.icon}</div><div><span>${item.earned?"ACHIEVED":`${item.progress}% COMPLETE`}</span><h3>${item.title}</h3><p>${item.description}</p><small>${Math.min(item.current,item.target)} of ${item.target}</small></div></article>`;

export function renderAcademyAchievements(){
  const root=document.querySelector("[data-academy-profile] .academy-profile-content");if(!root)return false;
  const data=getAcademyAchievements();let panel=root.querySelector("[data-academy-achievements]");
  if(!panel){panel=document.createElement("section");panel.dataset.academyAchievements="true";panel.className="academy-achievements-panel";root.appendChild(panel)}
  const signature=JSON.stringify(data);if(panel.dataset.signature===signature)return true;panel.dataset.signature=signature;
  panel.innerHTML=`<header class="academy-achievements-header"><div><span>ACADEMY ACHIEVEMENTS</span><h2>Progress worth recognising</h2><p>Achievements reflect recorded training evidence. They do not add XP or unlock content.</p></div><div class="academy-achievements-total"><strong>${data.earnedCount}</strong><small>of ${data.total}</small></div></header><section class="academy-achievements-summary"><article><span>CURRENT STREAK</span><strong>${data.streak}</strong><small>recorded day${data.streak===1?"":"s"}</small></article>${data.next?`<article><span>NEXT CLOSEST</span><strong>${data.next.title}</strong><small>${data.next.progress}% complete</small></article>`:`<article><span>COLLECTION</span><strong>Complete</strong><small>All current achievements earned</small></article>`}</section><div class="academy-achievements-grid">${data.achievements.map(card).join("")}</div>`;
  return true;
}

new MutationObserver(()=>queueMicrotask(renderAcademyAchievements)).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("hashchange",renderAcademyAchievements);window.addEventListener("pageshow",renderAcademyAchievements);renderAcademyAchievements();