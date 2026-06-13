const screens = document.querySelectorAll(".screen");
const navs = document.querySelectorAll(".nav");
const cueEl = document.getElementById("cue");
let liveScore = 0;
let combo = 1;
let timer = null;

const cues = [
  {cue:"🔴", coach:"Red = pass. Call it.", answer:"RED"},
  {cue:"🔵", coach:"Blue = turn. Call it.", answer:"BLUE"},
  {cue:"🟢", coach:"Green = drive. Call it.", answer:"GREEN"},
  {cue:"←", coach:"Cut left.", answer:"LEFT"},
  {cue:"→", coach:"Cut right.", answer:"RIGHT"},
  {cue:"CHECK", coach:"Check shoulder.", answer:"CHECK"},
  {cue:"DRIVE", coach:"Attack space.", answer:"DRIVE"},
  {cue:"8 - 3", coach:"Solve while moving.", answer:"FIVE"},
  {cue:"4 + 5", coach:"Solve while scanning.", answer:"NINE"},
  {cue:"CROSS", coach:"Winger decision.", answer:"CROSS"}
];

const ranks = [
  ["Grassroots",0],["Division 2",250],["Division 1",600],["Academy",1200],
  ["NPL",2200],["A-League",4000],["Champions League",7000],["Ballon d'Or",11000]
];

navs.forEach(btn => btn.addEventListener("click", () => showScreen(btn.dataset.screen)));

function showScreen(id){
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  navs.forEach(n => n.classList.toggle("active", n.dataset.screen === id));
  if(id === "analytics") drawChart();
}

function openTraining(){ showScreen("train"); }

function startLiveSession(){
  liveScore = 0; combo = 1;
  updateScore();
  nextCue();
  clearInterval(timer);
  timer = setInterval(nextCue, 2400);
  speak("Three, two, one, go.");
}

function nextCue(){
  const item = cues[Math.floor(Math.random()*cues.length)];
  cueEl.textContent = item.cue;
  document.getElementById("coachLine").textContent = item.coach;
  cueEl.animate([{transform:"scale(.94)",opacity:.4},{transform:"scale(1)",opacity:1}], {duration:240, easing:"ease-out"});
  beep(860, .06);
}

function scoreCorrect(){
  liveScore += 20 * combo;
  combo = Math.min(combo+1, 9);
  updateScore();
  showToast(`+${20*(combo-1)} XP 🔥`);
  beep(980,.07); setTimeout(()=>beep(1320,.08),90);
  nextCue();
}

function scoreWrong(){
  liveScore = Math.max(0, liveScore - 10);
  combo = 1;
  updateScore();
  showToast("-10 XP 😮");
  beep(180,.18);
  nextCue();
}

function updateScore(){
  document.getElementById("liveScore").textContent = liveScore;
  document.getElementById("combo").textContent = combo;
}

function showToast(text){
  const t = document.getElementById("toast");
  t.textContent = text; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1100);
}

function beep(freq, dur){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq; gain.gain.value = .055;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
  }catch(e){}
}

function speak(text){
  try{
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1.02; window.speechSynthesis.speak(msg);
  }catch(e){}
}

function buildHeatmap(){
  const hm = document.getElementById("heatmap");
  if(!hm) return;
  hm.innerHTML = "";
  for(let i=0;i<56;i++){
    const d = document.createElement("div");
    const v = Math.random();
    d.className = "heat " + (v>.72 ? "on3" : v>.48 ? "on2" : v>.28 ? "on1" : "");
    hm.appendChild(d);
  }
}

function buildCareer(){
  const cp = document.getElementById("careerPath");
  if(!cp) return;
  cp.innerHTML = "";
  ranks.forEach(([name,xp], idx)=>{
    const card = document.createElement("div");
    card.className = "rankCard " + (idx < 3 ? "unlocked" : "");
    card.innerHTML = `<b>${idx < 3 ? "✅" : "🔒"} ${name}</b><p>${idx < 3 ? "Unlocked" : "Keep training to unlock"}</p><span>${xp} XP</span>`;
    cp.appendChild(card);
  });
}

function drawChart(){
  const c = document.getElementById("chart");
  if(!c) return;
  const ctx = c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  const data = [220,420,180,520,610,300,720];
  const max = 800;
  ctx.font = "700 16px system-ui";
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ["M","T","W","T","F","S","S"].forEach((d,i)=>ctx.fillText(d, 42+i*70, 300));
  data.forEach((v,i)=>{
    const h = (v/max)*230;
    const x = 35+i*70;
    const y = 270-h;
    const grad = ctx.createLinearGradient(0,y,0,270);
    grad.addColorStop(0,"#b7ff4a");
    grad.addColorStop(1,"#27e58b");
    ctx.fillStyle = grad;
    roundRect(ctx,x,y,42,h,14);
    ctx.fill();
  });
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

document.querySelectorAll(".position").forEach(p => p.addEventListener("click", () => {
  document.querySelectorAll(".position").forEach(x => x.classList.remove("selected"));
  p.classList.add("selected");
}));

buildHeatmap();
buildCareer();
drawChart();
