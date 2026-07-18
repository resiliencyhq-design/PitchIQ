const CAMERA_CONSTRAINTS = [
  {audio:false, video:{facingMode:{ideal:"environment"}, width:{ideal:1280}, height:{ideal:720}}},
  {audio:false, video:{facingMode:"environment"}},
  {audio:false, video:true}
];

let recoveryToken = 0;
let activeRecoveryStream = null;

function delay(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setPlaceholder(message, state = "loading"){
  const placeholder = document.getElementById("labCameraPlaceholder");
  if(!placeholder) return;
  placeholder.hidden = false;
  placeholder.textContent = message;
  placeholder.dataset.cameraState = state;
}

function stopRecoveryStream(){
  activeRecoveryStream?.getTracks?.().forEach(track => track.stop());
  activeRecoveryStream = null;
}

function prepareVideo(video){
  video.playsInline = true;
  video.muted = true;
  video.autoplay = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
}

async function playVideo(video){
  try{
    await video.play();
  }catch(firstError){
    await delay(250);
    await video.play();
  }
}

function waitForFrame(video, token, timeoutMs = 4500){
  return new Promise((resolve, reject) => {
    let settled = false;
    let rafId = 0;
    const timeoutId = setTimeout(() => finish(false), timeoutMs);

    function finish(ok){
      if(settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if(rafId) cancelAnimationFrame(rafId);
      ok ? resolve(true) : reject(new Error("No rendered Academy Trial camera frame"));
    }

    function frameIsUsable(){
      return token === recoveryToken &&
        document.contains(video) &&
        video.videoWidth > 0 &&
        video.videoHeight > 0 &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        !video.paused;
    }

    if(typeof video.requestVideoFrameCallback === "function"){
      video.requestVideoFrameCallback(() => finish(frameIsUsable()));
      return;
    }

    function check(){
      if(frameIsUsable()) return finish(true);
      if(token !== recoveryToken || !document.contains(video)) return finish(false);
      rafId = requestAnimationFrame(check);
    }
    check();
  });
}

function markReady(video){
  const placeholder = document.getElementById("labCameraPlaceholder");
  if(placeholder) placeholder.hidden = true;
  video.dataset.cameraReady = "true";
  document.querySelector(".lab-camera")?.classList.add("camera-ready");
}

async function verifyExistingStream(video, token){
  for(let attempt = 0; attempt < 8 && token === recoveryToken; attempt += 1){
    if(video.srcObject?.getVideoTracks?.().some(track => track.readyState === "live")) break;
    await delay(100);
  }

  if(!video.srcObject) return false;
  prepareVideo(video);
  await playVideo(video);
  await waitForFrame(video, token, 3000);
  return true;
}

async function openFallbackStream(video, token){
  let lastError = null;

  for(const constraints of CAMERA_CONSTRAINTS){
    if(token !== recoveryToken || !document.contains(video)) throw new Error("Camera recovery cancelled");

    let candidate = null;
    try{
      setPlaceholder("Connecting to rear camera…");
      candidate = await navigator.mediaDevices.getUserMedia(constraints);
      const track = candidate.getVideoTracks()[0];
      if(!track || track.readyState !== "live") throw new Error("Camera track is not live");

      if(video.srcObject && video.srcObject !== candidate){
        video.srcObject.getTracks?.().forEach(existingTrack => existingTrack.stop());
      }
      stopRecoveryStream();
      activeRecoveryStream = candidate;
      prepareVideo(video);
      video.srcObject = candidate;
      setPlaceholder("Waiting for camera image…");
      await playVideo(video);
      await waitForFrame(video, token);
      return true;
    }catch(error){
      lastError = error;
      candidate?.getTracks?.().forEach(track => track.stop());
      if(video.srcObject === candidate) video.srcObject = null;
    }
  }

  throw lastError || new Error("Camera connected but no image was received");
}

async function recoverAssessmentCamera(video){
  if(!navigator.mediaDevices?.getUserMedia) return;
  const token = ++recoveryToken;
  video.dataset.cameraRecovery = "running";
  setPlaceholder("Waiting for camera image…");

  try{
    try{
      if(await verifyExistingStream(video, token)){
        markReady(video);
        return;
      }
    }catch(error){
      console.warn("[PitchIQ Assessment] Existing camera stream did not render", error);
    }

    if(token !== recoveryToken || !document.contains(video)) return;
    await openFallbackStream(video, token);
    markReady(video);
  }catch(error){
    if(token !== recoveryToken) return;
    setPlaceholder("Camera connected, but no image was received. Tap back and try the assessment again.", "error");
    console.warn("[PitchIQ Assessment] Camera recovery failed", error);
  }finally{
    if(token === recoveryToken) video.dataset.cameraRecovery = "complete";
  }
}

function inspectAssessmentCamera(){
  const video = document.getElementById("labVideo");
  if(!video || video.dataset.cameraRecovery) return;
  recoverAssessmentCamera(video);
}

new MutationObserver(inspectAssessmentCamera).observe(document.getElementById("app"), {childList:true, subtree:true});
inspectAssessmentCamera();

window.addEventListener("hashchange", () => {
  if(!document.getElementById("labVideo")){
    recoveryToken += 1;
    stopRecoveryStream();
  }
});

window.addEventListener("pagehide", () => {
  recoveryToken += 1;
  stopRecoveryStream();
});

document.addEventListener("visibilitychange", () => {
  if(document.hidden){
    recoveryToken += 1;
    stopRecoveryStream();
  }
});
