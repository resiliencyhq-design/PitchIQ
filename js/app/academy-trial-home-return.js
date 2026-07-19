const autoJugglerStyles = document.createElement("link");
autoJugglerStyles.rel = "stylesheet";
autoJugglerStyles.href = "css/auto-juggler.css?v=sprint-10-2-1-home-tile-restore-20260719";
document.head.appendChild(autoJugglerStyles);

const autoJugglerPreviewStyles = document.createElement("link");
autoJugglerPreviewStyles.rel = "stylesheet";
autoJugglerPreviewStyles.href = "css/auto-juggler-preview.css?v=sprint-10-2-1-home-tile-restore-20260719";
document.head.appendChild(autoJugglerPreviewStyles);

const footballIQResultsStyles = document.createElement("link");
footballIQResultsStyles.rel = "stylesheet";
footballIQResultsStyles.href = "css/football-iq-results.css?v=sprint-12-4b-player-development-20260719";
document.head.appendChild(footballIQResultsStyles);

const playerDevelopmentStyles = document.createElement("link");
playerDevelopmentStyles.rel = "stylesheet";
playerDevelopmentStyles.href = "css/player-development.css?v=sprint-12-4b-player-development-20260719";
document.head.appendChild(playerDevelopmentStyles);

const homeSprint103Styles = document.createElement("link");
homeSprint103Styles.rel = "stylesheet";
homeSprint103Styles.href = "css/home-sprint-10-3.css?v=sprint-10-3-1-home-simplification-20260719";
document.head.appendChild(homeSprint103Styles);

import("../lab/auto-juggler-camera.js?v=sprint-10-2-1-home-tile-restore-20260719").catch(error => {
  console.warn("[PitchIQ Lab] Auto Juggler ball detector failed to load", error);
});

import("../lab/auto-juggler-home-entry.js?v=sprint-10-2-1-home-tile-restore-20260719").catch(error => {
  console.warn("[PitchIQ Lab] Auto Juggler Home tile failed to load", error);
});

import("./football-iq-results-entry.js?v=sprint-12-4b-player-development-20260719").catch(error => {
  console.warn("[PitchIQ] Football IQ results and development experiences failed to load", error);
});

import("./home-sprint-10-3.js?v=sprint-10-3-1-home-simplification-20260719").catch(error => {
  console.warn("[PitchIQ] Home Sprint 10.3.1 enhancements failed to load", error);
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