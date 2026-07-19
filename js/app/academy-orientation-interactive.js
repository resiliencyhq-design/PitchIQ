const app = document.getElementById("app");

const ORIENTATION_ROUTE = "academy-trials";
let active = false;
let step = 0;
let originalStartButton = null;

const steps = [
  {
    key: "coach",
    kicker: "Step 1 of 3",
    title: "Meet Your Coach",
    icon: "◷",
    body: "Hi, welcome to PitchIQ Academy. I’ll give you short cues while you train, so you always know what to notice next.",
    cue: "Listen for one simple cue at a time.",
    action: "Meet the camera →"
  },
  {
    key: "camera",
    kicker: "Step 2 of 3",
    title: "Camera Finder",
    icon: "◉",
    body: "Place your phone where it can see your body and the training space. Good light and a steady surface work best.",
    cue: "Keep your full body and the ground in view.",
    action: "Try the challenge →"
  },
  {
    key: "challenge",
    kicker: "Step 3 of 3",
    title: "Quick Challenge",
    icon: "⚡",
    body: "When the signal changes, tap as quickly as you can. This is how PitchIQ turns instructions into short game-like actions.",
    cue: "Ready? Watch the signal.",
    action: "Start challenge"
  }
];

function isOrientationRoute(){
  return window.location.hash.replace(/^#/, "").toLowerCase() === ORIENTATION_ROUTE;
}

function progressMarkup(current){
  return `<div class="orientation-progress" aria-label="Orientation progress">
    ${steps.map((item, index) => {
      const state = index < current ? "complete" : index === current ? "current" : "upcoming";
      const marker = index < current ? "✓" : index + 1;
      return `<div class="orientation-progress-item ${state}"><span>${marker}</span><small>${item.title}</small></div>`;
    }).join("")}
  </div>`;
}

function renderStep(index){
  const item = steps[index];
  step = index;
  active = true;
  app.innerHTML = `<section class="screen app active trial-shell orientation-flow orientation-step-${item.key}">
    <header class="trial-top">
      <button class="trial-back" type="button" data-orientation-back aria-label="Back">←</button>
      <div class="trial-brand">Academy Orientation</div>
      <span class="orientation-top-spacer" aria-hidden="true"></span>
    </header>
    ${progressMarkup(index)}
    <main class="orientation-stage">
      <div class="orientation-stage-icon" aria-hidden="true">${item.icon}</div>
      <span class="trial-kicker">${item.kicker}</span>
      <h1>${item.title}</h1>
      <p>${item.body}</p>
      <div class="orientation-coach-cue"><strong>PitchIQ Coach</strong><span>${item.cue}</span></div>
      ${item.key === "challenge" ? `<div class="orientation-reaction" data-reaction-zone><span data-reaction-signal>WAIT</span><button type="button" data-reaction-tap disabled>TAP</button><small data-reaction-status>Press start when you’re ready.</small></div>` : ""}
      <button class="trial-primary" type="button" data-orientation-next>${item.action}</button>
    </main>
  </section>`;
  bindStep();
}

function completeOrientation(){
  active = false;
  document.body.classList.remove("orientation-interactive-active");
  if(originalStartButton){
    originalStartButton.click();
    originalStartButton = null;
    return;
  }
  window.location.hash = "lab-juggling";
}

function runReactionChallenge(){
  const signal = app.querySelector("[data-reaction-signal]");
  const tap = app.querySelector("[data-reaction-tap]");
  const status = app.querySelector("[data-reaction-status]");
  const next = app.querySelector("[data-orientation-next]");
  if(!signal || !tap || !status || !next) return;

  next.disabled = true;
  next.textContent = "Get ready…";
  signal.textContent = "WAIT";
  signal.classList.remove("go");
  tap.disabled = true;
  status.textContent = "Watch the signal.";

  const delay = 900 + Math.floor(Math.random() * 900);
  window.setTimeout(() => {
    if(!active || step !== 2) return;
    const started = performance.now();
    signal.textContent = "GO!";
    signal.classList.add("go");
    tap.disabled = false;
    tap.focus({preventScroll:true});
    tap.addEventListener("click", () => {
      const reaction = Math.max(1, Math.round(performance.now() - started));
      tap.disabled = true;
      signal.textContent = "NICE!";
      status.textContent = `Reaction: ${reaction} ms — you’re ready.`;
      next.disabled = false;
      next.textContent = "Finish Orientation →";
      navigator.vibrate?.(25);
    }, {once:true});
  }, delay);
}

function bindStep(){
  document.body.classList.add("orientation-interactive-active");
  app.querySelector("[data-orientation-back]")?.addEventListener("click", () => {
    if(step === 0){
      active = false;
      document.body.classList.remove("orientation-interactive-active");
      window.location.hash = "academy-trial";
      return;
    }
    renderStep(step - 1);
  });

  app.querySelector("[data-orientation-next]")?.addEventListener("click", event => {
    if(step === 2){
      if(event.currentTarget.textContent.includes("Finish")) completeOrientation();
      else runReactionChallenge();
      return;
    }
    renderStep(step + 1);
  });
}

function startInteractiveOrientation(event){
  const button = event.target.closest?.("[data-complete-orientation]");
  if(!button || !isOrientationRoute()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  originalStartButton = button;
  renderStep(0);
}

function leaveIfRouteChanged(){
  if(active && !isOrientationRoute() && window.location.hash !== "#lab-juggling"){
    active = false;
    document.body.classList.remove("orientation-interactive-active");
  }
}

document.addEventListener("click", startInteractiveOrientation, true);
window.addEventListener("hashchange", leaveIfRouteChanged);
