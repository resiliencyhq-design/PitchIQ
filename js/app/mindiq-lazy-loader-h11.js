let loading=null;

function routeFromLocation(){ return location.hash.replace(/^#/,"").split("?")[0]; }
function isMindIqRoute(route=routeFromLocation()){ return route === "mindiq-world"; }

async function loadMindIq(route=routeFromLocation()){
  if(!isMindIqRoute(route)) return false;
  if(!loading) loading=Promise.all([
    import("./mindiq-engine-h11.js?v=sprint-h11-mindiq-world-20260721"),
    import("./mindiq-world-h11.js?v=sprint-h11-mindiq-world-20260721"),
  ]);
  const [,world]=await loading;
  let link=document.getElementById("pitchiq-mindiq-h11-css");
  if(!link){ link=document.createElement("link"); link.id="pitchiq-mindiq-h11-css"; link.rel="stylesheet"; link.href="css/mindiq-world-h11.css?v=sprint-h11-mindiq-world-20260721"; document.head.appendChild(link); }
  world.renderMindIqWorld();
  return true;
}

function route(value){ loadMindIq(value).catch(error=>console.error("[PitchIQ MindIQ]",error)); }
if(typeof window!=="undefined"){
  window.addEventListener("pitchiq:route-change", event=>route(event.detail?.route));
  window.addEventListener("pageshow", ()=>route(window.PitchIQApp?.navigation?.getCurrentRoute?.() || routeFromLocation()));
  route(window.PitchIQApp?.navigation?.getCurrentRoute?.() || routeFromLocation());
}
