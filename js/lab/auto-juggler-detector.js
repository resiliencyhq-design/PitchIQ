const DEFAULTS={width:320,height:180,intervalMs:80,zone:{x:.08,y:.08,w:.84,h:.84},minArea:20,maxArea:2600,minConfidence:.38,maxMissed:8};

export function createAutoJugglerDetector(options={}){
  const config={...DEFAULTS,...options,zone:{...DEFAULTS.zone,...(options.zone||{})}};
  const video=options.video,overlay=options.overlayCanvas,processing=options.processingCanvas;
  const ctx=processing?.getContext("2d",{willReadFrequently:true}),overlayCtx=overlay?.getContext("2d");
  let running=false,timer=null,previous=null,history=[],missed=0,trackedFrames=0,lastResult=null;

  function resize(){
    if(processing){processing.width=config.width;processing.height=config.height;}
    if(overlay&&video){overlay.width=video.videoWidth||720;overlay.height=video.videoHeight||1280;}
  }

  function clearOverlay(){overlayCtx?.clearRect(0,0,overlay.width,overlay.height);}

  function direction(dx,dy){
    const ax=Math.abs(dx),ay=Math.abs(dy);
    if(Math.max(ax,ay)<.004)return "STABLE";
    if(ay>=ax)return dy<0?"UP":"DOWN";
    return dx<0?"LEFT":"RIGHT";
  }

  function analyse(){
    if(!running||!ctx||!overlayCtx||!video||video.readyState<2)return;
    ctx.drawImage(video,0,0,config.width,config.height);
    const frame=ctx.getImageData(0,0,config.width,config.height);
    const z={x:Math.floor(config.zone.x*config.width),y:Math.floor(config.zone.y*config.height),w:Math.floor(config.zone.w*config.width),h:Math.floor(config.zone.h*config.height)};
    let minX=config.width,minY=config.height,maxX=0,maxY=0,count=0,energy=0;
    if(previous){
      for(let y=z.y;y<z.y+z.h;y+=2){
        for(let x=z.x;x<z.x+z.w;x+=2){
          const i=(y*config.width+x)*4;
          const delta=Math.abs(frame.data[i]-previous.data[i])+Math.abs(frame.data[i+1]-previous.data[i+1])+Math.abs(frame.data[i+2]-previous.data[i+2]);
          if(delta>68){count++;energy+=Math.min(255,delta);if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
        }
      }
    }
    previous=frame;
    const area=(maxX-minX+1)*(maxY-minY+1);
    const width=maxX-minX+1,height=maxY-minY+1;
    const aspect=height>0?width/height:0;
    const compactness=area>0?Math.min(1,(count*4)/area):0;
    const shapeScore=aspect>0?Math.max(0,1-Math.abs(1-aspect)):0;
    const areaScore=area>=config.minArea&&area<=config.maxArea?1:0;
    const motionScore=count?Math.min(1,(energy/count)/180):0;
    const confidence=Math.max(0,Math.min(1,.35*shapeScore+.3*compactness+.25*motionScore+.1*areaScore));
    let result={detected:false,confidence:0,missedFrames:missed,trackedFrames,timestamp:performance.now()};
    if(count>4&&areaScore&&confidence>=config.minConfidence){
      const x=((minX+maxX)/2)/config.width,y=((minY+maxY)/2)/config.height;
      const radius=Math.max(width,height)/(2*Math.max(config.width,config.height));
      const previousPoint=history[history.length-1];
      const dx=previousPoint?x-previousPoint.x:0,dy=previousPoint?y-previousPoint.y:0;
      const smooth=previousPoint?{x:previousPoint.x*.55+x*.45,y:previousPoint.y*.55+y*.45}:{x,y};
      history.push(smooth);if(history.length>14)history.shift();missed=0;trackedFrames++;
      result={detected:true,confidence,x:smooth.x,y:smooth.y,radius,velocityX:dx,velocityY:dy,speed:Math.hypot(dx,dy),direction:direction(dx,dy),missedFrames:0,trackedFrames,timestamp:performance.now()};
      lastResult=result;
    }else{
      missed++;
      if(lastResult&&missed<=config.maxMissed){result={...lastResult,detected:false,confidence:Math.max(0,lastResult.confidence*(1-missed/(config.maxMissed+1))),missedFrames:missed,trackedFrames,timestamp:performance.now()};}
      else{history=[];lastResult=null;result={detected:false,confidence:0,missedFrames:missed,trackedFrames,timestamp:performance.now()};}
    }
    draw(result);
    options.onDetection?.(result);
  }

  function draw(result){
    clearOverlay();
    const sx=overlay.width/config.width,sy=overlay.height/config.height;
    const z=config.zone;
    overlayCtx.save();
    overlayCtx.strokeStyle="rgba(215,255,46,.55)";overlayCtx.setLineDash([10,8]);overlayCtx.lineWidth=2;
    overlayCtx.strokeRect(z.x*overlay.width,z.y*overlay.height,z.w*overlay.width,z.h*overlay.height);
    overlayCtx.setLineDash([]);
    if(history.length>1){overlayCtx.beginPath();history.forEach((p,i)=>{const px=p.x*overlay.width,py=p.y*overlay.height;i?overlayCtx.lineTo(px,py):overlayCtx.moveTo(px,py);});overlayCtx.strokeStyle="rgba(215,255,46,.45)";overlayCtx.lineWidth=3;overlayCtx.stroke();}
    if(result.x!=null&&result.y!=null&&result.confidence>0){
      const x=result.x*overlay.width,y=result.y*overlay.height,r=Math.max(18,result.radius*Math.max(overlay.width,overlay.height));
      overlayCtx.strokeStyle=result.detected?"#d7ff2e":"rgba(215,255,46,.45)";overlayCtx.lineWidth=4;overlayCtx.setLineDash(result.detected?[]:[8,6]);
      overlayCtx.beginPath();overlayCtx.arc(x,y,r,0,Math.PI*2);overlayCtx.stroke();overlayCtx.setLineDash([]);
      overlayCtx.fillStyle="#d7ff2e";overlayCtx.beginPath();overlayCtx.arc(x,y,4,0,Math.PI*2);overlayCtx.fill();
    }
    overlayCtx.restore();
  }

  function start(){if(running)return;resize();running=true;timer=setInterval(analyse,config.intervalMs);}
  function stop(){running=false;if(timer)clearInterval(timer);timer=null;clearOverlay();}
  function reset(){previous=null;history=[];missed=0;trackedFrames=0;lastResult=null;clearOverlay();}
  function destroy(){stop();reset();}
  return{start,stop,reset,destroy,isRunning:()=>running};
}
