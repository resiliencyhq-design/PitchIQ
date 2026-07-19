import { FOOTBALL_IQ_MISSIONS } from "../data/football-iq-missions.js?v=w1-3-mission-detail-20260719";
import { getFootballIqProgress, isMissionUnlocked, missionProgress, rememberActiveMission, xpToNextLevel } from "./football-iq-progression-w1-4.js?v=w1-4-progression-20260719";

const STYLE_ID = "pitchiq-football-iq-progression-w1-4-css";
if(!document.getElementById(STYLE_ID)){
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/football-iq-progression-w1-4.css?v=w1-4-progression-20260719";
  document.head.appendChild(link);
}

function missionById(id){ return FOOTBALL_IQ_MISSIONS.find(mission => mission.id === id); }
function friendlyDate(value){
  if(!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined,{day:"numeric",month:"short"});
}

function progressionMarkup(){
  const progress = getFootballIqProgress();
  const next = xpToNextLevel(progress);
  return `<section class="fiq-progression-card" data-fiq-progression-card>
    <div class="fiq-progression-head"><span>Academy progression</span><strong>Level ${progress.level}</strong></div>
    <div class="fiq-progression-track" aria-label="${next.percent}% progress to next level"><i style="width:${next.percent}%"></i></div>
    <div class="fiq-progression-meta"><span>${next.earned} / ${next.required} XP</span><span>${next.remaining} XP to Level ${progress.level + 1}</span></div>
  </section>`;
}

function applyProgression(){
  const root = document.querySelector("[data-football-iq-library], [data-football-iq-detail]");
  if(!root) return;
  const progress = getFootballIqProgress();
  root.querySelectorAll(".fiq-library-level,.fiq-detail-level").forEach(label => { label.textContent = `LEVEL ${progress.level}`; });
  const content = root.querySelector(".fiq-library-content,.fiq-detail-content");
  if(content && !content.querySelector("[data-fiq-progression-card]")) content.insertAdjacentHTML("afterbegin", progressionMarkup());

  root.querySelectorAll("[data-fiq-mission]").forEach(card => {
    const id = card.dataset.fiqMission;
    const mission = missionById(id);
    if(!mission) return;
    const saved = missionProgress(id, progress);
    const unlocked = isMissionUnlocked(mission, progress);
    const button = card.querySelector("button");
    const status = card.querySelector(".fiq-mission-card-head small");
    if(saved?.completed){
      card.classList.add("is-completed");
      if(status) status.textContent = `Best ${saved.personalBest || 0}%`;
    }
    if(unlocked && mission.status === "locked"){
      card.classList.remove("is-locked");
      if(status) status.textContent = "Newly unlocked";
      if(button){
        button.disabled = false;
        button.dataset.fiqOpenMission = id;
        button.textContent = "View mission →";
      }
    }
  });

  const detail = root.matches("[data-football-iq-detail]") ? root : null;
  if(detail){
    const id = detail.dataset.footballIqDetail;
    const saved = missionProgress(id, progress);
    if(saved){
      const values = detail.querySelectorAll(".fiq-detail-progress strong");
      if(values[0]) values[0].textContent = saved.completed ? `${saved.personalBest || 0}%` : "First attempt";
      if(values[1]) values[1].textContent = saved.attempts || "None yet";
      if(values[2]) values[2].textContent = saved.completed ? "Yes" : "Not yet";
      if(values[3]) values[3].textContent = friendlyDate(saved.lastPlayed);
    }
  }
}

let scheduled = false;
function scheduleApply(){
  if(scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; applyProgression(); });
}

new MutationObserver(scheduleApply).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("pitchiq:football-iq-progress", scheduleApply);
window.addEventListener("hashchange", scheduleApply);
window.addEventListener("pageshow", scheduleApply);

document.addEventListener("click", event => {
  const start = event.target.closest?.("[data-fiq-start-mission]");
  if(start) rememberActiveMission(start.dataset.fiqStartMission);
}, true);

scheduleApply();
