import { loadState, saveState, resetState, normalizeState } from "../services/storage.js";
import { addXP, completeDaily, openReward } from "../game/progression.js";
import { CORE_CUES, getCue } from "../data/cues.js";
import { createSession, nextCue as sessionNextCue, adaptiveDifficulty, cueTimeoutForDifficulty } from "../game/session.js";
import { REWARDS } from "../data/rewards.js";
import { PitchIQCameraEngine } from "../services/camera.js";
import { PitchIQVoiceEngine } from "../services/voice.js";
import { scoreVoiceAnswer } from "../game/scoring.js";
import { toast, sparkles } from "../components/ui.js";
import { renderSplash, renderOnboard, renderMission, renderHome, renderTraining, renderCamera, renderReward, renderPlayer, renderCareer, renderAnalytics, renderSettings, renderNav } from "./routes.js";
import { recommendedDrills } from "../data/drills.js";

let state = normalizeState(loadState());

let selectedPosition = "";
let currentRoute = "splash";
let cue = CORE_CUES[0];
let selectedDrillId = null;
let selectedDifficulty = "medium";
let trainingStage = "home";
let trainingSummary = null;
let activeSession = null;
let training = { time:45, score:0, combo:1, timer:null };
let camera = null;
let voice = null;
let camScore = 0;

const app = document.getElementById("app");
const nav = document.getElementById("nav");
const BUILD_ID = "sprint-4.4-daily-mission";
const VALID_ROUTES = new Set(["splash", "onboard", "mission", "home", "training", "camera", "reward", "player", "analytics", "career", "settings"]);

function showRenderError(error, route){
  console.error("[PitchIQ render error]", route, error);
  app.innerHTML = `<section class="screen app active" style="display:grid;place-items:center;min-height:100dvh"><div class="glass" style="padding:24px;max-width:680px"><span class="kicker">Recovery mode</span><h1>PitchIQ could not render ${route}</h1><p style="color:var(--muted)">The app caught a render error instead of showing a blank screen. Open the browser console for details.</p><button class="primary" data-route="splash">Return to splash</button></div></section>`;
  bindScreen();
}

function render(route="splash"){
  try {
    if (!VALID_ROUTES.has(route)) route = "home";
  currentRoute = route;
  if(route === "splash") app.innerHTML = renderSplash();
  if(route === "onboard") app.innerHTML = renderOnboard();
  if(route === "mission") app.innerHTML = renderMission(state);
  if(route === "home") app.innerHTML = renderHome(state);
  if(route === "training") app.innerHTML = renderTraining(state, trainingView());
  if(route === "camera") app.innerHTML = renderCamera();
  if(route === "reward") app.innerHTML = renderReward(state);
  if(route === "player") app.innerHTML = renderPlayer(state);
  if(route === "analytics") app.innerHTML = renderAnalytics(state);
  if(route === "career") app.innerHTML = renderCareer(state);
  if(route === "settings") app.innerHTML = renderSettings(state);
  nav.innerHTML = renderNav();
  nav.classList.toggle("visible", !["splash","onboard","mission"].includes(route));
  sparkles(document.getElementById("particles"));
  bindScreen();
  saveState(state);

  } catch(error) {
    showRenderError(error, route);
  }
}
function goto(route){ if (!VALID_ROUTES.has(route)) route = "home"; stopEphemeral(); if(route === "training") trainingStage ||= "home"; render(route); }
function stopEphemeral(){ if(training.timer) clearInterval(training.timer); training.timer = null; if(currentRoute !== "camera") camera?.stop?.(); }

function positionDrills(){
  return recommendedDrills(state.profile.position || "Winger");
}
function missionDrill(){
  return positionDrills()[0] || null;
}
function selectedDrill(){
  return activeSession?.drill || positionDrills().find(drill=>drill.id === selectedDrillId) || missionDrill();
}
function trainingView(){
  return {
    stage: trainingStage,
    selectedDrillId,
    selectedDrill: selectedDrill(),
    missionDrill: missionDrill(),
    difficulty: selectedDifficulty,
    summary: trainingSummary,
    time: training.time,
    score: training.score,
    combo: training.combo,
    cueDisplay: cue?.display,
    instruction: activeSession?.currentCue ? "Say or tap: " + activeSession.currentCue.acceptedResponses[0].toUpperCase() + " • " + selectedDifficulty.toUpperCase() : "Say or tap the cue.",
    rewardName: state.game?.dailyDone ? "Daily Academy Pack" : "Academy Training Pack"
  };
}
function renderTrainingRoute(){ render("training"); }
function setTrainingStage(stage){ trainingStage = stage; renderTrainingRoute(); }

