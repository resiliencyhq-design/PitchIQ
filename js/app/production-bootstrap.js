import { applyHomeContentComposition } from "./home-content-composition.js?v=refactor-explore-layout-ownership-20260723";

const APP_SELECTOR = "#app";
const HOME_SELECTOR = "#home";
const CANONICAL_HOME_CONTROL = '#nav [data-route="home"]';

function markProductionBuild() {
  document.documentElement.dataset.pitchiqProductionBuild = "explore-layout-ownership-refactor";
}

function applyCurrentHome() {
  const applied = applyHomeContentComposition(document);
  if (applied) {
    document.querySelector(HOME_SELECTOR)?.setAttribute("data-production-owner", "canonical-home-plus-explore-layout-refactor");
  }
  return applied;
}

function returnToCanonicalHome() {
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);

  const control = document.querySelector(CANONICAL_HOME_CONTROL);
  if (control instanceof HTMLElement) {
    control.click();
    queueMicrotask(applyCurrentHome);
    return true;
  }

  console.warn("[PitchIQ production] Canonical Home control was unavailable");
  return false;
}

function interceptLegacyHomeReload(event) {
  const button = event.target.closest?.('[data-trial-route="home"]');
  if (!button) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  returnToCanonicalHome();
}

function observeCanonicalRenders() {
  const app = document.querySelector(APP_SELECTOR);
  if (!app) return;

  new MutationObserver(() => {
    if (document.querySelector(HOME_SELECTOR)) queueMicrotask(applyCurrentHome);
  }).observe(app, { childList: true, subtree: false });
}

markProductionBuild();
document.addEventListener("click", interceptLegacyHomeReload, true);
window.addEventListener("pageshow", applyCurrentHome);
observeCanonicalRenders();
applyCurrentHome();

window.PitchIQProduction = Object.freeze({
  ...(window.PitchIQProduction || {}),
  applyCurrentHome,
  returnToCanonicalHome,
});
