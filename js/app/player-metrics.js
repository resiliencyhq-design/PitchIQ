export function playerOverall(state){
  return Math.min(99,60+state.game.level+(state.analytics.bestReaction?4:0));
}

function completedTrainingSeconds(state){
  return (state.analytics?.sessions||[]).reduce((total,session)=>total+(session.durationSeconds||45),0);
}

export function trainingStats(state){
  const sessions=state.analytics?.sessions||[];
  const attempts=sessions.reduce((total,session)=>total+(Array.isArray(session.results)?session.results.length:0),0);
  const correct=sessions.reduce((total,session)=>total+(Array.isArray(session.results)?session.results.filter(result=>result.correct).length:0),0);
  const savedResult=state.game?.lastResult;
  const accuracy=attempts?Math.round(correct/attempts*100):(savedResult?.attempts?savedResult.accuracy:null);
  const seconds=Math.max(state.game.trainingSeconds||0,completedTrainingSeconds(state));
  return {reps:sessions.length,timeMinutes:Math.floor(seconds/60),bestCombo:state.game.bestCombo||0,accuracy,xp:state.game.xp||0,level:state.game.level||1};
}

export function footballIQScore(state){
  const stats=trainingStats(state);
  if(!stats.reps&&!Number.isFinite(stats.accuracy)) return null;
  const accuracy=Number.isFinite(stats.accuracy)?stats.accuracy:50;
  const combo=Math.min(100,(stats.bestCombo||0)*8);
  const volume=Math.min(100,(stats.reps||0)*12);
  return Math.round(accuracy*.55+combo*.25+volume*.20);
}
