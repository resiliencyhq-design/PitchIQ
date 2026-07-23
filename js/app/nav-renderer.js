export const routeNames = ["home","training","results","player"];

export function renderNav(){
  return routeNames.map(route=>`<button data-route="${route}" data-nav-route="${route}" aria-label="${route}"><b>${route==="training"?"Train":route.charAt(0).toUpperCase()+route.slice(1)}</b></button>`).join("");
}
