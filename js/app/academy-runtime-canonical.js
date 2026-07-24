const app = document.getElementById("app");
const nav = document.getElementById("nav");
const CANONICAL_ROUTE = "academy-trial";
const ACADEMY_ACCEPTED_KEY = "pitchiqAcademyAccepted";
const AVATAR_KEY = "pitchiqAcademyAvatar";
const EMAIL_KEY = "pitchiqGuardianEmail";
const CONTRACT_KEY = "pitchiqPlayerContract";
const PLAYER_STYLE_KEY = "pitchiqPlayerStyle";
const CONTRACT_VERSION = "2026-07";

let stage = "welcome";
let reactionReady = false;
let selectedAvatar = localStorage.getItem(AVATAR_KEY) || "captain";
let selectedPlayerStyle = localStorage.getItem(PLAYER_STYLE_KEY) || "playmaker";

function route(){ return window.location.hash.replace(/^#/, "").toLowerCase(); }
function firstRun(){ return window.PitchIQApp?.firstRun || window.PitchIQApp?.getFirstRun?.(); }
function identity(){
  const labels = {LW:"Left Wing",ST:"Striker",RW:"Right Wing",CAM:"Central Attacking Midfielder",CM:"Central Midfielder",CDM:"Defensive Midfielder",LB:"Left Back",CB:"Centre Back",RB:"Right Back",GK:"Goalkeeper"};
  const position = localStorage.getItem("pitchiqSelectedPosition") || "";
  return {
    name: localStorage.getItem("pitchiqPlayerName") || "Player",
    number: localStorage.getItem("pitchiqJerseyNumber") || "1",
    position: labels[position] || position || "Academy Player"
  };
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
function shell(content){ return `<section class="screen app active trial-shell academy-runtime-canonical">${content}</section>`; }
function top(title, allowBack=false){
  return `<header class="trial-top">${allowBack?'<button class="trial-back" type="button" data-canonical-back aria-label="Back">←</button>':'<span></span>'}<div class="trial-brand">${title.replace("IQ", "<em>IQ</em>")}</div><span></span></header>`;
}
function clearIdentityOverlay(){
  document.getElementById("identity-complete-scene")?.remove();
  document.documentElement.classList.remove("identity-scene-active");
  document.body.classList.remove("identity-scene-active");
  document.querySelectorAll(".identity-scene-source").forEach(source => {
    source.classList.remove("identity-scene-source");
    source.removeAttribute("aria-hidden");
  });
}
function completeStep(step){
  const controller = firstRun();
  if(controller?.getCurrentStep?.() === step) controller.completeStep(step);
}
function resumeStage(){
  const current = firstRun()?.getCurrentStep?.();
  const map = {
    "academy-induction":"welcome",
    "meet-your-coach":"step-0",
    "meet-the-camera":"step-1",
    "practice":"step-2",
    "player-contract":"contract",
    "avatar":"avatar",
    "player-style":"player-style"
  };
  stage = map[current] || stage;
}
function welcome(){
  const player = identity();
  return shell(`<main class="orientation-story" aria-labelledby="orientationStoryTitle"><div class="orientation-brand">PITCH<em>IQ</em></div><section class="orientation-copy"><h1 id="orientationStoryTitle">LET’S GET YOU<br><em>MATCH READY</em></h1></section><section class="orientation-hero" aria-label="PitchIQ tactical orientation preview"><div class="orientation-art-placeholder" aria-hidden="true"></div><div class="orientation-tactical-label orientation-scan"><strong>SCAN</strong><span>See more<br>of the game</span></div><div class="orientation-tactical-label orientation-decide"><strong>DECIDE</strong><span>Make the right<br>choice faster</span></div><div class="orientation-tactical-label orientation-move"><strong>MOVE</strong><span>Create space<br>and support</span></div><div class="orientation-role-card"><div class="orientation-role-jersey">${player.number}</div><div><small>YOUR ROLE</small><strong>${player.position}</strong><span>${orientationRoleLine(player.position)}</span></div></div></section><section class="orientation-steps" aria-label="Orientation steps"><article><div class="orientation-step-number">1</div><div class="orientation-step-icon">●</div><h2>Meet your coach</h2><p>Hear the cues that<br>guide training</p></article><span class="orientation-step-arrow" aria-hidden="true">→</span><article><div class="orientation-step-number">2</div><div class="orientation-step-icon">◉</div><h2>Learn the camera</h2><p>Set up your<br>training space</p></article><span class="orientation-step-arrow" aria-hidden="true">→</span><article><div class="orientation-step-number">3</div><div class="orientation-step-icon">⚡</div><h2>Play a quick challenge</h2><p>Learn by<br>playing</p></article></section><button class="trial-primary orientation-primary" type="button" data-canonical-next>◉ &nbsp; BEGIN MISSION &nbsp; →</button><p class="orientation-footer">3 SHORT MISSIONS. 1 <em>BIGGER YOU.</em></p></main>`);
}
const steps = [
  {key:"coach", kicker:"Step 1 of 3", title:"Meet Your Coach", icon:"◷", body:"I’ll give you short cues while you train, so you always know what to notice next.", cue:"Listen for one simple cue at a time.", action:"Meet the camera →"},
  {key:"camera", kicker:"Step 2 of 3", title:"Meet the Camera", icon:"◉", body:"Place your phone where it can see your body and the training space. Good light and a steady surface work best.", cue:"Keep your full body and the ground in view.", action:"Try the practice →"},
  {key:"challenge", kicker:"Step 3 of 3", title:"Practice", icon:"⚡", body:"When the signal changes, tap as quickly as you can.", cue:"Ready? Watch the signal.", action:"Start practice"}
];
function progress(index){ return `<div class="orientation-progress" aria-label="Orientation progress">${steps.map((item,i)=>`<div class="orientation-progress-item ${i<index?'complete':i===index?'current':'upcoming'}"><span>${i<index?'✓':i+1}</span><small>${item.title}</small></div>`).join("")}</div>`; }
function orientation(index){
  const item = steps[index];
  return shell(`${top("Academy Induction", true)}${progress(index)}<main class="orientation-stage"><div class="orientation-stage-icon" aria-hidden="true">${item.icon}</div><span class="trial-kicker">${item.kicker}</span><h1>${item.title}</h1><p>${item.body}</p><div class="orientation-coach-cue"><strong>PitchIQ Coach</strong><span>${item.cue}</span></div>${item.key==='challenge'?'<div class="orientation-reaction" data-reaction-zone><span data-reaction-signal>WAIT</span><button type="button" data-reaction-tap disabled>TAP</button><small data-reaction-status>Press start when you’re ready.</small></div>':''}<div class="academy-canonical-cta-dock"><button class="trial-primary" type="button" data-canonical-next>${reactionReady&&item.key==='challenge'?'Continue to contract →':item.action}</button></div></main>`);
}
function contract(){
  const email = localStorage.getItem(EMAIL_KEY) || "";
  return shell(`${top("Player Contract", true)}<main class="lab-stage"><span class="trial-kicker">Your commitment</span><h1>Sign Your Player Contract</h1><p>I will give my best effort, practise consistently, learn from mistakes and respect my teammates and coaches.</p><label class="lab-note" style="display:block;text-align:left"><strong>Parent or guardian email</strong><input type="email" inputmode="email" autocomplete="email" data-contract-email value="${email}" placeholder="name@example.com" style="width:100%;margin-top:10px"></label><label class="lab-note" style="display:flex;gap:10px;align-items:flex-start;text-align:left"><input type="checkbox" data-contract-accept><span>I agree to the PitchIQ Player Contract.</span></label><div class="academy-canonical-cta-dock"><button class="trial-primary" type="button" data-contract-submit disabled>Sign contract →</button></div></main>`);
}
function avatar(){
  const options = [["captain","🧭"],["playmaker","⚡"],["guardian","🛡️"]];
  return shell(`${top("Academy Avatar", true)}<main class="lab-stage"><span class="trial-kicker">Identity reward</span><h1>Choose Your Avatar</h1><p>Select the academy identity that represents how you play.</p><div class="avatar-grid">${options.map(([id,icon])=>`<button class="avatar-choice ${selectedAvatar===id?'selected':''}" type="button" data-canonical-avatar="${id}" aria-label="Choose ${id}">${icon}</button>`).join("")}</div><div class="academy-canonical-cta-dock"><button class="trial-primary" type="button" data-canonical-next>Choose player style →</button></div></main>`);
}
function playerStyle(){
  const options = [["creator","Creator","See the pass others miss."],["finisher","Finisher","Attack space and take chances."],["playmaker","Playmaker","Connect the game and set the tempo."],["engine","Engine","Keep moving and support every phase."],["defender","Defender","Read danger and protect the team."],["leader","Leader","Communicate, organise and lift others."]];
  return shell(`${top("Player Style", true)}<main class="lab-stage"><span class="trial-kicker">Final step</span><h1>Choose Your Player Style</h1><p>This is your starting identity. It can evolve as you train.</p><div class="avatar-grid">${options.map(([id,title,copy])=>`<button class="avatar-choice ${selectedPlayerStyle===id?'selected':''}" type="button" data-player-style="${id}" aria-label="Choose ${title}"><strong>${title}</strong><small>${copy}</small></button>`).join("")}</div><div class="academy-canonical-cta-dock"><button class="trial-primary" type="button" data-complete-first-run>Enter Home →</button></div></main>`);
}
function render(){
  if(route() !== CANONICAL_ROUTE) return false;
  clearIdentityOverlay();
  nav?.classList.remove("visible");
  document.body.classList.remove("pitchiq-splash-active");
  if(stage === "welcome") app.innerHTML = welcome();
  else if(stage.startsWith("step-")) app.innerHTML = orientation(Number(stage.slice(5)));
  else if(stage === "contract") app.innerHTML = contract();
  else if(stage === "avatar") app.innerHTML = avatar();
  else if(stage === "player-style") app.innerHTML = playerStyle();
  bindFormState();
  window.scrollTo(0, 0);
  return true;
}
function goHome(){
  localStorage.setItem(ACADEMY_ACCEPTED_KEY, "true");
  localStorage.setItem(AVATAR_KEY, selectedAvatar);
  localStorage.setItem(PLAYER_STYLE_KEY, selectedPlayerStyle);
  const handoff = window.PitchIQApp?.enterHomeFromModule;
  if(typeof handoff === "function") handoff("academy");
}
function runReaction(){
  const signal = app.querySelector("[data-reaction-signal]");
  const tap = app.querySelector("[data-reaction-tap]");
  const status = app.querySelector("[data-reaction-status]");
  const next = app.querySelector("[data-canonical-next]");
  if(!signal || !tap || !status || !next) return;
  next.disabled = true; next.textContent = "Get ready…";
  status.textContent = "Watch the signal.";
  setTimeout(() => {
    signal.textContent = "GO!"; signal.classList.add("go"); tap.disabled = false;
    const started = performance.now();
    tap.addEventListener("click", () => {
      const ms = Math.max(1, Math.round(performance.now() - started));
      tap.disabled = true; signal.textContent = "NICE!"; status.textContent = `Reaction: ${ms} ms — you’re ready.`;
      reactionReady = true; next.disabled = false; next.textContent = "Continue to contract →";
    }, {once:true});
  }, 900 + Math.floor(Math.random()*900));
}
function advance(){
  if(stage === "welcome"){ completeStep("academy-induction"); stage = "step-0"; }
  else if(stage === "step-0"){ completeStep("meet-your-coach"); stage = "step-1"; }
  else if(stage === "step-1"){ completeStep("meet-the-camera"); stage = "step-2"; }
  else if(stage === "step-2" && !reactionReady){ runReaction(); return; }
  else if(stage === "step-2"){ completeStep("practice"); stage = "contract"; }
  else if(stage === "avatar"){ completeStep("avatar"); stage = "player-style"; }
  render();
}
function goBack(){
  if(stage === "step-0") stage = "welcome";
  else if(stage === "step-1") stage = "step-0";
  else if(stage === "step-2") stage = "step-1";
  else if(stage === "contract") stage = "step-2";
  else if(stage === "avatar") stage = "contract";
  else if(stage === "player-style") stage = "avatar";
  render();
}
function bindFormState(){
  const email = app.querySelector("[data-contract-email]");
  const accepted = app.querySelector("[data-contract-accept]");
  const submit = app.querySelector("[data-contract-submit]");
  if(email && accepted && submit){
    const sync = () => { submit.disabled = !(email.validity.valid && email.value.trim() && accepted.checked); };
    email.addEventListener("input", sync);
    accepted.addEventListener("change", sync);
    sync();
  }
}
function handleCanonicalClick(event){
  if(route() !== CANONICAL_ROUTE) return;
  const next = event.target.closest?.("[data-canonical-next]");
  const back = event.target.closest?.("[data-canonical-back]");
  const avatarChoice = event.target.closest?.("[data-canonical-avatar]");
  const styleChoice = event.target.closest?.("[data-player-style]");
  const contractSubmit = event.target.closest?.("[data-contract-submit]");
  const complete = event.target.closest?.("[data-complete-first-run]");
  if(!next && !back && !avatarChoice && !styleChoice && !contractSubmit && !complete) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(next){ advance(); return; }
  if(back){ goBack(); return; }
  if(contractSubmit){
    const email = app.querySelector("[data-contract-email]")?.value?.trim();
    const accepted = app.querySelector("[data-contract-accept]")?.checked;
    if(!email || !accepted) return;
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(CONTRACT_KEY, JSON.stringify({accepted:true,acceptedAt:new Date().toISOString(),version:CONTRACT_VERSION}));
    completeStep("player-contract");
    stage = "avatar";
    render();
    return;
  }
  if(complete){
    localStorage.setItem(PLAYER_STYLE_KEY, selectedPlayerStyle);
    completeStep("player-style");
    goHome();
    return;
  }
  if(avatarChoice){
    selectedAvatar = avatarChoice.dataset.canonicalAvatar;
    localStorage.setItem(AVATAR_KEY, selectedAvatar);
    app.querySelectorAll("[data-canonical-avatar]").forEach(choice => choice.classList.toggle("selected", choice.dataset.canonicalAvatar===selectedAvatar));
    return;
  }
  selectedPlayerStyle = styleChoice.dataset.playerStyle;
  localStorage.setItem(PLAYER_STYLE_KEY, selectedPlayerStyle);
  app.querySelectorAll("[data-player-style]").forEach(choice => choice.classList.toggle("selected", choice.dataset.playerStyle===selectedPlayerStyle));
}
function handleRoute(){
  const normalized = window.PitchIQApp?.normalizeAcademyRoute?.() || route();
  if(normalized === CANONICAL_ROUTE){ resumeStage(); queueMicrotask(render); }
}

document.addEventListener("click", handleCanonicalClick, true);
window.addEventListener("hashchange", handleRoute);
handleRoute();

window.PitchIQAcademy = Object.freeze({
  render,
  advance,
  enter: () => {
    resumeStage();
    window.PitchIQApp?.enterAcademy?.("academy-runtime");
  }
});
