const MENTAL_IMAGERY_ROUTE = "lab-mental-imagery";
let runtimePromise = null;

function currentRoute() {
  return window.location.hash.replace(/^#/, "").toLowerCase();
}

function ensureStylesheet() {
  const id = "pitchiq-mental-imagery-lab-css";
  const href = "css/mental-imagery-lab.css?v=sprint-l2-mental-imagery-lab-20260721";
  let link = document.getElementById(id);
  if (link) {
    if (link.getAttribute("href") !== href) link.setAttribute("href", href);
    return;
  }
  link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadMentalImageryRuntime() {
  if (currentRoute() !== MENTAL_IMAGERY_ROUTE) return Promise.resolve(false);
  ensureStylesheet();
  if (!runtimePromise) {
    runtimePromise = import("../lab/mental-imagery.js?v=sprint-l2-mental-imagery-lab-20260721")
      .then(() => true)
      .catch(error => {
        runtimePromise = null;
        console.error("[PitchIQ Lab] Mental Imagery runtime failed to load", error);
        return false;
      });
  }
  return runtimePromise.then(loaded => {
    if (loaded) window.PitchIQMentalImagery?.render?.();
    return loaded;
  });
}

window.addEventListener("hashchange", loadMentalImageryRuntime);
window.addEventListener("pageshow", loadMentalImageryRuntime);
loadMentalImageryRuntime();
