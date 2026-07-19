import { getUnifiedPlayerProfile } from "./academy-unified-profile-a1.js?v=a1-unified-profile-20260719";

const clamp=value=>Math.max(0,Math.min(100,Math.round(Number(value)||0)));
const mean=values=>values.length?values.reduce((sum,value)=>sum+Number(value||0),0)/values.length:0;

function band(score,evidence){
  if(evidence==="building")return {id:"building",label:"Building",message:"Complete training to establish your Academy Performance Index."};
  if(score>=85)return {id:"advanced",label:"Advanced",message:"Your current evidence shows a highly developed academy profile."};
  if(score>=70)return {id:"progressing",label:"Progressing",message:"Your profile is progressing strongly across the academy."};
  if(score>=50)return {id:"developing",label:"Developing",message:"Your academy foundations are growing through consistent training."};
  return {id:"foundation",label:"Foundation",message:"Keep building evidence and completing targeted training."};
}

function consistency(history){
  if(!history.length)return 0;
  const scores=history.map(item=>Number(item.score||0));
  if(scores.length===1)return clamp(scores[0]*0.7);
  const average=mean(scores);
  const variance=mean(scores.map(score=>(score-average)**2));
  const stability=Math.max(0,100-Math.sqrt(variance)*2);
  return clamp(average*0.6+stability*0.4);
}

function confidence(profile){
  const completed=profile.domains.reduce((sum,domain)=>sum+Number(domain.completed||0),0);
  const activeDomains=profile.domains.filter(domain=>domain.evidence==="active").length;
  if(!completed)return {score:0,label:"No evidence",state:"building"};
  const score=clamp(Math.min(60,completed*5)+activeDomains*20);
  return {score,label:score>=80?"Strong evidence":score>=50?"Growing evidence":"Early evidence",state:score>=80?"strong":score>=50?"growing":"early"};
}

export function getAcademyPerformanceIndex(profile=getUnifiedPlayerProfile()){
  const activeDomains=profile.domains.filter(domain=>domain.evidence==="active");
  const domainScore=activeDomains.length?mean(activeDomains.map(domain=>domain.score)):0;
  const skillScore=profile.skills.length?mean(profile.skills.map(skill=>skill.score)):0;
  const consistencyScore=consistency(profile.history);
  const evidence=confidence(profile);
  const score=activeDomains.length?clamp(domainScore*0.55+skillScore*0.25+consistencyScore*0.20):0;
  const classification=band(score,profile.evidence);
  return Object.freeze({
    version:"1.0",
    generatedAt:new Date().toISOString(),
    score,
    label:classification.label,
    state:classification.id,
    message:classification.message,
    evidence,
    components:[
      {id:"academy-domains",label:"Academy Domains",score:clamp(domainScore),available:activeDomains.length>0},
      {id:"skill-development",label:"Skill Development",score:clamp(skillScore),available:profile.skills.length>0},
      {id:"consistency",label:"Consistency",score:consistencyScore,available:profile.history.length>0}
    ],
    coverage:{activeDomains:activeDomains.length,totalDomains:profile.domains.length,recordedSkills:profile.skills.length,activities:profile.history.length}
  });
}

window.PitchIQAcademyPerformanceIndex=Object.freeze({get:getAcademyPerformanceIndex});
