import { getUnifiedPlayerProfile } from "./academy-unified-profile-a1.js?v=a1-unified-profile-20260719";
import { getAcademyPerformanceIndex } from "./academy-performance-index-a2.js?v=a2-performance-index-20260719";

const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(Number(value)||0)));
const DAYS=86400000;
function trend(history){
  if(history.length<2)return {id:"building",label:"Building evidence",delta:0};
  const ordered=[...history].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const split=Math.max(1,Math.floor(ordered.length/2));
  const mean=items=>items.reduce((sum,item)=>sum+Number(item.score||0),0)/Math.max(1,items.length);
  const delta=Math.round(mean(ordered.slice(split))-mean(ordered.slice(0,split)));
  return delta>=5?{id:"improving",label:"Improving",delta}:delta<=-5?{id:"review",label:"Needs review",delta}:{id:"steady",label:"Steady",delta};
}
function forecast(profile,index){
  const remaining=Math.max(0,200-(profile.academyXp%200||0));
  const dated=profile.history.filter(item=>item.date).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const span=dated.length>1?Math.max(1,(new Date(dated.at(-1).date)-new Date(dated[0].date))/DAYS):0;
  const rate=span?profile.academyXp/span:0;
  const days=rate>0?Math.ceil(remaining/rate):null;
  const confidence=index.evidence.state==="strong"?"High":index.evidence.state==="growing"?"Medium":"Low";
  return {remainingXp:remaining,estimatedDays:days,confidence,message:days?`At the current recorded pace, the next Academy level is approximately ${days} day${days===1?"":"s"} away.`:"Complete more sessions to establish a reliable progression pace."};
}
export function getAcademyDevelopmentPath(){
  const profile=getUnifiedPlayerProfile(),index=getAcademyPerformanceIndex(profile),movement=trend(profile.history),projection=forecast(profile,index);
  const strongest=profile.strengths[0]||null,priority=profile.developmentAreas[0]||null;
  const nextLevel=profile.academyLevel+1;
  const milestones=[
    {id:"academy-level",label:`Reach Academy Level ${nextLevel}`,progress:clamp(((profile.academyXp%200)/200)*100),detail:`${projection.remainingXp} XP remaining`},
    {id:"performance-index",label:"Build Academy Performance Index",progress:index.score,detail:index.evidence.label},
    {id:"development-focus",label:priority?`Develop ${priority.label}`:"Establish a development focus",progress:priority?priority.score:0,detail:priority?`${priority.score}% current evidence":"Complete training to identify a priority"`}
  ];
  return Object.freeze({version:"1.0",generatedAt:new Date().toISOString(),stage:index.label,academyLevel:profile.academyLevel,indexScore:index.score,evidence:index.evidence,trend:movement,forecast:projection,strongest,priority,milestones,state:profile.history.length?"active":"building",guardrails:{readOnly:true,usesRecordedEvidenceOnly:true,doesNotChangeScores:true,doesNotChangeXp:true,doesNotUnlockContent:true}});
}
window.PitchIQAcademyDevelopmentPath=Object.freeze({get:getAcademyDevelopmentPath});
