import { getAcademySkillRadar } from "./academy-skill-radar-a3.js?v=a3-skill-radar-20260719";

const STYLE_ID="pitchiq-academy-skill-radar-a3-css";
if(!document.getElementById(STYLE_ID)){
  const link=document.createElement("link");
  link.id=STYLE_ID;
  link.rel="stylesheet";
  link.href="css/academy-skill-radar-a3.css?v=a3-skill-radar-20260719";
  document.head.appendChild(link);
}

const point=(angle,radius,cx=150,cy=150)=>({x:cx+Math.cos(angle)*radius,y:cy+Math.sin(angle)*radius});
const polygon=points=>points.map(item=>`${item.x.toFixed(1)},${item.y.toFixed(1)}`).join(" ");

function radarSvg(radar){
  const count=radar.axes.length;
  if(!count)return `<div class="academy-radar-empty" aria-hidden="true"><span>RADAR BUILDING</span></div>`;
  const radius=96,start=-Math.PI/2;
  const angles=radar.axes.map((_,index)=>start+(Math.PI*2*index/count));
  const rings=[25,50,75,100].map(level=>`<polygon points="${polygon(angles.map(angle=>point(angle,radius*level/100)))}"/>`).join("");
  const spokes=angles.map(angle=>{const edge=point(angle,radius);return `<line x1="150" y1="150" x2="${edge.x.toFixed(1)}" y2="${edge.y.toFixed(1)}"/>`}).join("");
  const valuePoints=radar.axes.map((axis,index)=>point(angles[index],radius*axis.score/100));
  const labels=radar.axes.map((axis,index)=>{const labelPoint=point(angles[index],122);return `<text x="${labelPoint.x.toFixed(1)}" y="${labelPoint.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${axis.label}</text>`}).join("");
  const dots=valuePoints.map(item=>`<circle cx="${item.x.toFixed(1)}" cy="${item.y.toFixed(1)}" r="3"/>`).join("");
  return `<svg class="academy-radar-svg" viewBox="0 0 300 300" role="img" aria-label="Academy skill radar showing ${count} recorded skills"><g class="academy-radar-grid">${rings}${spokes}</g><polygon class="academy-radar-shape" points="${polygon(valuePoints)}"/>${dots}<g class="academy-radar-labels">${labels}</g></svg>`;
}

function insight(label,item,fallback){
  return `<article><span>${label}</span>${item?`<strong>${item.label}</strong><small>${item.score}% · ${item.source}</small>`:`<strong>${fallback}</strong><small>More training evidence required</small>`}</article>`;
}

export function renderAcademySkillRadar(){
  const profile=document.querySelector("[data-academy-profile]");
  if(!profile)return false;
  const content=profile.querySelector(".academy-profile-content");
  if(!content)return false;
  const radar=getAcademySkillRadar();
  let panel=content.querySelector("[data-academy-skill-radar]");
  if(!panel){
    panel=document.createElement("section");
    panel.className="academy-profile-card academy-skill-radar";
    panel.dataset.academySkillRadar="true";
    const index=content.querySelector("[data-academy-performance-index]");
    (index||content.querySelector(".academy-profile-hero"))?.insertAdjacentElement("afterend",panel);
  }
  const signature=JSON.stringify(radar);
  if(panel.dataset.signature===signature)return true;
  panel.dataset.signature=signature;
  panel.dataset.radarState=radar.state;
  panel.innerHTML=`<div class="academy-radar-heading"><div><span>ACADEMY SKILL RADAR</span><h2>Your development shape</h2></div><strong>${radar.average||"—"}<small>AVG</small></strong></div><p>${radar.message}</p><div class="academy-radar-stage">${radarSvg(radar)}</div><div class="academy-radar-insights">${insight("STRONGEST AREA",radar.strongest,"Still building")}${insight("NEXT DEVELOPMENT FOCUS",radar.focus,"Still building")}</div><small class="academy-radar-note">The radar visualises recorded skill evidence only. It expands as more varied training is completed.</small>`;
  return true;
}

const refresh=()=>queueMicrotask(renderAcademySkillRadar);
new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("hashchange",refresh);
window.addEventListener("pageshow",refresh);
window.addEventListener("pitchiq:football-iq-complete",refresh);
window.addEventListener("pitchiq:technical-complete",refresh);
renderAcademySkillRadar();
