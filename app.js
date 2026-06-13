let playerName = localStorage.getItem("pitchiqName") || "";
let score=0, combo=1, time=45, timer=null;
let cameraScore=0, stream=null, camLoop=null, prevFrame=null, cueStart=0, waitingForMove=false, bestRT=Number(localStorage.getItem("pitchiqBestRT") || 0);
let baseline=0;

const titles={home:"Good afternoon, {name}",train:"Training Session",camera:"Camera Reaction Mode",career:"Your Career",player:"Build Your Player",rewards:"Daily Rewards",club:"Club Battle",analytics:"Progress Analytics",watch:"Apple Watch Concept"};
const cues=[["🔴","Say RED"],["🔵","Say BLUE"],["🟢","Say GREEN"],["CHECK","Check shoulder"],["DRIVE","Attack space"],["8 - 3","Say FIVE"],["←","Cut LEFT"],["→","Cut RIGHT"]];
const cameraCues=["←","→","⬆","⬇","TURN","DRIVE","CHECK"];

document.querySelectorAll(".nav,.profile").forEach(b=>b.onclick=()=>showScreen(b.dataset.screen));

function initName(){
  if(!playerName){ document.getElementById("nameModal").classList.add("active"); }
  else { document.getElementById("nameModal").classList.remove("active"); applyName(); }
  updateBestRT();
}
function savePlayerName(){
  const n = document.getElementById("nameInput").value.trim() || "Player";
  playerName = n;
  localStorage.setItem("pitchiqName", n);
  document.getElementById("nameModal").classList.remove("active");
  applyName();
}
function resetName(){
  localStorage.removeItem("pitchiqName");
  playerName="";
  document.getElementById("nameInput").value="";
  document.getElementById("nameModal").classList.add("active");
}
function applyName(){
  document.querySelectorAll(".playerName").forEach(e=>e.textContent=playerName);
  document.getElementById("profileName").textContent=playerName;
  document.getElementById("profileInitial").textContent=(playerName[0]||"P").toUpperCase();
  document.getElementById("title").textContent=`Good afternoon, ${playerName}`;
}
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.screen===id));
  const title=titles[id] || "PitchIQ";
  document.getElementById("title").textContent=title.replace("{name}", playerName||"Player");
  if(id==="analytics") drawChart();
}

function startDemo(){
  score=0; combo=1; time=45; update(); nextCue(); clearInterval(timer);
  timer=setInterval(()=>{time--; update(); if(time<=0){clearInterval(timer); toast("Session complete 🏆"); speak("Session complete");}},1000);
  speak("Three. Two. One. Go.");
}
function nextCue(){
  const c=cues[Math.floor(Math.random()*cues.length)];
  document.getElementById("cue").textContent=c[0];
  document.getElementById("instruction").textContent=c[1];
  beep(900,.06);
}
function correct(){score+=20*combo; combo=Math.min(combo+1,9); update(); toast("+XP 🔥"); beep(1000,.07); setTimeout(()=>beep(1350,.08),90); nextCue();}
function wrong(){score=Math.max(0,score-10); combo=1; update(); toast("-10 XP 😮"); beep(180,.18); nextCue();}
function update(){
  document.getElementById("score").textContent=score;
  document.getElementById("combo").textContent="x"+combo;
  document.getElementById("time").textContent="0:"+String(time).padStart(2,"0");
}

