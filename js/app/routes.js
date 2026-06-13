import { stat } from "../components/ui.js";
import { renderTrainingHome, renderChooseDrill, renderChooseDifficulty, renderSessionPreview, renderLiveSession, renderTrainingResults, renderAnalyticsHome, renderAnalyticsRadar, renderAnalyticsHeatmap, renderAnalyticsCoach, renderAnalyticsParent, renderRewardUX, renderCareerJourney } from "./uxScreens.js";
import { rankForLevel, xpNeed } from "../game/progression.js";
import { recommendedDrills } from "../data/drills.js";
import { REWARDS, CAREER_RANKS, ACHIEVEMENTS } from "../data/rewards.js";

export const routeNames = ["home","training","camera","reward","player","career","analytics","collection","art","settings"];

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

export function renderTraining(state){ return renderTrainingHome(state); }

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

export function renderReward(state){ return renderRewardUX(state); }

export function renderPlayer(state){
  return `<section class="screen app active" id="player"><header class="sub"><button data-route="home">←</button><h1>Player</h1><button data-route="settings">Settings</button></header><div class="player glass"><img src="assets/art/player.svg" alt="Player"><div><span class="kicker">OVR ${60+state.game.level}</span><h2>${state.profile.name||"Player"}</h2><p>${state.profile.position}</p></div></div><div class="stats">${stat("Vision",65+state.game.level)}${stat("Reaction",state.analytics.bestReaction?72:61)}${stat("Composure",60+state.game.bestCombo)}</div></section>`;
}
export function renderAnalytics(state){ return renderAnalyticsHome(state); }

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

export function renderCareer(state){ return renderCareerJourney(state); }

export function renderChooseDrill(state){ return renderChooseDrill(state); }

export function renderChooseDifficulty(state){ return renderChooseDifficulty(state); }

export function renderSessionPreview(state){ return renderSessionPreview(state); }

export function renderLiveSession(state){ return renderLiveSession(state); }

export function renderTrainingResults(state){ return renderTrainingResults(state); }

export function renderAnalyticsRadar(state){ return renderAnalyticsRadar(state); }

export function renderAnalyticsHeatmap(state){ return renderAnalyticsHeatmap(state); }

export function renderAnalyticsCoach(state){ return renderAnalyticsCoach(state); }

export function renderAnalyticsParent(state){ return renderAnalyticsParent(state); }
