/* Onboarding number/position regression repair + direct selected-puck rendering.
   This module restores the approved Name → Number → Position sequence, mounts
   the Position progress/header when the dynamic wizard appears, and keeps the
   marker layer idempotent without restoring document-wide click repair.
*/

const PLAYER_NAME_KEY = 'pitchiqPlayerName';
const SELECTED_POSITION_KEY = 'pitchiqSelectedPosition';
const ONBOARDING_COMPLETE_KEY = 'pitchiqOnboardingComplete';
const JERSEY_NUMBER_KEY = 'pitchiqJerseyNumber';
const JERSEY_NUMBER_CONFIRMED_KEY = 'pitchiqJerseyNumberConfirmed';
const DEFAULT_JERSEY_NUMBER = '1';
const MARKER_SPAWN_STAGGER_MS = 75;
const MARKER_SPAWN_DURATION_MS = 620;
const ACTIVE_MARKER_SRC = 'assets/onboarding/position-marker-active.png?v=selected-puck-20260713';

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
  const positionStep = document.querySelector('.onboard-step[data-onboard-step="2"]');

  if(positionStep && !positionStep.querySelector('.academy-progress')){
    positionStep.querySelector('.position-title')?.insertAdjacentHTML('afterend', academyProgress(3));
  }
  if(positionStep){
    const title = positionStep.querySelector('.position-title');
    if(title?.textContent !== 'Step 3 of 3') title.textContent = 'Step 3 of 3';
    standardiseStepHeader(positionStep, 'Choose your favourite position');
  }
}

function markerLabel(marker){
  return marker?.dataset.pos || marker?.dataset.position || marker?.querySelector('.marker-accessible-label')?.textContent?.trim() || marker?.textContent?.trim() || '';
}

function syncSelectedPuck(preferredMarker = null){
  const positionStep = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!positionStep) return;

  const markers = [...positionStep.querySelectorAll('.position-marker')];
  const selected = preferredMarker || positionStep.querySelector('.position-marker.is-selected, .position-marker.selected, .position-marker.active');

  markers.forEach(marker => {
    const isSelected = marker === selected || marker.classList.contains('is-selected') || marker.classList.contains('selected') || marker.classList.contains('active');
    marker.classList.toggle('has-active-puck', isSelected);
    marker.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  });
}

function upgradeMarkerLayers(){
  const positionStep = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!positionStep) return [];

  const markers = [...positionStep.querySelectorAll('.position-marker')];
  const firstInitialisation = positionStep.dataset.markerSystemInitialised !== 'true';

  markers.forEach((marker, index) => {
    const label = markerLabel(marker);
    marker.dataset.layered = 'direct-active-puck';
    marker.setAttribute('aria-label', marker.getAttribute('aria-label') || `Select ${label}`);
    marker.setAttribute('aria-pressed', 'false');
    if(marker.dataset.markerMarkupReady !== 'true'){
      marker.dataset.markerMarkupReady = 'true';
      marker.innerHTML = `
        <img class="selected-puck-image" src="${ACTIVE_MARKER_SRC}" alt="" aria-hidden="true">
        <b class="selected-puck-label" aria-hidden="true">${label}</b>
        <span class="marker-accessible-label">${label}</span>
      `;
    }
    marker.style.setProperty('--spawn-delay', `${index * MARKER_SPAWN_STAGGER_MS}ms`);

    if(firstInitialisation){
      marker.classList.remove('active', 'selected', 'is-selected', 'is-linked', 'has-active-puck');
    }
  });

  if(firstInitialisation) positionStep.dataset.markerSystemInitialised = 'true';
  syncSelectedPuck();
  return markers;
}

function isVisiblePositionStep(step){
  if(!step || step.hidden) return false;
  const styles = window.getComputedStyle(step);
  return styles.display !== 'none' && styles.visibility !== 'hidden';
}

