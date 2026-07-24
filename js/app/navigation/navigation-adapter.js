export function createNavigationAdapter({ navigation, firstRun, history = window.history, location = window.location }) {
  if (!navigation || typeof navigation.go !== "function") throw new TypeError("Navigation adapter requires a navigation controller");
  if (!firstRun) throw new TypeError("Navigation adapter requires first-run state");

  const ACADEMY_ROUTE = "academy-trial";
  const LEGACY_ACADEMY_ROUTE = "academy-trials";

  function go(route, source = "adapter") {
    return navigation.go(route, { source });
  }

  function goFeature(route, source = "feature") {
    const normalized = String(route || "").replace(/^#/, "").toLowerCase();
    if (!normalized) return navigation.getCurrentRoute?.() || firstRun.getEntryRoute();
    history.replaceState(null, "", `${location.pathname}${location.search}#${normalized}`);
    window.dispatchEvent(new CustomEvent("pitchiq:route-change", { detail: { route: normalized, source } }));
    return normalized;
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

  function enterAcademy() {
    return goFeature(ACADEMY_ROUTE, "academy");
  }

  function normalizeAcademyRoute(route) {
    const normalized = String(route || "").replace(/^#/, "").toLowerCase();
    if (normalized !== LEGACY_ACADEMY_ROUTE) return normalized;
    history.replaceState(null, "", `${location.pathname}${location.search}#${ACADEMY_ROUTE}`);
    return ACADEMY_ROUTE;
  }

  return Object.freeze({
    go,
    goFeature,
    enterFromLanding,
    enterHomeFromModule,
    enterAcademy,
    normalizeAcademyRoute,
  });
}
