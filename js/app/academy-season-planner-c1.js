import { buildDynamicDifficultyPlan } from "./academy-dynamic-difficulty-b3.js?v=b3-dynamic-difficulty-20260719";
import { getUnifiedPlayerProfile } from "./academy-unified-profile-a1.js?v=a1-unified-profile-20260719";
import { getAcademyPerformanceIndex } from "./academy-performance-index-a2.js?v=a2-performance-index-20260719";

const MATCH_DAY_KEY="pitchiq.academy.matchDay.v1";
const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const SHORT=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));

function readMatchDay(storage=globalThis.localStorage){try{const day=storage?.getItem?.(MATCH_DAY_KEY)||"Saturday";return DAYS.includes(day)?day:"Saturday"}catch{return "Saturday"}}
function phaseFor(index,matchIndex){if(index===matchIndex)return "match";if(index===6)return "review";if(index===matchIndex-1)return "prepare";if(index===2)return "recovery";return index<3?"foundation":"build"}
function activityFor(plan,index){if(!plan.blocks.length)return null;return plan.blocks[index%plan.blocks.length]}
function sessionDay(day,index,matchIndex,plan){const phase=phaseFor(index,matchIndex);if(phase==="match")return {day,short:SHORT[index],phase,title:"Match day",description:"Use scanning, communication and calm decision-making in the game.",minutes:0,xp:0,route:"",activity:null};if(phase==="review")return {day,short:SHORT[index],phase,title:"Weekly review",description:"Review completed sessions, progress and next academy priority.",minutes:5,xp:0,route:"",activity:null};if(phase==="recovery")return {day,short:SHORT[index],phase,title:"Recovery and reflection",description:"Light movement, ball familiarity and a short reflection. No score target.",minutes:10,xp:0,route:"",activity:null};const activity=activityFor(plan,index+(phase==="prepare"?1:0));if(!activity)return {day,short:SHORT[index],phase,title:"Evidence-building session",description:"Complete an unlocked activity to begin building the weekly programme.",minutes:10,xp:0,route:"training",activity:null};const multiplier=phase==="prepare"?.75:1;return {day,short:SHORT[index],phase,title:phase==="prepare"?`Match preparation · ${activity.title}`:activity.title,description:phase==="prepare"?"A lighter pre-match block focused on information, rhythm and confidence.":`${activity.purpose}. Recommended challenge: Level ${activity.targetDifficulty||activity.difficulty}.`,minutes:Math.max(4,Math.round(activity.minutes*multiplier)),xp:phase==="prepare"?Math.round((activity.difficulty*5+5)*.75):activity.difficulty*5+5,route:activity.route,activity};}
function goals(schedule,profile,index){const training=schedule.filter(item=>item.activity);const minutes=training.reduce((sum,item)=>sum+item.minutes,0);const xp=training.reduce((sum,item)=>sum+item.xp,0);const focus=profile.developmentAreas?.[0]?.label||"your next development area";return [{id:"sessions",label:`Complete ${training.length} planned training sessions`,target:training.length},{id:"minutes",label:`Train for approximately ${minutes} minutes`,target:minutes},{id:"xp",label:`Earn up to ${xp} Academy XP`,target:xp},{id:"focus",label:`Build evidence in ${focus}`,target:1},{id:"index",label:`Protect or improve your ${index.label} Academy Index`,target:index.score}];}

export function buildAcademySeasonPlan({matchDay=readMatchDay()}={}){
  const difficulty=buildDynamicDifficultyPlan();
  const profile=getUnifiedPlayerProfile();
  const index=getAcademyPerformanceIndex(profile);
  const matchIndex=clamp(DAYS.indexOf(matchDay),0,6);
  const schedule=DAYS.map((day,i)=>sessionDay(day,i,matchIndex,difficulty));
  const weeklyGoals=goals(schedule,profile,index);
  const trainingDays=schedule.filter(item=>item.activity).length;
  const totalMinutes=schedule.reduce((sum,item)=>sum+item.minutes,0);
  const totalXp=schedule.reduce((sum,item)=>sum+item.xp,0);
  return Object.freeze({version:"1.0",generatedAt:new Date().toISOString(),state:difficulty.blocks.length?"ready":"building",title:"Your Academy Week",matchDay,schedule,weeklyGoals,trainingDays,totalMinutes,totalXp,phase:"Foundation → Build → Prepare → Review",message:difficulty.blocks.length?`A balanced ${trainingDays}-session week shaped around ${matchDay.toLowerCase()} match preparation.`:"Complete an activity to begin building your academy week.",review:{title:"End-of-week review",prompts:["Which session felt strongest?","What improved through the week?","What should the coach prioritise next week?"]},guardrails:{recommendationOnly:true,usesUnlockedContentOnly:true,includesRecovery:true,reducesPreMatchLoad:true,doesNotChangeScores:true,doesNotChangeProgression:true}});
}
export function saveAcademyMatchDay(day,storage=globalThis.localStorage){if(!DAYS.includes(day))return false;try{storage?.setItem?.(MATCH_DAY_KEY,day);window.dispatchEvent(new CustomEvent("pitchiq:academy-match-day",{detail:{day}}));return true}catch{return false}}
window.PitchIQAcademySeasonPlanner=Object.freeze({build:buildAcademySeasonPlan,setMatchDay:saveAcademyMatchDay,days:DAYS});
