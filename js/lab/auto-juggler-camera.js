import {createAutoJugglerDetector} from "./auto-juggler-detector.js?v=sprint-10-2-ball-detection-mvp-20260718";
import {createJuggleEventDetector} from "./auto-juggler-events.js?v=sprint-10-0e-20260718";
import {createAutoJugglerValidation} from "./auto-juggler-validation.js?v=sprint-10-0e-20260718";

const app = document.getElementById("app");
const nav = document.getElementById("nav");

let stream = null;
let countdownTimer = null;
let previousMarkup = "";
let previousNavVisible = false;
let mounted = false;
let detector = null;
let eventDetector = null;
let validation = null;
let tracking = false;
let flashTimer = null;
let cameraAttemptId = 0;

const CAMERA_CONSTRAINTS = [
  {audio:false, video:{facingMode:{ideal:"environment"}, width:{ideal:1280}, height:{ideal:720}}},
  {audio:false, video:{facingMode:"environment"}},
  {audio:false, video:true}
];

function cameraSupported(){
  return Boolean(navigator.mediaDevices?.getUserMedia);
}

function stopCountdown(){
  if(countdownTimer) clearInterval(countdownTimer);
  countdownTimer = null;
}

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
}

function setStatus(message, state = "idle"){
  const el = document.getElementById("autoJugglerStatus");
  if(el){
    el.textContent = message;
    el.dataset.state = state;
  }
}

function percent(value){
  return `${Math.round((value || 0) * 100)}%`;
}

function seconds(ms){
  return `${(ms / 1000).toFixed(1)}s`;
}

function updatePreviewDiagnostics(video, track, frameReceived = false){
  setText("autoJugglerTrackState", track?.readyState || "—");
  setText("autoJugglerVideoReadyState", String(video?.readyState ?? 0));
  setText("autoJugglerVideoSize", video?.videoWidth && video?.videoHeight ? `${video.videoWidth}×${video.videoHeight}` : "0×0");
  setText("autoJugglerPlaybackState", video?.paused ? "PAUSED" : "PLAYING");
  setText("autoJugglerFrameState", frameReceived ? "YES" : "NO");
}

function updateEventState(state = {}){
  setText("autoJugglerCount", String(state.count || 0));
  setText("autoJugglerPhase", state.phase || "SEARCHING");
  setText("autoJugglerRejected", String(state.rejected || 0));
  validation?.observeEvents(state);
}

function updateValidation(state = {}){
  setText("autoJugglerDuration", seconds(state.durationMs || 0));
  setText("autoJugglerCoverage", percent(state.coverage));
  setText("autoJugglerAverageConfidence", percent(state.averageConfidence));
  setText("autoJugglerSessionState", state.active ? "RUNNING" : state.durationMs ? state.valid ? "VALID" : "LOW DATA" : "READY");

  const result = document.getElementById("autoJugglerResult");
  if(result){
    result.hidden = state.active || !state.durationMs;
    result.dataset.valid = state.valid ? "true" : "false";
  }

  setText("autoJugglerFinalCount", String(state.eventCount || 0));
  setText("autoJugglerResultQuality", state.valid ? "VALIDATION SAMPLE ACCEPTED" : "INSUFFICIENT TRACKING DATA");

  const comparison = document.getElementById("autoJugglerComparison");
  if(comparison) comparison.hidden = state.manualCount == null;

  setText("autoJugglerAccuracy", state.accuracy == null ? "—" : percent(state.accuracy));
  setText("autoJugglerError", state.error == null ? "—" : `${state.error > 0 ? "+" : ""}${state.error}`);
}

function flashEvent(event){
  const badge = document.getElementById("autoJugglerEventFlash");
  if(!badge) return;
  badge.textContent = String(event.count);
  badge.hidden = false;
  badge.classList.remove("pulse");
  void badge.offsetWidth;
  badge.classList.add("pulse");
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => badge.hidden = true, 520);
}

function stopTracking({finish = false} = {}){
  if(finish && tracking) validation?.finish?.();
  tracking = false;
  detector?.stop?.();
  detector?.reset?.();
  eventDetector?.reset?.();
  updateDiagnostics();
}

