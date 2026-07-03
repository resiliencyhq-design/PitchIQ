/* STEP 2/3 onboarding repair + safe spawn trigger
   Stability-safe: no MutationObserver, no repeating timers.
   Restores labels, upgrades marker internals to real image layers,
   and runs marker spawn once when Step 2 becomes visible.
*/

const MARKER_GREY_SRC = 'assets/onboarding/position-marker-grey.png';
const MARKER_ACTIVE_SRC = 'assets/onboarding/position-marker-active.png';
const MARKER_SHIRT_SRC = 'assets/onboarding/position-marker-active.png';

let lastSpawnKey = "";
let spawnCleanupTimer = null;

function academyProgress(stepNumber){
  return `<div class="academy-progress" aria-label="Step ${stepNumber} of 3"><span class="active"></span><i></i><span class="${stepNumber >= 2 ? 'active' : ''}"></span><i></i><span class="${stepNumber >= 3 ? 'active' : ''}"></span></div>`;
}

function repairOnboardingLabels(){
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  const step3 = document.querySelector('.onboard-step[data-onboard-step="3"]');

  if(step2 && !step2.querySelector('.academy-progress')){
    step2.querySelector('.position-title')?.insertAdjacentHTML('afterend', academyProgress(2));
  }

  if(step2 && !step2.querySelector('.onboard-position-subtitle')){
    step2.querySelector('.onboard-position-heading')?.insertAdjacentHTML('afterend', '<p class="onboard-subtitle onboard-position-subtitle">Favorite Position</p>');
  }

  if(step3 && !step3.querySelector('.academy-progress')){
    step3.querySelector('.position-title')?.insertAdjacentHTML('afterend', academyProgress(3));
  }
}

function syncMarkerImageState(marker){
  const base = marker.querySelector('.marker-base');
  if(!base) return;

  const isActive = marker.classList.contains('is-selected') || marker.classList.contains('selected') || marker.classList.contains('active');
  const nextSrc = isActive ? MARKER_ACTIVE_SRC : MARKER_GREY_SRC;

  if(!base.src.endsWith(nextSrc)){
    base.src = nextSrc;
  }
}

function upgradeMarkerLayers(){
  const markers = [...document.querySelectorAll('.onboard-step[data-onboard-step="2"] .position-marker')];

  markers.forEach(marker => {
    const label = marker.dataset.pos || marker.querySelector('.marker-label')?.textContent?.trim() || marker.querySelector('b')?.textContent?.trim() || '';

    if(marker.dataset.layered !== 'true'){
      marker.dataset.layered = 'true';
      marker.innerHTML = `
        <span class="marker-halo" aria-hidden="true"></span>
        <img class="marker-base" src="${MARKER_GREY_SRC}" alt="" aria-hidden="true">
        <span class="marker-shirt" aria-hidden="true"><img class="marker-shirt-img" src="${MARKER_SHIRT_SRC}" alt="" aria-hidden="true"></span>
        <b class="marker-label" aria-hidden="true">${label}</b>
      `;
    }

    syncMarkerImageState(marker);
  });
}

function isVisibleStep2(step){
  if(!step || step.hidden) return false;
  const styles = window.getComputedStyle(step);
  return styles.display !== 'none' && styles.visibility !== 'hidden';
}

function maybeRunStep2Spawn(){
  repairOnboardingLabels();
  upgradeMarkerLayers();

  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!isVisibleStep2(step2)) return;

  const markers = [...step2.querySelectorAll('.position-marker')];
  if(!markers.length) return;

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
  spawnCleanupTimer = window.setTimeout(() => {
    markers.forEach(marker => {
      marker.classList.remove('is-spawning');
      syncMarkerImageState(marker);
    });
    step2.dataset.spawnRun = String(Number(step2.dataset.spawnRun || 0) + 1);
  }, 2850);
}

function scheduleOnboardingRepair(){
  setTimeout(maybeRunStep2Spawn, 0);
  setTimeout(maybeRunStep2Spawn, 120);
}

window.addEventListener('DOMContentLoaded', scheduleOnboardingRepair);
window.addEventListener('load', scheduleOnboardingRepair);
document.addEventListener('click', scheduleOnboardingRepair, true);
