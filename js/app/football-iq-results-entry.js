import { renderFootballIQResults } from "../../src/results/football-iq-results.js";

let footballIQNavigationRequested = false;

function renderIntoApp() {
  if (!footballIQNavigationRequested) return;
  const currentResults = document.querySelector("#app > #results.results-v2, #app #results.results-v2");
  if (!currentResults) return;

  footballIQNavigationRequested = false;
  currentResults.outerHTML = renderFootballIQResults();
}

document.addEventListener("click", (event) => {
  const routeControl = event.target.closest?.('[data-route="results"]');
  if (!routeControl) return;
  footballIQNavigationRequested = true;
  queueMicrotask(renderIntoApp);
  requestAnimationFrame(renderIntoApp);
}, true);

const observer = new MutationObserver(renderIntoApp);
const app = document.getElementById("app");
if (app) observer.observe(app, { childList: true, subtree: true });
