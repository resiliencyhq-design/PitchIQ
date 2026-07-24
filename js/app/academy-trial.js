const app = document.getElementById("app");
const nav = document.getElementById("nav");
const FEATURE_ROUTES = new Set(["lab-juggling"]);
const AVATAR_KEY = "pitchiqAcademyAvatar";
const CAMERA_CONSTRAINTS = [
  {audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}}},
  {audio:false,video:{facingMode:"environment"}},
  {audio:false,video:true}
];
let labStage = "welcome";
let stream = null;
let timerId = null;
let countdownId = null;
let elapsed = 0;
let provisionalCount = 0;
let cameraStartToken = 0;
let selectedAvatar = localStorage.getItem(AVATAR_KEY) || "captain";

function currentHash(){ return window.location.hash.replace(/^#/, "").toLowerCase(); }
function isFeatureRoute(){ return FEATURE_ROUTES.has(currentHash()); }
function playerIdentity(){
  const labels = {LW:"Left Wing",ST:"Striker",RW:"Right Wing",CAM:"Attacking Midfielder",CM:"Central Midfielder",CDM:"Defensive Midfielder",LB:"Left Back",CB:"Centre Back",RB:"Right Back",GK:"Goalkeeper"};
  const position = localStorage.getItem("pitchiqSelectedPosition") || "";
  return {
    name: localStorage.getItem("pitchiqPlayerName") || "Player",
    number: localStorage.getItem("pitchiqJerseyNumber") || "1",
    position: labels[position] || position || "Academy Player"
  };
}
function stopCamera(){
  cameraStartToken += 1;
  if(timerId) clearInterval(timerId);
  if(countdownId) clearInterval(countdownId);
  timerId = null;
  countdownId = null;
  stream?.getTracks?.().forEach(track => track.stop());
  stream = null;
  const video = document.getElementById("labVideo");
  if(video){
    video.pause?.();
    video.srcObject = null;
  }
}
function routeTo(route){ stopCamera(); window.location.hash = route; }
function returnHome(){
  stopCamera();
  const handoff = window.PitchIQApp?.enterHomeFromModule;
  if(typeof handoff === "function"){
    handoff();
    return;
  }
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  window.dispatchEvent(new CustomEvent("pitchiq:navigate", { detail: { route: "home", source: "lab-juggling" } }));
}
function shell(content){ return `<section class="screen app active trial-shell">${content}</section>`; }
function top(title, backRoute="home", allowBack=true){
  return `<header class="trial-top">${allowBack?`<button class="trial-back" type="button" data-trial-route="${backRoute}" aria-label="Back">←</button>`:"<span></span>"}<div class="trial-brand">${title.replace("IQ", "<em>IQ</em>")}</div><button class="trial-info" type="button" aria-label="Information">ⓘ</button></header>`;
}
function assessmentBrief(){
  return shell(`${top("Assessment Brief", "home")}<main class="lab-stage"><div class="lab-orb">⚽</div><span class="trial-kicker">Assessment brief</span><h1>Juggling Assessment</h1><p>Use good lighting and enough space so your full body and the ground stay visible.</p><div class="lab-facts"><div class="lab-fact"><b>◉</b><small>3–5m distance</small></div><div class="lab-fact"><b>♙</b><small>Full body in frame</small></div><div class="lab-fact"><b>☀</b><small>Good light</small></div></div><div class="lab-note"><strong>Today's assessment</strong><p>Complete your juggling attempt and record a manual reference count while camera-counting remains under development.</p></div><button class="trial-primary" type="button" data-lab-stage="guide">Continue</button></main>`);
}
function labGuide(){
  return shell(`${top("Position Guide", "home")}<main class="lab-stage"><span class="trial-kicker">Position guide</span><h1>Set the phone</h1><p>Stand 3–5 metres from the camera. Ensure your full body and the ground are visible.</p><div class="position-frame" aria-label="Player framing guide"></div><div class="distance-rule">←──── 3–5m ────→</div><button class="trial-primary" type="button" data-lab-stage="countdown">I'm ready</button></main>`);
}
function countdown(value="3"){
  return shell(`${top("Juggling Assessment", "home", false)}<main class="trial-countdown"><div><span class="trial-kicker">Get ready</span><strong id="trialCountdown">${value}</strong><p>Begin when the camera opens.</p></div></main>`);
}
function labCamera(){
  return shell(`${top("Juggling Assessment", "home")}<main class="lab-stage"><div class="lab-recording"><span><i></i>ASSESSMENT LIVE</span><b id="labTime">00:00</b></div><div class="lab-camera"><video id="labVideo" playsinline muted autoplay></video><div class="lab-camera-placeholder" id="labCameraPlaceholder">Requesting camera access…</div><div class="lab-camera-guide"></div></div><p class="lab-manual">Automatic touch detection is not active yet. Record a manual reference count during this MVP assessment.</p><div class="lab-count" id="labCount">0</div><div class="lab-count-label">Reference touches</div><button class="trial-primary" type="button" data-lab-touch style="margin:16px 0">+ Record touch</button><button class="trial-danger" type="button" data-lab-stage="result">Complete assessment</button></main>`);
}
function labResult(){
  return shell(`${top("Assessment Report", "home", false)}<main class="lab-stage"><span class="trial-kicker">Assessment report</span><h1>Assessment Complete</h1><div class="result-card"><div class="lab-count">${provisionalCount}</div><div class="lab-count-label">Reference touches</div><div class="result-meta"><div><small>Time</small><b>${formatTime(elapsed)}</b></div><div><small>Status</small><b>Completed</b></div></div></div><div class="lab-note"><strong>Coach note</strong><p>This Lab result is saved separately and does not change Academy induction progress.</p></div><button class="trial-primary" type="button" data-lab-stage="avatar">Choose a Lab avatar →</button></main>`);
}
function avatarSelection(){
  const options = [["captain","🧭"],["playmaker","⚡"],["guardian","🛡️"]];
  return shell(`${top("Lab Avatar", "home", false)}<main class="lab-stage"><span class="trial-kicker">Experiment reward</span><h1>Choose a Lab Avatar</h1><p>This selection is for the experimental juggling flow only.</p><div class="avatar-grid">${options.map(([id,icon])=>`<button class="avatar-choice ${selectedAvatar===id?"selected":""}" type="button" data-avatar="${id}" aria-label="Choose ${id}">${icon}</button>`).join("")}</div><button class="trial-primary" type="button" data-complete-lab>Return home →</button></main>`);
}
function formatTime(seconds){ return `00:${String(Math.min(99, seconds)).padStart(2,"0")}`; }
function renderFeature(){
  if(!isFeatureRoute()) return;
  document.body.classList.remove("pitchiq-splash-active");
  nav?.classList.remove("visible");
  if(labStage === "welcome") app.innerHTML = assessmentBrief();
  if(labStage === "guide") app.innerHTML = labGuide();
  if(labStage === "countdown") app.innerHTML = countdown();
  if(labStage === "camera") app.innerHTML = labCamera();
  if(labStage === "result") app.innerHTML = labResult();
  if(labStage === "avatar") app.innerHTML = avatarSelection();
  bindFeature();
}
function runCountdown(){
  const sequence = ["3","2","1","GO"];
  let index = 0;
  if(countdownId) clearInterval(countdownId);
  countdownId = window.setInterval(() => {
    index += 1;
    const el = document.getElementById("trialCountdown");
    if(index < sequence.length){ if(el) el.textContent = sequence[index]; return; }
    clearInterval(countdownId);
    countdownId = null;
    labStage = "camera";
    renderFeature();
    startCamera();
  }, 850);
}
function bindFeature(){
  app.querySelectorAll("[data-trial-route]").forEach(button => button.addEventListener("click", () => {
    if(button.dataset.trialRoute === "home") returnHome();
    else routeTo(button.dataset.trialRoute);
  }));
  app.querySelectorAll("[data-lab-stage]").forEach(button => button.addEventListener("click", () => {
    if(button.dataset.labStage === "result") stopCamera();
    labStage = button.dataset.labStage;
    renderFeature();
    if(labStage === "countdown") runCountdown();
  }));
  app.querySelectorAll("[data-avatar]").forEach(button => button.addEventListener("click", () => {
    selectedAvatar = button.dataset.avatar;
    localStorage.setItem(AVATAR_KEY, selectedAvatar);
    app.querySelectorAll("[data-avatar]").forEach(choice => choice.classList.toggle("selected", choice.dataset.avatar === selectedAvatar));
  }));
  app.querySelector("[data-complete-lab]")?.addEventListener("click", () => {
    localStorage.setItem(AVATAR_KEY, selectedAvatar);
    returnHome();
  });
  app.querySelector("[data-lab-touch]")?.addEventListener("click", () => {
    provisionalCount += 1;
    const counter = document.getElementById("labCount");
    if(counter) counter.textContent = provisionalCount;
    navigator.vibrate?.(20);
  });
}
function delay(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }
function setCameraMessage(message, state="loading"){
  const placeholder = document.getElementById("labCameraPlaceholder");
  if(!placeholder) return;
  placeholder.hidden = false;
  placeholder.textContent = message;
  placeholder.dataset.cameraState = state;
}
function prepareVideo(video){
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.muted = true;
  video.autoplay = true;
}
async function requestCamera(){
  if(!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access is not available in this browser.");
  let lastError = null;
  for(const constraints of CAMERA_CONSTRAINTS){
    try { return await navigator.mediaDevices.getUserMedia(constraints); }
    catch(error){ lastError = error; }
  }
  throw lastError || new Error("Unable to start the camera.");
}
async function startCamera(){
  const token = ++cameraStartToken;
  const video = document.getElementById("labVideo");
  if(!video) return;
  stopCamera();
  prepareVideo(video);
  setCameraMessage("Requesting camera access…");
  try{
    stream = await requestCamera();
    if(token !== cameraStartToken){ stream.getTracks().forEach(track => track.stop()); return; }
    video.srcObject = stream;
    await video.play();
    const placeholder = document.getElementById("labCameraPlaceholder");
    if(placeholder) placeholder.hidden = true;
    elapsed = 0;
    timerId = window.setInterval(() => {
      elapsed += 1;
      const timer = document.getElementById("labTime");
      if(timer) timer.textContent = formatTime(elapsed);
    }, 1000);
  }catch(error){
    setCameraMessage(error?.message || "Camera could not start.", "error");
  }
}
function handleRoute(){
  if(!isFeatureRoute()) stopCamera();
  renderFeature();
}
window.addEventListener("hashchange", handleRoute);
window.addEventListener("pagehide", stopCamera);
document.addEventListener("visibilitychange", () => { if(document.hidden) stopCamera(); });
handleRoute();