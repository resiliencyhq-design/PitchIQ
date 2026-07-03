/* ==========================================================
   STEP 2 — Robust Jersey Spawn Trigger
   Watches the app shell so the animation fires when Step 2 is
   rendered or shown after the initial page load.
   ========================================================== */

let lastSpawnAt = 0;
let appObserver = null;
let stepObserver = null;
let retryTimer = null;

function getVisibleStep2(){
  const step = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step || step.hidden) return null;

  const style = window.getComputedStyle(step);
  if(style.display === 'none' || style.visibility === 'hidden') return null;

  return step;
}

function triggerStep2Spawn(force = false){
  const step = getVisibleStep2();
  if(!step) return false;

  const markers = [...step.querySelectorAll('.position-marker')];
  if(!markers.length) return false;

  const now = Date.now();
  if(!force && now - lastSpawnAt < 900) return true;
  lastSpawnAt = now;

  markers.forEach(marker => {
    marker.classList.remove('is-spawning');
    void marker.offsetWidth;
  });

  requestAnimationFrame(() => {
    markers.forEach(marker => marker.classList.add('is-spawning'));
  });

  window.clearTimeout(retryTimer);
  retryTimer = window.setTimeout(() => {
    markers.forEach(marker => marker.classList.remove('is-spawning'));
  }, 2200);

  return true;
}

function attachStepObserver(){
  const step = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step) return;

  if(stepObserver) stepObserver.disconnect();

  stepObserver = new MutationObserver(() => {
    triggerStep2Spawn(true);
  });

  stepObserver.observe(step, {
    attributes:true,
    attributeFilter:['hidden','class','style']
  });
}

function watchStep2Spawn(){
  const app = document.getElementById('app') || document.body;

  attachStepObserver();
  triggerStep2Spawn(true);

  if(appObserver) appObserver.disconnect();

  appObserver = new MutationObserver(() => {
    attachStepObserver();
    triggerStep2Spawn(false);
  });

  appObserver.observe(app, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['hidden','class','style']
  });
}

window.addEventListener('DOMContentLoaded', watchStep2Spawn);
window.addEventListener('load', watchStep2Spawn);
window.addEventListener('hashchange', () => triggerStep2Spawn(true));
window.addEventListener('pageshow', () => setTimeout(() => triggerStep2Spawn(true), 120));

setTimeout(watchStep2Spawn, 250);
setTimeout(() => triggerStep2Spawn(true), 700);
setTimeout(() => triggerStep2Spawn(true), 1400);
