const autoJugglerStyles = document.createElement("link");
autoJugglerStyles.rel = "stylesheet";
autoJugglerStyles.href = "css/auto-juggler.css?v=sprint-10-0e-iphone-camera-preview-20260718";
document.head.appendChild(autoJugglerStyles);

import("../lab/auto-juggler-camera.js?v=sprint-10-0e-iphone-camera-preview-20260718").catch(error => {
  console.warn("[PitchIQ Lab] Auto Juggler camera preview failed to load", error);
});

document.addEventListener("click", event => {
  const button = event.target.closest?.('[data-trial-route="home"]');
  if(!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);
  window.location.reload();
}, true);
