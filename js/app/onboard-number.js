const PLAYER_NAME_KEY = "pitchiqPlayerName";
const SELECTED_POSITION_KEY = "pitchiqSelectedPosition";
const JERSEY_NUMBER_KEY = "pitchiqJerseyNumber";
const JERSEY_NUMBER_CONFIRMED_KEY = "pitchiqJerseyNumberConfirmed";
const DEFAULT_NUMBER = 10;
const ITEM_HEIGHT = 52;

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
        <div class="jersey-number-picker" role="listbox" aria-label="Jersey number" tabindex="0">${items}</div>
        <div class="jersey-number-selection" aria-hidden="true"></div>
      </div>
      <p class="jersey-number-help">Swipe up or down</p>
      <div class="onboard-step-footer">
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

  if (withHaptic && previous && previous !== nextNumber) hapticTick();
}

function bindPicker(panel) {
  if (panel.dataset.numberPickerBound === "true") return;
  panel.dataset.numberPickerBound = "true";

  const picker = panel.querySelector('.jersey-number-picker');
  if (!picker) return;

  let selected = clampNumber(localStorage.getItem(JERSEY_NUMBER_KEY));
  let frame = 0;

  const scrollToNumber = (number, behavior = "auto") => {
    const next = clampNumber(number);
    picker.scrollTo({ top: (next - 1) * ITEM_HEIGHT, behavior });
    updateNumber(panel, next, false);
  };

  picker.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const next = clampNumber(Math.round(picker.scrollTop / ITEM_HEIGHT) + 1);
      if (next !== selected) {
        selected = next;
        updateNumber(panel, selected, true);
      }
    });
  }, { passive: true });

  picker.addEventListener('click', event => {
    const option = event.target.closest?.('[data-jersey-number]');
    if (!option) return;
    selected = clampNumber(option.dataset.jerseyNumber);
    scrollToNumber(selected, 'smooth');
  });

  picker.addEventListener('keydown', event => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    selected = clampNumber(selected + (event.key === 'ArrowDown' ? 1 : -1));
    scrollToNumber(selected, 'smooth');
  });

  requestAnimationFrame(() => scrollToNumber(selected));
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

  if (storedName && !storedPosition && !numberConfirmed) setVisiblePhase('number');
  bindPicker(numberPanel);
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
      const panel = document.querySelector('.onboard-number-step');
      bindPicker(panel);
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
