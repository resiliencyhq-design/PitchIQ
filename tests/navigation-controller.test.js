import test from 'node:test';
import assert from 'node:assert/strict';
import { NavigationController } from '../js/app/controllers/navigation-controller.js';

function createController({ complete = false } = {}) {
  const calls = [];
  const firstRun = {
    isComplete: () => complete,
    getEntryRoute: () => complete ? 'home' : 'onboard',
  };
  const controller = new NavigationController({
    validRoutes: ['splash', 'onboard', 'home', 'training', 'results', 'player'],
    protectedRoutes: ['home', 'training', 'results', 'player'],
    firstRun,
    syncPlayer: () => calls.push('sync-player'),
    beforeNavigate: (route) => calls.push(`before:${route}`),
    renderRoute: (route) => calls.push(`render:${route}`),
  });
  return { controller, calls };
}

test('invalid routes resolve to first-run entry route', () => {
  const { controller } = createController();
  assert.equal(controller.resolve('unknown'), 'onboard');
});

test('protected routes are blocked until first run completes', () => {
  const { controller, calls } = createController();
  assert.equal(controller.go('home'), 'onboard');
  assert.deepEqual(calls, ['before:onboard', 'render:onboard']);
});

test('protected routes sync the player after first run completes', () => {
  const { controller, calls } = createController({ complete: true });
  assert.equal(controller.go('training'), 'training');
  assert.deepEqual(calls, ['sync-player', 'before:training', 'render:training']);
});
