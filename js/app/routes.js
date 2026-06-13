import { stat } from "../components/ui.js";
import { rankForLevel, xpNeed } from "../game/progression.js";
import { recommendedDrills } from "../data/drills.js";
import { REWARDS, CAREER_RANKS, ACHIEVEMENTS } from "../data/rewards.js";

export const routeNames = ["home","training","camera","reward","player","career","analytics","collection","art","settings"];

const TRAINING_FLOW = [
  { id:"recommended", icon:"⚡", title:"Today’s Session", subtitle:"Recommended 4-minute Vision Sprint", drill:"colour-scan" },
  { id:"choose", icon:"🎯", title:"Choose Drill", subtitle:"Vision, reaction, scanning, decision", route:"training-drills" },
  { id:"recent", icon:"📈", title:"Recent Performance", subtitle:"Best RT, combo, weekly XP", route:"analytics" }
];

function compactDrillCategories(position="Winger"){
  return [
    { id:"vision", icon:"👁️", title:"Vision", desc:"See cues earlier", drill:"colour-scan" },
    { id:"reaction", icon:"⚡", title:"Reaction", desc:"Fast left/right responses", drill:"left-right-react" },
    { id:"scanning", icon:"🔄", title:"Scanning", desc:"Shoulder check habits", drill:"shoulder-check" },
    { id:"decision", icon:"🧠", title:"Decision", desc:"Choose under pressure", drill:"midfield-picture" },
    { id:"dual", icon:"➕", title:"Dual Task", desc:"Think while reacting", drill:"math-pressure" },
    { id:"position", icon:"🎯", title:position, desc:"Role-specific reps", drill: position==="CB" ? "cb-scan-clear" : position==="Striker" ? "striker-trigger" : "winger-drive" }
  ];
}

function analyticsTabs(active="overview"){
  const tabs = [
    ["analytics","Overview"],
    ["analytics-radar","Radar"],
    ["analytics-heatmap","Heatmap"],
    ["analytics-coach","Coach"],
    ["analytics-parent","Parent"]
  ];
  return `<div class="pill-tabs">${tabs.map(([r,l])=>`<button class="${active===r?'active':''}" data-route="${r}">${l}</button>`).join("")}</div>`;
}


