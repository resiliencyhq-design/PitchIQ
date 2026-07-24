import { loadState, normalizeState, resetState, saveState } from "../services/storage.js";
import { PlayerService } from "../services/player-service.js";
import { sparkles, toast } from "../components/ui.js";
import { recommendedDrills } from "../data/drills.js";
import {
  renderHome,
  renderNav,
  renderOnboard,
  renderPlayer,
  renderResults,
  renderSplash,
  renderTraining,
} from "./routes.js?v=step1-art-align-20260620";
import { TrainingController } from "./controllers/training-controller.js";
import { createPlayerProfileEditor } from "./player-profile-editor.js?v=refactor-h39-player-reset-single-owner-20260723";
import { bindScreen } from "./ui/bind-screen.js";

const state = normalizeState(loadState());
const appElement = document.getElementById("app");
const validRoutes = new Set(["splash", "onboard", "home", "training", "results", "player"]);
const protectedRoutes = new Set(["home", "training", "results", "player"]);
const devMode = new URLSearchParams(window.location.search).has("dev");
let currentRoute = "splash";
let nav = document.getElementById("nav");
let selectedPosition = "";
let onboardingStep = 1;
let voiceStatusMessage = "";

function syncPlayer() {
  const player = PlayerService.getPlayer();
  state.profile = { ...(state.profile || {}), ...player };
  return player;
}

function onboardingComplete() {
  const player = syncPlayer();
  return Boolean(player.name && player.position);
}

function completeOnboarding(name, position) {
  state.profile = { ...state.profile, ...PlayerService.completeOnboarding({ name, position }) };
  saveState(state);
}

function guardRoute(route) {
  if (!validRoutes.has(route)) return "home";
  if (protectedRoutes.has(route) && !onboardingComplete()) return "onboard";
  if (protectedRoutes.has(route)) syncPlayer();
  return route;
}

function drills() {
  return recommendedDrills(state.profile.position || "Winger");
}

function selectedDrill() {
  return training.session.session?.drill || drills().find((drill) => drill.id === training.selectedDrillId) || drills()[0];
}

function liveCueDisplay(cue) {
  const id = String(cue?.id || "").toLowerCase();
  if (["red", "blue", "green", "yellow"].includes(id)) return id.toUpperCase();
  if (cue?.type === "scan") return "SCAN";
  return (cue?.label || cue?.display || "SCAN").toUpperCase();
}

function ensureShell() {
  appElement.classList.add("scrollable-content", "app-scroll");
  if (!nav) {
    nav = document.createElement("nav");
    nav.id = "nav";
    nav.setAttribute("aria-label", "Main navigation");
    document.body.appendChild(nav);
  }
  nav.className = "nav bottom-nav";
  nav.innerHTML = renderNav();
}

function immersive() {
  return currentRoute === "training" && ["setup", "countdown", "live", "exit-confirm"].includes(training.stage);
}

function trainingView() {
  return training.view({
    selectedDrill,
    missionDrill: () => drills()[0],
    liveCueDisplay,
    voiceAvailable: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    voiceStatusMessage,
  });
}

function renderRoute(route) {
  const view = trainingView();
  if (route === "splash") return renderSplash();
  if (route === "onboard") return renderOnboard();
  if (route === "home") return renderHome(state);
  if (route === "training") return renderTraining(state, view);
  if (route === "results") return renderResults(state, view);
  return renderPlayer(state);
}

function showRenderError(error, route) {
  console.error("[PitchIQ render error]", route, error);
  appElement.innerHTML = `<section class="screen app active" style="display:grid;place-items:center;min-height:100dvh"><div class="glass" style="padding:24px;max-width:680px"><span class="kicker">Recovery mode</span><h1>PitchIQ could not render ${route}</h1><p style="color:var(--muted)">The app caught a render error instead of showing a blank screen. Open the browser console for details.</p><button class="primary" data-route="splash">Return to splash</button></div></section>`;
  bindScreen(appElement, api);
}

function render(route = currentRoute) {
  try {
    ensureShell();
    currentRoute = guardRoute(route);
    appElement.innerHTML = renderRoute(currentRoute);
    document.body.classList.toggle("pitchiq-splash-active", currentRoute === "splash");
    document.body.classList.toggle("pitchiq-immersive-active", immersive());
    document.querySelector(".app-shell")?.classList.toggle("pitchiq-immersive-active", immersive());
    nav.classList.toggle("visible", !["splash", "onboard"].includes(currentRoute) && !immersive());
    sparkles(document.getElementById("particles"));
    bindScreen(appElement, api);
    saveState(state);
    window.dispatchEvent(new CustomEvent("pitchiq:render", { detail: { route: currentRoute } }));
  } catch (error) {
    showRenderError(error, route);
  }
}

function goto(route) {
  route = guardRoute(route);
  if (route === "training" && training.stage === "results") training.home();
  render(route);
}

function setOnboardStep(step) {
  onboardingStep = step;
  document.querySelectorAll("[data-onboard-step]").forEach((panel) => {
    panel.hidden = Number(panel.dataset.onboardStep) !== onboardingStep;
  });
  const player = PlayerService.getPlayer();
  const name = document.getElementById("confirmName");
  const position = document.getElementById("confirmPosition");
  if (name) name.textContent = player.name || document.getElementById("nameInput")?.value || "—";
  if (position) position.textContent = selectedPosition || player.position || "—";
}

function resetPlayer() {
  if (!window.confirm("Reset PitchIQ profile?")) return;
  resetState();
  PlayerService.resetPlayer();
  Object.assign(state, normalizeState(loadState()));
  selectedPosition = "";
  training.home();
  goto("splash");
}

const training = new TrainingController({ state, save: () => saveState(state), render: () => render("training") });
const api = {
  state,
  training,
  goto,
  setOnboardStep,
  completeOnboarding,
  get selectedPosition() { return selectedPosition; },
  set selectedPosition(value) { selectedPosition = value; },
};

createPlayerProfileEditor({
  getState: () => state,
  saveState,
  rerenderPlayer: () => render("player"),
  notify: toast,
  onPositionChanged: () => {
    selectedPosition = state.profile.position;
    training.selectedDrillId = null;
    training.home();
  },
  resetPlayer,
});

window.PitchIQApp = Object.freeze({
  ...(window.PitchIQApp || {}),
  enterFromLanding: () => {
    const target = onboardingComplete() ? "home" : "onboard";
    goto(target);
    return target;
  },
  enterHomeFromModule: () => {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    goto("home");
    return "home";
  },
});

if (devMode) console.info("[PitchIQ] developer mode enabled");
render(onboardingComplete() ? "home" : "splash");
window.__PITCHIQ_READY__ = true;
