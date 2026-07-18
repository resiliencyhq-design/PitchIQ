const DEFAULTS = {
  width: 320,
  height: 180,
  intervalMs: 90,
  zone: {x: .06, y: .06, w: .88, h: .88},
  minRadius: 7,
  maxRadius: 34,
  minConfidence: .42,
  maxMissed: 10
};

export function createAutoJugglerDetector(options = {}){
  const config = {...DEFAULTS, ...options, zone: {...DEFAULTS.zone, ...(options.zone || {})}};
  const video = options.video;
  const overlay = options.overlayCanvas;
  const processing = options.processingCanvas;
  const ctx = processing?.getContext("2d", {willReadFrequently: true});
  const overlayCtx = overlay?.getContext("2d");

  let running = false;
  let timer = null;
  let previousGray = null;
  let history = [];
  let missed = 0;
  let trackedFrames = 0;
  let analysedFrames = 0;
  let consecutiveDetected = 0;
  let consecutiveLost = 0;
  let lastResult = null;
  let lastTick = 0;
  let fps = 0;

  function resize(){
    if(processing){
      processing.width = config.width;
      processing.height = config.height;
    }
    if(overlay && video){
      overlay.width = video.videoWidth || 720;
      overlay.height = video.videoHeight || 1280;
    }
  }

  function clearOverlay(){
    overlayCtx?.clearRect(0, 0, overlay.width, overlay.height);
  }

  function direction(dx, dy){
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if(Math.max(ax, ay) < .004) return "STABLE";
    if(ay >= ax) return dy < 0 ? "UP" : "DOWN";
    return dx < 0 ? "LEFT" : "RIGHT";
  }

  function buildFrame(image){
    const pixels = config.width * config.height;
    const gray = new Uint8Array(pixels);
    const neutral = new Uint8Array(pixels);
    const motion = new Uint8Array(pixels);

    for(let p = 0, i = 0; p < pixels; p += 1, i += 4){
      const r = image.data[i];
      const g = image.data[i + 1];
      const b = image.data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lum = Math.round(.299 * r + .587 * g + .114 * b);
      gray[p] = lum;
      neutral[p] = max - min < 48 ? 1 : 0;
      if(previousGray) motion[p] = Math.abs(lum - previousGray[p]) > 22 ? 1 : 0;
    }

    return {gray, neutral, motion};
  }

  function sampleCandidate(frame, cx, cy, radius){
    const inner = radius * .78;
    const outer = radius * 1.12;
    const step = Math.max(2, Math.round(radius / 5));
    let inside = 0;
    let neutralInside = 0;
    let bright = 0;
    let dark = 0;
    let edges = 0;
    let moving = 0;
    let ring = 0;
    let ringLum = 0;
    let insideLum = 0;
    let insideLumSq = 0;

    for(let y = Math.floor(cy - outer); y <= Math.ceil(cy + outer); y += step){
      if(y < 1 || y >= config.height - 1) continue;
      for(let x = Math.floor(cx - outer); x <= Math.ceil(cx + outer); x += step){
        if(x < 1 || x >= config.width - 1) continue;
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.hypot(dx, dy);
        const index = y * config.width + x;
        const lum = frame.gray[index];

        if(d <= inner){
          inside += 1;
          insideLum += lum;
          insideLumSq += lum * lum;
          neutralInside += frame.neutral[index];
          moving += frame.motion[index];
          if(lum >= 150) bright += 1;
          if(lum <= 105) dark += 1;
          const gx = Math.abs(frame.gray[index + 1] - frame.gray[index - 1]);
          const gy = Math.abs(frame.gray[index + config.width] - frame.gray[index - config.width]);
          if(gx + gy > 42) edges += 1;
        }else if(d <= outer){
          ring += 1;
          ringLum += lum;
        }
      }
    }

    if(inside < 8 || ring < 4) return null;

    const mean = insideLum / inside;
    const variance = Math.max(0, insideLumSq / inside - mean * mean);
    const contrastScore = Math.min(1, Math.sqrt(variance) / 58);
    const edgeScore = Math.min(1, edges / Math.max(3, inside * .28));
    const neutralScore = neutralInside / inside;
    const brightRatio = bright / inside;
    const darkRatio = dark / inside;
    const patternScore = Math.min(1, Math.min(brightRatio, darkRatio) * 5.5);
    const ringMean = ringLum / ring;
    const separationScore = Math.min(1, Math.abs(mean - ringMean) / 50);
    const motionScore = Math.min(1, moving / Math.max(2, inside * .2));

    let proximityScore = 0;
    if(lastResult?.x != null){
      const lastX = lastResult.x * config.width;
      const lastY = lastResult.y * config.height;
      const distance = Math.hypot(cx - lastX, cy - lastY);
      proximityScore = Math.max(0, 1 - distance / Math.max(48, radius * 4));
    }

    const confidence = Math.max(0, Math.min(1,
      .25 * patternScore +
      .22 * contrastScore +
      .18 * edgeScore +
      .12 * neutralScore +
      .08 * separationScore +
      .07 * motionScore +
      .08 * proximityScore
    ));

    return {cx, cy, radius, confidence, motionScore, patternScore};
  }

  function findBestCandidate(frame){
    const zone = {
      x: Math.floor(config.zone.x * config.width),
      y: Math.floor(config.zone.y * config.height),
      w: Math.floor(config.zone.w * config.width),
      h: Math.floor(config.zone.h * config.height)
    };

    let best = null;
    const radii = [8, 11, 15, 20, 26, 33].filter(value => value >= config.minRadius && value <= config.maxRadius);

    for(const radius of radii){
      const stride = Math.max(5, Math.round(radius * .55));
      const left = zone.x + radius;
      const top = zone.y + radius;
      const right = zone.x + zone.w - radius;
      const bottom = zone.y + zone.h - radius;

      for(let cy = top; cy <= bottom; cy += stride){
        for(let cx = left; cx <= right; cx += stride){
          const candidate = sampleCandidate(frame, cx, cy, radius);
          if(!candidate) continue;
          if(!best || candidate.confidence > best.confidence) best = candidate;
        }
      }
    }

    return best;
  }

  function analyse(){
    if(!running || !ctx || !overlayCtx || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    const now = performance.now();
    if(lastTick){
      const instant = 1000 / Math.max(1, now - lastTick);
      fps = fps ? fps * .75 + instant * .25 : instant;
    }
    lastTick = now;

    ctx.drawImage(video, 0, 0, config.width, config.height);
    const image = ctx.getImageData(0, 0, config.width, config.height);
    const frame = buildFrame(image);
    analysedFrames += 1;

    const candidate = findBestCandidate(frame);
    previousGray = frame.gray;

    let result = {
      detected: false,
      confidence: 0,
      missedFrames: missed,
      trackedFrames,
      analysedFrames,
      consecutiveDetected,
      consecutiveLost,
      fps,
      timestamp: now
    };

    if(candidate && candidate.confidence >= config.minConfidence){
      const x = candidate.cx / config.width;
      const y = candidate.cy / config.height;
      const radius = candidate.radius / Math.max(config.width, config.height);
      const previousPoint = history[history.length - 1];
      const dx = previousPoint ? x - previousPoint.x : 0;
      const dy = previousPoint ? y - previousPoint.y : 0;
      const smooth = previousPoint
        ? {x: previousPoint.x * .62 + x * .38, y: previousPoint.y * .62 + y * .38}
        : {x, y};

      history.push(smooth);
      if(history.length > 16) history.shift();
      missed = 0;
      trackedFrames += 1;
      consecutiveDetected += 1;
      consecutiveLost = 0;

      result = {
        detected: true,
        confidence: candidate.confidence,
        x: smooth.x,
        y: smooth.y,
        radius,
        boundingBox: {
          x: Math.max(0, (candidate.cx - candidate.radius) / config.width),
          y: Math.max(0, (candidate.cy - candidate.radius) / config.height),
          width: Math.min(1, candidate.radius * 2 / config.width),
          height: Math.min(1, candidate.radius * 2 / config.height)
        },
        velocityX: dx,
        velocityY: dy,
        speed: Math.hypot(dx, dy),
        direction: direction(dx, dy),
        missedFrames: 0,
        trackedFrames,
        analysedFrames,
        consecutiveDetected,
        consecutiveLost,
        fps,
        timestamp: now
      };
      lastResult = result;
    }else{
      missed += 1;
      consecutiveDetected = 0;
      consecutiveLost += 1;
      if(lastResult && missed <= config.maxMissed){
        result = {
          ...lastResult,
          detected: false,
          confidence: Math.max(0, lastResult.confidence * (1 - missed / (config.maxMissed + 1))),
          missedFrames: missed,
          trackedFrames,
          analysedFrames,
          consecutiveDetected,
          consecutiveLost,
          fps,
          timestamp: now
        };
      }else{
        history = [];
        lastResult = null;
        result = {
          detected: false,
          confidence: 0,
          missedFrames: missed,
          trackedFrames,
          analysedFrames,
          consecutiveDetected,
          consecutiveLost,
          fps,
          timestamp: now
        };
      }
    }

    draw(result);
    options.onDetection?.(result);
  }

  function draw(result){
    clearOverlay();
    const zone = config.zone;
    overlayCtx.save();
    overlayCtx.strokeStyle = "rgba(215,255,46,.55)";
    overlayCtx.setLineDash([10, 8]);
    overlayCtx.lineWidth = 2;
    overlayCtx.strokeRect(zone.x * overlay.width, zone.y * overlay.height, zone.w * overlay.width, zone.h * overlay.height);
    overlayCtx.setLineDash([]);

    if(history.length > 1){
      overlayCtx.beginPath();
      history.forEach((point, index) => {
        const px = point.x * overlay.width;
        const py = point.y * overlay.height;
        index ? overlayCtx.lineTo(px, py) : overlayCtx.moveTo(px, py);
      });
      overlayCtx.strokeStyle = "rgba(215,255,46,.45)";
      overlayCtx.lineWidth = 3;
      overlayCtx.stroke();
    }

    if(result.boundingBox && result.confidence > 0){
      const box = result.boundingBox;
      const x = box.x * overlay.width;
      const y = box.y * overlay.height;
      const width = box.width * overlay.width;
      const height = box.height * overlay.height;
      overlayCtx.strokeStyle = result.detected ? "#d7ff2e" : "rgba(215,255,46,.45)";
      overlayCtx.lineWidth = 4;
      overlayCtx.setLineDash(result.detected ? [] : [8, 6]);
      overlayCtx.strokeRect(x, y, width, height);
      overlayCtx.setLineDash([]);
      overlayCtx.fillStyle = "rgba(2,8,7,.72)";
      overlayCtx.fillRect(x, Math.max(0, y - 28), Math.max(84, width), 26);
      overlayCtx.fillStyle = "#d7ff2e";
      overlayCtx.font = "700 18px system-ui";
      overlayCtx.fillText(`BALL ${Math.round(result.confidence * 100)}%`, x + 6, Math.max(19, y - 8));
    }

    overlayCtx.restore();
  }

  function start(){
    if(running) return;
    resize();
    running = true;
    lastTick = 0;
    timer = setInterval(analyse, config.intervalMs);
  }

  function stop(){
    running = false;
    if(timer) clearInterval(timer);
    timer = null;
    clearOverlay();
  }

  function reset(){
    previousGray = null;
    history = [];
    missed = 0;
    trackedFrames = 0;
    analysedFrames = 0;
    consecutiveDetected = 0;
    consecutiveLost = 0;
    lastResult = null;
    lastTick = 0;
    fps = 0;
    clearOverlay();
  }

  function destroy(){
    stop();
    reset();
  }

  return {start, stop, reset, destroy, isRunning: () => running};
}
