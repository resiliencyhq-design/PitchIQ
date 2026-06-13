const defaultState = {
  name: "",
  position: "Winger",
  xp: 0,
  level: 1,
  streak: 1,
  bestRT: null,
  bestCombo: 1,
  dailyDone: false,
  packOpened: false,
  lastSessionXp: 0
};

let state = loadState();
let selectedPosition = state.position || "Winger";
let trainTimer = null;
let trainTime = 60;
let trainScore = 0;
let trainCombo = 1;
let expected = [];
let recognition = null;

// Camera state
let cameraScore = 0, stream = null, camLoop = null, prevFrame = null, cueStart = 0, waitingForMove = false;
const cameraCues = ["←","→","⬆","⬇","TURN","DRIVE","CHECK"];
const cueBank = [
  {cue:"🔴", answers:["red"]},
  {cue:"🔵", answers:["blue"]},
  {cue:"←", answers:["left"]},
  {cue:"→", answers:["right"]},
  {cue:"8 - 3", answers:["5","five"]},
  {cue:"CHECK", answers:["check"]},
  {cue:"DRIVE", answers:["drive"]}
];

function loadState(){
  try { return {...defaultState, ...JSON.parse(localStorage.getItem("pitchiqSprint1") || "{}")}; }
  catch(e){ return {...defaultState}; }
}
function saveState(){
  localStorage.setItem("pitchiqSprint1", JSON.stringify(state));
}
function show(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id === "dashboard") refreshDashboard();
  if(id === "summary") refreshSummary();
}
function toast(text){
  const t = document.getElementById("toast");
  t.textContent = text;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 1300);
}
function beep(freq, dur){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = .05;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
  }catch(e){}
}
function speak(text){
  try{
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1.06;
    window.speechSynthesis.speak(msg);
  }catch(e){}
}
function continueFromSplash(){
  if(state.name) {
    refreshDashboard();
    show("dashboard");
  } else {
    show("onboarding");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  makeParticles();
  bindPositions();
  refreshDashboard();
  // Keep splash first on every load. User taps through to onboarding/dashboard.
});
function makeParticles(){
  const field = document.getElementById("particles");
  if(!field) return;
  for(let i=0;i<90;i++){
    const p = document.createElement("span");
    p.className = "particle";
    p.style.left = Math.random()*100+"%";
    p.style.top = Math.random()*100+"%";
    p.style.animationDelay = Math.random()*4+"s";
    field.appendChild(p);
  }
}
function bindPositions(){
  document.querySelectorAll("#positionGrid button").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("#positionGrid button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedPosition = btn.dataset.pos;
    }
  });
}
function finishOnboarding(){
  const name = document.getElementById("playerNameInput").value.trim() || "Player";
  state.name = name;
  state.position = selectedPosition;
  saveState();
  toast("Welcome to PitchIQ Academy");
  show("dashboard");
}
function resetProfile(){
  if(confirm("Reset this PitchIQ profile?")){
    localStorage.removeItem("pitchiqSprint1");
    state = {...defaultState};
    location.reload();
  }
}
function xpForNextLevel(){
  return state.level * 600;
}
function addXP(amount){
  state.xp += amount;
  state.lastSessionXp += amount;
  while(state.xp >= xpForNextLevel()){
    state.xp -= xpForNextLevel();
    state.level += 1;
    toast("LEVEL UP! 🏆");
    beep(900,.08); setTimeout(()=>beep(1250,.08),90); setTimeout(()=>beep(1500,.1),190);
  }
  saveState();
  refreshDashboard();
}
function rankName(){
  if(state.level >= 10) return "Academy";
  if(state.level >= 6) return "Division 1";
  if(state.level >= 3) return "Local Club";
  return "Grassroots";
}
function refreshDashboard(){
  document.querySelectorAll(".playerName").forEach(el=>el.textContent = state.name || "Player");
  document.getElementById("dashStreak").textContent = state.streak;
  document.getElementById("levelNum").textContent = state.level;
  document.getElementById("rankName").textContent = rankName(); if(document.getElementById("levelTag")) document.getElementById("levelTag").textContent = rankName(); if(document.getElementById("nextRank")) document.getElementById("nextRank").textContent = state.level < 3 ? "Local Club" : state.level < 6 ? "Division 1" : "Academy";
  document.getElementById("xpText").textContent = state.xp; if(document.getElementById("xpNeed")) document.getElementById("xpNeed").textContent = xpForNextLevel();
  document.getElementById("playerPosition").textContent = state.position;
  const ovrVal = Math.min(99, 60 + state.level + Math.floor((state.bestRT ? Math.max(0, 900-state.bestRT)/80 : 0))); document.getElementById("ovr").textContent = ovrVal; if(document.getElementById("statVision")) document.getElementById("statVision").textContent = Math.min(99, 63 + state.level); if(document.getElementById("statReaction")) document.getElementById("statReaction").textContent = Math.min(99, 60 + state.level + (state.bestRT ? 4 : 0)); if(document.getElementById("statDecision")) document.getElementById("statDecision").textContent = Math.min(99, 62 + state.level);
  document.getElementById("leaderXp").textContent = (state.xp + (state.level-1)*600) + " XP";
  const pct = Math.min(100, Math.round(state.xp / xpForNextLevel()*100));
  document.getElementById("heroXpBar").style.width = pct + "%";
  document.getElementById("levelXpBar").style.width = pct + "%";
  document.getElementById("packStatus").textContent = state.dailyDone ? (state.packOpened ? "Opened: Academy Boots unlocked." : "Unlocked: tap to open.") : "Locked: complete today's mission.";
  document.getElementById("missionTrain").classList.toggle("done", state.dailyDone);
  drawWeekly();
}
function drawWeekly(){
  const c = document.getElementById("weeklyChart");
  if(!c) return;
  const ctx = c.getContext("2d");
  const data = [80, 140, 220, 180, 310, state.xp || 90, state.lastSessionXp || 120];
  ctx.clearRect(0,0,c.width,c.height);
  data.forEach((v,i)=>{
    const h = Math.min(170, v/420*170);
    const x = 34+i*68, y = 190-h;
    const g = ctx.createLinearGradient(0,y,0,190);
    g.addColorStop(0,"#d6ff2f"); g.addColorStop(1,"#25ff99");
    ctx.fillStyle = g;
    roundRect(ctx,x,y,38,h,12); ctx.fill();
    ctx.fillStyle = "rgba(246,255,248,.65)";
    ctx.font = "900 13px system-ui";
    ctx.fillText(["M","T","W","T","F","S","S"][i], x+11, 214);
  });
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}

