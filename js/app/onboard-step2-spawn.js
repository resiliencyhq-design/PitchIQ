/* STEP 2/3 static onboarding repair
   Stability-safe: no MutationObserver, no repeating timers, no animation trigger.
   Restores progress bars and Step 2 prompt after normal route renders.
*/

function academyProgress(stepNumber){
  return `<div class="academy-progress" aria-label="Step ${stepNumber} of 3"><span class="active"></span><i></i><span class="${stepNumber >= 2 ? 'active' : ''}"></span><i></i><span class="${stepNumber >= 3 ? 'active' : ''}"></span></div>`;
}

function repairOnboardingLabels(){
  const step2 = document.querySelector('.onboard-step[data-onboard-step="2"]');
  const step3 = document.querySelector('.onboard-step[data-onboard-step="3"]');

  if(step2 && !step2.querySelector('.academy-progress')){
    step2.querySelector('.position-title')?.insertAdjacentHTML('afterend', academyProgress(2));
  }

  if(step2 && !step2.querySelector('.onboard-position-subtitle')){
    step2.querySelector('.onboard-position-heading')?.insertAdjacentHTML('afterend', '<p class="onboard-subtitle onboard-position-subtitle">Favorite Position</p>');
  }

  if(step3 && !step3.querySelector('.academy-progress')){
    step3.querySelector('.position-title')?.insertAdjacentHTML('afterend', academyProgress(3));
  }
}

window.addEventListener('DOMContentLoaded', () => setTimeout(repairOnboardingLabels, 0));
window.addEventListener('load', () => setTimeout(repairOnboardingLabels, 0));
document.addEventListener('click', () => setTimeout(repairOnboardingLabels, 0), true);
