const DEFAULTS={minConfidence:.45,minDownVelocity:.008,minUpVelocity:-.006,minDrop:.025,cooldownMs:260,maxGapMs:260,contactZoneY:.34};

export function createJuggleEventDetector(options={}){
  const config={...DEFAULTS,...options};
  let count=0,phase="SEARCHING",fallStart=null,lastPoint=null,lastEventAt=0,rejected=0;

  function reset(){count=0;phase="SEARCHING";fallStart=null;lastPoint=null;lastEventAt=0;rejected=0;emit();}
  function snapshot(extra={}){return{count,phase,rejected,...extra};}
  function emit(extra={}){options.onUpdate?.(snapshot(extra));}

  function process(result={}){
    const now=result.timestamp||performance.now();
    if(!result.detected||result.confidence<config.minConfidence||result.x==null||result.y==null){
      if(lastPoint&&now-lastPoint.time>config.maxGapMs){phase="SEARCHING";fallStart=null;}
      emit({event:false,reason:"low-confidence"});
      return snapshot();
    }

    const point={x:result.x,y:result.y,time:now,vy:result.velocityY||0};
    if(!lastPoint){lastPoint=point;phase="TRACKING";emit({event:false});return snapshot();}

    const vy=point.vy;
    if(vy>=config.minDownVelocity){
      if(phase!=="FALLING")fallStart={...point};
      phase="FALLING";
    }else if(phase==="FALLING"&&vy<=config.minUpVelocity){
      const drop=fallStart?point.y-fallStart.y:0;
      const cooldownOk=now-lastEventAt>=config.cooldownMs;
      const zoneOk=point.y>=config.contactZoneY;
      const travelOk=drop>=config.minDrop;
      if(cooldownOk&&zoneOk&&travelOk){
        count++;lastEventAt=now;phase="RISING";fallStart=null;
        emit({event:true,drop,confidence:result.confidence,timestamp:now});
        options.onEvent?.({count,drop,confidence:result.confidence,timestamp:now,x:point.x,y:point.y});
        lastPoint=point;return snapshot({event:true});
      }
      rejected++;phase="TRACKING";fallStart=null;
      emit({event:false,reason:!cooldownOk?"cooldown":!zoneOk?"contact-zone":"travel"});
    }else if(vy<0){phase="RISING";}else if(Math.abs(vy)<.004){phase="TRACKING";}

    lastPoint=point;emit({event:false});return snapshot();
  }

  return{process,reset,getState:()=>snapshot()};
}
