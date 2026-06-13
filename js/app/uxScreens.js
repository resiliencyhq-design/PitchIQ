import { stat } from "../components/ui.js";
import { rankForLevel, xpNeed } from "../game/progression.js";
import { REWARDS, CAREER_RANKS } from "../data/rewards.js";

export const TRAINING_CATEGORIES = [
  { id:"vision", icon:"👁️", title:"Vision", desc:"Recognise cues earlier", time:"4 min", xp:250 },
  { id:"reaction", icon:"⚡", title:"Reaction", desc:"Move faster to signals", time:"3 min", xp:220 },
  { id:"scanning", icon:"🔄", title:"Scanning", desc:"Check shoulder habits", time:"4 min", xp:260 },
  { id:"decision", icon:"🧠", title:"Decision", desc:"Choose under pressure", time:"5 min", xp:300 },
  { id:"dual", icon:"➕", title:"Dual Task", desc:"Think while reacting", time:"5 min", xp:320 },
  { id:"position", icon:"🎯", title:"Position", desc:"Role-specific reps", time:"4 min", xp:280 },
  { id:"elite", icon:"🏆", title:"Elite", desc:"High-speed mixed cues", time:"6 min", xp:400 }
];

export const DIFFICULTIES = [
  { id:"easy", title:"Easy", desc:"Slower cues, confidence reps", mult:1 },
  { id:"medium", title:"Medium", desc:"Balanced challenge", mult:1.15 },
  { id:"hard", title:"Hard", desc:"Faster transitions", mult:1.35 },
  { id:"adaptive", title:"Adaptive", desc:"Adjusts to performance", mult:1.25 },
  { id:"elite", title:"Elite", desc:"Fastest academy mode", mult:1.6 }
];

export function renderTrainingHome(state){
  return `<section class="screen app ux-screen active" id="training">
    <header class="ux-top"><button data-route="home">←</button><span class="kicker">Training</span></header>
    <div class="ux-hero">
      <span class="kicker">Today's session</span>
      <h1>Vision Sprint</h1>
      <p>One short session to protect your streak and unlock today's reward.</p>
      <button class="primary mega" data-action="quick-start-training">Start Training</button>
    </div>
    <div class="ux-actions">
      <button class="glass ux-tile" data-route="chooseDrill"><b>Choose Drill</b><small>Vision, reaction, scan, decision</small></button>
      <button class="glass ux-tile" data-route="analytics"><b>Recent Performance</b><small>XP, reaction, consistency</small></button>
    </div>
  </section>`;
}

export function renderChooseDrill(state){
  return `<section class="screen app ux-screen active" id="chooseDrill">
    <header class="ux-top"><button data-route="training">←</button><span class="kicker">Choose drill</span></header>
    <div class="category-grid">
      ${TRAINING_CATEGORIES.map(c=>`<button class="glass category-card" data-select-drill="${c.id}">
        <span>${c.icon}</span><b>${c.title}</b><small>${c.desc}<br>${c.time} • ${c.xp} XP</small>
      </button>`).join("")}
    </div>
  </section>`;
}

export function renderChooseDifficulty(state){
  return `<section class="screen app ux-screen active" id="chooseDifficulty">
    <header class="ux-top"><button data-route="chooseDrill">←</button><span class="kicker">Difficulty</span></header>
    <div class="difficulty-grid">
      ${DIFFICULTIES.map(d=>`<button class="glass difficulty-card" data-select-difficulty="${d.id}">
        <b>${d.title}</b><small>${d.desc}</small>
      </button>`).join("")}
    </div>
  </section>`;
}

