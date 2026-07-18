const autoJugglerStyles = document.createElement("link");
autoJugglerStyles.rel = "stylesheet";
autoJugglerStyles.href = "css/auto-juggler.css?v=sprint-10-2-ball-detection-mvp-20260718";
document.head.appendChild(autoJugglerStyles);

const autoJugglerPreviewStyles = document.createElement("link");
autoJugglerPreviewStyles.rel = "stylesheet";
autoJugglerPreviewStyles.href = "css/auto-juggler-preview.css?v=sprint-10-2-ball-detection-mvp-20260718";
document.head.appendChild(autoJugglerPreviewStyles);

import("../lab/auto-juggler-camera.js?v=sprint-10-2-ball-detection-mvp-20260718").catch(error => {
  console.warn("[PitchIQ Lab] Auto Juggler ball detector failed to load", error);
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
