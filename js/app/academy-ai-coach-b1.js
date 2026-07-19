import { getUnifiedPlayerProfile } from "./academy-unified-profile-a1.js?v=a1-unified-profile-20260719";
import { getAcademyPerformanceIndex } from "./academy-performance-index-a2.js?v=a2-performance-index-20260719";
import { getAcademySkillRadar } from "./academy-skill-radar-a3.js?v=a3-skill-radar-20260719";

const COACH=Object.freeze({id:"pitchiq-academy-coach",name:"PitchIQ Coach",role:"Your academy development coach"});
const lower=value=>String(value||"your game").toLowerCase();

function evidenceMessage(index,radar){
  if(index.evidence.state==="strong")return `This recommendation is supported by ${index.coverage.activities} recent activities and a developed skill profile.`;
  if(radar.coverage)return `This is an early recommendation based on ${radar.coverage} recorded skill area${radar.coverage===1?"":"s"}.`;
  return "Complete training to help PitchIQ personalise your coaching plan.";
}

function nextStep(focus,profile){
  if(!focus)return {title:"Build your academy profile",action:"Complete one Football IQ mission or Technical drill so your coach has evidence to work from.",route:"training"};
  const technical=String(focus.source||"").toLowerCase().includes("technical");
  return {title:`Build ${focus.label}`,action:technical?`Choose a short Technical drill that trains ${lower(focus.label)}.`:`Choose a Football IQ mission that trains ${lower(focus.label)}.`,route:"training"};
}

export function getAcademyAICoachPlan(profile=getUnifiedPlayerProfile()){
  const index=getAcademyPerformanceIndex(profile);
  const radar=getAcademySkillRadar(profile);
  const focus=radar.focus||profile.developmentAreas?.[0]||null;
  const strength=radar.strongest||profile.strengths?.[0]||null;
  const step=nextStep(focus,profile);
  const personalised=Boolean(focus);
  return Object.freeze({
    version:"1.0",
    generatedAt:new Date().toISOString(),
    coach:COACH,
    state:personalised?"personalised":"building",
    personalised,
    greeting:personalised?"Your next academy focus is ready.":"Let’s start building your player profile.",
    focus,
    strength,
    title:step.title,
    message:personalised?`Your current academy evidence suggests ${lower(focus.label)} is the most useful area to work on next.`:"One completed activity is enough to begin creating evidence-aware guidance.",
    encouragement:strength?`${strength.label} is currently one of your strongest recorded areas. Keep using it while you develop ${lower(focus.label)}.`:"There is no pressure to be perfect. Complete one short activity and build from there.",
    nextAction:step.action,
    route:step.route,
    evidenceNote:evidenceMessage(index,radar),
    performance:{score:index.score,label:index.label,evidence:index.evidence.label},
    guardrails:{recommendationOnly:true,doesNotDiagnose:true,doesNotRankPlayers:true,doesNotInventMissingEvidence:true,doesNotChangeAssessmentScores:true}
  });
}

window.PitchIQAcademyCoach=Object.freeze({get:getAcademyAICoachPlan,identity:COACH});