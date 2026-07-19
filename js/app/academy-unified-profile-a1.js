import { FOOTBALL_IQ_MISSIONS } from "../data/football-iq-missions.js?v=w1-3-mission-detail-20260719";
import { TECHNICAL_TRAINING_DRILLS, TECHNICAL_CATEGORY_LABELS } from "../data/technical-training-drills.js?v=w2-2-technical-catalogue-20260719";
import { getFootballIqProgress } from "./football-iq-progression-w1-4.js?v=w1-4-progression-20260719";
import { getTechnicalProgress, technicalCategorySnapshot } from "./technical-training-progression-w2-4.js?v=w2-4-technical-progression-20260719";

const CATEGORY_LABELS={scanning:"Scanning",vision:"Vision",decision:"Decision Making",reaction:"Reaction",dual:"Dual Task",position:"Positioning"};
const clamp=value=>Math.max(0,Math.min(100,Math.round(Number(value)||0)));
const time=value=>{const parsed=value?new Date(value).getTime():0;return Number.isFinite(parsed)?parsed:0};

function footballDomain(progress){
  const completed=FOOTBALL_IQ_MISSIONS.map(mission=>({mission,saved:progress.missions?.[mission.id]})).filter(item=>item.saved?.completed);
  const score=completed.length?clamp(completed.reduce((sum,item)=>sum+Number(item.saved.personalBest||0),0)/completed.length):0;
  return {id:"football-iq",label:"Football IQ",score,level:progress.level,completed:completed.length,total:FOOTBALL_IQ_MISSIONS.length,evidence:completed.length?"active":"building"};
}

function technicalDomain(progress){
  const completed=TECHNICAL_TRAINING_DRILLS.map(drill=>progress.drills?.[drill.id]).filter(item=>item?.completed);
  const score=completed.length?clamp(completed.reduce((sum,item)=>sum+Number(item.personalBest||0),0)/completed.length):0;
  return {id:"technical",label:"Technical",score,level:progress.level,completed:completed.length,total:TECHNICAL_TRAINING_DRILLS.length,evidence:completed.length?"active":"building"};
}

function dimensions(football,technical){
  const fiq=FOOTBALL_IQ_MISSIONS.map(mission=>{const saved=football.missions?.[mission.id];return {id:`fiq-${mission.category}`,label:CATEGORY_LABELS[mission.category]||mission.category,score:clamp(saved?.personalBest),source:"Football IQ",lastPlayed:saved?.lastPlayed||null,completed:Boolean(saved?.completed)}});
  const categories=[...new Set(TECHNICAL_TRAINING_DRILLS.map(drill=>drill.category))].map(category=>{const snapshot=technicalCategorySnapshot(category,technical);const latest=Math.max(...TECHNICAL_TRAINING_DRILLS.filter(drill=>drill.category===category).map(drill=>time(technical.drills?.[drill.id]?.lastPlayed)),0);return{id:`tech-${category}`,label:TECHNICAL_CATEGORY_LABELS[category]||category,score:clamp(snapshot.percent),source:"Technical",lastPlayed:latest?new Date(latest).toISOString():null,completed:snapshot.completed>0}});
  return [...fiq,...categories].filter(item=>item.completed||item.score>0);
}

function history(football,technical){
  const fiq=FOOTBALL_IQ_MISSIONS.flatMap(mission=>{const saved=football.missions?.[mission.id];return saved?.lastPlayed?[{id:`fiq-${mission.id}`,title:mission.title,world:"Football IQ",score:clamp(saved.personalBest),date:saved.lastPlayed}]:[]});
  const drills=TECHNICAL_TRAINING_DRILLS.flatMap(drill=>{const saved=technical.drills?.[drill.id];return saved?.lastPlayed?[{id:`tech-${drill.id}`,title:drill.title,world:"Technical",score:clamp(saved.personalBest),date:saved.lastPlayed}]:[]});
  return [...fiq,...drills].sort((a,b)=>time(b.date)-time(a.date)).slice(0,12);
}

export function getUnifiedPlayerProfile(){
  const football=getFootballIqProgress(),technical=getTechnicalProgress();
  const domains=[footballDomain(football),technicalDomain(technical)];
  const active=domains.filter(domain=>domain.evidence==="active");
  const academyScore=active.length?clamp(active.reduce((sum,domain)=>sum+domain.score,0)/active.length):0;
  const academyXp=Number(football.totalXp||0)+Number(technical.totalXp||0);
  const academyLevel=Math.max(1,Math.floor(academyXp/200)+1);
  const skills=dimensions(football,technical).sort((a,b)=>b.score-a.score);
  return Object.freeze({version:"1.0",generatedAt:new Date().toISOString(),academyScore,academyXp,academyLevel,evidence:active.length===2?"connected":active.length?"partial":"building",domains,skills,strengths:skills.slice(0,3),developmentAreas:[...skills].sort((a,b)=>a.score-b.score).slice(0,3),history:history(football,technical)});
}

window.PitchIQUnifiedPlayerProfile=Object.freeze({get:getUnifiedPlayerProfile});
