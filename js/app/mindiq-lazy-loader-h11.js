let loading=null;

function isMindIqRoute(){ return location.hash.replace(/^#/,"").split("?")[0] === "mindiq-world"; }

async function loadMindIq(){
  if(!loading) loading=Promise.all([
    import("./mindiq-engine-h11.js?v=sprint-h11-mindiq-world-20260721"),
    import("./mindiq-world-h11.js?v=sprint-h11-mindiq-world-20260721"),
  ]);
  const [,world]=await loading;
  let link=document.getElementById("pitchiq-mindiq-h11-css");
  if(!link){ link=document.createElement("link"); link.id="pitchiq-mindiq-h11-css"; link.rel="stylesheet"; link.href="css/mindiq-world-h11.css?v=sprint-h11-mindiq-world-20260721"; document.head.appendChild(link); }
  world.renderMindIqWorld();
}

function route(){ if(isMindIqRoute()) loadMindIq().catch(error=>console.error("[PitchIQ MindIQ]",error)); }
if(typeof window!=="undefined"){ window.addEventListener("hashchange",route); window.addEventListener("pageshow",route); route(); }
