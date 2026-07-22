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
  return shell(`${top("PitchIQ", "home", false)}<article class="trial-hero"><div class="trial-shield">★</div><span class="trial-kicker">Welcome to PitchIQ Academy</span><h1>Let’s get you <em>match ready</em></h1><p>Meet your coach, learn the PitchIQ tools and play a few quick challenges.</p><div class="trial-identity-strip"><div><small>Player</small><b>${player.name.toUpperCase()}</b></div><div><small>Number</small><b>#${player.number}</b></div><div><small>Position</small><b>${player.position}</b></div></div><ul class="trial-benefits"><li><i>◷</i><span><b>Meet your coach</b><small>Hear the cues that guide training</small></span></li><li><i>◉</i><span><b>Learn the camera</b><small>Set up your training space</small></span></li><li><i>⚽</i><span><b>Play mini challenges</b><small>Learn by playing</small></span></li></ul><button class="trial-primary" type="button" data-trial-route="academy-trials">Enter the Academy →</button></article>`);
}
function orientationPreview(){
  const player = playerIdentity();
  return shell(`<main class="orientation-story" aria-labelledby="orientationStoryTitle"><div class="orientation-brand">PITCH<em>IQ</em></div><section class="orientation-copy"><h1 id="orientationStoryTitle">LET’S GET YOU<br><em>MATCH READY</em></h1></section><section class="orientation-hero" aria-label="PitchIQ tactical orientation preview"><div class="orientation-art-placeholder" aria-hidden="true"></div><div class="orientation-tactical-label orientation-scan"><strong>SCAN</strong><span>See more<br>of the game</span></div><div class="orientation-tactical-label orientation-decide"><strong>DECIDE</strong><span>Make the right<br>choice faster</span></div><div class="orientation-tactical-label orientation-move"><strong>MOVE</strong><span>Create space<br>and support</span></div><div class="orientation-role-card"><div class="orientation-role-jersey">${player.number}</div><div><small>YOUR ROLE</small><strong>${player.position}</strong><span>${orientationRoleLine(player.position)}</span></div></div></section><section class="orientation-steps" aria-label="Orientation steps"><article><div class="orientation-step-number">1</div><div class="orientation-step-icon">●</div><h2>Meet your coach</h2><p>Hear the cues that<br>guide training</p></article><span class="orientation-step-arrow" aria-hidden="true">→</span><article><div class="orientation-step-number">2</div><div class="orientation-step-icon">◉</div><h2>Learn the camera</h2><p>Set up your<br>training space</p></article><span class="orientation-step-arrow" aria-hidden="true">→</span><article><div class="orientation-step-number">3</div><div class="orientation-step-icon">⚡</div><h2>Play a quick challenge</h2><p>Learn by<br>playing</p></article></section><button class="trial-primary orientation-primary" type="button" data-complete-orientation>◉ &nbsp; BEGIN MISSION &nbsp; →</button><p class="orientation-footer">3 SHORT MISSIONS. 1 <em>BIGGER YOU.</em></p></main>`);
}
function orientationRoleLine(position){
  const lines = {
    "Goalkeeper":"Lead. Organize. Protect.",
    "Centre Back":"Read. Organize. Protect.",
    "Left Back":"Scan. Support. Recover.",
    "Right Back":"Scan. Support. Recover.",
    "Defensive Midfielder":"Screen. Link. Control.",
    "Central Midfielder":"Scan. Connect. Control.",
    "Attacking Midfielder":"Create. Link. Lead.",
    "Left Wing":"Stretch. Attack. Create.",
    "Right Wing":"Stretch. Attack. Create.",
    "Striker":"Move. Finish. Lead."
  };
  return lines[position] || "See. Calm. Improve.";
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
  return shell(`${top("PitchIQ Academy", "academy-trials", false)}<main class="academy-accepted"><div class="trial-shield">★</div><span class="trial-kicker">Orientation complete</span><h1>ACADEMY<br><em>ACCEPTED</em></h1><p>Welcome, ${player.name}. You know the tools and your coach is ready.</p><button class="trial-primary" type="button" data-lab-stage="avatar">Choose your avatar →</button></main>`);
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
  if(route === "academy-trials") app.innerHTML = orientationPreview();
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
  app.querySelector("[data-complete-orientation]")?.addEventListener("click", () => {
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
  const token = ++cameraStartToken;
  const video = document.getElementById("labVideo");
  if(!video || !navigator.mediaDevices?.getUserMedia){
    setCameraMessage("Camera access is unavailable in this browser.", "error");
    return;
  }
  prepareVideo(video);
  for(const constraints of CAMERA_CONSTRAINTS){
    if(token !== cameraStartToken) return;
    try{
      setCameraMessage("Requesting camera access…");
      const nextStream = await navigator.mediaDevices.getUserMedia(constraints);
      if(token !== cameraStartToken){ nextStream.getTracks().forEach(track => track.stop()); return; }
      stream = nextStream;
      video.srcObject = stream;
      await playVideo(video);
      await waitForFrame(video, token);
      const placeholder = document.getElementById("labCameraPlaceholder");
      if(placeholder) placeholder.hidden = true;
      timerId = setInterval(() => {
        elapsed += 1;
        const label = document.getElementById("labTime");
        if(label) label.textContent = formatTime(elapsed);
      }, 1000);
      return;
    }catch(error){
      stream?.getTracks?.().forEach(track => track.stop());
      stream = null;
    }
  }
  setCameraMessage("Camera could not start. Check Safari permissions and try again.", "error");
}
window.addEventListener("hashchange", renderFeature);
renderFeature();
