const DEFAULTS={minimumDurationMs:3000,minimumTrackedFrames:18,minimumCoverage:.35};

export function createAutoJugglerValidation(options={}){
  const config={...DEFAULTS,...options};
  let active=false,startedAt=0,endedAt=0,totalFrames=0,detectedFrames=0,confidenceTotal=0,confidenceSamples=0,eventCount=0,rejected=0,manualCount=null;

  function reset(){active=false;startedAt=0;endedAt=0;totalFrames=0;detectedFrames=0;confidenceTotal=0;confidenceSamples=0;eventCount=0;rejected=0;manualCount=null;emit();}
  function start(){reset();active=true;startedAt=performance.now();emit();}
  function observeTracking(result={}){if(!active)return;totalFrames++;if(result.detected)detectedFrames++;if(Number.isFinite(result.confidence)){confidenceTotal+=result.confidence;confidenceSamples++;}emit();}
  function observeEvents(state={}){if(!active)return;eventCount=state.count||0;rejected=state.rejected||0;emit();}
  function finish(){if(!startedAt)return snapshot();active=false;endedAt=performance.now();const result=snapshot();options.onFinish?.(result);emit();return result;}
  function setManualCount(value){const parsed=Number.parseInt(value,10);manualCount=Number.isFinite(parsed)&&parsed>=0?parsed:null;emit();return snapshot();}
  function snapshot(){
    const end=active?performance.now():(endedAt||startedAt);
    const durationMs=startedAt?Math.max(0,end-startedAt):0;
    const coverage=totalFrames?detectedFrames/totalFrames:0;
    const averageConfidence=confidenceSamples?confidenceTotal/confidenceSamples:0;
    const error=manualCount==null?null:eventCount-manualCount;
    const absoluteError=error==null?null:Math.abs(error);
    const accuracy=manualCount==null?null:(manualCount===0?(eventCount===0?1:0):Math.max(0,1-absoluteError/manualCount));
    const valid=durationMs>=config.minimumDurationMs&&detectedFrames>=config.minimumTrackedFrames&&coverage>=config.minimumCoverage;
    return{active,durationMs,totalFrames,detectedFrames,coverage,averageConfidence,eventCount,rejected,manualCount,error,absoluteError,accuracy,valid};
  }
  function emit(){options.onUpdate?.(snapshot());}
  return{start,finish,reset,observeTracking,observeEvents,setManualCount,getState:snapshot};
}