export function stopCamera(){
  cameraAttemptId += 1;
  stopTracking();
  validation?.reset?.();

  if(stream){
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  const video = document.getElementById("autoJugglerVideo");
  if(video){
    video.pause();
    video.srcObject = null;
    video.removeAttribute("src");
    video.load?.();
  }

  const start = document.getElementById("autoJugglerStart");
  if(start) start.disabled = true;

  updatePreviewDiagnostics(video, null, false);
  document.body.classList.remove("auto-juggler-camera-active");
}

function showPermissionHelp(error){
  const denied = error?.name === "NotAllowedError" || error?.name === "SecurityError";
  const message = denied
    ? "Camera access is blocked. Allow camera access in Safari Settings, then try again."
    : "The camera could not start. Check that no other app is using it, then try again.";
  setStatus(message, "error");
}

function updateDiagnostics(result = {}){
  const confidence = Math.round((result.confidence || 0) * 100);
  const status = !tracking
    ? "READY"
    : result.detected
      ? "BALL DETECTED"
      : result.confidence > 0
        ? "TRACKING…"
        : result.missedFrames > 8
          ? "BALL LOST"
          : "SEARCHING";

  setText("autoJugglerTrackStatus", status);
  setText("autoJugglerConfidence", `${confidence}%`);
  setText("autoJugglerDirection", result.direction || "—");
  setText("autoJugglerMovement", result.speed ? `${(result.speed * 1000).toFixed(1)} u/s` : "—");
  setText("autoJugglerFrames", String(result.trackedFrames || 0));

  const panel = document.getElementById("autoJugglerDiagnostics");
  if(panel) panel.dataset.state = status.toLowerCase().replace(/[^a-z]+/g, "-");

  if(tracking){
    validation?.observeTracking(result);
    eventDetector?.process(result);
  }
}

function ensureDetector(){
  const video = document.getElementById("autoJugglerVideo");
  const overlayCanvas = document.getElementById("autoJugglerOverlay");
  const processingCanvas = document.getElementById("autoJugglerProcessing");
  if(!video || !overlayCanvas || !processingCanvas) return null;

  detector?.destroy?.();
  validation = createAutoJugglerValidation({onUpdate:updateValidation});
  eventDetector = createJuggleEventDetector({onUpdate:updateEventState, onEvent:flashEvent});
  detector = createAutoJugglerDetector({video, overlayCanvas, processingCanvas, onDetection:updateDiagnostics});
  return detector;
}

function waitForEvent(target, eventName, timeoutMs){
  return new Promise((resolve, reject) => {
    let timeoutId;
    const cleanup = () => {
      target.removeEventListener(eventName, onEvent);
      clearTimeout(timeoutId);
    };
    const onEvent = () => {
      cleanup();
      resolve();
    };
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`${eventName} timeout`));
    }, timeoutMs);
    target.addEventListener(eventName, onEvent, {once:true});
  });
}

async function waitForMetadata(video){
  if(video.readyState >= HTMLMediaElement.HAVE_METADATA && video.videoWidth > 0 && video.videoHeight > 0) return;
  if(video.readyState < HTMLMediaElement.HAVE_METADATA) await waitForEvent(video, "loadedmetadata", 5000);
  if(video.videoWidth > 0 && video.videoHeight > 0) return;
  await waitForEvent(video, "resize", 3000);
}

async function playVideo(video){
  try{
    await video.play();
  }catch(firstError){
    await new Promise(resolve => setTimeout(resolve, 250));
    await video.play();
  }
}

