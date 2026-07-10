const PLAYER_NAME_KEY = "pitchiqPlayerName";
const SELECTED_POSITION_KEY = "pitchiqSelectedPosition";
const JERSEY_NUMBER_KEY = "pitchiqJerseyNumber";
const JERSEY_NUMBER_CONFIRMED_KEY = "pitchiqJerseyNumberConfirmed";
const DEFAULT_NUMBER = 1;
const FALLBACK_ITEM_HEIGHT = 52;

function clampNumber(value) {
  return Math.min(99, Math.max(1, Number.parseInt(value, 10) || DEFAULT_NUMBER));
}

function hapticTick() {
  try {
    if (navigator.vibrate) navigator.vibrate(8);
  } catch {}
}

function numberPanelMarkup() {
  const items = Array.from({ length: 99 }, (_, index) => index + 1)
    .map(number => `<button type="button" class="jersey-number-option" data-jersey-number="${number}" role="option" aria-selected="false">${number}</button>`)
    .join("");

  return `
    <section class="onboard-step onboard-number-step" data-onboard-step="1" data-onboard-phase="number" hidden>
      <span class="position-title">Step 1 of 3</span>
      <div class="academy-progress" aria-label="Step 1 of 3">
        <span class="active"></span><i></i><span></span><i></i><span></span>
      </div>
      <p class="onboard-subtitle">MAKE IT YOURS</p>
      <h1 class="onboard-heading">Choose your squad number</h1>
      <div class="onboard-jersey-preview" aria-label="Academy jersey number preview"></div>
      <div class="jersey-number-picker-shell">
        <div class="jersey-number-picker" role="listbox" aria-label="Jersey number" tabindex="0">
          <div class="jersey-number-track">${items}</div>
        </div>
        <div class="jersey-number-selection" aria-hidden="true"></div>
      </div>
      <p class="jersey-number-help">Swipe up or down</p>
      <div class="onboard-step-footer onboard-number-footer">
        <button class="primary mega splash-cta-v1 onboard-cta-v1 sticky-cta" data-action="onboard-next-number">CONTINUE →</button>
      </div>
    </section>`;
}

function setVisiblePhase(phase) {
  const namePanel = document.querySelector('.onboard-step[data-onboard-step="1"]:not([data-onboard-phase="number"])');
  const numberPanel = document.querySelector('.onboard-number-step');
  const positionPanel = document.querySelector('.onboard-step[data-onboard-step="2"]');
  const confirmPanel = document.querySelector('.onboard-step[data-onboard-step="3"]');

  if (namePanel) namePanel.hidden = phase !== "name";
  if (numberPanel) numberPanel.hidden = phase !== "number";
  if (positionPanel) positionPanel.hidden = phase !== "position";
  if (confirmPanel) confirmPanel.hidden = phase !== "confirm";

  if (phase === "number" && numberPanel) refreshPicker(numberPanel);
}

function updateNumber(panel, number, withHaptic = false) {
  const nextNumber = clampNumber(number);
  const previous = Number(panel.dataset.selectedNumber || 0);
  panel.dataset.selectedNumber = String(nextNumber);
  localStorage.setItem(JERSEY_NUMBER_KEY, String(nextNumber));

  const preview = panel.querySelector('.onboard-jersey-number');
  if (preview) {
    preview.textContent = String(nextNumber);
    preview.classList.remove('is-rolling');
    void preview.offsetWidth;
    preview.classList.add('is-rolling');
  }

  panel.querySelectorAll('[data-jersey-number]').forEach(option => {
    const selected = Number(option.dataset.jerseyNumber) === nextNumber;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-selected', selected ? 'true' : 'false');
  });

  window.dispatchEvent(new CustomEvent('pitchiq:jersey-number-change', { detail: { number: nextNumber } }));
  if (withHaptic && previous && previous !== nextNumber) hapticTick();
}

function itemHeight(picker) {
  const option = picker?.querySelector('.jersey-number-option');
  const measured = option?.getBoundingClientRect().height;
  return measured && measured > 0 ? measured : FALLBACK_ITEM_HEIGHT;
}

function renderPickerPosition(panel, animate = false) {
  const picker = panel?.querySelector('.jersey-number-picker');
  const track = picker?.querySelector('.jersey-number-track');
  if (!picker || !track) return;
  const selected = clampNumber(panel.dataset.selectedNumber || localStorage.getItem(JERSEY_NUMBER_KEY));
  const height = itemHeight(picker);
  track.style.transition = animate ? 'transform 180ms cubic-bezier(.2,.8,.2,1)' : 'none';
  track.style.transform = `translate3d(0, ${-(selected - 1) * height}px, 0)`;
}

function refreshPicker(panel) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const selected = clampNumber(panel.dataset.selectedNumber || localStorage.getItem(JERSEY_NUMBER_KEY));
      updateNumber(panel, selected, false);
      renderPickerPosition(panel, false);
    });
  });
}