function maybeRunPositionSpawn(){
  repairOnboardingLabels();
  const markers = upgradeMarkerLayers();
  const positionStep = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!isVisiblePositionStep(positionStep) || !markers.length) return;

  const key = `${performance.timeOrigin}-${markers.length}-${positionStep.dataset.spawnRun || '0'}`;
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
    positionStep.dataset.spawnRun = String(Number(positionStep.dataset.spawnRun || 0) + 1);
    syncSelectedPuck();
  }, finalDelay + MARKER_SPAWN_DURATION_MS + 100);
}

function schedulePositionRepair(){
  setTimeout(maybeRunPositionSpawn, 0);
  setTimeout(maybeRunPositionSpawn, 120);
}

function showNumberPhase(){
  const namePanel = document.querySelector('.onboard-step[data-onboard-step="1"]:not([data-onboard-phase="number"])');
  const numberPanel = document.querySelector('.onboard-number-step');
  const positionPanel = document.querySelector('.onboard-step[data-onboard-step="2"]');
  const confirmPanel = document.querySelector('.onboard-step[data-onboard-step="3"]');
  if(!namePanel || !numberPanel) return false;

  namePanel.hidden = true;
  numberPanel.hidden = false;
  if(positionPanel) positionPanel.hidden = true;
  if(confirmPanel) confirmPanel.hidden = true;
  return true;
}

function resetJerseyNumberState(){
  localStorage.removeItem(JERSEY_NUMBER_CONFIRMED_KEY);
  localStorage.setItem(JERSEY_NUMBER_KEY, DEFAULT_JERSEY_NUMBER);
}

function bindNameToNumber(){
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-action="onboard-next-name"]');
    if(!button) return;

    const name = document.getElementById('nameInput')?.value?.trim();
    if(!name || !document.querySelector('.onboard-number-step')) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    localStorage.setItem(PLAYER_NAME_KEY, name);
    localStorage.removeItem(JERSEY_NUMBER_CONFIRMED_KEY);
    showNumberPhase();
  }, true);
}

function bindResetCleanup(){
  document.addEventListener('click', event => {
    const resetControl = event.target.closest?.('[data-action="reset"], [data-dev-reset-onboarding]');
    if(!resetControl) return;

    setTimeout(() => {
      const resetCompleted = !localStorage.getItem(ONBOARDING_COMPLETE_KEY)
        && !localStorage.getItem(PLAYER_NAME_KEY)
        && !localStorage.getItem(SELECTED_POSITION_KEY);
      if(resetCompleted) resetJerseyNumberState();
    }, 0);
  });
}

function initialiseLifecycle(){
  const freshIdentity = !localStorage.getItem(PLAYER_NAME_KEY)
    && !localStorage.getItem(SELECTED_POSITION_KEY)
    && localStorage.getItem(ONBOARDING_COMPLETE_KEY) !== 'true';
  if(freshIdentity) resetJerseyNumberState();

  bindNameToNumber();
  bindResetCleanup();
  schedulePositionRepair();

  const app = document.getElementById('app');
  if(!app) return;

  const observer = new MutationObserver(mutations => {
    const positionStep = document.querySelector('.onboard-step[data-onboard-step="2"]');
    if(!positionStep) return;

    if(positionStep.dataset.positionLifecycleMounted !== 'true'){
      positionStep.dataset.positionLifecycleMounted = 'true';
      schedulePositionRepair();
      return;
    }

    const becameVisible = mutations.some(mutation => mutation.type === 'attributes'
      && mutation.attributeName === 'hidden'
      && mutation.target === positionStep
      && !positionStep.hidden);
    if(becameVisible) schedulePositionRepair();
  });
  observer.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
}

document.addEventListener('click', event => {
  const marker = event.target.closest?.('.onboard-step[data-onboard-step="2"] .position-marker');
  if(!marker) return;
  requestAnimationFrame(() => syncSelectedPuck(marker));
}, true);

window.addEventListener('pitchiq:marker-state-change', event => {
  const marker = event.detail?.marker || document.querySelector('.onboard-step[data-onboard-step="2"] .position-marker.is-selected');
  syncSelectedPuck(marker);
});

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initialiseLifecycle, { once: true });
} else {
  initialiseLifecycle();
}
