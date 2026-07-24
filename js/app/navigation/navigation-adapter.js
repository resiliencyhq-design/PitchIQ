export function createNavigationAdapter({ navigation, firstRun, history = window.history, location = window.location }) {
  if (!navigation || typeof navigation.go !== "function") throw new TypeError("Navigation adapter requires a navigation controller");
  if (!firstRun) throw new TypeError("Navigation adapter requires first-run state");

  function go(route, source = "adapter") {
    return navigation.go(route, { source });
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

  return Object.freeze({ go, enterFromLanding, enterHomeFromModule });
}
