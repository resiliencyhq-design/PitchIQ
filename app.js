const navs = document.querySelectorAll(".nav, .profile");
const screens = document.querySelectorAll(".screen");
const titles = {
  home:"Good afternoon, Hugo",
  train:"Training session",
  career:"Your career",
  player:"Build your player",
  rewards:"Daily rewards",
  club:"Club battles",
  analytics:"Progress analytics",
  watch:"Apple Watch concept"
};
let score = 0, combo = 1, timer = null, timeLeft = 45;
const cueData = [
  ["🔴","Say: RED"],["🔵","Say: BLUE"],["🟢","Say: GREEN"],["←","Cut LEFT"],["→","Cut RIGHT"],
  ["CHECK","Check shoulder"],["DRIVE","Attack space"],["CROSS","Winger cue"],["8 - 3","Say: FIVE"],["4 + 5","Say: NINE"],
  ["TURN","Open body"],["SCAN","Look early"],["PRESS","React fast"]
];

navs.forEach(n => n.addEventListener("click", () => showScreen(n.dataset.screen)));
document.querySelectorAll(".mode").forEach(m => m.addEventListener("click", () => {
  document.querySelectorAll(".mode").forEach(x => x.classList.remove("active"));
  m.classList.add("active");
  document.getElementById("sessionMode").textContent = m.dataset.mode;
}));

function showScreen(id){
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".nav").forEach(n => n.classList.toggle("active", n.dataset.screen === id));
  document.getElementById("screenTitle").textContent = titles[id] || "PitchIQ";
  if(id==="analytics") drawChart();
}

function startDemo(){
  score = 0; combo = 1; timeLeft = 45;
  updateStats();
  nextCue();
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = "0:" + String(timeLeft).padStart(2,"0");
    if(timeLeft <= 0){ clearInterval(timer); toast("Session complete 🏆"); speak("Session complete"); }
  }, 1000);
  speak("Three. Two. One. Go.");
}

function nextCue(){
  const [cue, instruction] = cueData[Math.floor(Math.random()*cueData.length)];
  const cueEl = document.getElementById("cue");
  cueEl.textContent = cue;
  document.getElementById("instruction").textContent = instruction;
  cueEl.animate([{transform:"scale(.85)", opacity:.25},{transform:"scale(1)", opacity:1}], {duration:260, easing:"ease-out"});
  beep(900,.06);
}

function correct(){
  score += 20 * combo;
  combo = Math.min(combo + 1, 9);
  updateStats();
  toast(`+${20*(combo-1)} XP 🔥`);
  beep(1000,.07); setTimeout(()=>beep(1350,.08),90);
  nextCue();
}
function wrong(){
  score = Math.max(0, score - 10);
  combo = 1;
  updateStats();
  toast("-10 XP 😮");
  beep(180,.18);
  nextCue();
}
function updateStats(){
  document.getElementById("score").textContent = score;
  document.getElementById("combo").textContent = "x" + combo;
  document.getElementById("time").textContent = "0:" + String(timeLeft).padStart(2,"0");
}
function toast(text){
  const t = document.getElementById("toast");
  t.textContent = text;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1100);
}
function beep(freq,dur){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = .055;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
  }catch(e){}
}
function speak(text){
  try{
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1.05;
    speechSynthesis.speak(msg);
  }catch(e){}
}
function openPack(el){
  el.querySelector(".pack").textContent = "🏟️";
  el.querySelector("h3").textContent = "New Stadium!";
  toast("Reward unlocked 🏟️");
  speak("Reward unlocked");
}
function buildCareer(){
  const ranks = ["Grassroots","Local Club","Division 3","Division 2","Division 1","Academy","NPL","A-League","Champions League","Ballon d’Or"];
  const map = document.getElementById("careerMap");
  map.innerHTML = "";
  ranks.forEach((r,i)=>{
    const n = document.createElement("div");
    n.className = "node " + (i<5?"done":i===5?"current":"");
    n.innerHTML = `<div class="badge">${i<5?"✅":i===5?"⭐":"🔒"}</div><b>${r}</b>`;
    map.appendChild(n);
  });
}
function buildHeat(){
  const hm = document.getElementById("heatmap");
  if(!hm) return;
  hm.innerHTML = "";
  for(let i=0;i<156;i++){
    const c=document.createElement("div");
    const v=Math.random();
    c.className = "hcell " + (v>.8?"h3":v>.55?"h2":v>.35?"h1":"");
    hm.appendChild(c);
  }
}
function drawChart(){
  const c = document.getElementById("barChart");
  if(!c) return;
  const ctx = c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  const data = [180,310,420,300,520,260,360];
  const days = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const max = 600;
  ctx.font = "900 15px system-ui";
  data.forEach((v,i)=>{
    const x=42+i*90, h=(v/max)*240, y=280-h;
    const grad = ctx.createLinearGradient(0,y,0,280);
    grad.addColorStop(0,"#b8ff22"); grad.addColorStop(1,"#2dff95");
    ctx.fillStyle=grad; roundRect(ctx,x,y,48,h,14); ctx.fill();
    ctx.fillStyle="rgba(245,255,247,.65)"; ctx.fillText(days[i],x+5,315);
  });
  ctx.fillStyle="#b8ff22"; ctx.fillText("520 XP", 405, 38);
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
buildCareer(); buildHeat(); drawChart();
