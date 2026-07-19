const autoJugglerStyles = document.createElement("link");
autoJugglerStyles.rel = "stylesheet";
autoJugglerStyles.href = "css/auto-juggler.css?v=sprint-10-2-1-home-tile-restore-20260719";
document.head.appendChild(autoJugglerStyles);

const autoJugglerPreviewStyles = document.createElement("link");
autoJugglerPreviewStyles.rel = "stylesheet";
autoJugglerPreviewStyles.href = "css/auto-juggler-preview.css?v=sprint-10-2-1-home-tile-restore-20260719";
document.head.appendChild(autoJugglerPreviewStyles);

import("../lab/auto-juggler-camera.js?v=sprint-10-2-1-home-tile-restore-20260719").catch(error => {
  console.warn("[PitchIQ Lab] Auto Juggler ball detector failed to load", error);
});

import("../lab/auto-juggler-home-entry.js?v=sprint-10-2-1-home-tile-restore-20260719").catch(error => {
  console.warn("[PitchIQ Lab] Auto Juggler Home tile failed to load", error);
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
