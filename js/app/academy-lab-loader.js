const LAB_ROUTE = "lab-juggling";
let labRuntimePromise = null;

function currentRoute(){
  return window.location.hash.replace(/^#/, "").toLowerCase();
}

function loadLabRuntime(){
  if(currentRoute() !== LAB_ROUTE) return Promise.resolve(false);
  if(!labRuntimePromise){
    labRuntimePromise = import("./academy-trial.js?v=sprint-c3-2-lab-only-route-ownership-20260721")
      .then(() => true)
      .catch(error => {
        labRuntimePromise = null;
        console.error("[PitchIQ Lab] Experimental lab runtime failed to load", error);
        return false;
      });
  }
  return labRuntimePromise;
}

window.addEventListener("hashchange", loadLabRuntime);
loadLabRuntime();
