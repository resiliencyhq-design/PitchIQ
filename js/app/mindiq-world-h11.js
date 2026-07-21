import { EXERCISES, completeMindIqExercise, getMindIqCheckins, mindIqProfile, recommendMindIqExercise, saveMindIqCheckin } from "./mindiq-engine-h11.js?v=sprint-h11-mindiq-world-20260721";

function scale(name, value=3){
  return `<label class="mindiq-scale"><span>${name}</span><input name="${name.toLowerCase()}" type="range" min="1" max="5" value="${value}"><output>${value}</output></label>`;
}

function renderExercise(exercise){
  return `<article class="mindiq-card mindiq-featured"><header><span>Recommended now</span><small>${exercise.minutes} min</small></header><h2>${exercise.title}</h2><p>${exercise.cue}</p><button data-mindiq-complete="${exercise.id}">Complete exercise</button></article>`;
}

function renderLibrary(){
  return EXERCISES.map(item=>`<button class="mindiq-library-card" data-mindiq-select="${item.id}"><span>${item.skill}</span><strong>${item.title}</strong><small>${item.minutes} min</small></button>`).join("");
}

export function renderMindIqWorld(){
  const app=document.getElementById("app");
  if(!app) return false;
  const checkins=getMindIqCheckins();
  const profile=mindIqProfile(checkins);
  const recommendation=recommendMindIqExercise(checkins);
  const today=checkins[0];
  app.innerHTML=`<section id="mindiq-world" class="mindiq-world">
    <header class="mindiq-topbar"><button data-mindiq-back aria-label="Back">‹</button><div><span>Academy World</span><strong>MindIQ</strong></div><em>Performance skills</em></header>
    <main class="mindiq-content">
      <section class="mindiq-hero"><span>Calm. Focus. Respond.</span><h1>Train the mind<br><em>behind the player.</em></h1><p>Build confidence, focus and resilience through short, practical football routines.</p></section>
      <section class="mindiq-profile" aria-label="Mental performance profile">
        ${["confidence","focus","calm","resilience"].map(key=>`<div><strong>${profile[key] || "—"}</strong><span>${key}</span></div>`).join("")}
      </section>
      ${renderExercise(recommendation)}
      <section class="mindiq-section"><header><div><span>Daily check-in</span><small>${today ? "Update how you feel today" : "Take 30 seconds before training"}</small></div></header>
        <form class="mindiq-checkin">${scale("Confidence", today?.confidence)}${scale("Focus", today?.focus)}${scale("Calm", today?.calm)}${scale("Energy", today?.energy)}${scale("Resilience", today?.resilience)}<label class="mindiq-note"><span>Anything on your mind? Optional</span><textarea name="note" placeholder="One sentence is enough"></textarea></label><button type="submit">Save check-in</button></form>
      </section>
      <section class="mindiq-section"><header><div><span>Mental skills library</span><small>Short routines for football moments</small></div></header><div class="mindiq-library">${renderLibrary()}</div></section>
      <aside class="mindiq-safety"><strong>Performance support, not diagnosis</strong><p>MindIQ uses coaching language and trends. It does not diagnose mental-health conditions or replace professional care.</p></aside>
    </main></section>`;
  bindMindIq();
  return true;
}

function bindMindIq(){
  document.querySelector("[data-mindiq-back]")?.addEventListener("click",()=>{ window.location.hash="home"; });
  document.querySelectorAll('.mindiq-scale input').forEach(input=>input.addEventListener('input',()=>{ input.nextElementSibling.textContent=input.value; }));
  document.querySelector('.mindiq-checkin')?.addEventListener('submit',event=>{
    event.preventDefault();
    const data=Object.fromEntries(new FormData(event.currentTarget));
    saveMindIqCheckin(data);
    renderMindIqWorld();
  });
  document.querySelectorAll('[data-mindiq-complete]').forEach(button=>button.addEventListener('click',()=>{
    completeMindIqExercise(button.dataset.mindiqComplete);
    button.textContent="Completed";
    button.disabled=true;
  }));
  document.querySelectorAll('[data-mindiq-select]').forEach(button=>button.addEventListener('click',()=>{
    const exercise=EXERCISES.find(item=>item.id===button.dataset.mindiqSelect);
    const featured=document.querySelector('.mindiq-featured');
    if(featured && exercise) featured.outerHTML=renderExercise(exercise);
    bindMindIq();
  }));
}
