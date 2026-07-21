const REFLECT_ROUTES = new Set(["reflect-world"]);
let loaderPromise = null;

function currentRoute(){ return window.location.hash.replace(/^#/, "").split("/")[0].toLowerCase(); }
export function isReflectRoute(route=currentRoute()){ return REFLECT_ROUTES.has(route); }
export function loadReflectWorld(){
  if(!isReflectRoute()) return Promise.resolve(false);
  if(!loaderPromise){
    loaderPromise = import("./reflect-world-h10.js?v=sprint-h10-reflect-world-20260721")
      .then(()=>true)
      .catch(error=>{ loaderPromise=null; console.error("[PitchIQ Reflect] World failed to load", error); return false; });
  }
  return loaderPromise;
}

if(typeof window !== "undefined"){
  window.addEventListener("hashchange", loadReflectWorld);
  window.addEventListener("pageshow", loadReflectWorld);
  loadReflectWorld();
}
