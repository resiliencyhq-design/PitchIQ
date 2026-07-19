export const FOOTBALL_IQ_MISSIONS = Object.freeze([
  { id:"scan-before-receive", title:"Scan Before You Receive", category:"scanning", difficulty:2, xp:10, minutes:4, description:"Build the habit of checking your surroundings before the ball arrives.", objectives:["Check both shoulders before receiving","Identify pressure and free space","Prepare your first action earlier"], status:"available", recommended:true, launchRoute:"training", attempts:0 },
  { id:"predict-next-play", title:"Predict the Next Play", category:"vision", difficulty:4, xp:15, minutes:5, description:"Read the pattern and anticipate what may happen next.", objectives:["Recognise developing play patterns","Track teammates and opponents together","Choose the highest-value option earlier","Anticipate the next pass before it is played"], status:"available", recommended:true, launchRoute:"training", attempts:0 },
  { id:"find-third-player", title:"Find the Third Player", category:"awareness", difficulty:3, xp:15, minutes:5, description:"Spot the teammate who becomes free after the next pass.", objectives:["Look beyond the nearest passing option","Recognise third-player combinations","Keep multiple teammates in your awareness"], status:"available", recommended:false, launchRoute:"training", attempts:0 },
  { id:"play-forward-or-secure", title:"Forward or Secure?", category:"decision", difficulty:3, xp:15, minutes:5, description:"Choose when to break a line and when to protect possession.", objectives:["Compare risk and reward quickly","Recognise when a forward option is truly on","Protect possession when the picture is closed"], status:"available", recommended:false, launchRoute:"training", attempts:0 },
  { id:"move-before-pass", title:"Move Before the Pass", category:"positioning", difficulty:2, xp:10, minutes:4, description:"Create a better angle before your teammate receives the ball.", objectives:["Move while the ball is travelling","Create a clear passing lane","Support from a useful angle and distance"], status:"completed", recommended:false, launchRoute:"training", personalBest:82, attempts:6, lastPlayed:"2 days ago" },
  { id:"read-the-trigger", title:"Read the Trigger", category:"anticipation", difficulty:4, xp:20, minutes:6, description:"Recognise the cue that tells you the next action is coming.", objectives:["Notice body-shape and movement cues","React to the trigger rather than the outcome","Anticipate play without guessing"], status:"locked", unlockLevel:2, recommended:false, launchRoute:"training", attempts:0 },
  { id:"early-information", title:"Give Early Information", category:"communication", difficulty:2, xp:10, minutes:4, description:"Use clear, early calls that help teammates act faster.", objectives:["Communicate before the ball arrives","Use short and useful information","Match your call to the developing picture"], status:"locked", unlockLevel:2, recommended:false, launchRoute:"training", attempts:0 },
]);

export const FOOTBALL_IQ_CATEGORY_LABELS = Object.freeze({
  awareness:"Awareness",
  scanning:"Scanning",
  vision:"Vision",
  decision:"Decision Making",
  positioning:"Positioning",
  anticipation:"Anticipation",
  communication:"Communication",
});

export const FOOTBALL_IQ_MODULES = Object.freeze({
  awareness:Object.freeze({ id:"awareness", title:"Awareness", icon:"◉", description:"Notice teammates, opponents and space before the moment demands a decision.", coachingPrompt:"See the whole picture earlier." }),
  scanning:Object.freeze({ id:"scanning", title:"Scanning", icon:"◎", description:"Build reliable checking habits before receiving, turning and transitioning.", coachingPrompt:"Look early. Look again." }),
  vision:Object.freeze({ id:"vision", title:"Vision", icon:"◇", description:"Recognise developing patterns and see valuable options beyond the obvious pass.", coachingPrompt:"See what opens next." }),
  decision:Object.freeze({ id:"decision", title:"Decision Making", icon:"↯", description:"Choose the right action quickly by balancing opportunity, pressure and risk.", coachingPrompt:"Decide earlier with purpose." }),
  positioning:Object.freeze({ id:"positioning", title:"Positioning", icon:"⌖", description:"Move into useful spaces that improve passing angles and support the next action.", coachingPrompt:"Arrive where the game needs you." }),
  anticipation:Object.freeze({ id:"anticipation", title:"Anticipation", icon:"≫", description:"Read triggers and predict the next action before it becomes obvious.", coachingPrompt:"React to the clue, not the outcome." }),
  communication:Object.freeze({ id:"communication", title:"Communication", icon:"◌", description:"Give clear, early information that helps teammates act faster and with confidence.", coachingPrompt:"Make teammates quicker." }),
});

export function missionById(id){
  return FOOTBALL_IQ_MISSIONS.find(mission => mission.id === id) || null;
}

export function moduleById(id){
  return FOOTBALL_IQ_MODULES[id] || null;
}

export function missionsForModule(moduleId){
  return FOOTBALL_IQ_MISSIONS.filter(mission => mission.category === moduleId);
}

export function moduleProgress(moduleId){
  const missions = missionsForModule(moduleId);
  const completed = missions.filter(mission => mission.status === "completed");
  const available = missions.filter(mission => mission.status !== "locked");
  const totalMinutes = available.reduce((sum, mission) => sum + Number(mission.minutes || 0), 0);
  const latest = completed.find(mission => mission.lastPlayed)?.lastPlayed || null;
  const percent = missions.length ? Math.round((completed.length / missions.length) * 100) : 0;
  const mastery = percent >= 80 ? "Advanced" : percent >= 40 ? "Developing" : "Foundation";
  const nextMission = available.find(mission => mission.status !== "completed") || completed[0] || null;
  return Object.freeze({ total:missions.length, completed:completed.length, available:available.length, percent, mastery, totalMinutes, lastTrained:latest, nextMission });
}

export function relatedMissions(mission, limit=3){
  if(!mission) return [];
  const sameCategory = FOOTBALL_IQ_MISSIONS.filter(item => item.id !== mission.id && item.category === mission.category && item.status !== "locked");
  const others = FOOTBALL_IQ_MISSIONS.filter(item => item.id !== mission.id && item.category !== mission.category && item.status !== "locked");
  return [...sameCategory, ...others].slice(0, limit);
}

export function missionsForView(view="recommended", category=""){
  const missions = category ? FOOTBALL_IQ_MISSIONS.filter(mission => mission.category === category) : [...FOOTBALL_IQ_MISSIONS];
  if(view === "recommended") return missions.filter(mission => mission.recommended && mission.status !== "locked");
  if(view === "completed") return missions.filter(mission => mission.status === "completed");
  if(view === "locked") return missions.filter(mission => mission.status === "locked");
  return missions.filter(mission => mission.status !== "locked");
}
