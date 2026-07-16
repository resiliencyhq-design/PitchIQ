/* STEP 2/3 onboarding repair + direct selected-puck rendering.
   The approved inactive master pitch remains the visible formation. Each marker
   is a transparent hit target that owns one hidden active-puck image. Selecting
   a position reveals that image directly at the marker, avoiding full-pitch
   clipping and coordinate conversion.
*/

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
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');

  if(step2 && !step2.querySelector('.academy-progress')){
    step2.querySelector('.position-title')?.insertAdjacentHTML('afterend', academyProgress(2));
  }
  standardiseStepHeader(step2, 'Choose your favourite position');
}

function markerLabel(marker){
  return marker?.dataset.pos || marker?.dataset.position || marker?.querySelector('.marker-accessible-label')?.textContent?.trim() || marker?.textContent?.trim() || '';
}

function syncSelectedPuck(preferredMarker = null){
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step2) return;

  const markers = [...step2.querySelectorAll('.position-marker')];
  const selected = preferredMarker || step2.querySelector('.position-marker.is-selected, .position-marker.selected, .position-marker.active');

  markers.forEach(marker => {
    const isSelected = marker === selected || marker.classList.contains('is-selected') || marker.classList.contains('selected') || marker.classList.contains('active');
    marker.classList.toggle('has-active-puck', isSelected);
    marker.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  });
}

function upgradeMarkerLayers(){
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step2) return [];

  const markers = [...step2.querySelectorAll('.position-marker')];
  const firstInitialisation = step2.dataset.markerSystemInitialised !== 'true';

  markers.forEach((marker, index) => {
    const label = markerLabel(marker);
    marker.dataset.layered = 'direct-active-puck';
    marker.setAttribute('aria-label', marker.getAttribute('aria-label') || `Select ${label}`);
    marker.setAttribute('aria-pressed', 'false');
    marker.innerHTML = `
      <img class="selected-puck-image" src="${ACTIVE_MARKER_SRC}" alt="" aria-hidden="true">
      <b class="selected-puck-label" aria-hidden="true">${label}</b>
      <span class="marker-accessible-label">${label}</span>
    `;
    marker.style.setProperty('--spawn-delay', `${index * MARKER_SPAWN_STAGGER_MS}ms`);

    if(firstInitialisation){
      marker.classList.remove('active', 'selected', 'is-selected', 'is-linked', 'has-active-puck');
    } else {
      marker.classList.remove('active', 'selected');
    }
  });

  if(firstInitialisation) step2.dataset.markerSystemInitialised = 'true';
  syncSelectedPuck();
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
    syncSelectedPuck();
  }, finalDelay + MARKER_SPAWN_DURATION_MS + 100);
}

function scheduleOnboardingRepair(){
  setTimeout(maybeRunStep2Spawn, 0);
  setTimeout(maybeRunStep2Spawn, 120);
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
window.addEventListener('DOMContentLoaded', scheduleOnboardingRepair);
window.addEventListener('load', scheduleOnboardingRepair);
