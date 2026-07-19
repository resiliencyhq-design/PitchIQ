import { FOOTBALL_IQ_CATEGORY_LABELS } from "../data/football-iq-missions.js?v=s21-2-adaptive-plan-20260719";
import { adaptiveFootballIqPlan, footballIqActivity, footballIqRecommendations, primaryFootballIqRecommendation } from "./football-iq-recommendations-w1-5.js?v=s21-2-adaptive-plan-20260719";

const STYLE_ID = "pitchiq-football-iq-adaptive-w1-5-css";
if(!document.getElementById(STYLE_ID)){
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/football-iq-adaptive-w1-5.css?v=s21-2-adaptive-plan-20260719";
  document.head.appendChild(link);
}

function applyHomeRecommendation(){
  const card = document.querySelector("[data-home-adaptive-recommendation]");
  const mission = primaryFootballIqRecommendation();
  if(!card || !mission) return;
  const activity = footballIqActivity();
  const best = window.PitchIQFootballIqProgress?.get?.()?.missions?.[mission.id]?.personalBest;
  const signature = `s21-2:${mission.id}:${best || 0}:${activity.streak}:${activity.weekly}:${activity.readiness}`;
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

function adaptiveCard(item, primary=false, step=0){
  const category = FOOTBALL_IQ_CATEGORY_LABELS[item.category] || "Football IQ";
  return `<article class="fiq-adaptive-card${primary ? " is-primary" : ""}">
    <div><span>${step ? `Step ${step}` : primary ? "Best next mission" : "Also recommended"}</span><small>${category} · ${item.minutes} min · ${item.xp} XP</small></div>
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
  const plan = adaptiveFootballIqPlan();
  const signature = `${plan.focus}:${plan.missions.map(item => `${item.id}:${item.recommendationReason}`).join("|")}`;
  if(!section){
    section = document.createElement("section");
    section.dataset.fiqAdaptiveRecommendations = "true";
    section.className = "fiq-adaptive-recommendations";
    panel.prepend(section);
  }
  if(section.dataset.signature === signature) return;
  section.dataset.signature = signature;
  section.innerHTML = `<div class="fiq-adaptive-heading"><div><span>Personal Coach</span><h2>Your adaptive training plan</h2></div><small>Updates after every mission</small></div>
    <div class="fiq-adaptive-plan-summary"><span>Priority module</span><h3>${plan.headline}</h3><p>${plan.rationale}</p><div><b>${plan.focusLabel}</b><b>${plan.missions.length} missions</b><b>${plan.totalMinutes} min</b></div></div>
    <div class="fiq-adaptive-grid">${plan.missions.map((item,index)=>adaptiveCard(item,index===0,index+1)).join("")}</div>`;
}

function applyModuleRecommendation(){
  const root = document.querySelector("[data-football-iq-module]");
  const moduleId = root?.dataset?.footballIqModule;
  const content = root?.querySelector?.(".fiq-library-content");
  if(!root || !content || !moduleId) return;
  let section = content.querySelector("[data-fiq-module-coach]");
  const recommendations = footballIqRecommendations(10).filter(item => item.category === moduleId).slice(0,2);
  if(!recommendations.length) return;
  const signature = recommendations.map(item => `${item.id}:${item.recommendationReason}`).join("|");
  if(!section){
    section = document.createElement("section");
    section.dataset.fiqModuleCoach = "true";
    section.className = "fiq-module-coach";
    const progress = content.querySelector(".fiq-module-progress");
    progress?.insertAdjacentElement("afterend", section);
  }
  if(section.dataset.signature === signature) return;
  section.dataset.signature = signature;
  section.innerHTML = `<span>Coach focus</span><h2>${recommendations[0].title}</h2><p>${recommendations[0].recommendationReason}</p><button type="button" data-fiq-adaptive-open="${recommendations[0].id}">Train this next →</button>`;
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
    applyModuleRecommendation();
  });
}

new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("pitchiq:football-iq-progress", apply);
window.addEventListener("hashchange", apply);
window.addEventListener("pageshow", apply);
apply();