function bindOnboardPositionSelector(){
  const pitch = document.querySelector(".academy-pitch");
  const ball = document.querySelector(".pitch-ball");
  const confirm = document.querySelector("#positionConfirm");
  const cta = document.querySelector(".onboard-cta-v1");
  const nodes = [...document.querySelectorAll(".pitch-node")];
  if(!pitch || !ball || !nodes.length) return;
  selectedPosition = "";
  cta?.setAttribute("disabled", "true");

  const setPosition = (node)=>{
    if(!node) return;
    nodes.forEach(n=>n.classList.remove("selected","targeted"));
    node.classList.add("selected");
    selectedPosition = node.dataset.pos;
    ball.dataset.pos = selectedPosition;
    ball.style.gridArea = node.dataset.slot || node.style.gridArea;
    if(confirm) confirm.innerHTML = `<span>Selected:</span><b>${selectedPosition}</b>`;
    cta?.removeAttribute("disabled");
  };
  const nearestNode = (clientX, clientY)=>{
    let nearest = null;
    let best = Infinity;
    nodes.forEach(node=>{
      const r = node.getBoundingClientRect();
      const x = r.left + r.width/2;
      const y = r.top + r.height/2;
      const d = Math.hypot(clientX - x, clientY - y);
      if(d < best){ best = d; nearest = node; }
    });
    return nearest;
  };
  nodes.forEach(node=>node.addEventListener("click",()=>setPosition(node)));
  let dragging = false;
  ball.addEventListener("pointerdown", e=>{ dragging = true; ball.setPointerCapture?.(e.pointerId); ball.classList.add("dragging"); });
  ball.addEventListener("pointermove", e=>{
    if(!dragging) return;
    const node = nearestNode(e.clientX, e.clientY);
    nodes.forEach(n=>n.classList.toggle("targeted", n === node));
  });
  ball.addEventListener("pointerup", e=>{
    if(!dragging) return;
    dragging = false;
    ball.classList.remove("dragging");
    const node = nearestNode(e.clientX, e.clientY);
    setPosition(node);
  });
}

function bindScreen(){
  document.querySelectorAll("[data-route]").forEach(el=>el.addEventListener("click",()=>{
    const route = el.dataset.route;
    if (!VALID_ROUTES.has(route)) {
      console.warn("[PitchIQ route] Route missing:", route);
      toast("Route not available yet");
      return;
    }
    goto(route);
  }));
  document.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",()=>handleAction(el.dataset.action, el)));
  document.querySelectorAll("[data-answer]").forEach(el=>el.addEventListener("click",()=>manualAnswer(el.dataset.answer)));
  bindOnboardPositionSelector();
  document.querySelectorAll("[data-pos]:not(.pitch-node)").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll("[data-pos]").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected"); selectedPosition = btn.dataset.pos;
  }));
  document.querySelectorAll("[data-drill]").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll("[data-drill]").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active"); selectedDrillId = btn.dataset.drill;
    toast("Selected: "+btn.querySelector("b").textContent);
  }));
  const sens = document.getElementById("sensitivity");
  if(sens) sens.addEventListener("input", e=>camera?.setSensitivity(Number(e.target.value)));
}
function handleAction(action, el){
  if(action==="enter") return state.profile.name ? goto("mission") : goto("onboard");
  if(action==="save-profile") return saveProfile();
  if(action==="reset") return reset();
  if(action==="training-home") return trainingHome();
  if(action==="choose-drill-stage") return setTrainingStage("choose-drill");
  if(action==="choose-difficulty-stage") return setTrainingStage("choose-difficulty");
  if(action==="choose-drill") return chooseDrill(el);
  if(action==="choose-difficulty") return chooseDifficulty(el);
  if(action==="claim-reward-stage") return setTrainingStage("claim-reward");
  if(action==="start-mission-training") return startMissionTraining();
  if(action==="start-training") return startTraining();
  if(action==="voice") return startVoice();
  if(action==="correct") return correct();
  if(action==="wrong") return wrong();
  if(action==="finish-training") return finishTraining();
  if(action==="test-video") return testVideo();
  if(action==="front-camera") return startCamera("user");
  if(action==="rear-camera") return startCamera("environment");
  if(action==="stop-camera") return camera?.stop();
  if(action==="camera-round") return cameraRound();
  if(action==="open-pack") return openPackAction();
}
function saveProfile(){
  if(!selectedPosition) return toast("Choose your position");
  const name = document.getElementById("nameInput")?.value?.trim() || "Player";
  state.profile.name = name; state.profile.position = selectedPosition; state.profile.createdAt ||= Date.now();
  toast("Welcome to PitchIQ Academy"); goto("mission");
}
function reset(){ if(confirm("Reset PitchIQ profile?")){ resetState(); state = normalizeState(loadState()); selectedPosition = ""; try {
  render("splash");
  window.__PITCHIQ_READY__ = true;
} catch (error) {
  showRenderError(error, "splash");
} } }

