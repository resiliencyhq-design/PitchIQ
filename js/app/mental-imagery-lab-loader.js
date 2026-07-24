const MENTAL_IMAGERY_ROUTE = "lab-mental-imagery";
const LAB_WORLD_ROUTE = "world-lab";
let runtimePromise = null;

function currentRoute() {
  return window.location.hash.replace(/^#/, "").toLowerCase()
    || window.PitchIQApp?.navigation?.getCurrentRoute?.();
}

function ensureStylesheet() {
  const id = "pitchiq-mental-imagery-lab-css";
  const href = "css/mental-imagery-lab.css?v=sprint-l2-mental-imagery-lab-20260721";
  let link = document.getElementById(id);
  if (link) {
    if (link.getAttribute("href") !== href) link.setAttribute("href", href);
    return;
  }
  link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function mentalImageryModuleMarkup() {
  return `<button type="button" class="world-module-card" data-world-module-route="${MENTAL_IMAGERY_ROUTE}" data-mental-imagery-module="true">
    <span aria-hidden="true">◉</span>
    <span><strong>Mental Imagery</strong><small>2–5 minute game-preparation lock-ins</small></span>
    <b aria-hidden="true">›</b>
  </button>`;
}

function injectLabModule() {
  if (currentRoute() !== LAB_WORLD_ROUTE) return false;
  const world = document.querySelector('[data-development-world="lab"]');
  const modules = world?.querySelector?.(".development-world-modules");
  if (!modules || modules.querySelector("[data-mental-imagery-module]")) return false;

  modules.insertAdjacentHTML("beforeend", mentalImageryModuleMarkup());
  const count = modules.querySelectorAll(".world-module-card").length;
  const countLabel = modules.querySelector("header small");
  if (countLabel) countLabel.textContent = `${count} destinations`;
  return true;
}

function loadMentalImageryRuntime(route = currentRoute()) {
  if (route !== MENTAL_IMAGERY_ROUTE) {
    queueMicrotask(injectLabModule);
    return Promise.resolve(false);
  }
  ensureStylesheet();
  if (!runtimePromise) {
    runtimePromise = Promise.all([
      import("../lab/mental-imagery.js?v=sprint-l2-mental-imagery-lab-20260721"),
      import("../lab/mental-imagery-player-controller.js?v=sprint-l2-mental-imagery-audio-20260721")
    ])
      .then(() => true)
      .catch(error => {
        runtimePromise = null;
        console.error("[PitchIQ Lab] Mental Imagery runtime failed to load", error);
        return false;
      });
  }
  return runtimePromise.then(loaded => {
    if (loaded) window.PitchIQMentalImagery?.render?.();
    return loaded;
  });
}

const app = document.getElementById("app");
if (app) {
  new MutationObserver(() => queueMicrotask(injectLabModule)).observe(app, {
    childList: true,
    subtree: false
  });
}

document.addEventListener("click", event => {
  const module = event.target.closest?.('[data-world-module-route="lab-mental-imagery"]');
  if (!module) return;
  event.preventDefault();
  window.PitchIQApp?.navigationAdapter?.goFeature?.(MENTAL_IMAGERY_ROUTE, "mental-imagery-module");
}, true);

window.addEventListener("pitchiq:route-change", event => loadMentalImageryRuntime(event.detail?.route));
window.addEventListener("pageshow", () => loadMentalImageryRuntime());
loadMentalImageryRuntime();