export function renderSessionPreview(state){
  const drill = state.sessionDraft?.drill || "vision";
  const diff = state.sessionDraft?.difficulty || "adaptive";
  const category = TRAINING_CATEGORIES.find(c=>c.id===drill) || TRAINING_CATEGORIES[0];
  const difficulty = DIFFICULTIES.find(d=>d.id===diff) || DIFFICULTIES[3];
  return `<section class="screen app ux-screen active" id="sessionPreview">
    <header class="ux-top"><button data-route="chooseDifficulty">←</button><span class="kicker">Session preview</span></header>
    <div class="ux-hero compact">
      <span class="big-icon">${category.icon}</span>
      <h1>${category.title}</h1>
      <p>${category.desc}</p>
    </div>
    <div class="stats">${stat("Duration",category.time)}${stat("XP",Math.round(category.xp*difficulty.mult))}${stat("Mode",difficulty.title)}</div>
    <button class="primary mega full" data-action="start-live-session">Start</button>
  </section>`;
}

export function renderLiveSession(state){
  return `<section class="screen app live-session active" id="liveSession">
    <header class="live-hud"><b id="liveTime">45</b><b id="liveCombo">x1</b><b id="liveScore">0</b></header>
    <div class="live-cue"><div class="pulse"></div><b id="liveCue">READY</b></div>
    <button class="ghost end-live" data-action="finish-live-session">Finish</button>
  </section>`;
}

export function renderTrainingResults(state){
  return `<section class="screen center ux-screen active" id="trainingResults">
    <div class="results-card glass">
      <span class="kicker">Session complete</span>
      <h1>+${state.game.lastXp || 250} XP</h1>
      <div class="stats">${stat("Reaction","★★★★☆")}${stat("Scanning","★★★★★")}${stat("Combo","x"+state.game.bestCombo)}</div>
      <button class="primary mega" data-route="reward">Claim Reward</button>
    </div>
  </section>`;
}

export function renderAnalyticsHome(state){
  return `<section class="screen app ux-screen active" id="analytics">
    <header class="ux-top"><button data-route="home">←</button><span class="kicker">Analytics</span></header>
    <div class="stats">${stat("Weekly XP",state.analytics.weeklyXp.reduce((a,b)=>a+b,0))}${stat("Best RT",state.analytics.bestReaction?state.analytics.bestReaction+" ms":"—")}${stat("Level",state.game.level)}${stat("Streak",state.game.streak)}</div>
    <div class="ux-actions two">
      <button class="glass ux-tile" data-route="analyticsRadar"><b>Radar</b><small>Player intelligence profile</small></button>
      <button class="glass ux-tile" data-route="analyticsHeatmap"><b>Heatmap</b><small>Training consistency</small></button>
      <button class="glass ux-tile" data-route="analyticsCoach"><b>Coach</b><small>Priority skill + next drill</small></button>
      <button class="glass ux-tile" data-route="analyticsParent"><b>Parent</b><small>Simple progress view</small></button>
    </div>
  </section>`;
}

export function renderAnalyticsRadar(state){
  const values = [76, state.analytics.bestReaction?82:64, 79, 72, 74, 68, 70];
  const labels = ["Vision","Reaction","Scanning","Decision","Composure","Memory","Processing"];
  const pts = values.map((v,i)=>{
    const a=(-90+i*360/7)*Math.PI/180, r=v*1.15;
    return [150+Math.cos(a)*r,150+Math.sin(a)*r].join(",");
  }).join(" ");
  return `<section class="screen app ux-screen active"><header class="ux-top"><button data-route="analytics">←</button><span class="kicker">Radar</span></header>
    <div class="glass radar-full"><svg viewBox="0 0 300 300">
      <polygon points="${[0,1,2,3,4,5,6].map(i=>{let a=(-90+i*360/7)*Math.PI/180,r=112;return [150+Math.cos(a)*r,150+Math.sin(a)*r].join(",")}).join(" ")}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/>
      <polygon class="radar-poly" points="${pts}" fill="rgba(215,255,46,.24)" stroke="#D7FF2E" stroke-width="5"/>
      ${labels.map((l,i)=>{let a=(-90+i*360/7)*Math.PI/180,r=135;return `<text x="${150+Math.cos(a)*r}" y="${150+Math.sin(a)*r}" text-anchor="middle" fill="#D7FF2E" font-size="11">${l}</text>`}).join("")}
    </svg></div></section>`;
}

