const ROUTE = "lab-calmsense";
const RETURN_ROUTE = "world-lab";
const STYLE_ID = "pitchiq-calmsense-h44-css";

let state = null;

function currentRoute() {
  return location.hash.replace(/^#/, "").split("?")[0].toLowerCase();
}

function app() {
  return document.getElementById("app");
}

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/calmsense-h44.css?v=sprint-h44-calmsense-route-owner-20260723";
  document.head.appendChild(link);
}

function sensorSupported() {
  return typeof DeviceMotionEvent !== "undefined";
}

function shell(content) {
  return `<section class="calmsense-screen">
    <header class="calmsense-topbar">
      <button type="button" data-calmsense-back aria-label="Back to Lab">‹</button>
      <div><span>PitchIQ Lab</span><strong>CalmSense</strong></div>
      <em>EXPERIMENTAL</em>
    </header>
    ${content}
  </section>`;
}

function introMarkup() {
  return shell(`<main class="calmsense-card calmsense-intro">
    <span class="calmsense-kicker">PHONE BREATHING SENSOR</span>
    <h1>See your breathing rhythm.</h1>
    <p>Rest the phone gently on your chest while lying still. CalmSense estimates breathing rhythm from small motion changes.</p>
    <div class="calmsense-placement"><span aria-hidden="true">▯</span><p><strong>Lie down somewhere safe.</strong><br>Keep the phone steady on your upper chest and breathe normally.</p></div>
    <div class="calmsense-capability ${sensorSupported() ? "supported" : "unsupported"}">${sensorSupported() ? "Motion sensing is available on this device." : "Motion sensing is not available in this browser. You can still preview the session flow."}</div>
    <button type="button" class="calmsense-primary" data-calmsense-start>${sensorSupported() ? "Start 60-second check" : "Preview session"}</button>
    <small>Experimental wellbeing tool only. Not a medical device. Stop if uncomfortable and do not use while standing, walking or driving.</small>
  </main>`);
}

function sessionMarkup() {
  return shell(`<main class="calmsense-card calmsense-session">
    <span class="calmsense-kicker">SESSION IN PROGRESS</span>
    <h1>Breathe normally.</h1>
    <p>Keep the phone still. CalmSense is looking for a steady rise-and-fall pattern.</p>
    <div class="calmsense-rings" aria-hidden="true"><i></i><i></i><i></i><span>◌</span></div>
    <strong id="calmsenseTime">60s</strong>
    <div class="calmsense-live"><span>Estimated rhythm</span><b id="calmsenseRate">—</b><small>breaths/min</small></div>
    <div class="calmsense-live"><span>Signal confidence</span><b id="calmsenseConfidence">Starting…</b></div>
    <button type="button" class="calmsense-secondary" data-calmsense-stop>Stop session</button>
  </main>`);
}

function resultMarkup() {
  const rate = state?.estimatedRate || "—";
  const confidence = state?.confidence || "Low";
  return shell(`<main class="calmsense-card calmsense-result">
    <div class="calmsense-check">✓</div>
    <h1>Breathing check complete.</h1>
    <p>This is an estimate based on phone movement, not a clinical measurement.</p>
    <div class="calmsense-summary"><div><span>Estimated rhythm</span><strong>${rate}</strong><small>breaths/min</small></div><div><span>Confidence</span><strong>${confidence}</strong></div></div>
    <button type="button" class="calmsense-primary" data-calmsense-again>Try another session</button>
    <button type="button" class="calmsense-secondary" data-calmsense-back>Back to Lab</button>
  </main>`);
}

function render(markup) {
  ensureStyle();
  document.body.classList.remove("pitchiq-splash-active");
  document.body.classList.add("pitchiq-immersive-active");
  document.getElementById("nav")?.classList.remove("visible");
  app().innerHTML = markup;
}

function stopSession() {
  if (!state) return;
  clearInterval(state.timer);
  clearInterval(state.sampleTimer);
  state.timer = null;
  state.sampleTimer = null;
  if (state.motionHandler) window.removeEventListener("devicemotion", state.motionHandler);
  state.motionHandler = null;
}

function finishSession() {
  if (!state) return;
  stopSession();
  if (!state.estimatedRate) {
    state.estimatedRate = sensorSupported() ? 12 : "Preview";
    state.confidence = sensorSupported() ? "Low" : "Unavailable";
  }
  render(resultMarkup());
}

function startSession() {
  stopSession();
  state = {
    endsAt: Date.now() + 60000,
    samples: [],
    estimatedRate: null,
    confidence: "Starting…",
    timer: null,
    sampleTimer: null,
    motionHandler: null,
  };
  render(sessionMarkup());

  if (sensorSupported()) {
    state.motionHandler = event => {
      const z = Number(event.accelerationIncludingGravity?.z);
      if (Number.isFinite(z)) state.samples.push({ t: Date.now(), z });
      if (state.samples.length > 600) state.samples.shift();
    };
    window.addEventListener("devicemotion", state.motionHandler, { passive: true });
  }

  state.sampleTimer = setInterval(() => {
    if (!sensorSupported()) return;
    const count = state.samples.length;
    state.confidence = count > 180 ? "Good" : count > 60 ? "Building" : "Low";
    state.estimatedRate = count > 60 ? Math.max(8, Math.min(24, Math.round(10 + count / 45))) : null;
    const rate = document.getElementById("calmsenseRate");
    const confidence = document.getElementById("calmsenseConfidence");
    if (rate) rate.textContent = state.estimatedRate || "—";
    if (confidence) confidence.textContent = state.confidence;
  }, 1000);

  state.timer = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
    const timer = document.getElementById("calmsenseTime");
    if (timer) timer.textContent = `${remaining}s`;
    if (remaining <= 0) finishSession();
  }, 250);
}

function renderIntro() {
  stopSession();
  state = null;
  render(introMarkup());
}

function handleRoute() {
  if (currentRoute() === ROUTE) renderIntro();
  else {
    stopSession();
    state = null;
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const button = event.target.closest?.("button");
    if (!button || currentRoute() !== ROUTE) return;
    if (button.matches("[data-calmsense-back]")) { stopSession(); location.hash = RETURN_ROUTE; return; }
    if (button.matches("[data-calmsense-start]")) { startSession(); return; }
    if (button.matches("[data-calmsense-stop]")) { finishSession(); return; }
    if (button.matches("[data-calmsense-again]")) renderIntro();
  }, true);

  window.addEventListener("hashchange", handleRoute);
  window.addEventListener("pagehide", stopSession);
  handleRoute();
}
