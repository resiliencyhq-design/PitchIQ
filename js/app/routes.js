import { stat } from "../components/ui.js";
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

function homeMetrics(state){
  const need = xpNeed(state.game.level);
  const rank = rankForLevel(state.game.level);
  const pct = Math.min(100, Math.round(state.game.xp/need*100));
  const ovr = Math.min(99, 60 + state.game.level + (state.analytics.bestReaction ? 4 : 0));
  const best = state.analytics.bestReaction ? state.analytics.bestReaction + " ms" : "—";
  const weeklyTotal = state.analytics.weeklyXp.reduce((a,b)=>a+b,0);
  const lastWeek = Math.max(1, Math.round(weeklyTotal * .85));
  const trend = Math.round((weeklyTotal - lastWeek) / lastWeek * 100);
  const rewardPct = state.game.dailyDone ? 100 : pct;
  const rewardState = state.game.dailyDone ? (state.game.packOpened ? "Opened" : "Reward Ready") : rewardPct + "% to unlock";
  const nextMilestone = state.game.level < 4 ? "Local Club" : state.game.level < 8 ? "Division 3" : "Academy";
  const milestoneLevel = state.game.level < 4 ? 4 : state.game.level < 8 ? 8 : 26;
  const previousMilestoneLevel = state.game.level < 4 ? 1 : state.game.level < 8 ? 4 : 8;
  const milestonePct = Math.min(100, Math.round((state.game.level - previousMilestoneLevel) / Math.max(1, milestoneLevel - previousMilestoneLevel) * 100));
  return { need, rank, pct, ovr, best, weeklyTotal, lastWeek, trend, rewardPct, rewardState, nextMilestone, milestoneLevel, milestonePct };
}

function renderIdentityModule(state, metrics){
  return `<article class="glass live-card home-player-card">
    <div class="ovr-badge">OVR ${metrics.ovr}</div>
    <img src="assets/art/player.svg" alt="Live player card">
    <span class="kicker">My Player • ${metrics.rank}</span>
    <h2>${state.profile.name || "Player"}</h2>
    <p>${state.profile.position} • Level ${state.game.level}</p>
    <div class="mini-strip">
      <div><small>Vision</small><b>${65 + state.game.level}</b></div>
      <div><small>Reaction</small><b>${state.analytics.bestReaction ? 78 : 61}</b></div>
      <div><small>Awareness</small><b>${70 + Math.min(20,state.game.streak)}</b></div>
    </div>
  </article>`;
}

function renderMissionModule(state, metrics){
  return `<article class="glass hero-panel home-mission-card">
    <span class="kicker">Today's Mission</span>
    <h1>Beat yesterday.<br>Think faster.</h1>
    <p>Complete one focused Vision Sprint to protect your streak, build XP, and move your player profile forward.</p>
    <div class="mini-strip">
      <div><small>Objective</small><b>1 clean rep</b></div>
      <div><small>Reward</small><b>${metrics.rewardState}</b></div>
      <div><small>Target</small><b>${Math.max(0, metrics.need - state.game.xp)} XP</b></div>
    </div>
    <div class="hero-actions">
      <button class="primary mega" data-route="training">Continue Training</button>
      <button data-route="camera">Camera Challenge</button>
    </div>
  </article>`;
}

function renderWeeklyProgressModule(state, metrics){
  return `<button class="tile home-progress-card" data-route="analytics">
    <span>Weekly progress</span>
    <b>${metrics.trend >= 0 ? "+" : ""}${metrics.trend}% trend</b>
    <div class="xpbar"><i style="width:${Math.min(100, metrics.weeklyTotal / Math.max(1, metrics.need) * 100)}%"></i></div>
    <small>${metrics.weeklyTotal} XP • ${metrics.weeklyTotal >= metrics.lastWeek ? "Best Week pace" : "Steady Growth"}</small>
  </button>`;
}

