const ROUTE = "lab-vibro-focus";
const RETURN_ROUTE = "world-lab";
const STYLE_ID = "pitchiq-vibro-focus-css";
const STORAGE_KEY = "pitchiq.lab.vibroFocus.history.v1";

const MODES = Object.freeze({
  calm: {
    label: "Calm",
    description: "Slow, gentle pulses for settling and relaxation.",
    accent: "#4d9cff",
    pattern: [180, 820],
  },
  focus: {
    label: "Focus",
    description: "Steady pulses for alertness and concentration.",
    accent: "#42d982",
    pattern: [120, 180, 120, 580],
  },
  reset: {
    label: "Reset",
    description: "A short pattern to reset between drills.",
    accent: "#ffc84d",
    pattern: [90, 110, 90, 110, 220, 580],
  },
  recover: {
    label: "Recover",
    description: "Longer, softer pulses after training.",
    accent: "#ff6b6b",
    pattern: [240, 1260],
  },
});

const DURATIONS = Object.freeze([30, 60, 120, 300]);
let state = null;

function route() {
  return location.hash.replace(/^#/, "").toLowerCase();
}

function app() {
  return document.getElementById("app");
}

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = "css/lab-vibro-focus.css?v=sprint-l2-0-vibro-focus-20260721";
  document.head.appendChild(link);
}

function supported() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function stopVibration() {
  try { navigator.vibrate?.(0); } catch (_) {}
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  return `${seconds / 60} min`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;",
  })[character]);
}

function shell(content, title = "Vibro Focus") {
  return `<section class="vibro-screen">
    <header class="vibro-topbar">
      <button type="button" data-vibro-back aria-label="Back to Lab">‹</button>
      <div><span>PitchIQ Lab</span><strong>${escapeHtml(title)}</strong></div>
      <em>EXPERIMENTAL</em>
    </header>
    ${content}
  </section>`;
}

function ratingRow(key, label, icon) {
  const buttons = Array.from({ length: 10 }, (_, index) => {
    const value = index + 1;
    return `<button type="button" data-vibro-rating="${key}" data-value="${value}" aria-label="${label} ${value} out of 10">${value}</button>`;
  }).join("");
  return `<div class="vibro-rating-row"><label>${icon} ${label}</label><div class="vibro-scale">${buttons}</div></div>`;
}

function introMarkup() {
  const modeCards = Object.entries(MODES).map(([id, mode]) => `<button type="button" class="vibro-mode-card${id === "calm" ? " selected" : ""}" data-vibro-mode="${id}" style="--mode-accent:${mode.accent}">
    <span aria-hidden="true">≋</span><span><strong>${mode.label}</strong><small>${mode.description}</small></span><b aria-hidden="true">${id === "calm" ? "✓" : "○"}</b>
  </button>`).join("");
  const durations = DURATIONS.map(seconds => `<button type="button" data-vibro-duration="${seconds}" class="${seconds === 30 ? "selected" : ""}">${formatDuration(seconds)}</button>`).join("");
  return shell(`<main class="vibro-card vibro-intro">
    <h1>Explore your best state.</h1>
    <p>Test whether different phone vibration patterns help you feel calmer, more focused or better prepared.</p>
    <section class="vibro-placement"><div aria-hidden="true">▯</div><p><strong>Hold the phone gently against your sternum.</strong><br>Remain seated or lying safely, stay still and breathe normally.</p></section>
    <h2>Choose mode</h2><div class="vibro-modes">${modeCards}</div>
    <h2>Duration</h2><div class="vibro-durations">${durations}</div>
    <div class="vibro-capability ${supported() ? "supported" : "unsupported"}">${supported() ? "Vibration support detected on this device." : "This browser does not expose vibration control. You can preview the visual session, but no phone vibration will occur."}</div>
    <button type="button" class="vibro-primary" data-vibro-rate-before>Continue</button>
    <small class="vibro-safety">Experimental wellbeing tool only. Not a medical device or treatment. Stop immediately if uncomfortable. Do not use while standing, walking or driving.</small>
  </main>`);
}

function ratingMarkup(phase) {
  const before = phase === "before";
  return shell(`<main class="vibro-card vibro-ratings">
    <span class="vibro-step">${before ? "BEFORE WE START" : "SESSION COMPLETE"}</span>
    <h1>${before ? "How do you feel right now?" : "How do you feel now?"}</h1>
    <p>Rate each item from 1 (low) to 10 (high).</p>
    ${ratingRow("calmness", "Calmness", "♥")}
    ${ratingRow("focus", "Focus", "◎")}
    ${ratingRow("readiness", "Readiness", "★")}
    <button type="button" class="vibro-primary" data-vibro-${before ? "start" : "save"} disabled>${before ? "Start Session" : "Save Result"}</button>
  </main>`, MODES[state.mode].label);
}

function sessionMarkup() {
  const mode = MODES[state.mode];
  return shell(`<main class="vibro-card vibro-session" style="--mode-accent:${mode.accent}">
    <span class="vibro-step">SESSION IN PROGRESS</span>
    <h1>${mode.label}</h1>
    <p>${mode.description}</p>
    <div class="vibro-rings" aria-hidden="true"><i></i><i></i><i></i><span>≋</span></div>
    <strong id="vibroTime">${formatDuration(state.duration)}</strong>
    <small>Keep the phone gently against your sternum.<br>Stay still and breathe normally.</small>
    <button type="button" class="vibro-stop" data-vibro-stop>Stop Session</button>
  </main>`, mode.label);
}

