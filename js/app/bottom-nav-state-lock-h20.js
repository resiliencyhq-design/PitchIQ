const ROUTES = new Set(["home", "training", "results", "player"]);
let route = "home";

function currentRoute(){
  return route;
}

function syncBottomNavState(nextRoute = route){
  if (ROUTES.has(nextRoute)) route = nextRoute;
  const nav = document.getElementById("nav");
  if (!nav) return false;

  nav.querySelectorAll("[data-route]").forEach(button => {
    const isActive = button.dataset.route === route;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  return true;
}

function handleRouteChange(event){
  syncBottomNavState(event.detail?.route);
}

if (typeof window !== "undefined") {
  window.addEventListener("pitchiq:route-change", handleRouteChange);
  window.addEventListener("pageshow", () => {
    const controllerRoute = window.PitchIQApp?.navigation?.getCurrentRoute?.();
    syncBottomNavState(controllerRoute || route);
  });
  queueMicrotask(() => {
    const controllerRoute = window.PitchIQApp?.navigation?.getCurrentRoute?.();
    syncBottomNavState(controllerRoute || route);
  });
}

export { currentRoute, syncBottomNavState };