export function renderAnalyticsHeatmap(state){
  const vals = state.analytics.weeklyXp;
  return `<section class="screen app ux-screen active"><header class="ux-top"><button data-route="analytics">←</button><span class="kicker">Heatmap</span></header>
    <div class="glass heatmap-full">${Array.from({length:28}).map((_,i)=>`<button class="heat ${vals[i%7]>0?'on':''}"><small>${i+1}</small></button>`).join("")}</div>
    <div class="glass tile"><b>Training calendar</b><small>Green days show completed activity. Tap a day to review the session.</small></div>
  </section>`;
}

export function renderAnalyticsCoach(state){
  return `<section class="screen app ux-screen active"><header class="ux-top"><button data-route="analytics">←</button><span class="kicker">Coach dashboard</span></header>
    <div class="glass tile"><span class="kicker">Strength</span><b>Scanning consistency</b><small>Good completion pattern across recent sessions.</small></div>
    <div class="glass tile"><span class="kicker">Priority skill</span><b>Reaction under pressure</b><small>Next drill: Reaction Ladder, medium difficulty.</small></div>
    <div class="glass tile"><span class="kicker">Recommendation</span><b>3 short sessions this week</b><small>Keep it brief and reward attempts.</small></div>
  </section>`;
}

export function renderAnalyticsParent(state){
  return `<section class="screen app ux-screen active"><header class="ux-top"><button data-route="analytics">←</button><span class="kicker">Parent dashboard</span></header>
    <div class="stats">${stat("Sessions",state.analytics.sessions.length)}${stat("Minutes","12")}${stat("XP",state.analytics.weeklyXp.reduce((a,b)=>a+b,0))}${stat("Progress","On track")}</div>
    <div class="glass tile"><b>Simple summary</b><small>${state.profile.name || "Player"} is building a short, consistent training habit. Metrics are training indicators only.</small></div>
  </section>`;
}

export function renderRewardUX(state){
  const unlocked = state.game.unlocked || [];
  return `<section class="screen app ux-screen active" id="reward">
    <header class="ux-top"><button data-route="home">←</button><span class="kicker">Reward</span></header>
    <div class="reward-flow glass">
      <b>${state.game.dailyDone ? "Reward unlocked" : "Complete today's mission to unlock today's reward"}</b>
      <div class="flow-row"><span>Mission</span><i></i><span>Progress</span><i></i><span>Reward</span></div>
      <button class="primary mega" data-action="open-pack">${state.game.dailyDone ? "Open Pack" : "Start Mission"}</button>
    </div>
    <div class="collection-grid compact">
      ${REWARDS.map(r=>`<div class="glass collection-card ${unlocked.includes(r.id)?"unlocked":"locked"}"><img src="${r.art}" style="${unlocked.includes(r.id)?"":"filter:grayscale(1) opacity(.35)"}"><b>${r.name}</b><small>${unlocked.includes(r.id)?"Unlocked":"Locked"}</small></div>`).join("")}
    </div>
  </section>`;
}

export function renderCareerJourney(state){
  const current = rankForLevel(state.game.level);
  return `<section class="screen app ux-screen active" id="career">
    <header class="ux-top"><button data-route="home">←</button><span class="kicker">Career</span></header>
    <div class="career-vertical">
      ${["Grassroots","Local Club","Division 3","Division 2","Division 1","Academy","NPL","Professional","Europe","Legend"].map((r,i)=>{
        const active = r===current || (current==="A-League" && r==="Professional") || (current==="Ballon d'Or" && r==="Legend");
        const past = i < ["Grassroots","Local Club","Division 3","Division 2","Division 1","Academy","NPL","Professional","Europe","Legend"].indexOf(active?r:"");
        return `<div class="career-step ${active?"current":""}"><span>${active?"●":"○"}</span><b>${r}</b><small>${active?"Current rank":"Locked pathway"}</small></div>`;
      }).join("")}
    </div>
  </section>`;
}