function bindPicker(panel) {
  if (!panel || panel.dataset.numberPickerBound === "true") return;
  panel.dataset.numberPickerBound = "true";

  const picker = panel.querySelector('.jersey-number-picker');
  if (!picker) return;

  let selected = clampNumber(localStorage.getItem(JERSEY_NUMBER_KEY));
  let startY = 0;
  let startNumber = selected;
  let dragging = false;

  const setSelected = (number, withHaptic = true, animate = false) => {
    const next = clampNumber(number);
    if (next !== selected) {
      selected = next;
      updateNumber(panel, selected, withHaptic);
    }
    renderPickerPosition(panel, animate);
  };

  const beginDrag = clientY => {
    dragging = true;
    startY = clientY;
    startNumber = selected;
    picker.classList.add('is-dragging');
  };

  const moveDrag = clientY => {
    if (!dragging) return;
    const height = itemHeight(picker);
    const offset = Math.round((startY - clientY) / height);
    setSelected(startNumber + offset, true, false);
  };

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    picker.classList.remove('is-dragging');
    renderPickerPosition(panel, true);
  };

  picker.addEventListener('pointerdown', event => {
    beginDrag(event.clientY);
    picker.setPointerCapture?.(event.pointerId);
  });
  picker.addEventListener('pointermove', event => moveDrag(event.clientY));
  picker.addEventListener('pointerup', endDrag);
  picker.addEventListener('pointercancel', endDrag);

  picker.addEventListener('touchstart', event => {
    if (!event.touches.length) return;
    beginDrag(event.touches[0].clientY);
  }, { passive: true });
  picker.addEventListener('touchmove', event => {
    if (!event.touches.length) return;
    event.preventDefault();
    moveDrag(event.touches[0].clientY);
  }, { passive: false });
  picker.addEventListener('touchend', endDrag, { passive: true });
  picker.addEventListener('touchcancel', endDrag, { passive: true });

  picker.addEventListener('click', event => {
    if (dragging) return;
    const option = event.target.closest?.('[data-jersey-number]');
    if (!option) return;
    setSelected(option.dataset.jerseyNumber, true, true);
  });

  picker.addEventListener('keydown', event => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    setSelected(selected + (event.key === 'ArrowDown' ? 1 : -1), true, true);
  });

  picker.addEventListener('wheel', event => {
    event.preventDefault();
    setSelected(selected + (event.deltaY > 0 ? 1 : -1), true, true);
  }, { passive: false });

  refreshPicker(panel);
}

function mountNumberPhase() {
  const wizard = document.querySelector('#onboard .onboarding-wizard');
  const namePanel = wizard?.querySelector('.onboard-step[data-onboard-step="1"]:not([data-onboard-phase="number"])');
  if (!wizard || !namePanel) return;

  let numberPanel = wizard.querySelector('.onboard-number-step');
  if (!numberPanel) {
    namePanel.insertAdjacentHTML('afterend', numberPanelMarkup());
    numberPanel = wizard.querySelector('.onboard-number-step');
  }

  const storedName = localStorage.getItem(PLAYER_NAME_KEY);
  const storedPosition = localStorage.getItem(SELECTED_POSITION_KEY);
  const numberConfirmed = localStorage.getItem(JERSEY_NUMBER_CONFIRMED_KEY) === 'true';

  if (!storedName && !storedPosition) {
    localStorage.setItem(JERSEY_NUMBER_KEY, String(DEFAULT_NUMBER));
    localStorage.removeItem(JERSEY_NUMBER_CONFIRMED_KEY);
    numberPanel.dataset.selectedNumber = String(DEFAULT_NUMBER);
  }

  bindPicker(numberPanel);
  if (storedName && !storedPosition && !numberConfirmed) setVisiblePhase('number');
}

function bindNumberFlow() {
  document.addEventListener('click', event => {
    const nameContinue = event.target.closest?.('[data-action="onboard-next-name"]');
    if (nameContinue?.dataset.jerseyTransitionBypass === 'true') {
      const name = document.getElementById('nameInput')?.value?.trim();
      if (!name) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      localStorage.setItem(PLAYER_NAME_KEY, name);
      localStorage.removeItem(JERSEY_NUMBER_CONFIRMED_KEY);
      setVisiblePhase('number');
      return;
    }

    const numberContinue = event.target.closest?.('[data-action="onboard-next-number"]');
    if (!numberContinue) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const panel = numberContinue.closest('.onboard-number-step');
    const number = clampNumber(panel?.dataset.selectedNumber || localStorage.getItem(JERSEY_NUMBER_KEY));
    localStorage.setItem(JERSEY_NUMBER_KEY, String(number));
    localStorage.setItem(JERSEY_NUMBER_CONFIRMED_KEY, 'true');
    hapticTick();
    setVisiblePhase('position');
  }, true);
}

function initialiseNumberPhase() {
  mountNumberPhase();
  bindNumberFlow();
  const app = document.getElementById('app');
  if (!app) return;
  new MutationObserver(mountNumberPhase).observe(app, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialiseNumberPhase, { once: true });
} else {
  initialiseNumberPhase();
}
