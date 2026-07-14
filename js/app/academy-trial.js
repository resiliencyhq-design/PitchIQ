const app = document.getElementById("app");
const nav = document.getElementById("nav");
const FEATURE_ROUTES = new Set(["academy-trial", "academy-trials", "lab-juggling"]);
let labStage = "welcome";
let stream = null;
let timerId = null;
let elapsed = 0;
let provisionalCount = 0;

function currentHash(){ return window.location.hash.replace(/^#/, "").toLowerCase(); }
function isFeatureRoute(){ return FEATURE_ROUTES.has(currentHash()); }
function stopCamera(){
  if(timerId) clearInterval(timerId);
  timerId = null;
  stream?.getTracks?.().forEach(track => track.stop());
  stream = null;
}
function routeTo(route){
  stopCamera();
  window.location.hash = route;
}
function shell(content){
  return `<section class="screen app active trial-shell">${content}</section>`;
}
function top(title, backRoute="home"){
  return `<header class="trial-top"><button class="trial-back" type="button" data-trial-route="${backRoute}" aria-label="Back">←</button><div class="trial-brand">${title.replace("IQ", "<em>IQ</em>")}</div><button class="trial-info" type="button" aria-label="Information">ⓘ</button></header>`;
}
function intro(){
  return shell(`${top("PitchIQ", "home")}<article class="trial-hero"><div class="trial-shield">★</div><span class="trial-kicker">Academy assessment</span><h1>Academy <em>Trial</em></h1><p>Prove how you see, think and play.</p><ul class="trial-benefits"><li><i>◷</i><span><b>Short trials</b><small>30–90 seconds each</small></span></li><li><i>⚽</i><span><b>Test your football IQ</b><small>Decisions, vision and awareness</small></span></li><li><i>☆</i><span><b>Earn XP and badges</b><small>Progression remains locked during the prototype</small></span></li></ul><button class="trial-primary" type="button" data-trial-route="academy-trials">Enter the trial →</button></article>`);
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
  return shell(`${top("Academy Trial", "academy-trial")}<div class="trial-list-head"><h1>Academy Trial</h1><p>Complete trials. Earn XP. Level up.</p></div><span class="trial-section-label">Trials</span><div class="trial-grid">${cards}</div><span class="trial-section-label">Experimental Lab</span><button class="trial-card experimental" type="button" data-trial-route="lab-juggling"><span class="trial-card-icon">⚗</span><span><strong>Juggling Challenge</strong><small>Experimental camera test. Auto-counting is not yet active.</small></span><span class="trial-new">NEW</span></button><button class="trial-secondary" type="button" data-trial-route="home">Back to Academy</button>`);
}
function labWelcome(){
  return shell(`${top("Juggling Challenge", "academy-trials")}<main class="lab-stage"><div class="lab-orb">⚗</div><span class="trial-kicker">Experimental feature</span><h1>Juggling Challenge</h1><p>This feature is in development. Results may not be accurate. Use it in good lighting with enough space.</p><div class="lab-facts"><div class="lab-fact"><b>◉</b><small>3–5m distance</small></div><div class="lab-fact"><b>♙</b><small>Full body in frame</small></div><div class="lab-fact"><b>☀</b><small>Good light</small></div></div><div class="lab-note"><strong>What we're testing</strong><p>Can the camera see the player and ball consistently enough to support future automatic juggling counts?</p></div><button class="trial-primary" type="button" data-lab-stage="guide">Continue</button></main>`);
}
function labGuide(){
  return shell(`${top("Position Guide", "academy-trials")}<main class="lab-stage"><span class="trial-kicker">Position guide</span><h1>Set the phone</h1><p>Stand 3–5 metres from the camera. Ensure your full body and the ground are visible.</p><div class="position-frame" aria-label="Player framing guide"></div><div class="distance-rule">←──── 3–5m ────→</div><button class="trial-primary" type="button" data-lab-stage="camera">I'm ready</button></main>`);
}
function labCamera(){
  return shell(`${top("Juggling Test", "academy-trials")}<main class="lab-stage"><div class="lab-recording"><span><i></i>CAMERA TEST</span><b id="labTime">00:00</b></div><div class="lab-camera"><video id="labVideo" playsinline muted autoplay></video><div class="lab-camera-placeholder" id="labCameraPlaceholder">Allow camera access to begin the feasibility test.</div><div class="lab-camera-guide"></div></div><p class="lab-manual">Automatic ball and touch detection is not active in this shell. Tap below to record a manual reference count while testing framing.</p><div class="lab-count" id="labCount">0</div><div class="lab-count-label">Reference touches</div><button class="trial-primary" type="button" data-lab-touch style="margin:16px 0">+ Record touch</button><button class="trial-danger" type="button" data-lab-stage="result">End test</button></main>`);
}
function labResult(){
  return shell(`${top("Result", "academy-trials")}<main class="lab-stage"><span class="trial-kicker">Provisional result</span><div class="result-card"><div class="lab-count">${provisionalCount}</div><div class="lab-count-label">Reference touches</div><div class="result-meta"><div><small>Time</small><b>${formatTime(elapsed)}</b></div><div><small>Confidence</small><b>Not scored</b></div></div></div><div class="lab-note"><strong>Spike status</strong><p>This version validates camera access, framing and the trial flow. Computer-vision counting remains the next technical spike.</p></div><button class="trial-primary" type="button" data-lab-stage="guide">Retry test</button><button class="trial-secondary" type="button" data-trial-route="academy-trials">Back to trials</button></main>`);
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
    if(labStage === "welcome") app.innerHTML = labWelcome();
    if(labStage === "guide") app.innerHTML = labGuide();
    if(labStage === "camera") app.innerHTML = labCamera();
    if(labStage === "result") app.innerHTML = labResult();
  }
  bindFeature();
}
function bindFeature(){
  app.querySelectorAll("[data-trial-route]").forEach(button => button.addEventListener("click", () => routeTo(button.dataset.trialRoute)));
  app.querySelectorAll("[data-lab-stage]").forEach(button => button.addEventListener("click", () => {
    if(button.dataset.labStage === "result") stopCamera();
    labStage = button.dataset.labStage;
    renderFeature();
    if(labStage === "camera") startCamera();
  }));
  app.querySelector("[data-lab-touch]")?.addEventListener("click", () => {
    provisionalCount += 1;
    const counter = document.getElementById("labCount");
    if(counter) counter.textContent = provisionalCount;
    navigator.vibrate?.(20);
  });
}
async function startCamera(){
  elapsed = 0;
  provisionalCount = 0;
  const video = document.getElementById("labVideo");
  const placeholder = document.getElementById("labCameraPlaceholder");
  try{
    stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:false});
    if(video){ video.srcObject = stream; await video.play(); }
    if(placeholder) placeholder.hidden = true;
    timerId = window.setInterval(() => {
      elapsed += 1;
      const timer = document.getElementById("labTime");
      if(timer) timer.textContent = formatTime(elapsed);
    },1000);
  }catch(error){
    if(placeholder) placeholder.textContent = "Camera access was unavailable. Check Safari camera permissions and retry.";
    console.warn("[PitchIQ Lab] Camera unavailable", error);
  }
}
function injectHomeEntry(){
  if(currentHash() && isFeatureRoute()) return;
  const grid = document.querySelector(".home-v7-grid");
  if(!grid || grid.querySelector(".home-trial-entry")) return;
  const card = document.createElement("button");
  card.type = "button";
  card.className = "home-trial-entry";
  card.innerHTML = `<span class="home-trial-entry-inner"><span><span>New academy experience</span><strong>Academy Trial</strong><small>Test how you see, think and play.</small></span><b>→</b></span>`;
  card.addEventListener("click", () => routeTo("academy-trial"));
  grid.appendChild(card);
}
window.addEventListener("hashchange", () => {
  if(isFeatureRoute()) renderFeature();
  else { stopCamera(); setTimeout(injectHomeEntry, 0); }
});
new MutationObserver(() => {
  if(isFeatureRoute()) return;
  injectHomeEntry();
}).observe(app, {childList:true,subtree:true});
if(isFeatureRoute()) renderFeature(); else injectHomeEntry();