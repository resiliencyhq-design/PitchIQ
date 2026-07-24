import { loadState, saveState, resetState, normalizeState } from "../services/storage.js";
import { addXP, completeDaily, openReward } from "../game/progression.js";
import { CORE_CUES, getCue } from "../data/cues.js";
import { createSession, nextCue as sessionNextCue, adaptiveDifficulty } from "../game/session.js";
import { REWARDS } from "../data/rewards.js";
import { PitchIQCameraEngine } from "../services/camera.js";
import { PitchIQVoiceEngine } from "../services/voice.js";
import { toast, sparkles } from "../components/ui.js";
import { renderSplash, renderOnboard, renderHome, renderTraining, renderResults, renderPlayer, renderNav } from "./routes.js?v=step1-art-align-20260620";
import { recommendedDrills } from "../data/drills.js";
import { createPlayerProfileEditor } from "./player-profile-editor.js?v=refactor-h39-player-reset-single-owner-20260723";

let state = normalizeState(loadState());
let selectedPosition = "";
let onboardingStep = 1;
let currentRoute = "splash";
let cue = CORE_CUES[0];
let selectedDrillId = null;
let selectedDifficulty = "medium";
let responseMode = "coach";
let trainingStage = "home";
let trainingSummary = null;
let activeSession = null;
let training = { time:45, score:0, combo:0, timer:null, countdown:null };
let trainingStateSnapshot = null;
let camera = null;
let voice = null;
let voiceReady = false;
let voiceStatusMessage = "";
let sharedAudioCtx = null;
let splashAudioUnlocked = false;
let camScore = 0;
let devPanelOpen = sessionStorage.getItem("pitchiq-dev-open") === "1";
let devBorderEnabled = localStorage.getItem("pitchiqDevBorderEnabled") !== "false";
const app = document.getElementById("app");
let nav = document.getElementById("nav");
const BUILD_ID = "ui-consistency-football-progress";
const VALID_ROUTES = new Set(["splash", "onboard", "home", "training", "results", "player"]);
const PROTECTED_ROUTES = new Set(["home", "training", "results", "player"]);
const DEV_JUMP_ROUTES = {"1":"splash","2":"onboard","3":"home","4":"training","5":"results","6":"player"};
const DEV_HASH_ROUTES = new Set(["splash", "onboard", "home", "training", "results", "player"]);
const ONBOARDING_COMPLETE_KEY = "pitchiqOnboardingComplete";
const PLAYER_NAME_KEY = "pitchiqPlayerName";
const SELECTED_POSITION_KEY = "pitchiqSelectedPosition";
const params = new URLSearchParams(window.location.search);
const DEV_MODE_ENABLED = params.has("dev");
function onboardingComplete(){ const storedName=localStorage.getItem(PLAYER_NAME_KEY), storedPosition=localStorage.getItem(SELECTED_POSITION_KEY); if(localStorage.getItem(ONBOARDING_COMPLETE_KEY)==="true"&&storedName&&storedPosition)return true; if(state.profile?.name&&state.profile?.position){ localStorage.setItem(PLAYER_NAME_KEY,state.profile.name); localStorage.setItem(SELECTED_POSITION_KEY,state.profile.position); localStorage.setItem(ONBOARDING_COMPLETE_KEY,"true"); return true; } return false; }
function syncProfileFromOnboardingKeys(){ const name=localStorage.getItem(PLAYER_NAME_KEY), position=localStorage.getItem(SELECTED_POSITION_KEY); if(name)state.profile.name=name; if(position)state.profile.position=position; }
function completeOnboarding(name,position){ localStorage.setItem(PLAYER_NAME_KEY,name); localStorage.setItem(SELECTED_POSITION_KEY,position); localStorage.setItem(ONBOARDING_COMPLETE_KEY,"true"); state.profile.name=name; state.profile.position=position; state.profile.createdAt ||= Date.now(); saveState(state); }
function clearOnboardingLock(){ localStorage.removeItem(ONBOARDING_COMPLETE_KEY); localStorage.removeItem(PLAYER_NAME_KEY); localStorage.removeItem(SELECTED_POSITION_KEY); state.profile.name=""; state.profile.position=""; state.profile.createdAt=null; saveState(state); }
function ensureAppShell(){ app.classList.add("scrollable-content","app-scroll"); if(!nav){ nav=document.createElement("nav"); nav.id="nav"; nav.setAttribute("aria-label","Main navigation"); document.body.appendChild(nav); } nav.className="nav bottom-nav"; nav.innerHTML=renderNav(); }
function applyDeveloperBorder(){ document.body.classList.toggle("pitchiq-dev-border", DEV_MODE_ENABLED&&devBorderEnabled); document.querySelector(".app-shell")?.classList.toggle("DeveloperIPhoneFrame", DEV_MODE_ENABLED&&devBorderEnabled); }
function showRenderError(error,route){ console.error("[PitchIQ render error]",route,error); app.innerHTML=`<section class="screen app active" style="display:grid;place-items:center;min-height:100dvh"><div class="glass" style="padding:24px;max-width:680px"><span class="kicker">Recovery mode</span><h1>PitchIQ could not render ${route}</h1><p style="color:var(--muted)">The app caught a render error instead of showing a blank screen. Open the browser console for details.</p><button class="primary" data-route="splash">Return to splash</button></div></section>`; bindScreen(); }
function guardRoute(route){ if(!VALID_ROUTES.has(route))return "home"; if(PROTECTED_ROUTES.has(route)&&!onboardingComplete())return "onboard"; if(PROTECTED_ROUTES.has(route))syncProfileFromOnboardingKeys(); return route; }
function render(route="splash"){ try{ ensureAppShell(); applyDeveloperBorder(); route=guardRoute(route); currentRoute=route; if(route==="splash")app.innerHTML=renderSplash(); if(route==="onboard")app.innerHTML=renderOnboard(); if(route==="home")app.innerHTML=renderHome(state); if(route==="training")app.innerHTML=renderTraining(state,trainingView()); if(route==="results")app.innerHTML=renderResults(state,trainingView()); if(route==="player")app.innerHTML=renderPlayer(state); document.body.classList.toggle("pitchiq-splash-active",route==="splash"); document.body.classList.toggle("pitchiq-immersive-active",isImmersiveTrainingStage()); document.querySelector(".app-shell")?.classList.toggle("pitchiq-immersive-active",isImmersiveTrainingStage()); nav.classList.toggle("visible",!["splash","onboard"].includes(route)&&!isImmersiveTrainingStage()); sparkles(document.getElementById("particles")); bindScreen(); renderDeveloperPanel(); saveState(state); }catch(error){ showRenderError(error,route); } }
function isImmersiveTrainingStage(){ return currentRoute==="training"&&["setup","ready","countdown","live","exit-confirm"].includes(trainingStage); }
function freshTrainingState(){ return { time:45, score:0, combo:0, timer:null, countdown:null }; }
function goto(route){ route=guardRoute(route); stopEphemeral(); if(route==="training"&&trainingStage==="results"){ activeSession=null; trainingStage="home"; training=freshTrainingState(); }else if(route==="training")trainingStage ||= "home"; render(route); }
function enterFromLanding(){ const target=onboardingComplete()?"home":"onboard"; goto(target); return target; }
function enterHomeFromModule(){ window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`); goto("home"); return "home"; }
window.PitchIQApp=Object.freeze({...(window.PitchIQApp||{}),enterFromLanding,enterHomeFromModule});
function stopEphemeral(){ if(training.timer)clearInterval(training.timer); training.timer=null; voice?.stop?.(); voice=null; voiceReady=false; if(currentRoute!=="camera")camera?.stop?.(); }
function routeLabel(route){ return route==="splash"?"Splash":route==="onboard"?"Create Player":route==="home"?"Home":route==="training"?"Training":route==="results"?"Results":route==="player"?"Player":route.charAt(0).toUpperCase()+route.slice(1); }
function renderDeveloperPanel(){ if(!DEV_MODE_ENABLED){ document.body.classList.remove("pitchiq-dev-border"); document.querySelector(".app-shell")?.classList.remove("DeveloperIPhoneFrame"); return; } applyDeveloperBorder(); let toggle=document.getElementById("pitchiq-dev-toggle"); if(!toggle){ toggle=document.createElement("button"); toggle.id="pitchiq-dev-toggle"; toggle.type="button"; toggle.setAttribute("aria-label","Toggle developer navigation"); toggle.style.cssText="position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:calc(env(safe-area-inset-left,0px) + 8px);z-index:10000;width:44px;height:44px;min-height:44px;padding:0;border-radius:14px;background:rgba(10,16,28,.62);color:#d7ff2e;border:1px solid rgba(215,255,46,.22);font:700 18px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;box-shadow:0 8px 24px rgba(0,0,0,.22);backdrop-filter:blur(18px)"; document.body.appendChild(toggle); toggle.addEventListener("click",()=>{ devPanelOpen=!devPanelOpen; sessionStorage.setItem("pitchiq-dev-open",devPanelOpen?"1":"0"); renderDeveloperPanel(); }); } toggle.textContent=devPanelOpen?"×":"☰"; let panel=document.getElementById("pitchiq-dev-panel"); if(!panel){ panel=document.createElement("aside"); panel.id="pitchiq-dev-panel"; panel.setAttribute("aria-label","PitchIQ Developer navigation"); panel.style.cssText="position:fixed;top:calc(env(safe-area-inset-top,0px) + 58px);left:calc(env(safe-area-inset-left,0px) + 8px);z-index:9999;background:rgba(10,16,28,.88);color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:10px;font:12px/1.3 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:190px;backdrop-filter:blur(18px)"; document.body.appendChild(panel); } panel.style.display=devPanelOpen?"block":"none"; if(!devPanelOpen)return; const routeButtons=Object.entries(DEV_JUMP_ROUTES).map(([key,route])=>`<button type="button" data-dev-route="${route}" style="display:block;width:100%;margin:3px 0;padding:5px 7px;border:0;border-radius:7px;background:rgba(255,255,255,.12);color:#fff;text-align:left;font:inherit;cursor:pointer">[${key}] ${routeLabel(route)}</button>`).join(""); panel.innerHTML=`<strong style="display:block;margin-bottom:6px">PitchIQ Developer</strong>${routeButtons}<hr style="border:0;border-top:1px solid rgba(255,255,255,.14);margin:8px 0"><button type="button" data-dev-border-toggle style="display:block;width:100%;margin:3px 0;padding:6px 7px;border:0;border-radius:7px;background:rgba(215,255,46,.14);color:#d7ff2e;text-align:left;font:inherit;cursor:pointer">Dev iPhone Border<br><small>${devBorderEnabled?"Hide dev iPhone border":"Show dev iPhone border"}</small></button><button type="button" data-dev-reset-onboarding style="display:block;width:100%;margin:3px 0;padding:6px 7px;border:0;border-radius:7px;background:rgba(255,138,138,.14);color:#fff;text-align:left;font:inherit;cursor:pointer">Reset Onboarding<br><small>Restore first-run flow</small></button><button type="button" data-dev-route="home" style="display:block;width:100%;margin:3px 0;padding:6px 7px;border:0;border-radius:7px;background:rgba(49,247,154,.14);color:#fff;text-align:left;font:inherit;cursor:pointer">Return to Dashboard<br><small>Requires onboarding complete</small></button>`; panel.querySelectorAll("[data-dev-route]").forEach(button=>button.addEventListener("click",()=>{ const route=button.dataset.devRoute; console.log(`[PitchIQ Dev] Jump to ${route}`); goto(route); })); panel.querySelector("[data-dev-border-toggle]")?.addEventListener("click",()=>{ devBorderEnabled=!devBorderEnabled; localStorage.setItem("pitchiqDevBorderEnabled",devBorderEnabled?"true":"false"); applyDeveloperBorder(); renderDeveloperPanel(); }); panel.querySelector("[data-dev-reset-onboarding]")?.addEventListener("click",()=>{ clearOnboardingLock(); selectedPosition=""; onboardingStep=1; toast("Onboarding reset"); goto("splash"); }); }
function devInitialRoute(){ const route=window.location.hash.replace("#","").toLowerCase(); if(DEV_MODE_ENABLED&&DEV_HASH_ROUTES.has(route))return guardRoute(route); return onboardingComplete()?"home":"splash"; }
function positionDrills(){ return recommendedDrills(state.profile.position||"Winger"); }
function missionDrill(){ return positionDrills()[0]||null; }
function selectedDrill(){ return activeSession?.drill||positionDrills().find(drill=>drill.id===selectedDrillId)||missionDrill(); }
function liveCueDisplay(cue){ const id=String(cue?.id||"").toLowerCase(); if(["red","blue","green","yellow"].includes(id))return id.toUpperCase(); if(cue?.type==="scan")return "SCAN"; if(["direction","command"].includes(cue?.type))return (cue.label||id||"").toUpperCase(); return cue?.display||"SCAN"; }
function updateLiveCueShell(cue){ const shell=document.querySelector(".live-rep"); if(!shell)return; shell.classList.remove("cue-red","cue-blue","cue-green","cue-yellow"); const id=String(cue?.id||"").toLowerCase(); if(["red","blue","green","yellow"].includes(id))shell.classList.add(`cue-${id}`); }
function voiceAvailable(){ return Boolean(window.SpeechRecognition||window.webkitSpeechRecognition); }
function trainingView(){ return { stage:trainingStage, selectedDrillId, selectedDrill:selectedDrill(), missionDrill:missionDrill(), difficulty:selectedDifficulty, responseMode, voiceAvailable:voiceAvailable(), voiceStatusMessage, summary:trainingSummary, time:training.time, score:training.score, combo:training.combo, countdown:training.countdown, cueId:cue?.id, cueType:cue?.type, cueLabel:cue?.label, cueDisplay:cue?.display, liveCueDisplay:liveCueDisplay(cue), instruction:activeSession?.currentCue?"Say or tap: "+activeSession.currentCue.acceptedResponses[0].toUpperCase()+" • "+selectedDifficulty.toUpperCase():"Say or tap the cue.", rewardName:state.game?.dailyDone?"Daily Academy Pack":"Academy Training Pack" }; }
function voiceCueSupported(cue){ return Boolean(expectedVoiceKeyword(cue)); }
function nextVoiceCue(drill){ const ids=(drill?.cuePool||[]).filter(id=>["red","blue","left","right","check"].includes(id)); const id=(ids.length?ids:["red","blue","left","right","check"])[Math.floor(Math.random()*(ids.length||5))]; return getCue(id); }
function renderTrainingRoute(){ render("training"); }
function setTrainingStage(stage){ trainingStage=stage; renderTrainingRoute(); }
function onboardingPositionName(position){ return {LW:"Left Wing",ST:"Striker",RW:"Right Wing",CAM:"Central Attacking Midfielder",CM:"Central Midfielder",CDM:"Defensive Midfielder",LB:"Left Back",CB:"Centre Back",RB:"Right Back",GK:"Goalkeeper"}[position]||position||"—"; }
function setOnboardStep(step){ onboardingStep=step; const progress=document.querySelector(".onboard-progress"); if(progress){ const progressImages={1:"assets/onboarding/progress-base.png?v=2",2:"assets/onboarding/progress-name-active.png?v=2",3:"assets/onboarding/progress-position-active.png?v=2"}; progress.dataset.step=String(step); progress.src=progressImages[step]||progressImages[1]; progress.setAttribute("aria-label",`Onboarding progress: step ${step} of 3`); } document.querySelectorAll("[data-onboard-step]").forEach(panel=>{ panel.hidden=Number(panel.dataset.onboardStep)!==step; }); document.querySelectorAll("[data-step-dot]").forEach(dot=>dot.classList.toggle("active",Number(dot.dataset.stepDot)===step)); const confirmName=document.getElementById("confirmName"), confirmPosition=document.getElementById("confirmPosition"), storedPosition=localStorage.getItem(SELECTED_POSITION_KEY)||selectedPosition; if(confirmName)confirmName.textContent=localStorage.getItem(PLAYER_NAME_KEY)||"—"; if(confirmPosition)confirmPosition.textContent=onboardingPositionName(storedPosition); }
function bindOnboardingWizard(){ const nameInput=document.getElementById("nameInput"); const storedName=localStorage.getItem(PLAYER_NAME_KEY)||""; if(nameInput){ nameInput.value=storedName; const next=document.querySelector('[data-action="onboard-next-name"]'), jerseyName=document.getElementById("jerseyNamePreview"); const updateName=()=>{ const value=nameInput.value.trim(); if(jerseyName)jerseyName.textContent=(value||"NAME").toUpperCase(); if(value)next?.removeAttribute("disabled"); else next?.setAttribute("disabled","true"); }; nameInput.addEventListener("input",updateName); updateName(); } if(currentRoute==="onboard")setOnboardStep(storedName?2:1); }