export function renderSplash(){
  return `<section class="screen center active" id="splash"><div class="particles" id="particles"></div><img class="logo hero-logo" src="assets/brand/logo.svg" alt="PitchIQ"><h1 class="splash-title">See earlier.<br>Think faster.</h1><button class="primary mega" data-action="enter">Enter Academy</button></section>`;
}
export function renderOnboard(){
  return `<section class="screen center active" id="onboard"><div class="glass form-card"><img src="assets/brand/logo.svg" class="logo small-logo" alt="PitchIQ"><h1>Create<br>your player</h1><label>Name</label><input id="nameInput" placeholder="Player name" maxlength="18"><label>Position</label><div class="pos-grid">${["CB","FB","CDM","CM","CAM","Winger","Striker","GK"].map(p=>`<button data-pos="${p}" class="${p==="Winger"?"selected":""}">${p}</button>`).join("")}</div><button class="primary full" data-action="save-profile">Continue</button></div></section>`;
}
export function renderMission(state){
  return `<section class="screen center active" id="mission"><div class="mission-card"><span class="kicker">🔥 Day ${state.game.streak} mission</span><h1>Beat yesterday.</h1><h2>Unlock Academy Boots.</h2><img src="assets/art/boots.svg" class="boots" alt="Academy Boots"><button class="primary mega" data-route="home">Continue</button></div></section>`;
}
export function renderHome(state){
  const need = xpNeed(state.game.level);
  const rank = rankForLevel(state.game.level);
  const pct = Math.min(100, Math.round(state.game.xp/need*100));
  const ovr = Math.min(99, 60 + state.game.level + (state.analytics.bestReaction ? 4 : 0));
  const best = state.analytics.bestReaction ? state.analytics.bestReaction + " ms" : "—";
  const rewardState = state.game.dailyDone ? (state.game.packOpened ? "Opened" : "Unlocked") : "Locked";
  return `<section class="screen app home-aaa active" id="home">
    <header class="top">
      <div>
        <span class="kicker">🔥 ${state.game.streak} day streak • ${rank}</span>
        <h1>Hi, ${state.profile.name || "Player"}</h1>
      </div>
      <button class="ghost" data-action="reset">Reset</button>
    </header>

    <section class="home-hero">
      <article class="glass hero-panel">
        <span class="kicker">Today's mission</span>
        <h1>Beat yesterday.<br>Think faster.</h1>
        <p>Complete a short Vision Sprint to protect your streak, build XP, and unlock your daily academy reward.</p>
        <div class="mini-strip">
          <div><small>Reward</small><b>Gold Pack</b></div>
          <div><small>Target</small><b>250 XP</b></div>
          <div><small>Best RT</small><b>${best}</b></div>
        </div>
        <div class="hero-actions">
          <button class="primary mega" data-route="training">Continue Training</button>
          <button data-route="camera">Camera Challenge</button>
        </div>
        <img src="assets/art/boots.svg" class="hero-art" alt="Academy boots">
      </article>

      <article class="glass live-card">
        <div class="ovr-badge">OVR ${ovr}</div>
        <img src="assets/art/player.svg" alt="Live player card">
        <span class="kicker">My Player</span>
        <h2>${state.profile.name || "Player"}</h2>
        <p>${state.profile.position}</p>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="glass tile">
        <span>Level progress</span>
        <b>Level ${state.game.level}</b>
        <div class="xpbar"><i style="width:${pct}%"></i></div>
        <small>${state.game.xp} / ${need} XP to next level</small>
      </article>

      <button class="tile" data-route="reward">
        <span>Reward preview</span>
        <b>${rewardState}</b>
        <small>${state.game.dailyDone ? "Tap to open today's pack." : "Complete the mission to unlock."}</small>
      </button>

      <button class="tile" data-route="analytics">
        <span>Weekly form</span>
        <b>${state.analytics.weeklyXp.reduce((a,b)=>a+b,0)} XP</b>
        <small>Tap for summary and trends.</small>
      </button>

      <article class="glass career-card">
        <span class="kicker">Career ladder</span>
        <h2>Next: ${state.game.level < 4 ? "Local Club" : state.game.level < 8 ? "Division 3" : "Academy"}</h2>
        <img src="assets/art/career-ladder.svg" alt="Career ladder preview">
      </article>

      <article class="glass reward-preview">
        <div>
          <span class="kicker">Daily pack</span>
          <h2>Academy Boots</h2>
          <p>Earned through training effort. No pay-to-win.</p>
        </div>
        <img src="assets/art/pack.svg" alt="Gold pack">
      </article>

      <article class="quick-stat">
        ${stat("Vision", 65 + state.game.level)}
        ${stat("Reaction", best)}
        ${stat("Combo", "x" + state.game.bestCombo)}
      </article>
    </section>
  </section>`;
}

export function renderTraining(state){
  const position = state?.profile?.position || "Winger";
  return `<section class="screen app active ux-fit" id="training">
    <header class="sub tight"><button data-route="home">←</button><h1>Training</h1><button data-action="start-training">Start</button></header>
    <article class="glass focus-card">
      <span class="kicker">Today’s session</span>
      <h2>Vision Sprint</h2>
      <p>Short, focused reps for scanning, reaction and decision speed.</p>
      <button class="primary mega full" data-action="start-training">Start Training</button>
    </article>
    <div class="flow-grid">
      ${TRAINING_FLOW.map(item=>`<button class="glass flow-card" ${item.route?`data-route="${item.route}"`:`data-drill="${item.drill}" data-action="start-training"`}>
        <span>${item.icon}</span><b>${item.title}</b><small>${item.subtitle}</small>
      </button>`).join("")}
    </div>
    <div class="mini-metrics">
      ${stat("Best RT", state?.analytics?.bestReaction ? state.analytics.bestReaction+" ms" : "—")}
      ${stat("Combo", "x"+(state?.game?.bestCombo || 1))}
      ${stat("Level", state?.game?.level || 1)}
    </div>
  </section>`;
}

