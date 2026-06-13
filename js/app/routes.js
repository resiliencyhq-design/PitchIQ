import { stat } from "../components/ui.js";
import { rankForLevel, xpNeed } from "../game/progression.js";

export const routeNames = ["home","training","camera","reward","player","analytics","settings"];

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

export function renderTraining(){
  return `<section class="screen app active" id="training"><header class="sub"><button data-route="home">←</button><h1>Vision Sprint</h1><button data-action="start-training">Start</button></header><div class="stats">${stat("Time","45","time")}${stat("Score","0","score")}${stat("Combo",'x<span id="combo">1</span>')}</div><div class="cue glass"><div class="pulse"></div><b id="cue">READY</b><small id="instruction">Say or tap the answer</small></div><div class="actions"><button data-answer="red">Red</button><button data-answer="blue">Blue</button><button data-answer="left">Left</button><button data-answer="right">Right</button></div><div class="actions"><button data-action="voice">🎤 Voice</button><button data-action="correct">Correct</button><button data-action="wrong">Missed</button><button class="primary" data-action="finish-training">Finish</button></div></section>`;
}
export function renderCamera(){
  return `<section class="screen app active" id="camera"><header class="sub"><button data-route="home">←</button><h1>Camera Reaction</h1><button data-action="stop-camera">Stop</button></header><div class="video glass"><video id="video" playsinline muted></video><canvas id="motion"></canvas><div id="cameraCue" class="camera-cue">READY</div></div><div class="stats">${stat("Last RT","—","lastRT")}${stat("Best","—","camBest")}${stat("Score","0","camScore")}</div><div class="actions"><button data-action="test-video">Test</button><button data-action="front-camera">Front</button><button data-action="rear-camera">Rear</button><button class="primary" data-action="camera-round">Start Round</button></div><input id="sensitivity" type="range" min="8" max="60" value="24"><p id="videoStatus">Video not tested</p></section>`;
}
export function renderReward(state){
  return `<section class="screen center reward active" id="reward"><h1>Daily<br>Reward</h1><img id="pack" src="assets/art/pack.svg" alt="Gold pack" data-action="open-pack"><h2 id="rewardTitle">${state.game.packOpened ? "Academy Boots Unlocked!" : "Tap the pack"}</h2><p id="rewardText">${state.game.dailyDone ? "Open your reward." : "Complete a mission to unlock Academy Boots."}</p><button class="primary mega" data-route="analytics">Continue</button></section>`;
}
export function renderPlayer(state){
  return `<section class="screen app active" id="player"><header class="sub"><button data-route="home">←</button><h1>Player</h1><button data-route="settings">Settings</button></header><div class="player glass"><img src="assets/art/player.svg" alt="Player"><div><span class="kicker">OVR ${60+state.game.level}</span><h2>${state.profile.name||"Player"}</h2><p>${state.profile.position}</p></div></div><div class="stats">${stat("Vision",65+state.game.level)}${stat("Reaction",state.analytics.bestReaction?72:61)}${stat("Composure",60+state.game.bestCombo)}</div></section>`;
}
export function renderAnalytics(state){
  const vals = state.analytics.weeklyXp;
  const max = Math.max(1, ...vals);
  return `<section class="screen app summary active" id="analytics"><header class="sub"><button data-route="home">←</button><h1>Summary</h1><button data-route="player">Player</button></header><div class="stats">${stat("XP Earned",state.game.lastXp)}${stat("Best RT",state.analytics.bestReaction ? state.analytics.bestReaction+" ms":"—")}${stat("Best Combo","x"+state.game.bestCombo)}</div><div class="glass"><h2>Weekly XP</h2><div class="chart">${vals.map(v=>`<div class="bar" style="height:${Math.max(12,Math.round(v/max*190))}px"></div>`).join("")}</div></div><div class="ratings"><p>Reaction ★★★★☆</p><p>Scanning ★★★★★</p><p>Decision ★★★★☆</p></div><button class="primary mega" data-route="home">Return Home</button></section>`;
}
export function renderSettings(state){
  return `<section class="screen app active" id="settings"><header class="sub"><button data-route="home">←</button><h1>Settings</h1></header><div class="glass"><div class="settings-row"><b>Sound</b><span>${state.settings.sound?"On":"Off"}</span></div><div class="settings-row"><b>Haptics</b><span>${state.settings.haptics?"On":"Off"}</span></div><div class="settings-row"><b>Camera</b><span>${state.settings.cameraPreference}</span></div><div class="settings-row"><b>Privacy</b><span>Local-first</span></div></div></section>`;
}
export function renderNav(){
  return ["home","training","camera","reward","player"].map(r=>{
    const icon = {home:"🏠",training:"⚽",camera:"📷",reward:"🎁",player:"👤"}[r];
    const label = {home:"Home",training:"Train",camera:"Camera",reward:"Reward",player:"Player"}[r];
    return `<button data-route="${r}" aria-label="${label}">${icon}<span>${label}</span></button>`;
  }).join("");
}