function resultMarkup(result) {
  const rows = [
    ["Calmness", result.before.calmness, result.after.calmness],
    ["Focus", result.before.focus, result.after.focus],
    ["Readiness", result.before.readiness, result.after.readiness],
  ].map(([label, pre, post]) => {
    const delta = post - pre;
    return `<div class="vibro-result-row"><span>${label}</span><small>${pre} → ${post}</small><b class="${delta > 0 ? "positive" : delta < 0 ? "negative" : ""}">${delta > 0 ? "+" : ""}${delta}</b></div>`;
  }).join("");
  return shell(`<main class="vibro-card vibro-results">
    <div class="vibro-check">✓</div><h1>${MODES[result.mode].label} complete</h1>
    <p>Your ratings have been saved on this device.</p>
    <div class="vibro-result-list">${rows}</div>
    <button type="button" class="vibro-primary" data-vibro-again>Try another session</button>
    <button type="button" class="vibro-secondary" data-vibro-back>Back to Lab</button>
  </main>`, MODES[result.mode].label);
}

function render(markup) {
  ensureStyle();
  document.body.classList.remove("pitchiq-splash-active");
  document.body.classList.add("pitchiq-immersive-active");
  document.getElementById("nav")?.classList.remove("visible");
  app().innerHTML = markup;
}

function newState() {
  state = { mode: "calm", duration: 30, before: {}, after: {}, timer: null, pulse: null, endsAt: 0 };
}

function renderIntro() {
  stopSession();
  newState();
  render(introMarkup());
}

function ratingComplete(phase) {
  return ["calmness", "focus", "readiness"].every(key => Number.isFinite(state[phase][key]));
}

function selectRating(button) {
  const phase = button.closest(".vibro-ratings")?.querySelector("[data-vibro-start]") ? "before" : "after";
  const key = button.dataset.vibroRating;
  const value = Number(button.dataset.value);
  state[phase][key] = value;
  button.parentElement.querySelectorAll("button").forEach(item => item.classList.toggle("selected", item === button));
  const action = app().querySelector(phase === "before" ? "[data-vibro-start]" : "[data-vibro-save]");
  if (action) action.disabled = !ratingComplete(phase);
}

function startSession() {
  state.endsAt = Date.now() + state.duration * 1000;
  render(sessionMarkup());
  const mode = MODES[state.mode];
  const pulse = () => { if (supported()) navigator.vibrate(mode.pattern); };
  pulse();
  state.pulse = setInterval(pulse, mode.pattern.reduce((sum, value) => sum + value, 0));
  state.timer = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
    const timer = document.getElementById("vibroTime");
    if (timer) timer.textContent = formatDuration(remaining);
    if (remaining <= 0) finishSession();
  }, 250);
}

function stopSession() {
  if (!state) return;
  clearInterval(state.timer);
  clearInterval(state.pulse);
  state.timer = null;
  state.pulse = null;
  stopVibration();
}

function finishSession() {
  stopSession();
  state.after = {};
  render(ratingMarkup("after"));
}

function saveResult() {
  const result = {
    id: `vibro-${Date.now()}`,
    createdAt: new Date().toISOString(),
    mode: state.mode,
    duration: state.duration,
    vibrationSupported: supported(),
    before: { ...state.before },
    after: { ...state.after },
  };
  let history = [];
  try { history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (_) {}
  history.unshift(result);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 30))); } catch (_) {}
  render(resultMarkup(result));
}

function handleRoute() {
  if (route() === ROUTE) {
    if (!state) renderIntro();
  } else {
    stopSession();
    state = null;
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const target = event.target.closest("button");
    if (!target || route() !== ROUTE) return;
    if (target.matches("[data-vibro-back]")) { stopSession(); location.hash = RETURN_ROUTE; return; }
    if (target.matches("[data-vibro-mode]")) {
      state.mode = target.dataset.vibroMode;
      app().querySelectorAll("[data-vibro-mode]").forEach(item => {
        const selected = item === target;
        item.classList.toggle("selected", selected);
        item.querySelector("b").textContent = selected ? "✓" : "○";
      });
      return;
    }
    if (target.matches("[data-vibro-duration]")) {
      state.duration = Number(target.dataset.vibroDuration);
      app().querySelectorAll("[data-vibro-duration]").forEach(item => item.classList.toggle("selected", item === target));
      return;
    }
    if (target.matches("[data-vibro-rate-before]")) { state.before = {}; render(ratingMarkup("before")); return; }
    if (target.matches("[data-vibro-rating]")) { selectRating(target); return; }
    if (target.matches("[data-vibro-start]")) { startSession(); return; }
    if (target.matches("[data-vibro-stop]")) { finishSession(); return; }
    if (target.matches("[data-vibro-save]")) { saveResult(); return; }
    if (target.matches("[data-vibro-again]")) { renderIntro(); }
  }, true);

  window.addEventListener("hashchange", handleRoute);
  window.addEventListener("pagehide", stopSession);
  handleRoute();
}
