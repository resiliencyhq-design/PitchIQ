/* ==========================================================
   STEP 2 — One-time Jersey Spawn Trigger
   Runs once when Step 2 becomes visible. Selection/chemistry
   interactions do not replay the entrance animation.
   Also restores missing onboarding progress bars and Step 2 prompt.
   ========================================================== */

let appObserver = null;
let stepObserver = null;
let cleanupTimer = null;
let hasSpawnedThisVisit = false;
let wasStep2Visible = false;

function ensureOnboardProgressBars(){
  const steps = [...document.querySelectorAll('.onboard-step[data-onboard-step]')];

  steps.forEach(step => {
    const stepNumber = Number(step.dataset.onboardStep || 0);
    if(!stepNumber || step.querySelector('.academy-progress')) return;

    const title = step.querySelector('.position-title');
    if(!title) return;

    const progress = document.createElement('div');
    progress.className = 'academy-progress';
    progress.setAttribute('aria-label', `Step ${stepNumber} of 3`);
    progress.innerHTML = `<span class="${stepNumber >= 1 ? 'active' : ''}"></span><i></i><span class="${stepNumber >= 2 ? 'active' : ''}"></span><i></i><span class="${stepNumber >= 3 ? 'active' : ''}"></span>`;

    title.insertAdjacentElement('afterend', progress);
  });
}

function ensureStep2Prompt(){
  const step = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step) return;

  const existing = step.querySelector('.onboard-position-subtitle');
  if(existing){
    existing.textContent = 'Favorite Position';
    return;
  }

  const heading = step.querySelector('.onboard-position-heading');
  if(!heading) return;

  const prompt = document.createElement('p');
  prompt.className = 'onboard-subtitle onboard-position-subtitle';
  prompt.textContent = 'Favorite Position';

  heading.insertAdjacentElement('afterend', prompt);
}

function getVisibleStep2(){
  const step = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step || step.hidden) return null;

  const style = window.getComputedStyle(step);
  if(style.display === 'none' || style.visibility === 'hidden') return null;

  return step;
}

function clearSpawnClasses(step){
  const markers = [...step.querySelectorAll('.position-marker')];
  markers.forEach(marker => marker.classList.remove('is-spawning'));
}

function triggerStep2Spawn(){
  const step = getVisibleStep2();
  if(!step) return false;
  if(hasSpawnedThisVisit) return true;

  const markers = [...step.querySelectorAll('.position-marker')];
  if(!markers.length) return false;

  hasSpawnedThisVisit = true;
  step.classList.add('step2-spawn-complete-pending');

  markers.forEach(marker => {
    marker.classList.remove('is-spawning');
    void marker.offsetWidth;
  });

  requestAnimationFrame(() => {
    markers.forEach(marker => marker.classList.add('is-spawning'));
  });

  window.clearTimeout(cleanupTimer);
  cleanupTimer = window.setTimeout(() => {
    markers.forEach(marker => marker.classList.remove('is-spawning'));
    step.classList.remove('step2-spawn-complete-pending');
    step.classList.add('step2-spawn-complete');
  }, 2700);

  return true;
}

function syncStep2SpawnState(){
  ensureOnboardProgressBars();
  ensureStep2Prompt();

  const step = getVisibleStep2();
  const isVisible = !!step;

  if(!isVisible){
    wasStep2Visible = false;
    hasSpawnedThisVisit = false;
    window.clearTimeout(cleanupTimer);
    return;
  }

  if(isVisible && !wasStep2Visible){
    wasStep2Visible = true;
    triggerStep2Spawn();
  }
}

function attachStepObserver(){
  const step = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step) return;

  if(stepObserver) stepObserver.disconnect();

  stepObserver = new MutationObserver(() => {
    syncStep2SpawnState();
  });

  stepObserver.observe(step, {
    attributes:true,
    attributeFilter:['hidden','style']
  });
}

function watchStep2Spawn(){
  const app = document.getElementById('app') || document.body;

  ensureOnboardProgressBars();
  ensureStep2Prompt();
  attachStepObserver();
  syncStep2SpawnState();

  if(appObserver) appObserver.disconnect();

  appObserver = new MutationObserver(() => {
    ensureOnboardProgressBars();
    ensureStep2Prompt();
    attachStepObserver();
    syncStep2SpawnState();
  });

  appObserver.observe(app, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['hidden','style']
  });
}

window.addEventListener('DOMContentLoaded', watchStep2Spawn);
window.addEventListener('load', watchStep2Spawn);
window.addEventListener('pageshow', () => setTimeout(syncStep2SpawnState, 120));

setTimeout(watchStep2Spawn, 250);
