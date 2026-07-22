const ROUTES = ["home", "training", "results", "player"];

function currentRoute(){
  const activeScreen = document.querySelector("#app > .screen.active[id]");
  if (activeScreen && ROUTES.includes(activeScreen.id)) return activeScreen.id;

  const hashRoute = window.location.hash.replace(/^#/, "").toLowerCase();
  if (ROUTES.includes(hashRoute)) return hashRoute;

  return "home";
}

function syncBottomNavState(){
  const nav = document.getElementById("nav");
  if (!nav) return false;

  const route = currentRoute();
  nav.querySelectorAll("[data-route]").forEach(button => {
    const isActive = button.dataset.route === route;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  return true;
}

function scheduleSync(){
  queueMicrotask(syncBottomNavState);
}

if (typeof document !== "undefined") {
  const app = document.getElementById("app");
  const nav = document.getElementById("nav");

  if (app) new MutationObserver(scheduleSync).observe(app, { childList: true, subtree: false });
  if (nav) new MutationObserver(scheduleSync).observe(nav, { childList: true, subtree: true });

  document.addEventListener("click", event => {
    if (event.target.closest?.("#nav [data-route]")) scheduleSync();
  }, true);

  window.addEventListener("hashchange", scheduleSync);
  window.addEventListener("pageshow", scheduleSync);
  scheduleSync();
}

export { currentRoute, syncBottomNavState };
