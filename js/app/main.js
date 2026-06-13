import { loadState, saveState, resetState } from "../services/storage.js";
import { addXP, completeDaily, openReward } from "../game/progression.js";
import { CORE_CUES, getCue } from "../data/cues.js";
import { createSession, nextCue as sessionNextCue, adaptiveDifficulty, cueTimeoutForDifficulty } from "../game/session.js";
import { REWARDS } from "../data/rewards.js";
import { PitchIQCameraEngine } from "../services/camera.js";
import { PitchIQVoiceEngine } from "../services/voice.js";
import { scoreVoiceAnswer } from "../game/scoring.js";
import { toast, sparkles } from "../components/ui.js";
import { renderSplash, renderOnboard, renderMission, renderHome, renderTraining, renderTrainingDrills, renderTrainingPreview, renderCamera, renderReward, renderPlayer, renderCareer, renderCollection, renderArt, renderAnalytics, renderAnalyticsRadar, renderAnalyticsHeatmap, renderAnalyticsCoach, renderAnalyticsParent, renderSettings, renderNav } from "./routes.js";

let state = loadState();
let selectedPosition = state.profile.position || "Winger";
let currentRoute = "splash";
let cue = CORE_CUES[0];
let selectedDrillId = null;
let activeSession = null;
let training = { time:45, score:0, combo:1, timer:null };
let camera = null;
let voice = null;
let camScore = 0;

const app = document.getElementById("app");
const nav = document.getElementById("nav");

function render(route="splash"){
  currentRoute = route;
  if(route === "splash") app.innerHTML = renderSplash();
  if(route === "onboard") app.innerHTML = renderOnboard();
  if(route === "mission") app.innerHTML = renderMission(state);
  if(route === "home") app.innerHTML = renderHome(state);
  if(route === "training") app.innerHTML = renderTraining();
  if(route === "camera") app.innerHTML = renderCamera();
  if(route === "reward") app.innerHTML = renderReward(state);
  if(route === "player") app.innerHTML = renderPlayer(state);
  if(route === "analytics") app.innerHTML = renderAnalytics(state);
  if(route === "analytics-radar") app.innerHTML = renderAnalyticsRadar(state);
  if(route === "analytics-heatmap") app.innerHTML = renderAnalyticsHeatmap(state);
  if(route === "analytics-coach") app.innerHTML = renderAnalyticsCoach(state);
  if(route === "analytics-parent") app.innerHTML = renderAnalyticsParent(state);
  if(route === "career") app.innerHTML = renderCareer(state);
  if(route === "collection") app.innerHTML = renderCollection(state);
  if(route === "art") app.innerHTML = renderArt(state);
  if(route === "settings") app.innerHTML = renderSettings(state);
  nav.innerHTML = renderNav();
  nav.classList.toggle("visible", !["splash","onboard","mission"].includes(route));
  sparkles(document.getElementById("particles"));
  bindScreen();
  saveState(state);
}
function goto(route){ stopEphemeral(); render(route); }
function stopEphemeral(){ if(training.timer) clearInterval(training.timer); if(currentRoute !== "camera") camera?.stop?.(); }

function bindScreen(){
  document.querySelectorAll("[data-route]").forEach(el=>el.addEventListener("click",()=>goto(el.dataset.route)));
  document.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",()=>handleAction(el.dataset.action)));
  document.querySelectorAll("[data-answer]").forEach(el=>el.addEventListener("click",()=>manualAnswer(el.dataset.answer)));
  document.querySelectorAll("[data-pos]").forEach(btn=>btn.addEventListener("click",()=>{
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
function handleAction(action){
  if(action==="enter") return state.profile.name ? goto("mission") : goto("onboard");
  if(action==="save-profile") return saveProfile();
  if(action==="reset") return reset();
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
  const name = document.getElementById("nameInput")?.value?.trim() || "Player";
  state.profile.name = name; state.profile.position = selectedPosition; state.profile.createdAt ||= Date.now();
  toast("Welcome to PitchIQ Academy"); goto("mission");
}
function reset(){ if(confirm("Reset PitchIQ profile?")){ resetState(); state = loadState(); render("splash"); } }

function randomCue(){ 
  if(activeSession?.drill) return sessionNextCue(activeSession.drill);
  cue = CORE_CUES[Math.floor(Math.random()*CORE_CUES.length)]; 
  return cue; 
}
function startTraining(){
  activeSession = createSession({ position:state.profile.position, drillId:selectedDrillId, level:state.game.level });
  training = { time:activeSession.drill.seconds, score:0, combo:1, timer:null };
  state.game.lastXp = 0; updateTraining();
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
  document.getElementById("cue").textContent = cue.display;
  const difficulty = activeSession ? adaptiveDifficulty(activeSession) : 1;
  document.getElementById("instruction").textContent = "Say or tap: " + cue.acceptedResponses[0].toUpperCase() + " • D" + difficulty;
  voice?.updateCue?.(cue);
}
function manualAnswer(ans){ cue.acceptedResponses.includes(ans) ? correct() : wrong(); }
function correct(){
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
  if(activeSession) activeSession.results.push({ cueId:cue.id, correct:false, xpAwarded:0, reactionMs:null, detected:false, timestamp:Date.now() });
  training.combo = 1; training.score = Math.max(0, training.score-10); toast("Reset. Next cue."); updateTraining(); nextCue(); 
}
function finishTraining(){ 
  if(training.timer) clearInterval(training.timer); 
  completeDaily(state); 
  if(activeSession){
    state.analytics.sessions.push({ id:activeSession.id, drill:activeSession.drill.id, score:training.score, results:activeSession.results, endedAt:Date.now() });
  }
  toast("Session complete 🏆"); goto("reward"); 
}

function startVoice(){
  voice = new PitchIQVoiceEngine({
    onStatus:(s)=>toast("Voice: "+s),
    onTranscript:(t)=>{},
    onResult:(r)=>{
      if(r.correct){ const leveled = addXP(state, r.xpAwarded); toast(leveled ? "LEVEL UP 🏆" : "+"+r.xpAwarded+" XP 🎤"); nextCue(); }
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
        if(!state.analytics.bestReaction || r.reactionMs < state.analytics.bestReaction) state.analytics.bestReaction = r.reactionMs;
        state.analytics.reactionHistory.push(r.reactionMs);
        addXP(state, r.xpAwarded); completeDaily(state); toast("Reaction "+r.reactionMs+" ms");
      }
    },
    onError:(e)=>toast(e.message)
  });
  await camera.start(mode); toast("Camera on");
}
function cameraRound(){
  if(!camera){ toast("Enable camera first"); return; }
  const c = randomCue();
  const cueEl = document.getElementById("cameraCue");
  cueEl.textContent = c.display; cueEl.className = "camera-cue go";
  camera.beginCue(c, cueTimeoutForDifficulty(activeSession ? adaptiveDifficulty(activeSession) : 2));
}
function openPackAction(){
  if(!state.game.dailyDone){ toast("Complete a mission first"); return; }
  const pack = document.getElementById("pack"); pack?.classList.add("open");
  setTimeout(()=>{
    const reward = REWARDS[(state.game.unlocked?.length || 0) % REWARDS.length];
    const xp = openReward(state, reward);
    addXP(state, xp);
    document.getElementById("rewardTitle").textContent = reward.name+" Unlocked!";
    document.getElementById("rewardText").textContent = "+"+xp+" XP bonus added.";
    toast("Reward unlocked 🎁");
  },650);
}

render("splash");