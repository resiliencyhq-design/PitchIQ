import { FOOTBALL_IQ_CATEGORY_LABELS } from "../data/football-iq-missions.js?v=w1-5-adaptive-recommendations-20260719";
import { footballIqActivity, footballIqRecommendations, primaryFootballIqRecommendation } from "./football-iq-recommendations-w1-5.js?v=w1-5-adaptive-recommendations-20260719";

const STYLE_ID = "pitchiq-football-iq-adaptive-w1-5-css";
if(!document.getElementById(STYLE_ID)){
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/football-iq-adaptive-w1-5.css?v=w1-5-adaptive-recommendations-20260719";
  document.head.appendChild(link);
}

function applyHomeRecommendation(){
  const card = document.querySelector("[data-home-adaptive-recommendation]");
  const mission = primaryFootballIqRecommendation();
  if(!card || !mission) return;
  const activity = footballIqActivity();
  const best = window.PitchIQFootballIqProgress?.get?.()?.missions?.[mission.id]?.personalBest;
  const signature = `w1-5:${mission.id}:${best || 0}:${activity.streak}:${activity.weekly}:${activity.readiness}`;
  if(card.dataset.fiqAdaptiveSignature === signature) return;
  card.dataset.fiqAdaptiveMission = mission.id;
  card.dataset.fiqAdaptiveSignature = signature;
  card.innerHTML = `<div class="home-adaptive-copy">
    <span>Today's Mission</span>
    <small>${FOOTBALL_IQ_CATEGORY_LABELS[mission.category] || "Football IQ"} · ${mission.minutes} min · ${mission.xp} XP</small>
    <h2>${mission.title}</h2>
    <p>${mission.recommendationReason}</p>
    <div class="fiq-home-signals"><b>${best ? `Best ${best}%` : "First attempt"}</b><b>🔥 ${activity.streak} day streak</b><b>${activity.weekly} this week</b><b>${activity.readiness}</b></div>
  </div><button type="button" data-fiq-adaptive-open="${mission.id}">Continue Training →</button>`;
}

function adaptiveCard(item, primary=false){
  const category = FOOTBALL_IQ_CATEGORY_LABELS[item.category] || "Football IQ";
  return `<article class="fiq-adaptive-card${primary ? " is-primary" : ""}">
    <div><span>${primary ? "Best next mission" : "Also recommended"}</span><small>${category} · ${item.minutes} min · ${item.xp} XP</small></div>
    <h3>${item.title}</h3><p>${item.recommendationReason}</p>
    <button type="button" data-fiq-adaptive-open="${item.id}">View mission →</button>
  </article>`;
}

function applyLibraryRecommendations(){
  const root = document.querySelector("[data-football-iq-library]");
  const panel = root?.querySelector?.("[data-fiq-panel]");
  const active = root?.querySelector?.('[data-fiq-tab="recommended"].active');
  if(!panel || !active) return;
  let section = panel.querySelector("[data-fiq-adaptive-recommendations]");
  const recommendations = footballIqRecommendations(3);
  const signature = recommendations.map(item => `${item.id}:${item.recommendationReason}`).join("|");
  if(!section){
    section = document.createElement("section");
    section.dataset.fiqAdaptiveRecommendations = "true";
    section.className = "fiq-adaptive-recommendations";
    panel.prepend(section);
  }
  if(section.dataset.signature === signature) return;
  section.dataset.signature = signature;
  section.innerHTML = `<div class="fiq-adaptive-heading"><div><span>Personal Coach</span><h2>Recommended for you</h2></div><small>Updates after every mission</small></div><div class="fiq-adaptive-grid">${recommendations.map((item,index)=>adaptiveCard(item,index===0)).join("")}</div>`;
}

function openMission(id){
  if(!id) return;
  window.location.hash = `football-iq-mission/${encodeURIComponent(id)}`;
}

document.addEventListener("click", event => {
  const button = event.target.closest?.("[data-fiq-adaptive-open]");
  if(!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openMission(button.dataset.fiqAdaptiveOpen);
}, true);

let scheduled = false;
function apply(){
  if(scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyHomeRecommendation();
    applyLibraryRecommendations();
  });
}

new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("pitchiq:football-iq-progress", apply);
window.addEventListener("hashchange", apply);
window.addEventListener("pageshow", apply);
apply();
