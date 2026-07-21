const app = document.getElementById("app");
const nav = document.getElementById("nav");
const CANONICAL_ROUTE = "academy-trial";
const LEGACY_ROUTE = "academy-trials";
const ACADEMY_ACCEPTED_KEY = "pitchiqAcademyAccepted";
const AVATAR_KEY = "pitchiqAcademyAvatar";

let stage = "welcome";
let reactionReady = false;
let selectedAvatar = localStorage.getItem(AVATAR_KEY) || "captain";

function route(){ return window.location.hash.replace(/^#/, "").toLowerCase(); }
function identity(){
  const labels = {LW:"Left Wing",ST:"Striker",RW:"Right Wing",CAM:"Attacking Midfielder",CM:"Central Midfielder",CDM:"Defensive Midfielder",LB:"Left Back",CB:"Centre Back",RB:"Right Back",GK:"Goalkeeper"};
  const position = localStorage.getItem("pitchiqSelectedPosition") || "";
  return {
    name: localStorage.getItem("pitchiqPlayerName") || "Player",
    number: localStorage.getItem("pitchiqJerseyNumber") || "1",
    position: labels[position] || position || "Academy Player"
  };
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
function welcome(){
  const player = identity();
  return shell(`${top("PitchIQ")}<article class="trial-hero"><div class="trial-shield">★</div><span class="trial-kicker">Welcome to PitchIQ Academy</span><h1>Let’s get you <em>match ready</em></h1><p>Meet your coach, learn the PitchIQ tools and play a few quick challenges.</p><div class="trial-identity-strip"><div><small>Player</small><b>${player.name.toUpperCase()}</b></div><div><small>Number</small><b>#${player.number}</b></div><div><small>Position</small><b>${player.position}</b></div></div><ul class="trial-benefits"><li><i>◷</i><span><b>Meet your coach</b><small>Hear the cues that guide training</small></span></li><li><i>◉</i><span><b>Learn the camera</b><small>Set up your training space</small></span></li><li><i>⚡</i><span><b>Play a quick challenge</b><small>Learn by playing</small></span></li></ul><button class="trial-primary" type="button" data-canonical-next>Start Orientation →</button></article>`);
}
const steps = [
  {key:"coach", kicker:"Step 1 of 3", title:"Meet Your Coach", icon:"◷", body:"I’ll give you short cues while you train, so you always know what to notice next.", cue:"Listen for one simple cue at a time.", action:"Meet the camera →"},
  {key:"camera", kicker:"Step 2 of 3", title:"Camera Finder", icon:"◉", body:"Place your phone where it can see your body and the training space. Good light and a steady surface work best.", cue:"Keep your full body and the ground in view.", action:"Try the challenge →"},
  {key:"challenge", kicker:"Step 3 of 3", title:"Quick Challenge", icon:"⚡", body:"When the signal changes, tap as quickly as you can.", cue:"Ready? Watch the signal.", action:"Start challenge"}
];
function progress(index){ return `<div class="orientation-progress" aria-label="Orientation progress">${steps.map((item,i)=>`<div class="orientation-progress-item ${i<index?'complete':i===index?'current':'upcoming'}"><span>${i<index?'✓':i+1}</span><small>${item.title}</small></div>`).join("")}</div>`; }
function orientation(index){
  const item = steps[index];
  return shell(`${top("Academy Orientation", true)}${progress(index)}<main class="orientation-stage"><div class="orientation-stage-icon" aria-hidden="true">${item.icon}</div><span class="trial-kicker">${item.kicker}</span><h1>${item.title}</h1><p>${item.body}</p><div class="orientation-coach-cue"><strong>PitchIQ Coach</strong><span>${item.cue}</span></div>${item.key==='challenge'?'<div class="orientation-reaction" data-reaction-zone><span data-reaction-signal>WAIT</span><button type="button" data-reaction-tap disabled>TAP</button><small data-reaction-status>Press start when you’re ready.</small></div>':''}<button class="trial-primary" type="button" data-canonical-next>${reactionReady&&item.key==='challenge'?'Finish Orientation →':item.action}</button></main>`);
}
function accepted(){
  const player = identity();
  return shell(`${top("PitchIQ Academy")}<main class="academy-accepted"><div class="trial-shield">★</div><span class="trial-kicker">Orientation complete</span><h1>ACADEMY<br><em>ACCEPTED</em></h1><p>Welcome, ${player.name}. You know the tools and your coach is ready.</p><button class="trial-primary" type="button" data-canonical-next>Choose your avatar →</button></main>`);
}
function avatar(){
  const options = [["captain","🧭"],["playmaker","⚡"],["guardian","🛡️"]];
  return shell(`${top("Academy Avatar")}<main class="lab-stage"><span class="trial-kicker">Identity reward</span><h1>Choose Your Avatar</h1><p>Select the academy identity that represents how you play.</p><div class="avatar-grid">${options.map(([id,icon])=>`<button class="avatar-choice ${selectedAvatar===id?'selected':''}" type="button" data-canonical-avatar="${id}" aria-label="Choose ${id}">${icon}</button>`).join("")}</div><button class="trial-primary" type="button" data-canonical-next>Welcome home →</button></main>`);
}
function render(){
  if(route() !== CANONICAL_ROUTE) return false;
  clearIdentityOverlay();
  nav?.classList.remove("visible");
  document.body.classList.remove("pitchiq-splash-active");
  if(stage === "welcome") app.innerHTML = welcome();
  else if(stage.startsWith("step-")) app.innerHTML = orientation(Number(stage.slice(5)));
  else if(stage === "accepted") app.innerHTML = accepted();
  else if(stage === "avatar") app.innerHTML = avatar();
  bind();
  return true;
}
function goHome(){
  localStorage.setItem(ACADEMY_ACCEPTED_KEY, "true");
  localStorage.setItem(AVATAR_KEY, selectedAvatar);
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  window.location.reload();
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
      reactionReady = true; next.disabled = false; next.textContent = "Finish Orientation →";
    }, {once:true});
  }, 900 + Math.floor(Math.random()*900));
}
function bind(){
  app.querySelector("[data-canonical-back]")?.addEventListener("click", () => {
    if(stage === "step-0") stage = "welcome";
    else if(stage.startsWith("step-")) stage = `step-${Math.max(0, Number(stage.slice(5))-1)}`;
    render();
  });
  app.querySelector("[data-canonical-next]")?.addEventListener("click", () => {
    if(stage === "welcome") stage = "step-0";
    else if(stage === "step-0") stage = "step-1";
    else if(stage === "step-1") stage = "step-2";
    else if(stage === "step-2" && !reactionReady){ runReaction(); return; }
    else if(stage === "step-2") stage = "accepted";
    else if(stage === "accepted") stage = "avatar";
    else if(stage === "avatar"){ goHome(); return; }
    render();
  });
  app.querySelectorAll("[data-canonical-avatar]").forEach(button => button.addEventListener("click", () => {
    selectedAvatar = button.dataset.canonicalAvatar;
    localStorage.setItem(AVATAR_KEY, selectedAvatar);
    app.querySelectorAll("[data-canonical-avatar]").forEach(choice => choice.classList.toggle("selected", choice.dataset.canonicalAvatar===selectedAvatar));
  }));
}
function enterAcademy(event){
  const button = event.target.closest?.('[data-action="save-profile"]');
  if(!button || !button.closest(".academy-welcome-step")) return;
  event.preventDefault(); event.stopImmediatePropagation();
  localStorage.setItem("pitchiqOnboardingComplete", "true");
  localStorage.removeItem(ACADEMY_ACCEPTED_KEY);
  stage = "welcome"; reactionReady = false;
  clearIdentityOverlay();
  if(route() !== CANONICAL_ROUTE) window.location.hash = CANONICAL_ROUTE;
  queueMicrotask(render);
}
function handleRoute(){
  if(route() === LEGACY_ROUTE){ window.location.replace(`${window.location.pathname}${window.location.search}#${CANONICAL_ROUTE}`); return; }
  if(route() === CANONICAL_ROUTE) queueMicrotask(render);
}

document.addEventListener("click", enterAcademy, true);
window.addEventListener("hashchange", handleRoute);
handleRoute();

window.PitchIQAcademy = Object.freeze({ render, enter: () => { stage="welcome"; window.location.hash=CANONICAL_ROUTE; queueMicrotask(render); } });
