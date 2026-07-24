import { loadState, normalizeState, resetState, saveState } from "../services/storage.js";
import { PlayerService } from "../services/player-service.js";
import { addXP, completeDaily } from "../game/progression.js";
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
} from "./routes.js?v=onboarding-canonical-ui-runtime-20260724";
import { FirstRunController } from "./controllers/first-run-controller.js";
import { TrainingController } from "./controllers/training-controller.js";
import { createPlayerProfileEditor } from "./player-profile-editor.js?v=refactor-h39-player-reset-single-owner-20260723";
import { bindScreen } from "./ui/bind-screen.js";
import { NotificationController } from "./notification-controller.js?v=sprint-n1-notification-centre-20260724";

const state = normalizeState(loadState());
const appElement = document.getElementById("app");
const validRoutes = new Set(["splash", "onboard", "home", "training", "results", "player"]);
const protectedRoutes = new Set(["home", "training", "results", "player"]);
const devMode = new URLSearchParams(window.location.search).has("dev");
let currentRoute = "splash";
let nav = document.getElementById("nav");
let selectedPosition = "";
let voiceStatusMessage = "";
let devPanelOpen = sessionStorage.getItem("pitchiq-dev-open") === "1";
let devBorderEnabled = localStorage.getItem("pitchiqDevBorderEnabled") !== "false";
let notifications;

function syncPlayer() {
  const player = PlayerService.getPlayer();
  state.profile = { ...(state.profile || {}), ...player };
  return player;
}

const firstRun = new FirstRunController({
  playerService: PlayerService,
  onChange: (nextState) => {
    state.firstRun = nextState;
    saveState(state);
  },
});
state.firstRun = firstRun.getState();

function onboardingComplete() {
  return firstRun.isComplete();
}

function cleanIdentityValue(step, value) {
  if (step === "name") return String(value || "").trim().slice(0, 18);
  if (step === "number") {
    const parsed = Number.parseInt(String(value || "").replace(/\D/g, ""), 10);
    return parsed >= 1 && parsed <= 99 ? String(parsed) : "";
  }
  if (step === "position") return String(value || "").trim();
  return "";
}

function saveIdentityStep(step, value) {
  if (step !== firstRun.getCurrentStep()) return firstRun.getState();
  const cleanValue = cleanIdentityValue(step, value);
  if (!cleanValue) return firstRun.getState();

  if (step === "name") state.profile = { ...state.profile, ...PlayerService.updatePlayer({ name: cleanValue }) };
  if (step === "number") state.profile = { ...state.profile, ...PlayerService.updatePlayer({ number: cleanValue }) };
  if (step === "position") state.profile = { ...state.profile, ...PlayerService.completeOnboarding({ position: cleanValue }) };

  firstRun.completeStep(step);
  saveState(state);
  render("onboard");
  return firstRun.getState();
}

function guardRoute(route) {
  if (!validRoutes.has(route)) return firstRun.getEntryRoute();
  if (protectedRoutes.has(route) && !onboardingComplete()) return firstRun.getEntryRoute();
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

function bindNavigation() {
  nav?.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => goto(button.dataset.route));
  });
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
  bindNavigation();
}

function applyDeveloperBorder() {
  document.body.classList.toggle("pitchiq-dev-border", devMode && devBorderEnabled);
  document.querySelector(".app-shell")?.classList.toggle("DeveloperIPhoneFrame", devMode && devBorderEnabled);
}

function renderDeveloperPanel() {
  document.getElementById("pitchiq-dev-toggle")?.remove();
  document.getElementById("pitchiq-dev-panel")?.remove();
  if (!devMode) return;
  applyDeveloperBorder();
  const toggle = document.createElement("button");
  toggle.id = "pitchiq-dev-toggle";
  toggle.type = "button";
  toggle.textContent = devPanelOpen ? "×" : "☰";
  toggle.setAttribute("aria-label", "Toggle developer navigation");
  const panel = document.createElement("aside");
  panel.id = "pitchiq-dev-panel";
  panel.hidden = !devPanelOpen;
  panel.innerHTML = `<strong>PitchIQ Developer</strong>${["splash", "onboard", "home", "training", "results", "player"].map((route) => `<button type="button" data-dev-route="${route}">${route}</button>`).join("")}<button type="button" data-dev-border>Toggle dev border</button><button type="button" data-dev-reset>Reset onboarding</button>`;
  toggle.addEventListener("click", () => { devPanelOpen = !devPanelOpen; sessionStorage.setItem("pitchiq-dev-open", devPanelOpen ? "1" : "0"); renderDeveloperPanel(); });
  panel.querySelectorAll("[data-dev-route]").forEach((button) => button.addEventListener("click", () => goto(button.dataset.devRoute)));
  panel.querySelector("[data-dev-border]").addEventListener("click", () => { devBorderEnabled = !devBorderEnabled; localStorage.setItem("pitchiqDevBorderEnabled", String(devBorderEnabled)); renderDeveloperPanel(); });
  panel.querySelector("[data-dev-reset]").addEventListener("click", resetPlayer);
  document.body.append(toggle, panel);
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
  if (route === "onboard") return renderOnboard(firstRun.getCurrentStep(), syncPlayer());
  if (route === "home") return renderHome(state, notifications?.getViewModel());
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
    applyDeveloperBorder();
    currentRoute = guardRoute(route);
    notifications?.syncProgression();
    appElement.innerHTML = renderRoute(currentRoute);
    document.body.classList.toggle("pitchiq-splash-active", currentRoute === "splash");
    document.body.classList.toggle("pitchiq-immersive-active", immersive());
    document.querySelector(".app-shell")?.classList.toggle("pitchiq-immersive-active", immersive());
    nav.classList.toggle("visible", !["splash", "onboard"].includes(currentRoute) && !immersive());
    sparkles(document.getElementById("particles"));
    bindScreen(appElement, api);
    renderDeveloperPanel();
    saveState(state);
    window.dispatchEvent(new CustomEvent("pitchiq:render", { detail: { route: currentRoute } }));
  } catch (error) {
    showRenderError(error, route);
  }
}