async function testVideoAccess(){
  const el=document.getElementById("videoTest");
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    el.textContent="Video status: camera API not supported in this browser.";
    return;
  }
  try{
    const test = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
    test.getTracks().forEach(t=>t.stop());
    el.textContent="Video status: camera access works.";
    toast("Camera test passed 📷");
  }catch(e){
    el.textContent="Video status: permission denied or camera unavailable.";
    toast("Camera test failed");
  }
}
async function startCamera(){
  try{
    stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}, audio:false});
    const video=document.getElementById("video");
    video.srcObject=stream;
    await video.play();
    document.getElementById("cameraStatus").textContent="Camera on";
    toast("Camera enabled 📷");
    startMotionLoop();
  }catch(e){
    document.getElementById("cameraStatus").textContent="No access";
    toast("Camera permission needed");
  }
}
function stopCamera(){
  if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
  if(camLoop) cancelAnimationFrame(camLoop);
  document.getElementById("cameraStatus").textContent="Stopped";
}
function startMotionLoop(){
  const video=document.getElementById("video");
  const canvas=document.getElementById("motionCanvas");
  const ctx=canvas.getContext("2d", {willReadFrequently:true});
  const w=160,h=90;
  canvas.width=w; canvas.height=h;
  function loop(){
    if(video.readyState>=2){
      ctx.drawImage(video,0,0,w,h);
      const img=ctx.getImageData(0,0,w,h);
      const motion=calculateMotion(img.data);
      if(waitingForMove){
        const threshold = Number(document.getElementById("sensitivity").value) + baseline;
        if(motion > threshold && performance.now() - cueStart > 120){
          movementDetected(performance.now() - cueStart);
        }
      }
      prevFrame = new Uint8ClampedArray(img.data);
    }
    camLoop=requestAnimationFrame(loop);
  }
  loop();
}
function calculateMotion(data){
  if(!prevFrame) return 0;
  let diff=0, count=0;
  for(let i=0;i<data.length;i+=16){
    const r=Math.abs(data[i]-prevFrame[i]);
    const g=Math.abs(data[i+1]-prevFrame[i+1]);
    const b=Math.abs(data[i+2]-prevFrame[i+2]);
    diff += (r+g+b)/3;
    count++;
  }
  return diff/count;
}
function calibrateMotion(){
  baseline = 0;
  toast("Stillness calibrated");
  document.getElementById("cameraStatus").textContent="Calibrated";
}
function startCameraRound(){
  if(!stream){ toast("Enable camera first"); return; }
  const cue = cameraCues[Math.floor(Math.random()*cameraCues.length)];
  const cueEl=document.getElementById("cameraCue");
  cueEl.className="camera-cue go";
  cueEl.textContent=cue;
  waitingForMove=true;
  cueStart=performance.now();
  document.getElementById("cameraStatus").textContent="Move now";
  beep(950,.08);
  speak(String(cue).replace("←","left").replace("→","right").replace("⬆","forward").replace("⬇","back"));
  setTimeout(()=>{
    if(waitingForMove){
      waitingForMove=false;
      cueEl.className="camera-cue";
      cueEl.textContent="MISS";
      document.getElementById("cameraStatus").textContent="Too slow";
      toast("Too slow 😮");
      beep(180,.18);
      if(document.getElementById("autoRounds").checked) setTimeout(startCameraRound,1100);
    }
  },2500);
}
function movementDetected(ms){
  waitingForMove=false;
  const rt=Math.round(ms);
  cameraScore += scoreForRT(rt);
  const cueEl=document.getElementById("cameraCue");
  cueEl.className="camera-cue detected";
  cueEl.textContent=`${rt} ms`;
  document.getElementById("lastRT").textContent=`${rt} ms`;
  document.getElementById("cameraScore").textContent=cameraScore;
  document.getElementById("cameraStatus").textContent="Detected";
  if(!bestRT || rt < bestRT){
    bestRT=rt;
    localStorage.setItem("pitchiqBestRT", String(bestRT));
    updateBestRT();
    toast(`New best: ${rt} ms 🏆`);
  } else {
    toast(`Reaction: ${rt} ms`);
  }
  beep(1150,.07); setTimeout(()=>beep(1450,.08),80);
  if(document.getElementById("autoRounds").checked) setTimeout(startCameraRound,1200);
}
function scoreForRT(rt){
  if(rt<350) return 80;
  if(rt<550) return 60;
  if(rt<800) return 40;
  if(rt<1200) return 20;
  return 5;
}
function updateBestRT(){
  const txt=bestRT?`${bestRT} ms`:"—";
  ["bestRT","bestRT2","playerBestRT"].forEach(id=>{
    const e=document.getElementById(id);
    if(e) e.textContent = id==="bestRT" ? `Best: ${txt}` : txt;
  });
  const rating=document.getElementById("reactionRating");
  if(rating && bestRT){ rating.textContent = bestRT<450 ? "86" : bestRT<700 ? "78" : "72"; }
}

function toast(t){let e=document.getElementById("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1200);}
function beep(f,d){try{let c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d);}catch(e){}}
function speak(t){try{let u=new SpeechSynthesisUtterance(t);u.rate=1.08;speechSynthesis.speak(u);}catch(e){}}
function openPack(){document.getElementById("packTitle").textContent="New Stadium Unlocked!";toast("Reward unlocked 🏟️");}

function career(){
  const ranks=["grassroots","local-club","division-3","division-2","division-1","academy","npl","a-league","champions"];
  ["miniCareer","careerMap"].forEach(id=>{
    let el=document.getElementById(id); if(!el)return; el.innerHTML="";
    ranks.forEach((r,i)=>{
      let n=document.createElement("div");
      n.className="node "+(i<5?"done":i==5?"current":"");
      n.innerHTML=`<div class="badge"><img src="assets/badges/${r}.svg"></div><small>${r.replace("-", " ")}</small>`;
      el.appendChild(n);
    });
  });
}
function heat(){
  let h=document.getElementById("heatmap"); if(!h)return; h.innerHTML="";
  for(let i=0;i<156;i++){let d=document.createElement("div"),v=Math.random();d.className="hcell "+(v>.8?"h3":v>.55?"h2":v>.35?"h1":"");h.appendChild(d);}
}
function drawChart(){
  let c=document.getElementById("chart"); if(!c)return;
  let x=c.getContext("2d"),data=[180,310,420,300,520,260,360];
  x.clearRect(0,0,c.width,c.height);
  data.forEach((v,i)=>{
    let h=v/600*260,xx=40+i*115,y=310-h,g=x.createLinearGradient(0,y,0,310);
    g.addColorStop(0,"#c9ff2e"); g.addColorStop(1,"#2dff95");
    x.fillStyle=g; x.fillRect(xx,y,54,h);
    x.fillStyle="#9fb4a8"; x.font="900 16px system-ui"; x.fillText(["M","T","W","T","F","S","S"][i],xx+18,340);
  });
}
career(); heat(); drawChart(); initName();
