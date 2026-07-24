const REFLECT_ROUTES = new Set(["reflect-world"]);
let loaderPromise = null;

function routeFromLocation(){ return window.location.hash.replace(/^#/, "").split("/")[0].toLowerCase(); }
export function isReflectRoute(route=routeFromLocation()){ return REFLECT_ROUTES.has(route); }
export function loadReflectWorld(route=routeFromLocation()){
  if(!isReflectRoute(route)) return Promise.resolve(false);
  if(!loaderPromise){
    loaderPromise = import("./reflect-world-h10.js?v=sprint-h10-reflect-world-20260721")
      .then(()=>true)
      .catch(error=>{ loaderPromise=null; console.error("[PitchIQ Reflect] World failed to load", error); return false; });
  }
  return loaderPromise;
}

if(typeof window !== "undefined"){
  window.addEventListener("pitchiq:route-change", event => loadReflectWorld(event.detail?.route));
  window.addEventListener("pageshow", () => loadReflectWorld(window.PitchIQApp?.navigation?.getCurrentRoute?.() || routeFromLocation()));
  loadReflectWorld(window.PitchIQApp?.navigation?.getCurrentRoute?.() || routeFromLocation());
}
