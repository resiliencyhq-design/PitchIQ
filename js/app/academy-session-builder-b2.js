import { FOOTBALL_IQ_MISSIONS } from "../data/football-iq-missions.js?v=w1-3-mission-detail-20260719";
import { TECHNICAL_TRAINING_DRILLS, TECHNICAL_CATEGORY_LABELS } from "../data/technical-training-drills.js?v=w2-2-technical-catalogue-20260719";
import { getAcademyAICoachPlan } from "./academy-ai-coach-b1.js?v=b1-academy-ai-coach-20260719";
import { getTechnicalProgress, isTechnicalDrillUnlocked } from "./technical-training-progression-w2-4.js?v=w2-4-technical-progression-20260719";
import { getFootballIqProgress, isMissionUnlocked } from "./football-iq-progression-w1-4.js?v=w1-4-progression-20260719";

const normalise=value=>String(value||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const includes=(value,focus)=>normalise(value).includes(normalise(focus))||normalise(focus).includes(normalise(value));
const unique=items=>[...new Map(items.map(item=>[`${item.world}:${item.id}`,item])).values()];

function footballOptions(focus){
  const progress=getFootballIqProgress();
  return FOOTBALL_IQ_MISSIONS.filter(mission=>isMissionUnlocked(mission,progress)).map(mission=>({id:mission.id,title:mission.title,world:"Football IQ",category:mission.category,minutes:mission.minutes||5,difficulty:mission.difficulty||2,route:`football-iq-mission/${encodeURIComponent(mission.id)}`,focusMatch:includes(mission.category,focus)||includes(mission.title,focus)}));
}
function technicalOptions(focus){
  const progress=getTechnicalProgress();
  return TECHNICAL_TRAINING_DRILLS.filter(drill=>isTechnicalDrillUnlocked(drill,progress)).map(drill=>({id:drill.id,title:drill.title,world:"Technical",category:TECHNICAL_CATEGORY_LABELS[drill.category]||drill.category,minutes:drill.minutes||5,difficulty:drill.difficulty||2,route:`technical-training-drill/${encodeURIComponent(drill.id)}`,focusMatch:includes(drill.category,focus)||includes(drill.title,focus)}));
}
function choose(options,count,used=new Set()){return options.filter(item=>!used.has(`${item.world}:${item.id}`)).slice(0,count)}

export function buildAcademySession(plan=getAcademyAICoachPlan()){
  const focus=plan.focus?.label||"";
  const football=footballOptions(focus),technical=technicalOptions(focus);
  const focused=unique([...football.filter(item=>item.focusMatch),...technical.filter(item=>item.focusMatch)]).sort((a,b)=>a.difficulty-b.difficulty);
  const pool=unique([...focused,...football,...technical]);
  const used=new Set();
  const blocks=[];
  const add=(item,purpose)=>{if(!item)return;used.add(`${item.world}:${item.id}`);blocks.push({...item,purpose,order:blocks.length+1})};
  add(focused[0]||pool[0],plan.personalised?"Primary development focus":"Evidence-building start");
  const opposite=blocks[0]?.world==="Football IQ"?technical:football;
  add(choose(opposite,1,used)[0]||choose(pool,1,used)[0],"Whole-game balance");
  add(choose(pool.filter(item=>item.difficulty<=3),1,used)[0]||choose(pool,1,used)[0],"Confidence finish");
  const totalMinutes=blocks.reduce((sum,item)=>sum+Number(item.minutes||0),0);
  return Object.freeze({version:"1.0",generatedAt:new Date().toISOString(),state:blocks.length?"ready":"building",title:plan.personalised?`${plan.focus.label} development session`:"Academy starter session",focus:plan.focus,blocks,totalMinutes,totalXpEstimate:blocks.reduce((sum,item)=>sum+(item.difficulty*5+5),0),message:blocks.length?`A balanced ${totalMinutes}-minute session built from your current Academy evidence.`:"Complete or unlock training activities to build a session.",guardrails:{recommendationOnly:true,usesUnlockedContentOnly:true,doesNotChangeScores:true}});
}

window.PitchIQAcademySessionBuilder=Object.freeze({build:buildAcademySession});