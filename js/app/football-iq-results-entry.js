import { renderFootballIQResults } from "../../src/results/football-iq-results.js";
import { renderPlayerDevelopment } from "../../src/development/player-development.js";

let footballIQNavigationRequested = false;

function replaceCurrentResults(markup) {
  const currentResults = document.querySelector("#app > #results, #app #results");
  if (!currentResults) return false;
  currentResults.outerHTML = markup;
  return true;
}

function renderIntoApp() {
  if (!footballIQNavigationRequested) return;
  const currentResults = document.querySelector("#app > #results.results-v2, #app #results.results-v2");
  if (!currentResults) return;

  footballIQNavigationRequested = false;
  currentResults.outerHTML = renderFootballIQResults();
}

document.addEventListener("click", (event) => {
  const developmentControl = event.target.closest?.("[data-development-route]");
  if (developmentControl) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const action = developmentControl.dataset.developmentRoute;
    replaceCurrentResults(action === "results" ? renderFootballIQResults() : renderPlayerDevelopment());
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  const routeControl = event.target.closest?.('[data-route="results"]');
  if (!routeControl) return;
  footballIQNavigationRequested = true;
  queueMicrotask(renderIntoApp);
  requestAnimationFrame(renderIntoApp);
}, true);

const observer = new MutationObserver(renderIntoApp);
const app = document.getElementById("app");
if (app) observer.observe(app, { childList: true, subtree: true });
