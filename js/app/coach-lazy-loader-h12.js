const ROUTE="coach-world";
const STYLE_ID="pitchiq-coach-world-h12-css";
function ensureStyle(){ let link=document.getElementById(STYLE_ID); if(!link){ link=document.createElement("link"); link.id=STYLE_ID; link.rel="stylesheet"; link.href="css/coach-world-h12.css?v=sprint-h12-coach-intelligence-20260721"; document.head.appendChild(link); } }
async function render(){ if(location.hash.replace(/^#/,"").split("/")[0]!==ROUTE) return false; ensureStyle(); const module=await import("./coach-world-h12.js?v=sprint-h12-coach-intelligence-20260721"); return module.renderCoachWorld(document); }
if(typeof window!=="undefined"){ window.addEventListener("hashchange",render); window.addEventListener("pageshow",render); render(); }
export { render as renderCoachRoute };