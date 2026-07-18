const app = document.getElementById("app");
const nav = document.getElementById("nav");
const FEATURE_ROUTES = new Set(["academy-trial", "academy-trials", "lab-juggling"]);
const ACADEMY_ACCEPTED_KEY = "pitchiqAcademyAccepted";
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
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);
  window.location.reload();
}
function shell(content){ return `<section class="screen app active trial-shell">${content}</section>`; }
function top(title, backRoute="home", allowBack=true){
  return `<header class="trial-top">${allowBack?`<button class="trial-back" type="button" data-trial-route="${backRoute}" aria-label="Back">←</button>`:"<span></span>"}<div class="trial-brand">${title.replace("IQ", "<em>IQ</em>")}</div><button class="trial-info" type="button" aria-label="Information">ⓘ</button></header>`;
}
function intro(){
  const player = playerIdentity();
  return shell(`${top("PitchIQ", "home", false)}<article class="trial-hero"><div class="trial-shield">★</div><span class="trial-kicker">Welcome to PitchIQ Academy</span><h1>Begin your <em>first assessment</em></h1><p>Every academy player completes one assessment before training begins.</p><div class="trial-identity-strip"><div><small>Player</small><b>${player.name.toUpperCase()}</b></div><div><small>Number</small><b>#${player.number}</b></div><div><small>Position</small><b>${player.position}</b></div></div><ul class="trial-benefits"><li><i>◷</i><span><b>Short assessment</b><small>30–90 seconds</small></span></li><li><i>⚽</i><span><b>Football intelligence</b><small>Decisions, vision and awareness</small></span></li><li><i>☆</i><span><b>Earn your academy place</b><small>Your Home hub unlocks after completion</small></span></li></ul><button class="trial-primary" type="button" data-trial-route="academy-trials">Begin first assessment →</button></article>`);
}
const trials = [
  ["◉","Scanning","Find the best option before the pass arrives."],
  ["◷","Decision Speed","Make the right decision in less time."],
  ["♢","Defensive Shape","Place yourself in the best position to defend."],
  ["↯","Transition Reaction","React quickly when possession changes."],
  ["◎","Finishing Vision","Pick the right target and create the chance."]
];
function trialList(){
  const cards = trials.map(([icon,name,copy]) => `<button class="trial-card" type="button" disabled><span class="trial-card-icon">${icon}</span><span><strong>${name}</strong><small>${copy}</small></span><span class="lock">⌑</span></button>`).join("");
  const skipCard = `<button class="trial-card available" type="button" data-skip-academy-trial><span class="trial-card-icon">→</span><span><strong>Skip Trial for Now</strong><small>Trial activities are still being prepared. Continue into the Academy.</small></span><span class="trial-new">CONTINUE</span></button>`;
  return shell(`${top("Academy Assessment", "academy-trial")}<div class="trial-list-head"><span class="trial-kicker">First assessment</span><h1>Choose Your First Assessment</h1><p>Complete one assessment to earn your place in the Academy.</p></div><span class="trial-section-label">Coming soon</span><div class="trial-grid">${cards}${skipCard}</div>`);
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
  return shell(`${top("Assessment Report", "home", false)}<main class="lab-stage"><span class="trial-kicker">Academy assessment report</span><h1>Assessment Complete</h1><div class="result-card"><div class="lab-count">${provisionalCount}</div><div class="lab-count-label">Reference touches</div><div class="result-meta"><div><small>Time</small><b>${formatTime(elapsed)}</b></div><div><small>Status</small><b>Completed</b></div></div></div><div class="lab-note"><strong>Coach note</strong><p>Your first result establishes a starting point. Future assessments will add automatic counting and deeper feedback.</p></div><button class="trial-primary" type="button" data-lab-stage="accepted">Continue →</button></main>`);
}
function academyAccepted(){
  const player = playerIdentity();
  return shell(`${top("PitchIQ Academy", "academy-trials", false)}<main class="academy-accepted"><div class="trial-shield">★</div><span class="trial-kicker">Assessment complete</span><h1>ACADEMY<br><em>ACCEPTED</em></h1><p>Congratulations, ${player.name}. You have earned your place in PitchIQ Academy.</p><button class="trial-primary" type="button" data-lab-stage="avatar">Choose your avatar →</button></main>`);
}
function avatarSelection(){
  const options = [["captain","🧭"],["playmaker","⚡"],["guardian","🛡️"]];
  return shell(`${top("Academy Avatar", "academy-trials", false)}<main class="lab-stage"><span class="trial-kicker">Identity reward</span><h1>Choose Your Avatar</h1><p>Select the academy identity that represents how you play.</p><div class="avatar-grid">${options.map(([id,icon])=>`<button class="avatar-choice ${selectedAvatar===id?"selected":""}" type="button" data-avatar="${id}" aria-label="Choose ${id}">${icon}</button>`).join("")}</div><button class="trial-primary" type="button" data-complete-academy>Welcome home →</button></main>`);
}
function formatTime(seconds){ return `00:${String(Math.min(99, seconds)).padStart(2,"0")}`; }
function renderFeature(){
  if(!isFeatureRoute()) return;
  document.body.classList.remove("pitchiq-splash-active");
  nav?.classList.remove("visible");
  const route = currentHash();
  if(route === "academy-trial") app.innerHTML = intro();
  if(route === "academy-trials") app.innerHTML = trialList();
  if(route === "lab-juggling"){
    if(labStage === "welcome") app.innerHTML = assessmentBrief();
    if(labStage === "guide") app.innerHTML = labGuide();
    if(labStage === "countdown") app.innerHTML = countdown();
    if(labStage === "camera") app.innerHTML = labCamera();
    if(labStage === "result") app.innerHTML = labResult();
    if(labStage === "accepted") app.innerHTML = academyAccepted();
    if(labStage === "avatar") app.innerHTML = avatarSelection();
  }
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
  app.querySelector("[data-skip-academy-trial]")?.addEventListener("click", () => {
    labStage = "accepted";
    routeTo("lab-juggling");
  });
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
  app.querySelector("[data-complete-academy]")?.addEventListener("click", () => {
    localStorage.setItem(ACADEMY_ACCEPTED_KEY, "true");
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
  video.playsInline = true;
  video.muted = true;
  video.autoplay = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
}
async function playVideo(video){
  try{ await video.play(); }
  catch(error){ await delay(250); await video.play(); }
}
function waitForFrame(video, token, timeoutMs=5000){
  return new Promise((resolve,reject) => {
    let settled = false;
    let rafId = 0;
    const timeoutId = setTimeout(() => finish(false), timeoutMs);
    function usable(){
      return token === cameraStartToken && document.contains(video) && video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.paused;
    }
    function finish(ok){
      if(settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if(rafId) cancelAnimationFrame(rafId);
      ok ? resolve(true) : reject(new Error("No rendered camera frame"));
    }
    if(typeof video.requestVideoFrameCallback === "function"){
      video.requestVideoFrameCallback(() => finish(usable()));
      return;
    }
    function check(){
      if(usable()) return finish(true);
      if(token !== cameraStartToken || !document.contains(video)) return finish(false);
      rafId = requestAnimationFrame(check);
    }
    check();
  });
}
async function startCamera(){
  elapsed = 0;
  provisionalCount = 0;
  stopCamera();
  const token = ++cameraStartToken;
  const video = document.getElementById("labVideo");
  if(!video || !navigator.mediaDevices?.getUserMedia){
    setCameraMessage("Camera access is not supported in this browser.", "error");
    return false;
  }
  prepareVideo(video);
  let lastError = null;
  for(const constraints of CAMERA_CONSTRAINTS){
    if(token !== cameraStartToken || !document.contains(video)) return false;
    let candidate = null;
    try{
      setCameraMessage("Connecting to rear camera…");
      candidate = await navigator.mediaDevices.getUserMedia(constraints);
      if(token !== cameraStartToken){ candidate.getTracks().forEach(track => track.stop()); return false; }
      const track = candidate.getVideoTracks()[0];
      if(!track || track.readyState !== "live") throw new Error("Camera track is not live");
      video.srcObject = candidate;
      setCameraMessage("Waiting for camera image…");
      await playVideo(video);
      await waitForFrame(video, token);
      if(video.videoWidth <= 0 || video.videoHeight <= 0) throw new Error("Camera frame dimensions are zero");
      stream = candidate;
      const placeholder = document.getElementById("labCameraPlaceholder");
      if(placeholder) placeholder.hidden = true;
      document.querySelector(".lab-camera")?.classList.add("camera-ready");
      timerId = window.setInterval(() => {
        elapsed += 1;
        const timer = document.getElementById("labTime");
        if(timer) timer.textContent = formatTime(elapsed);
      },1000);
      return true;
    }catch(error){
      lastError = error;
      candidate?.getTracks?.().forEach(track => track.stop());
      if(video.srcObject === candidate) video.srcObject = null;
    }
  }
  const denied = lastError?.name === "NotAllowedError" || lastError?.name === "SecurityError";
  const message = denied
    ? "Camera permission was denied. Allow camera access in Safari settings and retry."
    : `Camera started but no image was received${lastError?.name ? ` (${lastError.name})` : ""}. Go back and retry.`;
  setCameraMessage(message, "error");
  console.warn("[PitchIQ Assessment] Camera startup failed", lastError);
  return false;
}
function injectHomeEntry(){
  if(currentHash() && isFeatureRoute()) return;
  const grid = document.querySelector(".home-v7-grid");
  if(!grid || grid.querySelector(".home-trial-entry")) return;
  const card = document.createElement("button");
  card.type = "button";
  card.className = "home-trial-entry";
  card.innerHTML = `<span class="home-trial-entry-inner"><span><span>Optional prototype area</span><strong>Experimental Lab</strong><small>Test the camera-based juggling challenge.</small></span><b>→</b></span>`;
  card.addEventListener("click", () => { labStage = "welcome"; routeTo("lab-juggling"); });
  grid.appendChild(card);
}
window.addEventListener("hashchange", () => {
  if(isFeatureRoute()) renderFeature();
  else { stopCamera(); setTimeout(injectHomeEntry, 0); }
});
window.addEventListener("pagehide", stopCamera);
document.addEventListener("visibilitychange", () => { if(document.hidden) stopCamera(); });
new MutationObserver(() => { if(isFeatureRoute()) return; injectHomeEntry(); }).observe(app, {childList:true,subtree:true});
if(isFeatureRoute()) renderFeature(); else injectHomeEntry();