// Training
function startTraining(){
  trainTime = 60; trainScore = 0; trainCombo = 1;
  state.lastSessionXp = 0;
  updateTrain();
  showCue();
  clearInterval(trainTimer);
  speak("Three. Two. One. Go.");
  trainTimer = setInterval(()=>{
    trainTime--;
    updateTrain();
    if(trainTime <= 0) endTraining();
  },1000);
}
function showCue(){
  const item = cueBank[Math.floor(Math.random()*cueBank.length)];
  expected = item.answers;
  document.getElementById("trainingCue").textContent = item.cue;
  document.getElementById("trainingInstruction").textContent = "Say or tap: " + item.answers[0].toUpperCase();
  beep(880,.06);
}
function updateTrain(){
  document.getElementById("trainTime").textContent = trainTime;
  document.getElementById("trainScore").textContent = trainScore;
  document.getElementById("trainCombo").textContent = trainCombo;
}
function manualAnswer(ans){
  if(expected.includes(ans)) correctTraining();
  else wrongTraining();
}
function correctTraining(){
  const gain = 20 * trainCombo;
  trainScore += gain;
  addXP(gain);
  trainCombo = Math.min(trainCombo+1, 9);
  state.bestCombo = Math.max(state.bestCombo, trainCombo);
  saveState();
  updateTrain();
  toast("+" + gain + " XP 🔥");
  beep(980,.07); setTimeout(()=>beep(1320,.08),90);
  showCue();
}
function wrongTraining(){
  trainScore = Math.max(0, trainScore - 10);
  trainCombo = 1;
  updateTrain();
  toast("Reset. Next cue.");
  beep(180,.18);
  showCue();
}
function endTraining(){
  clearInterval(trainTimer);
  state.dailyDone = true;
  saveState();
  toast("Session complete 🏆");
  show("reward");
}
function startVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ toast("Voice not supported in this browser"); return; }
  recognition = new SR();
  recognition.lang = "en-AU";
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.onresult = (e)=>{
    const heard = e.results[e.results.length-1][0].transcript.toLowerCase().trim();
    if(expected.some(a=>heard.includes(a))) correctTraining();
    else toast("Heard: " + heard + " — try again");
  };
  recognition.onend = ()=>{ try{ recognition.start(); }catch(e){} };
  try{ recognition.start(); toast("Voice enabled 🎤"); }catch(e){}
}

