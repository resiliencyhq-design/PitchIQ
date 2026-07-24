export function createNavigationAdapter({ navigation, firstRun, history = window.history, location = window.location }) {
  if (!navigation || typeof navigation.go !== "function") throw new TypeError("Navigation adapter requires a navigation controller");
  if (!firstRun) throw new TypeError("Navigation adapter requires first-run state");

  const ACADEMY_ROUTE = "academy-trial";
  const LEGACY_ACADEMY_ROUTE = "academy-trials";

  function go(route, source = "adapter") {
    return navigation.go(route, { source });
  }

  function replaceHash(route) {
    history.replaceState(null, "", `${location.pathname}${location.search}#${route}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return route;
  }

  function enterAcademy(source = "academy") {
    return replaceHash(ACADEMY_ROUTE, source);
  }

  function normalizeAcademyRoute() {
    const route = location.hash.replace(/^#/, "").toLowerCase();
    if (route === LEGACY_ACADEMY_ROUTE) return replaceHash(ACADEMY_ROUTE);
    return route;
  }

  function enterFromLanding() {
    if (firstRun.getCurrentStep() === "landing") firstRun.completeStep("landing");
    return go(firstRun.getEntryRoute(), "landing");
  }

  function enterHomeFromModule(source = "module") {
    const target = firstRun.getEntryRoute();
    if (target !== "home") return go(target, source);
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    return go("home", source);
  }

  return Object.freeze({
    go,
    enterAcademy,
    normalizeAcademyRoute,
    enterFromLanding,
    enterHomeFromModule,
  });
}
