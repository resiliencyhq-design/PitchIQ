/* ==========================================================
   STEP 2 — Position Tap Haptic Feedback
   Adds a crisp, subtle vibration on supported phones.
   Safe no-op on iPhone/Safari or browsers without Vibration API.
   ========================================================== */

function pitchiqHapticTap(){
  try{
    if(!("vibrate" in navigator)) return;
    navigator.vibrate(12);
  }catch{}
}

document.addEventListener("pointerup",event=>{
  const marker=event.target?.closest?.('.onboard-step[data-onboard-step="2"] .position-marker');
  if(!marker) return;
  pitchiqHapticTap();
},{passive:true});