function trainingHome(){ stopEphemeral(); activeSession = null; trainingStage = "home"; training = { time:45, score:0, combo:1, timer:null }; renderTrainingRoute(); }
function chooseDrill(el){ selectedDrillId = el?.dataset?.drill || selectedDrillId; setTrainingStage("choose-difficulty"); }
function chooseDifficulty(el){ selectedDifficulty = el?.dataset?.difficulty || "medium"; setTrainingStage("preview"); }
function startMissionTraining(){ selectedDrillId = missionDrill()?.id || selectedDrillId; selectedDifficulty = "medium"; setTrainingStage("preview"); }

function randomCue(){ 
  if(activeSession?.drill) return sessionNextCue(activeSession.drill);
  cue = CORE_CUES[Math.floor(Math.random()*CORE_CUES.length)]; 
  return cue; 
}
function startTraining(){
  if(training.timer) clearInterval(training.timer);
  activeSession = createSession({ position:state.profile.position, drillId:selectedDrillId, level:state.game.level });
  selectedDrillId = activeSession.drill.id;
  training = { time:activeSession.drill.seconds, score:0, combo:1, timer:null };
  trainingSummary = null;
  state.game.lastXp = 0;
  trainingStage = "live";
  renderTrainingRoute();
  updateTraining();
  nextCue();
  training.timer = setInterval(()=>{ training.time--; updateTraining(); if(training.time<=0) finishTraining(); },1000);
  toast("Started: "+activeSession.drill.name);
}
function updateTraining(){
  const t = document.getElementById("time"), s = document.getElementById("score"), c = document.getElementById("combo");
  if(t) t.textContent = training.time; if(s) s.textContent = training.score; if(c) c.textContent = training.combo;
}
function nextCue(){
  cue = randomCue();
  if(activeSession) activeSession.currentCue = cue;
  const cueEl = document.getElementById("cue");
  const instruction = document.getElementById("instruction");
  if(cueEl) cueEl.textContent = cue.display;
  const difficulty = activeSession ? adaptiveDifficulty(activeSession) : 1;
  if(instruction) instruction.textContent = "Say or tap: " + cue.acceptedResponses[0].toUpperCase() + " • " + selectedDifficulty.toUpperCase() + " • D" + difficulty;
  voice?.updateCue?.(cue);
}
function manualAnswer(ans){ if(trainingStage !== "live") return; cue.acceptedResponses.includes(ans) ? correct() : wrong(); }
function correct(){
  if(trainingStage !== "live") return;
  const gain = cue.xpBase * training.combo;
  training.score += gain;
  if(activeSession) activeSession.results.push({ cueId:cue.id, correct:true, xpAwarded:gain, reactionMs:null, detected:false, timestamp:Date.now() });
  const leveled = addXP(state, gain);
  training.combo = Math.min(9, training.combo + 1);
  state.game.bestCombo = Math.max(state.game.bestCombo, training.combo);
  toast(leveled ? "LEVEL UP 🏆" : "+"+gain+" XP 🔥");
  updateTraining(); nextCue();
}
function wrong(){ 
  if(trainingStage !== "live") return;
  if(activeSession) activeSession.results.push({ cueId:cue.id, correct:false, xpAwarded:0, reactionMs:null, detected:false, timestamp:Date.now() });
  training.combo = 1; training.score = Math.max(0, training.score-10); toast("Reset. Next cue."); updateTraining(); nextCue(); 
}
function finishTraining(){ 
  if(training.timer) clearInterval(training.timer); 
  training.timer = null;
  completeDaily(state); 
  if(activeSession){
    const attempts = activeSession.results.length;
    const correctCount = activeSession.results.filter(r=>r.correct).length;
    const accuracy = attempts ? Math.round(correctCount / attempts * 100) : 0;
    trainingSummary = { attempts, correct:correctCount, accuracy, score:training.score, xp:state.game.lastXp, combo:state.game.bestCombo };
    state.analytics.sessions.push({ id:activeSession.id, drill:activeSession.drill.id, difficulty:selectedDifficulty, score:training.score, results:activeSession.results, endedAt:Date.now() });
  } else {
    trainingSummary = { attempts:0, correct:0, accuracy:0, score:training.score, xp:state.game.lastXp, combo:state.game.bestCombo };
  }
  trainingStage = "results";
  toast("Session complete 🏆"); renderTrainingRoute(); 
}

