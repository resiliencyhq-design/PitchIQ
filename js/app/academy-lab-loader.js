import "./mental-imagery-lab-loader.js?v=sprint-l2-mental-imagery-lab-20260721";

const LAB_ROUTE = "lab-juggling";
const LAB_RETURN_ROUTE = "home";
let labRuntimePromise = null;

function currentRoute(){
  return window.location.hash.replace(/^#/, "").toLowerCase();
}

function openAutoJuggler(){
  if(currentRoute() !== LAB_ROUTE || document.getElementById("autoJuggler")) return false;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.hidden = true;
  trigger.setAttribute("data-auto-juggler-open", "true");
  document.body.appendChild(trigger);
  trigger.click();
  trigger.remove();
  return Boolean(document.getElementById("autoJuggler"));
}

function closeAutoJuggler(){
  const back = document.querySelector("#autoJuggler [data-auto-juggler-action='back']");
  if(back) back.click();
}

function loadLabRuntime(){
  if(currentRoute() !== LAB_ROUTE){
    closeAutoJuggler();
    return Promise.resolve(false);
  }

  if(!labRuntimePromise){
    labRuntimePromise = import("../lab/auto-juggler-camera.js?v=sprint-lab-auto-juggler-route-authority-20260721")
      .then(() => true)
      .catch(error => {
        labRuntimePromise = null;
        console.error("[PitchIQ Lab] Auto Juggler runtime failed to load", error);
        return false;
      });
  }

  return labRuntimePromise.then(loaded => {
    if(loaded) openAutoJuggler();
    return loaded;
  });
}

document.addEventListener("click", event => {
  const back = event.target.closest?.("#autoJuggler [data-auto-juggler-action='back']");
  if(!back || currentRoute() !== LAB_ROUTE) return;

  event.preventDefault();
  window.location.hash = LAB_RETURN_ROUTE;
}, true);

window.addEventListener("hashchange", loadLabRuntime);
loadLabRuntime();
