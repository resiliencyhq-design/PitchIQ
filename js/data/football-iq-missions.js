export const FOOTBALL_IQ_MISSIONS = Object.freeze([
  {
    id:"scan-before-receive",
    title:"Scan Before Receiving",
    category:"scanning",
    progressionStage:"foundation",
    difficulty:2,
    xp:10,
    minutes:4,
    description:"Build the habit of checking your surroundings before the ball arrives.",
    objectives:["Check both shoulders before receiving","Identify pressure and free space","Prepare your first action earlier"],
    coachingPrompt:"Look before the ball arrives.",
    successIndicators:["Scans before receiving","Identifies the nearest pressure","Recognises the safest useful space","Prepares the next action before the first touch"],
    assessmentCriteria:{ recognition:"Identifies pressure and available space before receiving", timing:"Completes the scan before the ball arrives", decisionQuality:"Prepares an appropriate first action from the information gathered" },
    commonMistakes:["Looking only after receiving","Checking one side only","Scanning without using the information"],
    feedback:{ before:"Check both shoulders before the ball arrives.", during:["Look early","Check both sides","Use what you saw"], after:{ strength:"You gathered information before receiving.", improvement:"Complete the scan earlier so your first action is ready.", transferQuestion:"Before your next receive in a match, can you locate pressure and free space on both sides?" } },
    status:"available",
    recommended:true,
    launchRoute:"training",
    runtimeMode:"generic_fallback",
    attempts:0
  },
  {
    id:"scan-while-moving",
    title:"Scan While Moving",
    category:"scanning",
    progressionStage:"developing",
    difficulty:3,
    xp:15,
    minutes:5,
    description:"Keep checking the picture while changing position instead of waiting until you stop.",
    objectives:["Scan while moving into support","Update pressure and space information","Keep body movement and visual checks coordinated"],
    coachingPrompt:"Move, check, update.",
    successIndicators:["Scans without stopping movement","Updates the picture more than once","Maintains useful support movement","Adjusts the next action when information changes"],
    assessmentCriteria:{ recognition:"Identifies changes in pressure and support while moving", timing:"Repeats scans during movement rather than only at the end", decisionQuality:"Adjusts movement or action using the updated picture" },
    commonMistakes:["Stopping to scan","Looking once and keeping an outdated picture","Turning the head without maintaining useful movement"],
    feedback:{ before:"Keep moving and keep updating the picture.", during:["Move and check","Look again","Update your route"], after:{ strength:"You kept gathering information while moving.", improvement:"Scan again whenever the pressure or support picture changes.", transferQuestion:"As you move to support in your next match, can you check twice before the ball reaches you?" } },
    status:"available",
    recommended:false,
    launchRoute:"training",
    runtimeMode:"generic_fallback",
    attempts:0
  },
  {
    id:"transition-scan",
    title:"Scan During Transition",
    category:"scanning",
    progressionStage:"advanced",
    difficulty:4,
    xp:20,
    minutes:6,
    description:"Scan immediately when possession changes so you can recognise the first threat or opportunity.",
    objectives:["Recognise the moment possession changes","Scan for the first attacking opportunity or defensive threat","Select an early transition action"],
    coachingPrompt:"When possession changes, scan first.",
    successIndicators:["Recognises transition quickly","Scans before committing to an action","Finds the highest-value opportunity or threat","Responds accurately within a shorter decision window"],
    assessmentCriteria:{ recognition:"Identifies the most important transition opportunity or threat", timing:"Scans immediately after possession changes", decisionQuality:"Selects an appropriate first transition action" },
    commonMistakes:["Running immediately without checking","Watching the ball after possession changes","Finding the right option after the transition window has closed"],
    feedback:{ before:"Possession changes. Scan before you move.", during:["Transition—look first","Find the first threat","Find the first opportunity"], after:{ strength:"You scanned early when the game changed direction.", improvement:"Make the first scan immediate so the transition picture is still open.", transferQuestion:"When possession changes in your next match, what is the first threat or opportunity you need to find?" } },
    status:"available",
    recommended:false,
    launchRoute:"training",
    runtimeMode:"native",
    attempts:0
  },
  { id:"predict-next-play", title:"Predict the Next Play", category:"vision", difficulty:4, xp:15, minutes:5, description:"Read the pattern and anticipate what may happen next.", objectives:["Recognise developing play patterns","Track teammates and opponents together","Choose the highest-value option earlier","Anticipate the next pass before it is played"], status:"available", recommended:true, launchRoute:"training", attempts:0 },
  {
    id:"find-third-player",
    title:"Find the Third Player",
    category:"awareness",
    progressionStage:"foundation",
    difficulty:2,
    xp:15,
    minutes:5,
    description:"Look beyond the nearest pass and spot the teammate who becomes available next.",
    objectives:["Identify the third-player option","Notice when the direct lane is blocked","Respond before the passing lane closes"],
    coachingPrompt:"See the next connection, not only the first pass.",
    successIndicators:["Identifies the third-player option","Notices when the direct lane is blocked","Responds before the passing lane closes","Repeats the correct recognition across scenarios"],
    assessmentCriteria:{ recognition:"Identifies the relevant third-player option", timing:"Responds before the passing lane closes", decisionQuality:"Selects the option that best continues the move" },
    commonMistakes:["Watching only the ball","Choosing the nearest teammate automatically","Recognising the option after the lane has closed"],
    feedback:{ before:"Look beyond the first pass. Who becomes free next?", during:["See the next connection","Check beyond the ball","Decide before the lane closes"], after:{ strength:"You recognised the next connection early.", improvement:"Check beyond the nearest option sooner.", transferQuestion:"In your next match, who could become free after your teammate receives the first pass?" } },
    status:"available",
    recommended:false,
    launchRoute:"training",
    runtimeMode:"native",
    attempts:0
  },
  {
    id:"see-beyond-ball",
    title:"See Beyond the Ball",
    category:"awareness",
    progressionStage:"developing",
    difficulty:3,
    xp:20,
    minutes:5,
    description:"Shift your attention away from the ball to notice useful movement and emerging space.",
    objectives:["Identify relevant off-ball movement","Distinguish useful movement from distraction","Recognise the space created by movement"],
    coachingPrompt:"Check what is changing away from the ball.",
    successIndicators:["Identifies a relevant off-ball movement cue","Distinguishes useful movement from distraction","Recognises the space created by player movement","Selects the best emerging option consistently"],
    assessmentCriteria:{ recognition:"Identifies the off-ball movement that changes the picture", timing:"Checks away from the ball before the option becomes obvious", decisionQuality:"Selects the most useful emerging option" },
    commonMistakes:["Following the ball continuously","Reacting to every movement as equally important","Seeing movement but not the space it creates"],
    feedback:{ before:"Check away from the ball. What movement changes the picture?", during:["Look off the ball","Find the useful movement","See the space it creates"], after:{ strength:"You noticed movement that changed the picture.", improvement:"Ignore distractions and track the movement that creates an option.", transferQuestion:"When the ball is on one side in your next match, what useful movement can you notice on the other side?" } },
    status:"available",
    recommended:false,
    launchRoute:"training",
    runtimeMode:"generic_fallback",
    attempts:0
  },
  {
    id:"track-three-players",
    title:"Track Three Players",
    category:"awareness",
    progressionStage:"advanced",
    difficulty:4,
    xp:25,
    minutes:6,
    description:"Keep the ball, pressure and support picture connected while the play changes.",
    objectives:["Track three relevant players across a sequence","Identify which movement changes the next action","Update the preferred option when pressure changes"],
    coachingPrompt:"Keep the ball, pressure and support picture connected.",
    successIndicators:["Tracks three relevant players across a changing sequence","Identifies which movement changes the next action","Updates the preferred option when pressure changes","Responds accurately within a shorter decision window"],
    assessmentCriteria:{ recognition:"Maintains awareness of the three relevant players", timing:"Updates the picture within the shorter decision window", decisionQuality:"Changes the preferred option when the pressure picture changes" },
    commonMistakes:["Losing one player while tracking another","Keeping the original option after the picture changes","Focusing on speed instead of updating information"],
    feedback:{ before:"Connect three things: the ball, the pressure and the support.", during:["Keep all three connected","Update the picture","Change the option when pressure changes"], after:{ strength:"You kept multiple players connected as the picture changed.", improvement:"Update your preferred option as soon as pressure changes.", transferQuestion:"Before you receive in your next match, can you locate the ball, the nearest pressure and your best support option?" } },
    status:"available",
    recommended:false,
    launchRoute:"training",
    runtimeMode:"generic_fallback",
    attempts:0
  },
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