function waitForRenderedFrame(video, timeoutMs = 5000){
  return new Promise((resolve, reject) => {
    let settled = false;
    let timeoutId;
    let rafId;

    const finish = (ok) => {
      if(settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if(rafId) cancelAnimationFrame(rafId);
      ok ? resolve() : reject(new Error("No rendered camera frame"));
    };

    timeoutId = setTimeout(() => finish(false), timeoutMs);

    if(typeof video.requestVideoFrameCallback === "function"){
      video.requestVideoFrameCallback(() => finish(video.videoWidth > 0 && video.videoHeight > 0 && !video.paused));
      return;
    }

    const check = () => {
      if(video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.paused){
        finish(true);
        return;
      }
      rafId = requestAnimationFrame(check);
    };
    check();
  });
}

async function openCameraWithFallback(attemptId){
  let lastError = null;

  for(const constraints of CAMERA_CONSTRAINTS){
    if(attemptId !== cameraAttemptId) throw new Error("Camera start cancelled");

    let candidate = null;
    try{
      setStatus("Connecting to rear camera…", "loading");
      candidate = await navigator.mediaDevices.getUserMedia(constraints);

      if(attemptId !== cameraAttemptId){
        candidate.getTracks().forEach(track => track.stop());
        throw new Error("Camera start cancelled");
      }

      const video = document.getElementById("autoJugglerVideo");
      if(!video) throw new Error("Camera preview element missing");

      const track = candidate.getVideoTracks()[0];
      if(!track || track.readyState !== "live") throw new Error("Camera track is not live");

      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      video.srcObject = candidate;

      updatePreviewDiagnostics(video, track, false);
      setStatus("Waiting for camera image…", "loading");

      await waitForMetadata(video);
      await playVideo(video);
      await waitForRenderedFrame(video);

      if(video.videoWidth <= 0 || video.videoHeight <= 0 || track.readyState !== "live"){
        throw new Error("Camera connected but no usable frame was received");
      }

      updatePreviewDiagnostics(video, track, true);
      stream = candidate;
      return {video, track};
    }catch(error){
      lastError = error;
      candidate?.getTracks?.().forEach(track => track.stop());
      const video = document.getElementById("autoJugglerVideo");
      if(video){
        video.pause();
        video.srcObject = null;
      }
    }
  }

  throw lastError || new Error("Camera connected, but no image was received");
}

export async function startCamera(){
  if(!cameraSupported()){
    setStatus("This browser does not support camera access.", "error");
    return false;
  }

  stopCamera();
  const attemptId = ++cameraAttemptId;
  setStatus("Requesting camera access…", "loading");

  try{
    const {video} = await openCameraWithFallback(attemptId);
    if(attemptId !== cameraAttemptId) return false;

    ensureDetector();
    document.body.classList.add("auto-juggler-camera-active");
    setStatus("Camera ready. Keep the ball inside the tracking zone.", "ready");

    const start = document.getElementById("autoJugglerStart");
    if(start) start.disabled = false;

    updateDiagnostics();
    updateEventState();
    updateValidation();
    updatePreviewDiagnostics(video, stream?.getVideoTracks?.()[0], true);
    return true;
  }catch(error){
    if(attemptId !== cameraAttemptId) return false;
    stopCamera();

    if(error?.message?.includes("no image") || error?.message?.includes("rendered camera frame")){
      setStatus("Camera connected, but no image was received. Tap Enable Camera to try again.", "error");
    }else{
      showPermissionHelp(error);
    }
    return false;
  }
}

function renderShell(){
  return `<section class="screen app auto-juggler-shell active" id="autoJuggler" aria-labelledby="autoJugglerTitle">
    <header class="auto-juggler-header">
      <button type="button" data-auto-juggler-action="back" aria-label="Return to Home">←</button>
      <div><span>PitchIQ Lab</span><h1 id="autoJugglerTitle">Auto Juggler</h1></div>
      <span class="auto-juggler-beta">VALIDATION</span>
    </header>
    <main class="auto-juggler-main">
      <div class="auto-juggler-video-wrap">
        <video id="autoJugglerVideo" playsinline muted autoplay></video>
        <canvas id="autoJugglerOverlay" class="auto-juggler-overlay" aria-hidden="true"></canvas>
        <canvas id="autoJugglerProcessing" class="auto-juggler-processing" aria-hidden="true"></canvas>
        <div class="auto-juggler-frame" aria-hidden="true"><span></span></div>
        <div class="auto-juggler-countdown" id="autoJugglerCountdown" hidden>3</div>
        <div class="auto-juggler-event-flash" id="autoJugglerEventFlash" hidden>1</div>
      </div>
      <p class="auto-juggler-status" id="autoJugglerStatus">Enable the camera to begin.</p>
      <section class="auto-juggler-preview-diagnostics" aria-label="Camera preview diagnostics">
        <div><small>Track</small><b id="autoJugglerTrackState">—</b></div>
        <div><small>Ready state</small><b id="autoJugglerVideoReadyState">0</b></div>
        <div><small>Video size</small><b id="autoJugglerVideoSize">0×0</b></div>
        <div><small>Playback</small><b id="autoJugglerPlaybackState">PAUSED</b></div>
        <div><small>Frame</small><b id="autoJugglerFrameState">NO</b></div>
      </section>
      <section class="auto-juggler-event-panel" aria-label="Juggle event diagnostics">
        <div><small>Provisional count</small><b id="autoJugglerCount">0</b></div>
        <div><small>Motion phase</small><b id="autoJugglerPhase">SEARCHING</b></div>
        <div><small>Rejected turns</small><b id="autoJugglerRejected">0</b></div>
      </section>
      <section class="auto-juggler-validation-panel" aria-label="Validation diagnostics">
        <div><small>Session</small><b id="autoJugglerSessionState">READY</b></div>
        <div><small>Duration</small><b id="autoJugglerDuration">0.0s</b></div>
        <div><small>Tracking coverage</small><b id="autoJugglerCoverage">0%</b></div>
        <div><small>Average confidence</small><b id="autoJugglerAverageConfidence">0%</b></div>
      </section>
      <section class="auto-juggler-diagnostics" id="autoJugglerDiagnostics" aria-label="Ball tracking diagnostics">
        <div><small>Tracking</small><b id="autoJugglerTrackStatus">READY</b></div>
        <div><small>Confidence</small><b id="autoJugglerConfidence">0%</b></div>
        <div><small>Direction</small><b id="autoJugglerDirection">—</b></div>
        <div><small>Movement</small><b id="autoJugglerMovement">—</b></div>
        <div><small>Frames</small><b id="autoJugglerFrames">0</b></div>
      </section>
      <div class="auto-juggler-actions">
        <button class="auto-juggler-secondary" type="button" data-auto-juggler-action="camera">Enable Camera</button>
        <button class="trial-primary" id="autoJugglerStart" type="button" data-auto-juggler-action="start" disabled>Start Validation</button>
      </div>
      <button class="auto-juggler-finish" id="autoJugglerFinish" type="button" data-auto-juggler-action="finish" disabled>Finish Attempt</button>
      <section class="auto-juggler-result" id="autoJugglerResult" hidden>
        <small>Provisional result</small><strong id="autoJugglerFinalCount">0</strong><b id="autoJugglerResultQuality">INSUFFICIENT TRACKING DATA</b>
        <label>Observed contact count<input id="autoJugglerManualCount" type="number" min="0" inputmode="numeric" placeholder="Enter count"></label>
        <div id="autoJugglerComparison" hidden><span>Estimated accuracy <b id="autoJugglerAccuracy">—</b></span><span>Error <b id="autoJugglerError">—</b></span></div>
      </section>
      <p class="auto-juggler-privacy">Frames are processed on this device. Nothing is uploaded or saved.</p>
    </main>
  </section>`;
}

function mount(){
  if(mounted || !app) return;
  mounted = true;
  previousMarkup = app.innerHTML;
  previousNavVisible = nav?.classList.contains("visible") || false;
  document.body.classList.add("auto-juggler-open");
  nav?.classList.remove("visible");
  app.innerHTML = renderShell();
  ensureDetector();
  startCamera();
}

function unmount(){
  if(!mounted) return;
  mounted = false;
  stopCountdown();
  stopCamera();
  detector?.destroy?.();
  detector = null;
  eventDetector = null;
  validation = null;
  document.body.classList.remove("auto-juggler-open");
  document.body.classList.remove("auto-juggler-camera-active");
  app.innerHTML = previousMarkup;
  if(previousNavVisible) nav?.classList.add("visible");
  else nav?.classList.remove("visible");
}

function beginCountdown(){
  if(!stream || tracking) return;
  const countdown = document.getElementById("autoJugglerCountdown");
  const start = document.getElementById("autoJugglerStart");
  const finish = document.getElementById("autoJugglerFinish");
  if(!countdown || !start || !finish) return;

  stopTracking();
  validation?.reset?.();
  updateValidation();
  updateEventState();

  let value = 3;
  countdown.hidden = false;
  countdown.textContent = String(value);
  start.disabled = true;
  finish.disabled = true;
  setStatus("Get ready…", "ready");

  stopCountdown();
  countdownTimer = setInterval(() => {
    value -= 1;
    if(value > 0){
      countdown.textContent = String(value);
      return;
    }
    if(value === 0){
      countdown.textContent = "GO";
      return;
    }

    stopCountdown();
    countdown.hidden = true;
    tracking = true;
    detector?.reset?.();
    eventDetector?.reset?.();
    validation?.begin?.();
    detector?.start?.();
    finish.disabled = false;
    setStatus("Tracking ball movement. Tap Finish Attempt when done.", "ready");
  }, 700);
}

function finishAttempt(){
  if(!tracking) return;
  stopTracking({finish:true});
  const start = document.getElementById("autoJugglerStart");
  const finish = document.getElementById("autoJugglerFinish");
  if(start) start.disabled = false;
  if(finish) finish.disabled = true;
  setStatus("Attempt complete. Enter the observed contact count to compare accuracy.", "ready");
}

function compareManualCount(){
  const input = document.getElementById("autoJugglerManualCount");
  if(!input || input.value === "") return;
  validation?.compareManual?.(Number(input.value));
}

document.addEventListener("click", event => {
  const entry = event.target.closest?.("[data-auto-juggler-open]");
  if(entry){
    event.preventDefault();
    mount();
    return;
  }

  if(!mounted) return;
  const action = event.target.closest?.("[data-auto-juggler-action]")?.dataset.autoJugglerAction;
  if(action === "back") unmount();
  if(action === "camera") startCamera();
  if(action === "start") beginCountdown();
  if(action === "finish") finishAttempt();
});

document.addEventListener("input", event => {
  if(event.target?.id === "autoJugglerManualCount") compareManualCount();
});

window.addEventListener("pagehide", () => {
  if(mounted) stopCamera();
});

document.addEventListener("visibilitychange", () => {
  if(document.hidden && mounted) stopCamera();
});
