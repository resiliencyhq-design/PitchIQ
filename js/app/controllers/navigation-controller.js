export class NavigationController {
  constructor({ validRoutes, protectedRoutes, firstRun, syncPlayer, beforeNavigate, renderRoute, onRouteChange }) {
    this.validRoutes = new Set(validRoutes || []);
    this.protectedRoutes = new Set(protectedRoutes || []);
    this.firstRun = firstRun;
    this.syncPlayer = typeof syncPlayer === "function" ? syncPlayer : () => {};
    this.beforeNavigate = typeof beforeNavigate === "function" ? beforeNavigate : () => {};
    this.renderRoute = typeof renderRoute === "function" ? renderRoute : () => {};
    this.onRouteChange = typeof onRouteChange === "function" ? onRouteChange : () => {};
    this.currentRoute = null;
  }

  resolve(route) {
    const fallback = this.firstRun.getEntryRoute();
    if (!this.validRoutes.has(route)) return fallback;
    if (this.protectedRoutes.has(route) && !this.firstRun.isComplete()) return fallback;
    if (this.protectedRoutes.has(route)) this.syncPlayer();
    return route;
  }

  go(route, context = {}) {
    const target = this.resolve(route);
    this.beforeNavigate(target, context);
    this.renderRoute(target, context);
    this.currentRoute = target;
    this.onRouteChange(target, context);
    return target;
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}