function renderRewardPreviewModule(state, metrics){
  return `<button class="tile home-reward-card" data-route="reward">
    <span>Reward preview</span>
    <b>${metrics.rewardPct}% to unlock</b>
    <div class="xpbar"><i style="width:${metrics.rewardPct}%"></i></div>
    <small>${state.game.dailyDone ? "Reward ready — tap to open." : `${100 - metrics.rewardPct}% remaining • complete today's mission.`}</small>
  </button>`;
}

function renderCareerLadderModule(state, metrics){
  return `<article class="glass career-card home-career-card">
    <span class="kicker">Career ladder</span>
    <h2>${metrics.milestonePct}% to ${metrics.nextMilestone}</h2>
    <div class="xpbar"><i style="width:${metrics.milestonePct}%"></i></div>
    <small>${Math.max(0,metrics.milestoneLevel - state.game.level)} levels remaining • Level ${state.game.level}/${metrics.milestoneLevel}</small>
    <img src="assets/art/career-ladder.svg" alt="Career ladder preview">
  </article>`;
}

export function renderHome(state){
  const metrics = homeMetrics(state);
  return `<section class="screen app home-aaa home-v7 active" id="home">
    <header class="top home-command">
      <div>
        <span class="kicker">🔥 ${state.game.streak} day streak • ${metrics.rank}</span>
        <h1>PitchIQ Academy</h1>
      </div>
      <button class="ghost" data-action="reset">Reset</button>
    </header>
    <section class="home-v7-grid">
      ${renderIdentityModule(state, metrics)}
      ${renderMissionModule(state, metrics)}
      <article class="glass tile home-xp-card"><span>XP progress</span><b>Level ${state.game.level}</b><div class="xpbar"><i style="width:${metrics.pct}%"></i></div><small>${state.game.xp} / ${metrics.need} XP to next level</small></article>
      ${renderWeeklyProgressModule(state, metrics)}
      ${renderRewardPreviewModule(state, metrics)}
      ${renderCareerLadderModule(state, metrics)}
      <article class="quick-stat home-attributes">${stat("Vision", 65 + state.game.level)}${stat("Reaction", metrics.best)}${stat("Combo", "x" + state.game.bestCombo)}</article>
    </section>
  </section>`;
}

const DIFFICULTY_COPY = {
  easy: { label:"Easy", text:"More time to settle in and build confidence." },
  medium: { label:"Medium", text:"Balanced pressure for a normal academy rep." },
  hard: { label:"Hard", text:"Higher pressure. Protect your combo." }
};

export function renderTraining(state = {}, trainingView = {}){
  const profile = state.profile || {};
  const position = profile.position || "Winger";
  const drills = recommendedDrills(position).slice(0, 8);
  const stage = trainingView.stage || "home";
  const selectedDrill = trainingView.selectedDrill || drills[0];
  const missionDrill = trainingView.missionDrill || drills[0];
  const difficulty = trainingView.difficulty || "medium";
  const difficultyInfo = DIFFICULTY_COPY[difficulty] || DIFFICULTY_COPY.medium;
  const summary = trainingView.summary || { attempts:0, correct:0, accuracy:0, score:0, xp:state.game?.lastXp || 0, combo:state.game?.bestCombo || 1 };
  const rewardName = trainingView.rewardName || "Daily Academy Pack";
  const goal = selectedDrill?.focus || profile.goal || "React faster";
  const duration = selectedDrill?.seconds || 45;
  const rewardEstimate = difficulty === "hard" ? "Up to 300 XP" : difficulty === "easy" ? "Up to 180 XP" : "Up to 240 XP";
  const missionStatus = state.game?.dailyDone ? "Mission complete" : "Protect your streak";
  const resultNote = summary.accuracy >= 80 ? "Strong rep. Keep the streak alive." : summary.attempts ? "Good rep. One more tomorrow builds the habit." : "Session logged. Start with one clean response next time.";
  const stepLabel = { home:"Step 1 of 5", "choose-drill":"Step 2 of 5", "choose-difficulty":"Step 3 of 5", preview:"Step 4 of 5", live:"Live rep", results:"Step 5 of 5", "claim-reward":"Reward" }[stage] || "Training";
  const flowHint = { home:"Choose your rep", "choose-drill":"Pick the focus", "choose-difficulty":"Set the pressure", preview:"Review and start", live:"React and score", results:"Review and claim", "claim-reward":"Bank the progress" }[stage] || "Build the next rep";
  const header = `<header class="sub"><button data-route="home">←</button><h1>Training</h1><button data-action="training-home">Home</button></header><div class="glass tile"><span class="kicker">${stepLabel}</span><b>${flowHint}</b><small>${selectedDrill?.name || missionDrill?.name || "Training"} • ${difficultyInfo.label}</small></div>`;

  if(stage === "choose-drill"){
    return `<section class="screen app active" id="training">
      ${header}
      <div class="glass tile"><span class="kicker">Choose your drill</span><b>What are you sharpening?</b><small>Pick one focused rep for your ${position} session.</small></div>
      <div class="drill-grid">
        ${drills.map(d=>`<button class="glass drill-card ${selectedDrill?.id===d.id?'active':''}" data-drill="${d.id}" data-action="choose-drill"><span class="kicker">${d.type}</span><b>${d.name}</b><small>${d.description || "Football cognition drill."}</small><small>${d.seconds}s • ${d.focus || d.type}</small></button>`).join("")}
      </div>
      <div class="actions"><button data-action="training-home">Back to Training Home</button></div>
    </section>`;
  }

  if(stage === "choose-difficulty"){
    return `<section class="screen app active" id="training">
      ${header}
      <div class="glass tile"><span class="kicker">Pressure level</span><b>${selectedDrill?.name || "Selected drill"}</b><small>Choose how hard this ${duration}s rep should feel.</small></div>
      <div class="drill-grid">
        ${Object.entries(DIFFICULTY_COPY).map(([key, info])=>`<button class="glass drill-card ${difficulty===key?'active':''}" data-difficulty="${key}" data-action="choose-difficulty"><span class="kicker">${key}</span><b>${info.label}</b><small>${info.text}</small></button>`).join("")}
      </div>
      <div class="actions"><button data-action="choose-drill-stage">Change Drill</button></div>
    </section>`;
  }

  if(stage === "preview"){
    return `<section class="screen app active" id="training">
      ${header}
      <div class="glass tile"><span class="kicker">Session Preview</span><b>${selectedDrill?.name || "Training"}</b><small>${selectedDrill?.description || "Check the plan, then start the live rep."}</small></div>
      <div class="stats">${stat("Difficulty", difficultyInfo.label)}${stat("Duration", duration + "s")}${stat("Reward", rewardEstimate)}</div>
      <div class="dashboard-grid">
        <article class="glass tile"><span>Goal</span><b>${goal}</b><small>One clear focus before you start.</small></article>
        <article class="glass tile"><span>How to win</span><b>Correct cues + combo</b><small>React cleanly, then protect your streak.</small></article>
        <article class="glass tile"><span>Focus</span><b>${selectedDrill?.focus || selectedDrill?.type || "Reaction"}</b><small>Keep your first action simple.</small></article>
      </div>
      <div class="actions"><button data-action="choose-difficulty-stage">Change Difficulty</button><button class="primary mega" data-action="start-training">Start Rep</button></div>
    </section>`;
  }

  if(stage === "live"){
    return `<section class="screen app active" id="training">
      <header class="sub"><button data-action="training-home">←</button><h1>Live Session</h1><button data-action="finish-training">Finish Rep</button></header>
      <div class="glass tile"><span class="kicker">Live rep</span><b>${selectedDrill?.name || "Training"}</b><small>${difficultyInfo.label} pressure • respond to the cue.</small></div>
      <div class="stats">${stat("Time", trainingView.time ?? duration, "time")}${stat("Score", trainingView.score ?? 0, "score")}${stat("Combo", 'x<span id="combo">'+(trainingView.combo ?? 1)+'</span>')}</div>
      <div class="cue glass"><div class="pulse"></div><b id="cue">${trainingView.cueDisplay || "READY"}</b><small id="instruction">${trainingView.instruction || "Say or tap the cue."}</small></div>
      <div class="actions"><button data-answer="red">Red</button><button data-answer="blue">Blue</button><button data-answer="left">Left</button><button data-answer="right">Right</button></div>
      <div class="actions"><button data-action="voice">🎤 Voice</button><button data-action="correct">Correct</button><button data-action="wrong">Missed</button><button class="primary" data-action="finish-training">Complete Rep</button></div>
    </section>`;
  }

  if(stage === "results"){
    return `<section class="screen app active" id="training">
      ${header}
      <div class="glass tile"><span class="kicker">Session complete</span><b>${selectedDrill?.name || "Training"}</b><small>${resultNote}</small></div>
      <div class="stats">${stat("XP earned", "+" + summary.xp)}${stat("Accuracy", summary.accuracy + "%")}${stat("Best combo", "x" + summary.combo)}${stat("Score", summary.score)}</div>
      <div class="dashboard-grid">
        <article class="glass tile"><span>Performance</span><b>${summary.correct}/${summary.attempts} correct</b><small>${difficultyInfo.label} pressure • ${selectedDrill?.focus || selectedDrill?.type || "Reaction"}</small></article>
        <article class="glass tile"><span>Progress</span><b>${rewardName}</b><small>Your session reward is ready to claim.</small></article>
        <article class="glass tile"><span>Next rep</span><b>${missionDrill?.name || "Training"}</b><small>Return tomorrow to protect the streak.</small></article>
      </div>
      <div class="actions"><button class="primary mega" data-action="claim-reward-stage">Claim Reward</button><button data-action="training-home">Back to Training</button></div>
    </section>`;
  }

  if(stage === "claim-reward"){
    return `<section class="screen center reward active" id="training">
      <div class="glass tile"><span class="kicker">Reward claimed</span><b>${rewardName}</b><small>${selectedDrill?.name || "Training"} is complete.</small></div>
      <div class="pack-stage"><img src="assets/art/pack.svg" alt="Gold pack"></div>
      <h2>+${summary.xp} XP banked</h2>
      <p>Progress saved. Come back tomorrow for ${missionDrill?.name || "your next rep"}.</p>
      <button class="primary mega" data-action="training-home">Return to Training Home</button>
    </section>`;
  }

  return `<section class="screen app active" id="training">
    ${header}
    <section class="home-hero">
      <article class="glass hero-panel">
        <span class="kicker">Training Home</span>
        <h1>Build the next rep.</h1>
        <p>Choose a focused drill, set the pressure, preview the goal, then complete one clean rep.</p>
        <div class="mini-strip">
          <div><small>Position</small><b>${position}</b></div>
          <div><small>Best Combo</small><b>x${state.game?.bestCombo || 1}</b></div>
          <div><small>Today</small><b>${state.game?.dailyDone ? "Complete" : "Open"}</b></div>
        </div>
        <div class="hero-actions"><button class="primary mega" data-action="start-mission-training">Start Today's Mission</button><button data-action="choose-drill-stage">Choose Drill</button></div>
      </article>
      <article class="glass live-card">
        <div class="ovr-badge">Level ${state.game?.level || 1}</div>
        <img src="assets/art/player.svg" alt="Training player">
        <span class="kicker">Recommended</span>
        <h2>${missionDrill?.name || "Vision Sprint"}</h2>
        <p>${missionDrill?.focus || "Reaction"}</p>
      </article>
    </section>
    <article class="glass tile">
      <span class="kicker">Today's Mission • ${missionStatus}</span>
      <b>${missionDrill?.name || "Daily Training"}</b>
      <small>${missionDrill?.description || "Complete one focused rep to build XP and protect your daily rhythm."}</small>
      <small>${missionDrill?.seconds || 45}s • ${missionDrill?.focus || "Reaction"} • Daily reward progress</small>
      <div class="actions"><button class="primary" data-action="start-mission-training">Start Mission</button><button data-action="choose-drill-stage">Choose Different Drill</button></div>
    </article>
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
  const need = xpNeed(state.game.level);
  const pct = state.game.dailyDone ? 100 : Math.min(100, Math.round(state.game.xp/need*100));
  const remaining = Math.max(0, 100 - pct);
  return `<section class="screen center reward active" id="reward">
    <h1>Daily<br>Reward</h1>
    <div class="pack-stage"><img id="pack" src="assets/art/pack.svg" alt="Gold pack" data-action="open-pack"></div>
    <h2 id="rewardTitle">${state.game.packOpened ? "Reward Claimed" : state.game.dailyDone ? "Reward Ready" : pct + "% to unlock"}</h2>
    <p id="rewardText">${state.game.dailyDone ? "Open your earned reward." : `${remaining}% remaining — complete today's mission to unlock Academy Boots.`}</p>
    <div class="glass tile"><span>Unlock progress</span><b>${pct}% complete</b><div class="xpbar"><i style="width:${pct}%"></i></div><small>${state.game.dailyDone ? "Daily pack is ready." : `${state.game.xp} / ${need} XP toward the next unlock.`}</small></div>
    <div class="collection-grid">
      ${REWARDS.map(r=>`<div class="glass collection-card"><img src="${r.art}" style="width:100%;max-height:140px;object-fit:contain"><span class="kicker">${r.tier}</span><b>${r.name}</b><small>${unlocked.includes(r.id) ? "Unlocked" : `${pct}% progress`}</small></div>`).join("")}
    </div>
    <button class="primary mega" data-route="analytics">Continue</button>
  </section>`;
}

export function renderPlayer(state){
  const ovr = Math.min(99, 60 + state.game.level + (state.analytics.bestReaction ? 4 : 0));
  const rank = rankForLevel(state.game.level);
  const vision = 65 + state.game.level;
  const reaction = state.analytics.bestReaction ? 78 : 61;
  const awareness = 70 + Math.min(20,state.game.streak);
  const decision = 64 + state.game.bestCombo;
  const composure = 62 + state.game.bestCombo;
  return `<section class="screen app active" id="player"><header class="sub"><button data-route="home">←</button><h1>Player</h1><button data-route="settings">Settings</button></header><div class="player glass"><img src="assets/art/player.svg" alt="Player"><div><span class="kicker">Player identity • ${rank}</span><h2>${state.profile.name||"Player"}</h2><p>OVR ${ovr} • ${state.profile.position} • Level ${state.game.level}</p></div></div><div class="stats">${stat("Vision",vision)}${stat("Reaction",reaction)}${stat("Awareness",awareness)}${stat("Decision",decision)}${stat("Composure",composure)}</div><div class="glass tile"><span>Profile focus</span><b>${state.profile.position || "Player"} pathway</b><small>Identity and attributes mirror the Home player card.</small></div></section>`;
}
export function renderAnalytics(state){
  const vals = state.analytics.weeklyXp;
  const max = Math.max(1, ...vals);
  const weeklyTotal = vals.reduce((a,b)=>a+b,0);
  const lastWeek = Math.max(1, Math.round(weeklyTotal * .85));
  const trend = Math.round((weeklyTotal - lastWeek) / lastWeek * 100);
  const vision = Math.min(95,65+state.game.level), reaction = state.analytics.bestReaction ? 78 : 61, scan = 70+Math.min(20,state.game.streak), decision = 64+state.game.bestCombo, comp = 62+state.game.bestCombo;
  const points = [[150,35-vision*.15],[245-reaction*.7,105-reaction*.25],[205-decision*.35,240-decision*.55],[95+comp*.25,240-comp*.55],[55+scan*.65,105-scan*.25]].map(p=>p.join(",")).join(" ");
  return `<section class="screen app summary active" id="analytics"><header class="sub"><button data-route="home">←</button><h1>Analytics</h1><button data-route="career">Career</button></header>
    <div class="stats">${stat("Weekly XP",weeklyTotal)}${stat("Trend",(trend >= 0 ? "+" : "") + trend + "%")}${stat("Best RT",state.analytics.bestReaction ? state.analytics.bestReaction+" ms":"—")}${stat("Best Combo","x"+state.game.bestCombo)}</div>
    <div class="analytics-grid">
      <div class="glass analytics-card"><span class="kicker">Weekly progress • ${weeklyTotal >= lastWeek ? "Best Week pace" : "Steady Growth"}</span><div class="chart">${vals.map(v=>`<div class="bar" style="height:${Math.max(12,Math.round(v/max*190))}px"></div>`).join("")}</div><small>${weeklyTotal} XP this week • ${(trend >= 0 ? "+" : "") + trend}% trend</small></div>
      <div class="glass analytics-card"><span class="kicker">Player radar • ${state.profile.position}</span><div class="spider"><svg viewBox="0 0 300 300"><polygon points="150,30 260,110 220,250 80,250 40,110" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/><polygon points="${points}" fill="rgba(215,255,46,.22)" stroke="#D7FF2E" stroke-width="5"/></svg></div></div>
      <div class="glass analytics-card"><span class="kicker">Training heatmap</span><div class="heatmap">${vals.map(v=>`<div class="heat ${v>0?'on':''}"></div>`).join("")}</div><small>Green days show completed activity.</small></div>
      <div class="parent-coach"><div class="glass analytics-card"><span class="kicker">Parent view</span><b>Consistency ${vals.filter(v=>v>0).length}/7</b><small>Simple effort summary.</small></div><div class="glass analytics-card"><span class="kicker">Coach view</span><b>${state.profile.position} pathway</b><small>Training indicators only.</small></div></div>
    </div>
    <button class="primary mega" data-route="home">Return Home</button></section>`;
}


export function renderCareer(state = {}){
  const game = state.game || {};
  const level = game.level || 1;
  const currentRank = rankForLevel(level);
  const ranks = [
    { name:"Grassroots", min:1 },
    { name:"Local Club", min:4 },
    { name:"Division 3", min:8 },
    { name:"Division 2", min:13 },
    { name:"Division 1", min:19 },
    { name:"Academy", min:26 },
    { name:"NPL", min:36 },
    { name:"Professional", min:51 },
    { name:"Europe", min:71 },
    { name:"Legend", min:91 }
  ];
  const nextRank = ranks.find(r=>level < r.min);
  const previousRank = [...ranks].reverse().find(r=>level >= r.min) || ranks[0];
  const progressToNext = nextRank ? Math.min(100, Math.round((level - previousRank.min) / Math.max(1, nextRank.min - previousRank.min) * 100)) : 100;
  return `<section class="screen app active" id="career">
    <header class="sub"><button data-route="home">←</button><h1>Career</h1><button data-route="player">Player</button></header>
    <div class="glass tile"><span class="kicker">Current pathway</span><b>${currentRank}</b><small>${nextRank ? `${progressToNext}% to ${nextRank.name} • ${nextRank.min - level} levels remaining.` : "Legend pathway complete."}</small><div class="xpbar"><i style="width:${progressToNext}%"></i></div></div>
    <div class="career-grid">
      ${ranks.map(r => {
        const unlocked = level >= r.min;
        const current = r.name === currentRank || (currentRank === "A-League" && r.name === "Professional") || (currentRank === "Ballon d'Or" && r.name === "Legend");
        return `<div class="glass career-node ${current ? "current" : ""} ${unlocked ? "unlocked" : "locked"}"><span class="kicker">Level ${r.min}+</span><b>${r.name}</b><small>${current ? "Current rank" : unlocked ? "Unlocked" : `${Math.max(0,r.min-level)} levels away`}</small></div>`;
      }).join("")}
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


// Compatibility exports added in Sprint 4.2.1.
// Older deployed main.js versions may still import these functions.
// Keeping these exports prevents a module-load crash.
export function renderCollection(state){
  return renderReward(state);
}

export function renderArt(state){
  return renderHome(state);
}
