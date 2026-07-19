export const FOOTBALL_IQ_MISSIONS = Object.freeze([
  { id:"scan-before-receive", title:"Scan Before You Receive", category:"scanning", difficulty:2, xp:10, minutes:4, description:"Build the habit of checking your surroundings before the ball arrives.", status:"available", recommended:true, launchRoute:"training" },
  { id:"predict-next-play", title:"Predict the Next Play", category:"vision", difficulty:4, xp:15, minutes:5, description:"Read the pattern and anticipate what may happen next.", status:"available", recommended:true, launchRoute:"training" },
  { id:"find-third-player", title:"Find the Third Player", category:"awareness", difficulty:3, xp:15, minutes:5, description:"Spot the teammate who becomes free after the next pass.", status:"available", recommended:false, launchRoute:"training" },
  { id:"play-forward-or-secure", title:"Forward or Secure?", category:"decision", difficulty:3, xp:15, minutes:5, description:"Choose when to break a line and when to protect possession.", status:"available", recommended:false, launchRoute:"training" },
  { id:"move-before-pass", title:"Move Before the Pass", category:"positioning", difficulty:2, xp:10, minutes:4, description:"Create a better angle before your teammate receives the ball.", status:"completed", recommended:false, launchRoute:"training", personalBest:82 },
  { id:"read-the-trigger", title:"Read the Trigger", category:"anticipation", difficulty:4, xp:20, minutes:6, description:"Recognise the cue that tells you the next action is coming.", status:"locked", unlockLevel:2, recommended:false, launchRoute:"training" },
  { id:"early-information", title:"Give Early Information", category:"communication", difficulty:2, xp:10, minutes:4, description:"Use clear, early calls that help teammates act faster.", status:"locked", unlockLevel:2, recommended:false, launchRoute:"training" },
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

export function missionsForView(view="recommended", category=""){
  const missions = category ? FOOTBALL_IQ_MISSIONS.filter(mission => mission.category === category) : [...FOOTBALL_IQ_MISSIONS];
  if(view === "recommended") return missions.filter(mission => mission.recommended && mission.status !== "locked");
  if(view === "completed") return missions.filter(mission => mission.status === "completed");
  if(view === "locked") return missions.filter(mission => mission.status === "locked");
  return missions.filter(mission => mission.status !== "locked");
}
