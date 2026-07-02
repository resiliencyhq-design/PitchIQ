/* ==========================================================
   STEP 2 — Visible-entry Jersey Spawn Trigger
   Restarts the drop/pop animation when Step 2 becomes visible.
   ========================================================== */

function triggerStep2Spawn(){
  const step = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step || step.hidden) return;

  const markers = [...step.querySelectorAll('.position-marker')];
  if(!markers.length) return;

  markers.forEach(marker => {
    marker.classList.remove('is-spawning');
    void marker.offsetWidth;
    marker.classList.add('is-spawning');
  });

  window.setTimeout(() => {
    markers.forEach(marker => marker.classList.remove('is-spawning'));
  }, 1900);
}

function watchStep2Spawn(){
  const step = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if(!step) return;

  const observer = new MutationObserver(() => triggerStep2Spawn());
  observer.observe(step, { attributes:true, attributeFilter:['hidden'] });

  if(!step.hidden) triggerStep2Spawn();
}

window.addEventListener('DOMContentLoaded', watchStep2Spawn);
window.addEventListener('load', watchStep2Spawn);
setTimeout(watchStep2Spawn, 250);