export function renderCamera(){
  return `<section class="screen app camera-full active" id="camera">
    <header class="sub"><button data-route="home">←</button><h1>Camera 2.0</h1><button data-action="stop-camera">Stop</button></header>
    <div class="video glass"><div class="overlay-pill" id="cameraStatus">Ready</div><video id="video" playsinline muted></video><canvas id="motion"></canvas><div id="cameraCue" class="camera-cue">READY</div></div>
    <div class="stats">${stat("Last RT","—","lastRT")}${stat("Best","—","camBest")}${stat("Score","0","camScore")}</div>
    <div class="calibration">
      <div class="glass tile"><span>Calibration</span><b id="motionRead">Motion 0</b><small>Adjust sensitivity before starting.</small><input id="sensitivity" type="range" min="8" max="60" value="24"></div>
      <div class="glass tile"><span>Mode</span><b>Reaction / Head Turn</b><small>Use front camera for head-check drills.</small></div>
    </div>
    <div class="actions"><button data-action="test-video">Test</button><button data-action="front-camera">Front</button><button data-action="rear-camera">Rear</button><button class="primary" data-action="camera-round">Start Round</button></div>
    <p id="videoStatus">Video not tested</p>
  </section>`;
}

export function renderReward(state){
  const unlocked = state.game.unlocked || [];
  return `<section class="screen app active ux-fit" id="reward">
    <header class="sub tight"><button data-route="home">←</button><h1>Reward</h1></header>
    <article class="glass focus-card reward-focus">
      <span class="kicker">${state.game.dailyDone ? "Unlocked" : "Locked"}</span>
      <h2>${state.game.dailyDone ? "Open today’s pack" : "Complete today’s mission"}</h2>
      <p>${state.game.dailyDone ? "You earned this through training." : "Finish a Vision Sprint or Camera Challenge to unlock the reward."}</p>
      <button class="primary mega full" data-action="${state.game.dailyDone ? "open-pack" : "start-training"}">${state.game.dailyDone ? "Open Pack" : "Start Mission"}</button>
    </article>
    <div class="reward-steps">
      <span class="${state.game.dailyDone?'done':''}">Mission</span><i></i><span class="${state.game.dailyDone?'done':''}">Progress</span><i></i><span class="${state.game.packOpened?'done':''}">Reward</span>
    </div>
    <div class="collection-grid compact">
      ${REWARDS.map(r=>`<div class="glass collection-card ${unlocked.includes(r.id)?"unlocked":"locked"}"><img src="${r.art}" style="${unlocked.includes(r.id)?"":"filter:grayscale(1) opacity(.35)"}"><b>${r.name}</b><small>${unlocked.includes(r.id)?"Unlocked":"Locked"}</small></div>`).join("")}
    </div>
  </section>`;
}

