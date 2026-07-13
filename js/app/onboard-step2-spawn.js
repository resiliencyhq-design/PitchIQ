/* STEP 2/3 onboarding repair + master-art position selector.
   The inactive pitch is the visible design master. The active master sits above
   it and is clipped to reveal only the selected puck. Marker buttons remain
   transparent hit targets so interaction and accessibility are preserved.
*/

const MARKER_SPAWN_STAGGER_MS = 75;
const MARKER_SPAWN_DURATION_MS = 620;
const ACTIVE_PITCH_SRC = 'assets/onboarding/position-pitch-active.png?v=master-pucks-20260713';

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

function ensureActivePitchLayer(step2){
  const selector = step2?.querySelector('.position-selector');
  const inactive = selector?.querySelector('.position-pitch-inactive');
  if(!selector || !inactive) return null;

  let active = selector.querySelector('.position-pitch-active');
  if(!active){
    active = document.createElement('img');
    active.className = 'position-pitch-layer position-pitch-active';
    active.src = ACTIVE_PITCH_SRC;
    active.alt = '';
    active.setAttribute('aria-hidden', 'true');
    inactive.insertAdjacentElement('afterend', active);
  }

  return active;
}

function repairOnboardingLabels(){
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  const step3 = document.querySelector('.onboard-step[data-onboard-step="3"]');

  if(step2 && !step2.querySelector('.academy-progress')){
    step2.querySelector('.position-title')?.insertAdjacentHTML('afterend', academyProgress(2));
  }
  standardiseStepHeader(step2, 'Choose your favourite position');
  ensureActivePitchLayer(step2);

  if(step3 && !step3.querySelector('.academy-progress')){
    step3.querySelector('.position-title')?.insertAdjacentHTML('afterend', academyProgress(3));
  }
  standardiseStepHeader(step3, 'Enter the Academy');
}

function syncActivePitch(marker = null){
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  const active = ensureActivePitchLayer(step2);
  if(!active) return;

  const selected = marker || step2?.querySelector('.position-marker.is-selected, .position-marker.selected, .position-marker.active');
  if(!selected){
    active.classList.remove('has-selection');
    active.style.removeProperty('--selected-x');
    active.style.removeProperty('--selected-y');
    return;
  }

  const x = selected.style.left || `${selected.offsetLeft}px`;
  const y = selected.style.top || `${selected.offsetTop}px`;
  active.style.setProperty('--selected-x', x);
  active.style.setProperty('--selected-y', y);
  active.classList.add('has-selection');
}

function upgradeMarkerLayers(){
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step2) return [];

  const markers = [...step2.querySelectorAll('.position-marker')];
  const firstInitialisation = step2.dataset.markerSystemInitialised !== 'true';

  markers.forEach((marker, index) => {
    const label = marker.dataset.pos || marker.dataset.position || marker.textContent?.trim() || '';
    marker.dataset.layered = 'master-art';
    marker.setAttribute('aria-label', marker.getAttribute('aria-label') || `Select ${label}`);
    marker.innerHTML = `<span class="marker-accessible-label">${label}</span>`;
    marker.style.setProperty('--spawn-delay', `${index * MARKER_SPAWN_STAGGER_MS}ms`);

    if(firstInitialisation){
      marker.classList.remove('active', 'selected', 'is-selected', 'is-linked');
    } else {
      marker.classList.remove('active', 'selected');
    }
  });

  if(firstInitialisation) step2.dataset.markerSystemInitialised = 'true';
  syncActivePitch();
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
      void marker.offsetWidth;
      marker.classList.add('is-spawning');
    });
  });

  window.clearTimeout(spawnCleanupTimer);
  const finalDelay = Math.max(0, markers.length - 1) * MARKER_SPAWN_STAGGER_MS;
  spawnCleanupTimer = window.setTimeout(() => {
    markers.forEach(marker => marker.classList.remove('is-spawning'));
    step2.dataset.spawnRun = String(Number(step2.dataset.spawnRun || 0) + 1);
  }, finalDelay + MARKER_SPAWN_DURATION_MS + 100);
}

function scheduleOnboardingRepair(){
  setTimeout(maybeRunStep2Spawn, 0);
  setTimeout(maybeRunStep2Spawn, 120);
}

document.addEventListener('click', event => {
  const marker = event.target.closest?.('.onboard-step[data-onboard-step="2"] .position-marker');
  if(!marker) return;
  requestAnimationFrame(() => syncActivePitch(marker));
}, true);

window.addEventListener('pitchiq:marker-state-change', event => {
  const marker = event.detail?.marker || document.querySelector('.onboard-step[data-onboard-step="2"] .position-marker.is-selected');
  syncActivePitch(marker);
});
window.addEventListener('DOMContentLoaded', scheduleOnboardingRepair);
window.addEventListener('load', scheduleOnboardingRepair);
document.addEventListener('click', scheduleOnboardingRepair, true);