function goto(route) {
  notifications?.closeCentre();
  route = guardRoute(route);
  if (route === "training" && training.stage === "results") training.home();
  render(route);
}

function enterAcademy() {
  if (firstRun.getCurrentStep() !== "know-your-strengths") return firstRun.getState();
  firstRun.completeStep("know-your-strengths");
  const academy = window.PitchIQAcademy;
  if (academy && typeof academy.enter === "function") {
    academy.enter();
    return firstRun.getState();
  }
  window.location.hash = "academy-trial";
  return firstRun.getState();
}

function resetPlayer() {
  if (!window.confirm("Reset PitchIQ profile?")) return;
  resetState();
  PlayerService.resetPlayer();
  firstRun.reset();
  notifications?.reset();
  Object.assign(state, normalizeState(loadState()), { firstRun: firstRun.getState() });
  selectedPosition = "";
  ["pitchiq-onboarding-step", "pitchiq-number-flow-lock", "pitchiq-onboarding-lock"].forEach((key) => sessionStorage.removeItem(key));
  training.home();
  goto("splash");
}

function recordTrainingAnswer(result) {
  if (!result?.correct) return;
  addXP(state, result.xpAwarded);
  notifications?.syncProgression();
}

function completeTraining(summary, session) {
  if (!summary || !session) return;
  completeDaily(state);
  state.game.bestCombo = Math.max(state.game.bestCombo || 0, summary.combo || 0);
  state.game.trainingSeconds = (state.game.trainingSeconds || 0) + (session.drill.seconds || 45);
  state.analytics.sessions.push({
    id: session.id,
    drill: session.drill.id,
    difficulty: training.difficulty,
    score: summary.score,
    durationSeconds: session.drill.seconds || 45,
    results: session.results,
    endedAt: summary.endedAt,
  });
  notifications?.syncProgression();
  window.dispatchEvent(new CustomEvent("pitchiq:training-complete", { detail: { summary, session } }));
}

const training = new TrainingController({
  state,
  save: () => saveState(state),
  render: () => render("training"),
  renderResults: () => render("results"),
  onAnswer: recordTrainingAnswer,
  onComplete: completeTraining,
});
const api = {
  state,
  training,
  firstRun,
  goto,
  saveIdentityStep,
  enterAcademy,
  get selectedPosition() { return selectedPosition; },
  set selectedPosition(value) { selectedPosition = value; },
};

notifications = new NotificationController({
  getState: () => state,
  goto,
  onChange: () => {
    if (currentRoute === "home") render("home");
  },
});

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
  firstRun,
  getFirstRun: () => firstRun,
  enterAcademy,
  enterFromLanding: () => {
    if (firstRun.getCurrentStep() === "landing") firstRun.completeStep("landing");
    const target = firstRun.getEntryRoute();
    goto(target);
    return target;
  },
  enterHomeFromModule: () => {
    const target = firstRun.getEntryRoute();
    if (target !== "home") {
      goto(target);
      return target;
    }
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    goto("home");
    return "home";
  },
});

import("./academy-journey.js?v=remove-strengths-second-owner-20260724").catch((error) => {
  console.warn("[PitchIQ] Academy journey failed to load", error);
});
import("./academy-runtime-canonical.js?v=remove-strengths-second-owner-20260724").catch((error) => {
  console.warn("[PitchIQ] Academy runtime failed to load", error);
});

if (devMode) console.info("[PitchIQ] developer mode enabled");
firstRun.repair();
render(firstRun.getEntryRoute());
window.__PITCHIQ_READY__ = true;
