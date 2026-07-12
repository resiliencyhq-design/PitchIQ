const HANDOFF_REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const HANDOFF_NAME_KEY = 'pitchiqPlayerName';
const HANDOFF_NUMBER_KEY = 'pitchiqJerseyNumber';
const HANDOFF_NUMBER_CONFIRMED_KEY = 'pitchiqJerseyNumberConfirmed';

function handoffHaptic() {
  try { navigator.vibrate?.(10); } catch {}
}

function handoffPanels() {
  return {
    name: document.querySelector('.onboard-step[data-onboard-step="1"]:not([data-onboard-phase="number"])'),
    number: document.querySelector('.onboard-number-step'),
    position: document.querySelector('.onboard-step[data-onboard-step="2"]'),
    confirm: document.querySelector('.onboard-step[data-onboard-step="3"]')
  };
}

function showHandoffPhase(phase) {
  const panels = handoffPanels();
  if (panels.name) panels.name.hidden = phase !== 'name';
  if (panels.number) panels.number.hidden = phase !== 'number';
  if (panels.position) panels.position.hidden = phase !== 'position';
  if (panels.confirm) panels.confirm.hidden = phase !== 'confirm';
}

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function advanceNameToNumber(button) {
  const panels = handoffPanels();
  const input = panels.name?.querySelector('#nameInput') || document.getElementById('nameInput');
  const name = input?.value?.trim();
  if (!name || !panels.number) return;

  button.disabled = true;
  localStorage.setItem(HANDOFF_NAME_KEY, name);
  localStorage.removeItem(HANDOFF_NUMBER_CONFIRMED_KEY);

  const stage = panels.name?.querySelector('.onboard-jersey-stage');
  stage?.classList.remove('is-idle', 'is-entering', 'is-exiting');
  stage?.classList.add('is-name-advancing');
  stage?.querySelector('.onboard-jersey-identity')?.classList.add('is-shining');

  if (!HANDOFF_REDUCED_MOTION) await wait(220);
  showHandoffPhase('number');
  window.dispatchEvent(new CustomEvent('pitchiq:jersey-number-change', {
    detail: { number: Number(localStorage.getItem(HANDOFF_NUMBER_KEY) || 1) }
  }));
  button.disabled = false;
}

function cloneJerseyOverlay(stage, rect) {
  const overlay = document.createElement('div');
  overlay.className = 'jersey-handoff-overlay';
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;

  const visual = stage.querySelector('.onboard-jersey-visual')?.cloneNode(true);
  if (visual) overlay.appendChild(visual);

  const marker = document.createElement('img');
  marker.className = 'jersey-handoff-marker';
  marker.src = 'assets/onboarding/position-marker-active.png?v=sprint-8-5-handoff-20260712';
  marker.alt = '';
  marker.setAttribute('aria-hidden', 'true');
  overlay.appendChild(marker);

  document.body.appendChild(overlay);
  return overlay;
}

function findHandoffTarget(positionPanel) {
  return positionPanel?.querySelector('.position-marker[data-pos="GK"], .position-marker[data-position="GK"], .position-marker');
}

async function advanceNumberToPosition(button) {
  const panels = handoffPanels();
  const numberPanel = button.closest('.onboard-number-step');
  const stage = numberPanel?.querySelector('.onboard-jersey-stage');
  if (!numberPanel || !panels.position) return;

  const number = Math.min(99, Math.max(1, Number.parseInt(numberPanel.dataset.selectedNumber || localStorage.getItem(HANDOFF_NUMBER_KEY), 10) || 1));
  localStorage.setItem(HANDOFF_NUMBER_KEY, String(number));
  localStorage.setItem(HANDOFF_NUMBER_CONFIRMED_KEY, 'true');
  handoffHaptic();

  if (!stage || HANDOFF_REDUCED_MOTION) {
    showHandoffPhase('position');
    return;
  }

  button.disabled = true;
  stage.classList.remove('is-idle', 'is-entering', 'is-exiting');
  const sourceRect = stage.getBoundingClientRect();
  const overlay = cloneJerseyOverlay(stage, sourceRect);
  numberPanel.style.visibility = 'hidden';
  overlay.classList.add('is-charging');

  await wait(170);
  showHandoffPhase('position');
  panels.position.style.visibility = 'visible';
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const target = findHandoffTarget(panels.position);
  const targetRect = target?.getBoundingClientRect();
  if (!targetRect || !targetRect.width || !targetRect.height) {
    overlay.remove();
    numberPanel.style.visibility = '';
    button.disabled = false;
    return;
  }

  overlay.classList.remove('is-charging');
  overlay.classList.add('is-travelling');

  const destinationLeft = targetRect.left;
  const destinationTop = targetRect.top;
  const destinationWidth = targetRect.width;
  const destinationHeight = targetRect.height;

  const travel = overlay.animate([
    {
      left: `${sourceRect.left}px`,
      top: `${sourceRect.top}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`,
      transform: 'translateY(0) scale(1)',
      opacity: 1
    },
    {
      offset: .34,
      left: `${sourceRect.left}px`,
      top: `${sourceRect.top - 18}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`,
      transform: 'translateY(0) scale(1.08)',
      opacity: 1
    },
    {
      left: `${destinationLeft}px`,
      top: `${destinationTop}px`,
      width: `${destinationWidth}px`,
      height: `${destinationHeight}px`,
      transform: 'translateY(0) scale(1)',
      opacity: 1
    }
  ], {
    duration: 620,
    easing: 'cubic-bezier(.2,.78,.2,1)',
    fill: 'forwards'
  });

  try { await travel.finished; } catch {}
  target.classList.add('handoff-arrival');
  overlay.remove();
  numberPanel.style.visibility = '';
  button.disabled = false;
  window.setTimeout(() => target.classList.remove('handoff-arrival'), 560);
}

function interceptHandoff(event) {
  const nameButton = event.target.closest?.('[data-action="onboard-next-name"]');
  if (nameButton) {
    const input = document.getElementById('nameInput');
    if (!input?.value?.trim()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    advanceNameToNumber(nameButton);
    return;
  }

  const numberButton = event.target.closest?.('[data-action="onboard-next-number"]');
  if (!numberButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  advanceNumberToPosition(numberButton);
}

window.addEventListener('click', interceptHandoff, true);