// Camera
async function testVideoAccess(){
  const el = document.getElementById("videoTest");
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    el.textContent = "Video status: not supported.";
    return;
  }
  try{
    const test = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
    test.getTracks().forEach(t=>t.stop());
    el.textContent = "Video status: camera access works.";
    toast("Camera test passed 📷");
  }catch(e){
    el.textContent = "Video status: permission denied or unavailable.";
    toast("Camera test failed");
  }
}
async function startCamera(facingMode="environment"){
  try{
    if(stream) stopCamera();
    stream = await navigator.mediaDevices.getUserMedia({video:{facingMode}, audio:false});
    const v = document.getElementById("video");
    v.srcObject = stream;
    await v.play();
    document.getElementById("cameraStatus").textContent = (facingMode === "user" ? "Front" : "Rear") + " camera on";
    toast("Camera enabled 📷");
    startMotionLoop();
  }catch(e){
    document.getElementById("cameraStatus").textContent = "No access";
    toast("Camera permission needed");
  }
}
function stopCamera(){
  if(stream){ stream.getTracks().forEach(t=>t.stop()); stream = null; }
  if(camLoop) cancelAnimationFrame(camLoop);
  document.getElementById("cameraStatus").textContent = "Stopped";
}
function startMotionLoop(){
  const video = document.getElementById("video");
  const canvas = document.getElementById("motionCanvas");
  const ctx = canvas.getContext("2d", {willReadFrequently:true});
  const w=160,h=90; canvas.width=w; canvas.height=h;
  function loop(){
    if(video.readyState >= 2){
      ctx.drawImage(video,0,0,w,h);
      const img = ctx.getImageData(0,0,w,h);
      const motion = calculateMotion(img.data);
      if(waitingForMove){
        const threshold = Number(document.getElementById("sensitivity").value);
        if(motion > threshold && performance.now() - cueStart > 120){
          movementDetected(performance.now() - cueStart);
        }
      }
      prevFrame = new Uint8ClampedArray(img.data);
    }
    camLoop = requestAnimationFrame(loop);
  }
  loop();
}
function calculateMotion(data){
  if(!prevFrame) return 0;
  let diff=0,count=0;
  for(let i=0;i<data.length;i+=16){
    diff += (Math.abs(data[i]-prevFrame[i]) + Math.abs(data[i+1]-prevFrame[i+1]) + Math.abs(data[i+2]-prevFrame[i+2]))/3;
    count++;
  }
  return diff/count;
}
function startCameraRound(){
  if(!stream){ toast("Enable camera first"); return; }
  const cue = cameraCues[Math.floor(Math.random()*cameraCues.length)];
  const el = document.getElementById("cameraCue");
  el.className = "camera-cue go";
  el.textContent = cue;
  waitingForMove = true;
  cueStart = performance.now();
  document.getElementById("cameraStatus").textContent = "Move now";
  beep(950,.08);
  speak(String(cue).replace("←","left").replace("→","right").replace("⬆","forward").replace("⬇","back"));
  setTimeout(()=>{
    if(waitingForMove){
      waitingForMove=false;
      el.className = "camera-cue";
      el.textContent = "MISS";
      document.getElementById("cameraStatus").textContent = "Too slow";
      toast("Too slow 😮");
      beep(180,.18);
      if(document.getElementById("autoRounds").checked) setTimeout(startCameraRound,1100);
    }
  },2500);
}
function movementDetected(ms){
  waitingForMove = false;
  const rt = Math.round(ms);
  const gain = scoreForRT(rt);
  cameraScore += gain;
  addXP(gain);
  const el = document.getElementById("cameraCue");
  el.className = "camera-cue detected";
  el.textContent = rt + " ms";
  document.getElementById("lastRT").textContent = rt + " ms";
  document.getElementById("cameraScore").textContent = cameraScore;
  document.getElementById("cameraStatus").textContent = "Detected";
  if(!state.bestRT || rt < state.bestRT){
    state.bestRT = rt;
    saveState();
    toast("New best: " + rt + " ms 🏆");
  } else {
    toast("Reaction: " + rt + " ms");
  }
  refreshCameraBest();
  beep(1150,.07); setTimeout(()=>beep(1450,.08),80);
  state.dailyDone = true;
  saveState();
  if(document.getElementById("autoRounds").checked) setTimeout(startCameraRound,1200);
}
function scoreForRT(rt){
  if(rt<350) return 90;
  if(rt<550) return 70;
  if(rt<800) return 45;
  if(rt<1200) return 25;
  return 10;
}
function refreshCameraBest(){
  document.getElementById("bestRT").textContent = state.bestRT ? state.bestRT + " ms" : "—";
}

// Reward/Summary
function openPack(){
  if(!state.dailyDone){ toast("Complete a session first"); return; }
  document.getElementById("packAnim").classList.add("open");
  setTimeout(()=>{
    document.getElementById("rewardTitle").textContent = "Academy Boots Unlocked!";
    document.getElementById("rewardText").textContent = "+100 XP bonus added to your player.";
    if(!state.packOpened){
      state.packOpened = true;
      addXP(100);
    }
    saveState();
  },700);
}
function refreshSummary(){
  document.getElementById("summaryXp").textContent = state.lastSessionXp;
  document.getElementById("summaryRT").textContent = state.bestRT ? state.bestRT + " ms" : "—";
  document.getElementById("summaryCombo").textContent = "x" + state.bestCombo;
  document.getElementById("summaryStreak").textContent = state.streak;
}
refreshCameraBest();
refreshDashboard();
