const FOOTBALL_IQ_ROUTES = new Set([
  "football-iq-library",
  "football-iq-module",
  "football-iq-mission",
]);

let loaderPromise = null;

function routeFromLocation() {
  return window.location.hash.replace(/^#/, "").split("/")[0].toLowerCase();
}

export function isFootballIqRoute(route = routeFromLocation()) {
  return FOOTBALL_IQ_ROUTES.has(route);
}

export function loadFootballIqWorld(route = routeFromLocation()) {
  if (!isFootballIqRoute(route)) return Promise.resolve(false);
  if (!loaderPromise) {
    loaderPromise = import("./football-iq-library-w1-1.js?v=sprint-h9-football-iq-world-20260721")
      .then(() => Promise.all([
        import("./football-iq-adaptive-ui-w1-5.js?v=sprint-h9-football-iq-world-20260721"),
        import("./football-iq-world-h9.js?v=sprint-h9-football-iq-world-20260721"),
      ]))
      .then(() => true)
      .catch(error => {
        loaderPromise = null;
        console.error("[PitchIQ Football IQ] World failed to load", error);
        return false;
      });
  }
  return loaderPromise;
}

if (typeof window !== "undefined") {
  window.addEventListener("pitchiq:route-change", event => loadFootballIqWorld(event.detail?.route));
  window.addEventListener("pageshow", () => loadFootballIqWorld(window.PitchIQApp?.navigation?.getCurrentRoute?.() || routeFromLocation()));
  loadFootballIqWorld(window.PitchIQApp?.navigation?.getCurrentRoute?.() || routeFromLocation());
}
