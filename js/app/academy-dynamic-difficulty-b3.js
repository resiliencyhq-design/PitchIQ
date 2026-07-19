import { buildAcademySession } from "./academy-session-builder-b2.js?v=b2-session-builder-20260719";
import { getFootballIqProgress } from "./football-iq-progression-w1-4.js?v=w1-4-progression-20260719";
import { getTechnicalProgress } from "./technical-training-progression-w2-4.js?v=w2-4-technical-progression-20260719";

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));

function evidenceFor(block,football,technical){
  const record=block.world==="Football IQ"?football.missions?.[block.id]:technical.drills?.[block.id];
  return {attempts:Number(record?.attempts||0),personalBest:Number(record?.personalBest||0),completed:Boolean(record?.completed),lastPlayed:record?.lastPlayed||null};
}

function adaptation(evidence,currentDifficulty){
  if(!evidence.attempts)return {direction:"hold",targetDifficulty:currentDifficulty,label:"Starting level",reason:"No previous result is recorded for this activity."};
  if(evidence.personalBest>=88&&evidence.attempts>=2)return {direction:"up",targetDifficulty:clamp(currentDifficulty+1,1,5),label:"Increase challenge",reason:"Repeated strong performance supports a small increase in challenge."};
  if(evidence.personalBest<55&&evidence.attempts>=2)return {direction:"down",targetDifficulty:clamp(currentDifficulty-1,1,5),label:"Reduce challenge",reason:"A simpler version can protect technique and confidence while the skill develops."};
  return {direction:"hold",targetDifficulty:currentDifficulty,label:"Keep challenge steady",reason:"Current evidence supports repeating this challenge level."};
}

export function buildDynamicDifficultyPlan(session=buildAcademySession()){
  const football=getFootballIqProgress(),technical=getTechnicalProgress();
  const blocks=session.blocks.map(block=>{
    const evidence=evidenceFor(block,football,technical);
    const adjustment=adaptation(evidence,Number(block.difficulty||2));
    return Object.freeze({...block,evidence,...adjustment,changed:adjustment.targetDifficulty!==Number(block.difficulty||2)});
  });
  const changed=blocks.filter(block=>block.changed).length;
  const state=!blocks.length?"building":changed?"adapted":"steady";
  return Object.freeze({
    version:"1.0",
    generatedAt:new Date().toISOString(),
    state,
    title:state==="adapted"?"Session challenge adjusted":state==="steady"?"Session challenge is balanced":"Build evidence to adapt difficulty",
    message:state==="adapted"?`${changed} session block${changed===1?" has":"s have"} been adjusted from recorded performance.`:state==="steady"?"The current session challenge matches the available performance evidence.":"Complete activities to begin evidence-based challenge adjustment.",
    blocks,
    changed,
    guardrails:{recommendationOnly:true,oneLevelChangeMaximum:true,usesRecordedResultsOnly:true,doesNotUnlockContent:true,doesNotChangeScores:true,doesNotChangeProgression:true}
  });
}

window.PitchIQAcademyDynamicDifficulty=Object.freeze({build:buildDynamicDifficultyPlan});