export function renderPlayer(state){
  return `<section class="screen app active" id="player"><header class="sub"><button data-route="home">←</button><h1>Player</h1><button data-route="settings">Settings</button></header><div class="player glass"><img src="assets/art/player.svg" alt="Player"><div><span class="kicker">OVR ${60+state.game.level}</span><h2>${state.profile.name||"Player"}</h2><p>${state.profile.position}</p></div></div><div class="stats">${stat("Vision",65+state.game.level)}${stat("Reaction",state.analytics.bestReaction?72:61)}${stat("Composure",60+state.game.bestCombo)}</div></section>`;
}
export function renderAnalytics(state){
  const vals = state.analytics.weeklyXp;
  const max = Math.max(1, ...vals);
  return `<section class="screen app active ux-fit" id="analytics">
    <header class="sub tight"><button data-route="home">←</button><h1>Analytics</h1></header>
    ${analyticsTabs("analytics")}
    <div class="analytics-home-grid">
      ${stat("Weekly XP", vals.reduce((a,b)=>a+b,0))}
      ${stat("Best RT", state.analytics.bestReaction ? state.analytics.bestReaction+" ms":"—")}
      ${stat("Level", state.game.level)}
      ${stat("Streak", state.game.streak)}
    </div>
    <div class="glass compact-chart">
      <span class="kicker">Weekly XP</span>
      <div class="chart small">${vals.map((v,i)=>`<div class="bar-wrap"><div class="bar" style="height:${Math.max(12,Math.round(v/max*120))}px"></div><small>${["M","T","W","T","F","S","S"][i]}</small></div>`).join("")}</div>
    </div>
  </section>`;
}

export function renderSettings(state){
  return `<section class="screen app active" id="settings"><header class="sub"><button data-route="home">←</button><h1>Settings</h1></header><div class="glass"><div class="settings-row"><b>Sound</b><span>${state.settings.sound?"On":"Off"}</span></div><div class="settings-row"><b>Haptics</b><span>${state.settings.haptics?"On":"Off"}</span></div><div class="settings-row"><b>Camera</b><span>${state.settings.cameraPreference}</span></div><div class="settings-row"><b>Privacy</b><span>Local-first</span></div></div></section>`;
}
export function renderNav(){
  return [
    ["home","🏠","Home"],
    ["training","⚽","Train"],
    ["camera","📷","Camera"],
    ["career","🏆","Career"],
    ["player","👤","Player"]
  ].map(([r,icon,label])=>`<button data-route="${r}" aria-label="${label}">${icon}<span>${label}</span></button>`).join("");
}

export function renderTrainingDrills(state){
  const position = state?.profile?.position || "Winger";
  const cats = compactDrillCategories(position);
  return `<section class="screen app active ux-fit" id="training-drills">
    <header class="sub tight"><button data-route="training">←</button><h1>Choose Drill</h1></header>
    <div class="category-grid compact-six">
      ${cats.map(c=>`<button class="glass category-card" data-drill="${c.drill}" data-route="training-preview">
        <span>${c.icon}</span><b>${c.title}</b><small>${c.desc}</small>
      </button>`).join("")}
    </div>
  </section>`;
}

export function renderTrainingPreview(state){
  return `<section class="screen app active ux-fit" id="training-preview">
    <header class="sub tight"><button data-route="training-drills">←</button><h1>Preview</h1></header>
    <article class="glass focus-card">
      <span class="kicker">Session preview</span>
      <h2>Ready to train?</h2>
      <p>45 seconds. Combo bonus. Streak protection. Reward unlock progress.</p>
      <div class="mini-metrics">${stat("Duration","45s")}${stat("Reward","Gold Pack")}${stat("XP","250+")}</div>
      <button class="primary mega full" data-action="start-training">Start Session</button>
    </article>
  </section>`;
}

export function renderAnalyticsRadar(state){
  const values = [76, state.analytics.bestReaction?82:64, 79, 72, 74, 68, 70];
  const labels = ["Vision","Reaction","Scanning","Decision","Composure","Memory","Processing"];
  const pts = values.map((v,i)=>{ const a=(-90+i*360/7)*Math.PI/180, r=v*1.08; return [150+Math.cos(a)*r,150+Math.sin(a)*r].join(","); }).join(" ");
  return `<section class="screen app active ux-fit" id="analytics-radar">
    <header class="sub tight"><button data-route="analytics">←</button><h1>Radar</h1></header>
    ${analyticsTabs("analytics-radar")}
    <div class="glass radar-screen"><svg viewBox="0 0 300 300">
      <polygon points="${[0,1,2,3,4,5,6].map(i=>{const a=(-90+i*360/7)*Math.PI/180,r=110;return [150+Math.cos(a)*r,150+Math.sin(a)*r].join(",")}).join(" ")}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/>
      <polygon points="${pts}" fill="rgba(215,255,46,.25)" stroke="#D7FF2E" stroke-width="5"/>
      ${labels.map((l,i)=>{const a=(-90+i*360/7)*Math.PI/180,r=134;return `<text x="${150+Math.cos(a)*r}" y="${150+Math.sin(a)*r}" text-anchor="middle" fill="#D7FF2E" font-size="10">${l}</text>`}).join("")}
    </svg></div>
  </section>`;
}

