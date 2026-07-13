/* STEP 2/3 onboarding repair + canonical marker setup.
   No MutationObserver or repeating timer. The marker system is initialised
   once, starts with no default selection, and spawns once when Step 2 appears.
*/

const MARKER_GREY_SRC = 'assets/onboarding/position-marker-grey.png';
const MARKER_ACTIVE_SRC = 'assets/onboarding/position-marker-active.png';
const MARKER_SPAWN_STAGGER_MS = 75;
const MARKER_SPAWN_DURATION_MS = 620;

let lastSpawnKey = '';
let spawnCleanupTimer = null;

function academyProgress(stepNumber){
  return `<div class="academy-progress" aria-label="Step ${stepNumber} of 3"><span class="active"></span><i></i><span class="${stepNumber >= 2 ? 'active' : ''}"></span><i></i><span class="${stepNumber >= 3 ? 'active' : ''}"></span></div>`;
}

function standardiseStepHeader(step, headingText){
  if(!step) return;

  let subtitle = step.querySelector('.onboard-subtitle');
  let heading = step.querySelector('.onboard-heading, .onboard-position-heading, h1');

  if(!subtitle && heading){
    heading.insertAdjacentHTML('beforebegin', '<p class="onboard-subtitle">MAKE IT YOURS</p>');
    subtitle = step.querySelector('.onboard-subtitle');
  }

  if(subtitle){
    subtitle.className = 'onboard-subtitle';
    subtitle.textContent = 'MAKE IT YOURS';
  }

  if(heading){
    heading.className = 'onboard-heading';
    heading.textContent = headingText;
  }
}

function repairOnboardingLabels(){
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  const step3 = document.querySelector('.onboard-step[data-onboard-step="3"]');

  if(step2 && !step2.querySelector('.academy-progress')){
    step2.querySelector('.position-title')?.insertAdjacentHTML('afterend', academyProgress(2));
  }
  standardiseStepHeader(step2, 'Choose your favourite position');

  if(step3 && !step3.querySelector('.academy-progress')){
    step3.querySelector('.position-title')?.insertAdjacentHTML('afterend', academyProgress(3));
  }
  standardiseStepHeader(step3, 'Enter the Academy');
}

function syncMarkerImageState(marker){
  const base = marker.querySelector('.marker-base');
  if(!base) return;
  const nextSrc = marker.classList.contains('is-selected') ? MARKER_ACTIVE_SRC : MARKER_GREY_SRC;
  if(!base.src.endsWith(nextSrc)) base.src = nextSrc;
}

function syncAllMarkerImages(){
  document.querySelectorAll('.onboard-step[data-onboard-step="2"] .position-marker').forEach(syncMarkerImageState);
}

function upgradeMarkerLayers(){
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step2) return [];

  const markers = [...step2.querySelectorAll('.position-marker')];
  const firstInitialisation = step2.dataset.markerSystemInitialised !== 'true';

  markers.forEach((marker, index) => {
    const label = marker.dataset.pos || marker.dataset.position || marker.querySelector('.marker-label')?.textContent?.trim() || marker.querySelector('b')?.textContent?.trim() || '';

    if(marker.dataset.layered !== 'true'){
      marker.dataset.layered = 'true';
      marker.innerHTML = `
        <span class="marker-halo" aria-hidden="true"></span>
        <img class="marker-base" src="${MARKER_GREY_SRC}" alt="" aria-hidden="true">
        <b class="marker-label" aria-hidden="true">${label}</b>
      `;
    }

    marker.style.setProperty('--spawn-delay', `${index * MARKER_SPAWN_STAGGER_MS}ms`);

    if(firstInitialisation){
      marker.classList.remove('active', 'selected', 'is-selected', 'is-linked');
    } else {
      marker.classList.remove('active', 'selected');
    }

    syncMarkerImageState(marker);
  });

  if(firstInitialisation) step2.dataset.markerSystemInitialised = 'true';
  return markers;
}

function isVisibleStep2(step){
  if(!step || step.hidden) return false;
  const styles = window.getComputedStyle(step);
  return styles.display !== 'none' && styles.visibility !== 'hidden';
}

function maybeRunStep2Spawn(){
  repairOnboardingLabels();
  const markers = upgradeMarkerLayers();
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!isVisibleStep2(step2) || !markers.length) return;

  const key = `${performance.timeOrigin}-${markers.length}-${step2.dataset.spawnRun || '0'}`;
  if(lastSpawnKey === key) return;
  lastSpawnKey = key;

  markers.forEach(marker => marker.classList.remove('is-spawning'));

  requestAnimationFrame(() => {
    markers.forEach(marker => {
      syncMarkerImageState(marker);
      void marker.offsetWidth;
      marker.classList.add('is-spawning');
    });
  });

  window.clearTimeout(spawnCleanupTimer);
  const finalDelay = Math.max(0, markers.length - 1) * MARKER_SPAWN_STAGGER_MS;
  spawnCleanupTimer = window.setTimeout(() => {
    markers.forEach(marker => {
      marker.classList.remove('is-spawning');
      syncMarkerImageState(marker);
    });
    step2.dataset.spawnRun = String(Number(step2.dataset.spawnRun || 0) + 1);
  }, finalDelay + MARKER_SPAWN_DURATION_MS + 100);
}

function scheduleOnboardingRepair(){
  setTimeout(maybeRunStep2Spawn, 0);
  setTimeout(maybeRunStep2Spawn, 120);
}

window.addEventListener('pitchiq:marker-state-change', syncAllMarkerImages);
window.addEventListener('DOMContentLoaded', scheduleOnboardingRepair);
window.addEventListener('load', scheduleOnboardingRepair);
document.addEventListener('click', scheduleOnboardingRepair, true);
