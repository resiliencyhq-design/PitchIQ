const NAV_SELECTOR = "#nav.bottom-nav";
const APP_SELECTOR = "#app";
const ROUTES = new Set(["home", "training", "results", "player"]);

function visibleRoute() {
  const activeScreen = document.querySelector(`${APP_SELECTOR} > .screen.active[id]`)
    || document.querySelector(`${APP_SELECTOR} .screen.active[id]`);
  const route = activeScreen?.id?.toLowerCase();
  return ROUTES.has(route) ? route : null;
}

function syncBottomNavState() {
  const nav = document.querySelector(NAV_SELECTOR);
  const route = visibleRoute();
  if (!nav || !route) return false;

  nav.querySelectorAll("button[data-route]").forEach(button => {
    const active = button.dataset.route === route;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  nav.dataset.activeRoute = route;
  return true;
}

function scheduleSync() {
  queueMicrotask(syncBottomNavState);
}

const app = document.querySelector(APP_SELECTOR);
if (app) {
  new MutationObserver(scheduleSync).observe(app, {
    childList: true,
    subtree: false,
  });
}

document.addEventListener("click", event => {
  if (event.target.closest?.(`${NAV_SELECTOR} button[data-route]`)) scheduleSync();
}, true);

window.addEventListener("pageshow", scheduleSync);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) scheduleSync();
});

syncBottomNavState();
