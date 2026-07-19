import { getUnifiedPlayerProfile } from "./academy-unified-profile-a1.js?v=a1-unified-profile-20260719";
import { getAcademyPerformanceIndex } from "./academy-performance-index-a2.js?v=a2-performance-index-20260719";

const DAY=86400000;
const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(Number(value)||0)));
const dateKey=value=>{const date=new Date(value);if(Number.isNaN(date.getTime()))return null;return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`};

function trainingStreak(history){
  const days=[...new Set(history.map(item=>dateKey(item.date)).filter(Boolean))].sort().reverse();
  if(!days.length)return 0;
  let streak=1;
  for(let i=1;i<days.length;i+=1){
    const previous=new Date(`${days[i-1]}T12:00:00`),current=new Date(`${days[i]}T12:00:00`);
    if(Math.round((previous-current)/DAY)!==1)break;
    streak+=1;
  }
  return streak;
}

function achievement(id,title,description,current,target,icon){
  const progress=clamp((current/target)*100);
  return Object.freeze({id,title,description,icon,current,target,progress,earned:current>=target});
}

export function getAcademyAchievements(){
  const profile=getUnifiedPlayerProfile(),index=getAcademyPerformanceIndex(profile);
  const sessions=profile.history.length,activeDomains=profile.domains.filter(domain=>domain.evidence==="active").length;
  const bestScore=profile.skills.length?Math.max(...profile.skills.map(skill=>Number(skill.score||0))):0;
  const streak=trainingStreak(profile.history);
  const achievements=[
    achievement("first-step","First Step","Complete your first recorded Academy activity.",sessions,1,"⚽"),
    achievement("two-world-player","Two-World Player","Record evidence in Football IQ and Technical Training.",activeDomains,2,"◈"),
    achievement("training-rhythm","Training Rhythm","Complete three recorded Academy activities.",sessions,3,"↻"),
    achievement("academy-regular","Academy Regular","Complete seven recorded Academy activities.",sessions,7,"★"),
    achievement("three-day-streak","Three-Day Streak","Train on three consecutive recorded days.",streak,3,"⚡"),
    achievement("strong-skill","Strong Skill","Reach 70% evidence in one Academy skill.",bestScore,70,"↑"),
    achievement("advanced-skill","Advanced Skill","Reach 85% evidence in one Academy skill.",bestScore,85,"◆"),
    achievement("level-two","Level Up","Reach Academy Level 2.",profile.academyLevel,2,"2"),
    achievement("five-hundred-xp","500 Academy XP","Build 500 Academy XP through recorded training.",profile.academyXp,500,"XP"),
    achievement("performance-70","Progressing Profile","Reach an Academy Performance Index of 70.",index.score,70,"PI")
  ];
  const earned=achievements.filter(item=>item.earned),next=achievements.filter(item=>!item.earned).sort((a,b)=>b.progress-a.progress)[0]||null;
  return Object.freeze({version:"1.0",generatedAt:new Date().toISOString(),earned,total:achievements.length,earnedCount:earned.length,streak,achievements,next,state:sessions?"active":"building",guardrails:{recognitionOnly:true,usesRecordedEvidenceOnly:true,doesNotAwardXp:true,doesNotChangeScores:true,doesNotChangeProgression:true,doesNotUnlockContent:true}});
}

window.PitchIQAcademyAchievements=Object.freeze({get:getAcademyAchievements});