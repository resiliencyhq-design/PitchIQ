import { createAutoJugglerDetector } from "./auto-juggler-detector.js?v=sprint-10-0b-ball-tracking-20260717";

const app=document.getElementById("app");
const nav=document.getElementById("nav");
let stream=null,countdownTimer=null,previousMarkup="",previousNavVisible=false,mounted=false,detector=null,tracking=false;

function cameraSupported(){return Boolean(navigator.mediaDevices?.getUserMedia);}
function stopCountdown(){if(countdownTimer)clearInterval(countdownTimer);countdownTimer=null;}
function stopTracking(){tracking=false;detector?.stop?.();detector?.reset?.();updateDiagnostics();}
export function stopCamera(){stopTracking();if(stream){stream.getTracks().forEach(track=>track.stop());stream=null;}const video=document.getElementById("autoJugglerVideo");if(video)video.srcObject=null;document.body.classList.remove("auto-juggler-camera-active");}
function setStatus(message,state="idle"){const status=document.getElementById("autoJugglerStatus");if(!status)return;status.textContent=message;status.dataset.state=state;}
function showPermissionHelp(error){const denied=error?.name==="NotAllowedError"||error?.name==="SecurityError";setStatus(denied?"Camera access is blocked. Allow camera access in Safari Settings, then try again.":"The camera could not start. Check that no other app is using it, then try again.","error");}
function setText(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
function updateDiagnostics(result={}){
  const confidence=Math.round((result.confidence||0)*100);
  const status=!tracking?"READY":result.detected?"BALL DETECTED":result.confidence>0?"TRACKING…":result.missedFrames>8?"BALL LOST":"SEARCHING";
  setText("autoJugglerTrackStatus",status);setText("autoJugglerConfidence",`${confidence}%`);setText("autoJugglerDirection",result.direction||"—");
  setText("autoJugglerMovement",result.speed?`${(result.speed*1000).toFixed(1)} u/s`:"—");setText("autoJugglerFrames",String(result.trackedFrames||0));
  const panel=document.getElementById("autoJugglerDiagnostics");if(panel)panel.dataset.state=status.toLowerCase().replace(/[^a-z]+/g,"-");
}
function ensureDetector(){
  const video=document.getElementById("autoJugglerVideo"),overlayCanvas=document.getElementById("autoJugglerOverlay"),processingCanvas=document.getElementById("autoJugglerProcessing");
  if(!video||!overlayCanvas||!processingCanvas)return null;
  detector?.destroy?.();
  detector=createAutoJugglerDetector({video,overlayCanvas,processingCanvas,onDetection:updateDiagnostics});
  return detector;
}
export async function startCamera(){
  if(!cameraSupported()){setStatus("This browser does not support camera access.","error");return false;}
  stopCamera();setStatus("Starting rear camera…","loading");
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}}});
    const video=document.getElementById("autoJugglerVideo");if(!video){stopCamera();return false;}
    video.srcObject=stream;await video.play();ensureDetector();document.body.classList.add("auto-juggler-camera-active");
    setStatus("Camera ready. Keep the ball inside the tracking zone.","ready");document.getElementById("autoJugglerStart")?.removeAttribute("disabled");updateDiagnostics();return true;
  }catch(error){stopCamera();showPermissionHelp(error);return false;}
}
function renderShell(){return `<section class="screen app auto-juggler-shell active" id="autoJuggler" aria-labelledby="autoJugglerTitle">
<header class="auto-juggler-header"><button type="button" class="auto-juggler-back" data-auto-juggler-action="back" aria-label="Return to Home">←</button><div><span>PitchIQ Lab</span><h1 id="autoJugglerTitle">Auto Juggler</h1></div><span class="auto-juggler-beta">BETA</span></header>
<main class="auto-juggler-main"><div class="auto-juggler-video-wrap"><video id="autoJugglerVideo" playsinline muted autoplay></video><canvas id="autoJugglerOverlay" class="auto-juggler-overlay" aria-hidden="true"></canvas><canvas id="autoJugglerProcessing" class="auto-juggler-processing" aria-hidden="true"></canvas><div class="auto-juggler-frame" aria-hidden="true"><span></span></div><div class="auto-juggler-countdown" id="autoJugglerCountdown" hidden></div></div>
<p id="autoJugglerStatus" class="auto-juggler-status" data-state="idle" role="status" aria-live="polite">Place your phone upright, stand back, and keep your full body and ball visible.</p>
<section class="auto-juggler-diagnostics" id="autoJugglerDiagnostics" aria-label="Ball tracking diagnostics"><div><small>Tracking status</small><b id="autoJugglerTrackStatus">READY</b></div><div><small>Confidence</small><b id="autoJugglerConfidence">0%</b></div><div><small>Direction</small><b id="autoJugglerDirection">—</b></div><div><small>Movement</small><b id="autoJugglerMovement">—</b></div><div><small>Tracked frames</small><b id="autoJugglerFrames">0</b></div></section>
<ol class="auto-juggler-setup"><li><b>1</b><span>Prop the phone upright</span></li><li><b>2</b><span>Keep the ball in frame</span></li><li><b>3</b><span>Start after the countdown</span></li></ol>
<div class="auto-juggler-actions"><button type="button" class="auto-juggler-secondary" data-auto-juggler-action="camera">ENABLE CAMERA</button><button type="button" class="primary mega" id="autoJugglerStart" data-auto-juggler-action="countdown" disabled>START TRACKING</button></div><p class="auto-juggler-privacy">Diagnostic only. No juggle count or score is saved.</p></main></section>`;}
function beginCountdown(){
  if(!stream)return setStatus("Enable the camera first.","error");stopTracking();stopCountdown();const overlay=document.getElementById("autoJugglerCountdown"),start=document.getElementById("autoJugglerStart");if(!overlay)return;if(start)start.disabled=true;overlay.hidden=false;
  const sequence=["3","2","1","GO"];let index=0;overlay.textContent=sequence[index];
  countdownTimer=setInterval(()=>{index++;if(index<sequence.length){overlay.textContent=sequence[index];return;}stopCountdown();setTimeout(()=>{if(overlay)overlay.hidden=true;if(start){start.disabled=false;start.textContent="RESTART TRACKING";}tracking=true;detector?.reset?.();detector?.start?.();setStatus("Tracking active. Move the ball inside the detection zone.","ready");updateDiagnostics({missedFrames:0});},650);},850);
}
function restoreHome(){stopCountdown();stopCamera();detector?.destroy?.();detector=null;mounted=false;document.body.classList.remove("auto-juggler-open");if(previousMarkup)app.innerHTML=previousMarkup;if(nav)nav.classList.toggle("visible",previousNavVisible);window.dispatchEvent(new HashChangeEvent("hashchange"));}
export function mountAutoJuggler(){if(!app||mounted)return;mounted=true;previousMarkup=app.innerHTML;previousNavVisible=nav?.classList.contains("visible")||false;document.body.classList.add("auto-juggler-open");if(nav)nav.classList.remove("visible");app.innerHTML=renderShell();app.scrollTop=0;updateDiagnostics();}
function injectLabTile(){const grid=document.querySelector("#home .home-actions-grid");if(!grid||grid.querySelector("[data-auto-juggler-launch]"))return;const tile=document.createElement("button");tile.type="button";tile.className="home-action-card auto-juggler-home-card";tile.dataset.autoJugglerLaunch="true";tile.innerHTML=`<b>◉</b><span>PitchIQ Lab</span><small>Auto Juggler</small>`;grid.appendChild(tile);}
document.addEventListener("click",event=>{const launch=event.target.closest("[data-auto-juggler-launch]");if(launch){event.preventDefault();mountAutoJuggler();return;}const action=event.target.closest("[data-auto-juggler-action]")?.dataset.autoJugglerAction;if(!action)return;if(action==="back")restoreHome();if(action==="camera")startCamera();if(action==="countdown")beginCountdown();});
window.addEventListener("pagehide",()=>{stopCountdown();stopCamera();});document.addEventListener("visibilitychange",()=>{if(document.hidden)stopCamera();});
new MutationObserver(injectLabTile).observe(app,{childList:true,subtree:true});injectLabTile();