function startVoice(){
  if(trainingStage !== "live") return toast("Start a live session first");
  voice = new PitchIQVoiceEngine({
    onStatus:(s)=>toast("Voice: "+s),
    onTranscript:(t)=>{},
    onResult:(r)=>{
      if(r.correct){ const leveled = addXP(state, r.xpAwarded); if(activeSession) activeSession.results.push({ cueId:r.cueId, correct:true, xpAwarded:r.xpAwarded, reactionMs:null, detected:false, timestamp:r.timestamp }); toast(leveled ? "LEVEL UP 🏆" : "+"+r.xpAwarded+" XP 🎤"); nextCue(); }
      else toast("Heard: "+r.transcript);
    }
  });
  if(!voice.start(cue)) toast("Voice not supported");
}
async function testVideo(){
  try{ const st = await navigator.mediaDevices.getUserMedia({video:true,audio:false}); st.getTracks().forEach(t=>t.stop()); document.getElementById("videoStatus").textContent="Video works"; toast("Camera test passed"); }
  catch{ document.getElementById("videoStatus").textContent="Camera blocked"; toast("Camera failed"); }
}
async function startCamera(mode){
  const video = document.getElementById("video"), canvas = document.getElementById("motion"), cueEl = document.getElementById("cameraCue");
  camera = new PitchIQCameraEngine(video, canvas, {
    onStatus:(s)=>{ const st=document.getElementById("cameraStatus"); if(st) st.textContent=s; if(cueEl && s==="missed"){ cueEl.textContent="MISS"; cueEl.className="camera-cue miss"; } },
    onMotionScore:(m)=>{ const mr=document.getElementById("motionRead"); if(mr) mr.textContent="Motion "+Math.round(m); },
    onResult:(r)=>{
      if(r.detected){
        cueEl.textContent = r.reactionMs+" ms"; cueEl.className = "camera-cue detected";
        document.getElementById("lastRT").textContent = r.reactionMs+" ms";
        camScore += r.xpAwarded; document.getElementById("camScore").textContent = camScore;
        if(!state.analytics.bestReaction || r.reactionMs < state.analytics.bestReaction){ state.analytics.bestReaction = r.reactionMs; document.getElementById("camBest").textContent = r.reactionMs+" ms"; }
        const leveled = addXP(state, r.xpAwarded); toast(leveled ? "LEVEL UP 🏆" : "+"+r.xpAwarded+" XP");
      }
    }
  });
  const ok = await camera.start(mode);
  toast(ok ? "Camera started" : "Camera unavailable");
}
function cameraRound(){ cue = getCue("red"); const el=document.getElementById("cameraCue"); el.textContent="MOVE"; el.className="camera-cue go"; camera?.startRound?.(cue); }
function openPackAction(){
  if(!state.game.dailyDone) return toast("Complete today's mission first");
  const reward = openReward(state, REWARDS);
  document.getElementById("pack")?.classList.add("open");
  document.getElementById("rewardTitle").textContent = reward.name;
  document.getElementById("rewardText").textContent = "Unlocked " + reward.tier + " reward";
  toast("Unlocked: "+reward.name); saveState(state);
}

try {
  render(state.profile.name ? "home" : "splash");
  window.__PITCHIQ_READY__ = true;
} catch (error) {
  showRenderError(error, currentRoute || "startup");
}
