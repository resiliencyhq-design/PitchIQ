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

export function missionById(id){
  return FOOTBALL_IQ_MISSIONS.find(mission => mission.id === id) || null;
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
