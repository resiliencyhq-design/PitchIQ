import { getUnifiedPlayerProfile } from "./academy-unified-profile-a1.js?v=a1-unified-profile-20260719";
import { getAcademyPerformanceIndex } from "./academy-performance-index-a2.js?v=a2-performance-index-20260719";
import { getAcademyDevelopmentPath } from "./academy-development-path-c2.js?v=c2-development-path-20260720";
import { buildAcademySeasonPlan } from "./academy-season-planner-c1.js?v=c1-season-planner-20260720";

const DAY=86400000;
const clamp=value=>Math.max(0,Math.min(100,Math.round(Number(value)||0)));
function recent(history,days=7){const cutoff=Date.now()-days*DAY;return history.filter(item=>{const time=new Date(item.date).getTime();return Number.isFinite(time)&&time>=cutoff})}
function consistency(history){if(!history.length)return 0;const dated=[...history].sort((a,b)=>new Date(a.date)-new Date(b.date));const activeDays=new Set(dated.map(item=>new Date(item.date).toDateString())).size;return clamp((activeDays/7)*100)}
function recommendation(profile,path){if(path.priority)return `Prioritise ${path.priority.label} while protecting ${path.strongest?.label||"the player's strongest area"}.`;if(profile.history.length)return "Continue balanced Football IQ and Technical Training to clarify the next priority.";return "Complete initial training activities to establish a reliable player baseline."}

export function getParentCoachDashboard(){
  const profile=getUnifiedPlayerProfile(),index=getAcademyPerformanceIndex(profile),path=getAcademyDevelopmentPath(),week=buildAcademySeasonPlan();
  const weekHistory=recent(profile.history,7),monthHistory=recent(profile.history,28);
  const average=items=>items.length?clamp(items.reduce((sum,item)=>sum+Number(item.score||0),0)/items.length):0;
  return Object.freeze({version:"1.0",generatedAt:new Date().toISOString(),player:{academyLevel:profile.academyLevel,academyXp:profile.academyXp,academyScore:profile.academyScore,indexScore:index.score,indexLabel:index.label,evidence:index.evidence.label},weekly:{sessions:weekHistory.length,consistency:consistency(weekHistory),averageScore:average(weekHistory),plannedSessions:week.trainingDays,plannedMinutes:week.totalMinutes,matchDay:week.matchDay},trend:{label:path.trend.label,delta:path.trend.delta,monthSessions:monthHistory.length,monthAverage:average(monthHistory)},strengths:profile.strengths.slice(0,3),priorities:profile.developmentAreas.slice(0,3),recommendation:recommendation(profile,path),nextMilestone:path.milestones[0]||null,guardrails:{readOnly:true,usesRecordedEvidenceOnly:true,noClinicalInterpretation:true,doesNotChangeScores:true,doesNotChangeXp:true,doesNotChangeProgression:true}});
}

window.PitchIQParentCoachDashboard=Object.freeze({get:getParentCoachDashboard});