const CONSTRUCTS = [["awareness","Awareness"],["gameReading","Game Reading"],["decisionQuality","Decision Quality"],["adaptability","Adaptability"],["useOfSpace","Use of Space"]];
const dateValue=p=>Date.parse(p?.assessmentDate||p?.generatedAt||p?.assessedAt||0)||0;
const scoreFor=(p,id)=>Number.isFinite(p?.constructs?.[id]?.score)?p.constructs[id].score:null;
export const sortFootballIQHistory=(profiles=[])=>[...profiles].filter(Boolean).sort((a,b)=>dateValue(b)-dateValue(a));
export function compareFootballIQProfiles(current,previous){return CONSTRUCTS.map(([id,label])=>{const currentScore=scoreFor(current,id),previousScore=scoreFor(previous,id);return{id,label,currentScore,previousScore,delta:currentScore!=null&&previousScore!=null?currentScore-previousScore:null};});}
export function evidenceConfidence(readiness){if(readiness?.ready)return{id:"ready",label:"Assessment Ready"};const q=Number(readiness?.summary?.evidenceQuality)||0;if(q>=.72)return{id:"high",label:"High"};if(q>=.42)return{id:"moderate",label:"Moderate"};return{id:"building",label:"Building"};}
export function buildFootballIQProgress({profiles=[],readiness=null}={}){const history=sortFootballIQHistory(profiles),current=history[0]||null,previous=history[1]||null;return{current,previous,history,changes:compareFootballIQProfiles(current,previous),confidence:evidenceConfidence(readiness),readiness};}
export {CONSTRUCTS as FOOTBALL_IQ_PROGRESS_CONSTRUCTS};
