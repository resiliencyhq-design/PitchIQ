import { getUnifiedPlayerProfile } from "./academy-unified-profile-a1.js?v=a1-unified-profile-20260719";

const clamp=value=>Math.max(0,Math.min(100,Math.round(Number(value)||0)));
const normalise=value=>String(value||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

function dedupeSkills(skills=[]){
  const grouped=new Map();
  skills.forEach(skill=>{
    const key=normalise(skill.label);
    if(!key)return;
    const current=grouped.get(key)||{id:key,label:skill.label,source:new Set(),scores:[],lastPlayed:null};
    current.source.add(skill.source);
    current.scores.push(clamp(skill.score));
    if(skill.lastPlayed&&(!current.lastPlayed||new Date(skill.lastPlayed)>new Date(current.lastPlayed)))current.lastPlayed=skill.lastPlayed;
    grouped.set(key,current);
  });
  return [...grouped.values()].map(item=>({
    id:item.id,
    label:item.label,
    score:clamp(item.scores.reduce((sum,score)=>sum+score,0)/item.scores.length),
    source:[...item.source].join(" + "),
    lastPlayed:item.lastPlayed
  }));
}

function selectAxes(skills,maxAxes=8){
  const sorted=[...skills].sort((a,b)=>b.score-a.score||a.label.localeCompare(b.label));
  if(sorted.length<=maxAxes)return sorted;
  const high=sorted.slice(0,Math.ceil(maxAxes/2));
  const low=[...sorted].sort((a,b)=>a.score-b.score||a.label.localeCompare(b.label)).slice(0,Math.floor(maxAxes/2));
  const selected=new Map([...high,...low].map(item=>[item.id,item]));
  return [...selected.values()].slice(0,maxAxes).sort((a,b)=>a.label.localeCompare(b.label));
}

export function getAcademySkillRadar(profile=getUnifiedPlayerProfile()){
  const allSkills=dedupeSkills(profile.skills||[]);
  const axes=selectAxes(allSkills);
  const average=axes.length?clamp(axes.reduce((sum,item)=>sum+item.score,0)/axes.length):0;
  const strongest=allSkills.length?[...allSkills].sort((a,b)=>b.score-a.score)[0]:null;
  const focus=allSkills.length?[...allSkills].sort((a,b)=>a.score-b.score)[0]:null;
  const coverage=allSkills.length;
  return Object.freeze({
    version:"1.0",
    generatedAt:new Date().toISOString(),
    state:axes.length>=5?"ready":axes.length?"building":"empty",
    axes,
    average,
    strongest,
    focus,
    coverage,
    message:axes.length>=5?"Your radar shows the balance of your recorded academy skills.":axes.length?"Complete more varied training to build a fuller skill radar.":"Complete Football IQ missions and Technical drills to create your skill radar."
  });
}

window.PitchIQAcademySkillRadar=Object.freeze({get:getAcademySkillRadar});