export function renderAnalyticsHeatmap(state){
  const vals = state.analytics.weeklyXp;
  return `<section class="screen app active ux-fit" id="analytics-heatmap">
    <header class="sub tight"><button data-route="analytics">←</button><h1>Heatmap</h1></header>
    ${analyticsTabs("analytics-heatmap")}
    <div class="glass heatmap-screen">
      ${Array.from({length:28}).map((_,i)=>`<button class="heat ${vals[i%7]>0?'on':''}"><small>${i+1}</small></button>`).join("")}
    </div>
    <p class="helper-copy">Green days show completed training. Tap a day later to review sessions.</p>
  </section>`;
}

export function renderAnalyticsCoach(state){
  return `<section class="screen app active ux-fit" id="analytics-coach">
    <header class="sub tight"><button data-route="analytics">←</button><h1>Coach</h1></header>
    ${analyticsTabs("analytics-coach")}
    <div class="stack-cards">
      <div class="glass tile"><span class="kicker">Strength</span><b>Scanning consistency</b><small>Good habit building across recent sessions.</small></div>
      <div class="glass tile"><span class="kicker">Priority skill</span><b>Reaction under pressure</b><small>Next drill: Reaction Ladder, medium difficulty.</small></div>
      <div class="glass tile"><span class="kicker">Recommendation</span><b>3 short sessions this week</b><small>Keep reps brief and reward attempts.</small></div>
    </div>
  </section>`;
}

export function renderAnalyticsParent(state){
  return `<section class="screen app active ux-fit" id="analytics-parent">
    <header class="sub tight"><button data-route="analytics">←</button><h1>Parent</h1></header>
    ${analyticsTabs("analytics-parent")}
    <div class="analytics-home-grid">
      ${stat("Sessions", state.analytics.sessions.length)}
      ${stat("Minutes", "12")}
      ${stat("XP", state.analytics.weeklyXp.reduce((a,b)=>a+b,0))}
      ${stat("Progress", "On track")}
    </div>
    <div class="glass tile"><b>Simple summary</b><small>${state.profile.name || "Player"} is building a short, consistent training habit. Metrics are training indicators only.</small></div>
  </section>`;
}

export function renderCareer(state){
  const current = rankForLevel(state.game.level);
  const ranks = ["Grassroots","Local Club","Division 3","Division 2","Division 1","Academy","NPL","Professional","Europe","Legend"];
  const currentIndex = Math.max(0, ranks.findIndex(r => r===current || (current==="A-League"&&r==="Professional") || (current==="Ballon d'Or"&&r==="Legend")));
  return `<section class="screen app active ux-fit" id="career">
    <header class="sub tight"><button data-route="home">←</button><h1>Career</h1></header>
    <div class="career-ladder-mobile">
      ${ranks.map((r,i)=>`<div class="career-step ${i<currentIndex?'done':''} ${i===currentIndex?'current':''}">
        <span>${i<currentIndex?'✓':i===currentIndex?'●':'○'}</span><b>${r}</b><small>${i===currentIndex?'Current rank':i<currentIndex?'Completed':'Locked'}</small>
      </div>`).join("")}
    </div>
  </section>`;
}
