import { expect, test } from "@playwright/test";
import { integratedKey, seedReturningPlayer } from "./helpers/state.js";

function collectRuntimeFailures(page) {
  const failures = [];
  page.on("pageerror", error => failures.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", request => failures.push(`request: ${request.url()} ${request.failure()?.errorText || "failed"}`));
  return failures;
}

async function clickFirstVisible(page, selectors) {
  for (const selector of selectors) {
    const candidate = page.locator(selector).first();
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.click();
      return selector;
    }
  }
  throw new Error(`No visible selector found: ${selectors.join(", ")}`);
}

async function expectAppText(page, pattern) {
  await expect(page.locator("#app")).toContainText(pattern);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__pitchiqRouteEvents = [];
    window.__pitchiqStateEvents = [];
    window.addEventListener("pitchiq:route-change", event => {
      window.__pitchiqRouteEvents.push(event.detail || null);
    });
    window.addEventListener("pitchiq:state-change", event => {
      window.__pitchiqStateEvents.push(event.detail || null);
    });
  });
});

test("returning player can enter Training and return through the core shell", async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await seedReturningPlayer(page);
  await page.goto("/");

  await expect(page.locator("#nav")).toHaveClass(/visible/);
  await clickFirstVisible(page, [
    "[data-route='training']",
    "[data-nav='training']",
    "#nav button:has-text('Train')",
    "#nav a:has-text('Train')",
    "button:has-text('Train')",
  ]);

  await expectAppText(page, /scan|training|mission|start/i);

  const routeEvents = await page.evaluate(() => window.__pitchiqRouteEvents);
  expect(routeEvents.length).toBeGreaterThanOrEqual(1);
  expect(failures).toEqual([]);
});

test("notification preferences persist after reload", async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await seedReturningPlayer(page);
  await page.goto("/");

  await clickFirstVisible(page, [
    "[data-notification-bell]",
    "#notification-bell",
    "button[aria-label*='notification' i]",
    "button:has-text('Notifications')",
  ]);

  const toggle = page.locator("input[type='checkbox']").first();
  if (await toggle.isVisible().catch(() => false)) {
    const initial = await toggle.isChecked();
    await toggle.setChecked(!initial);
  }

  const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), integratedKey);
  await page.reload();
  const after = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), integratedKey);

  expect(after.data.notifications).toEqual(before.data.notifications);
  expect(failures).toEqual([]);
});

test("Lab entry and Home return remain available from the app shell", async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await seedReturningPlayer(page);
  await page.goto("/");

  await clickFirstVisible(page, [
    "[data-route='lab']",
    "[data-nav='lab']",
    "button:has-text('Lab')",
    "a:has-text('Lab')",
  ]);
  await expectAppText(page, /lab|breathing|imagery|juggler|calm/i);

  await clickFirstVisible(page, [
    "[data-route='home']",
    "[data-nav='home']",
    "#nav button:has-text('Home')",
    "#nav a:has-text('Home')",
  ]);
  await expectAppText(page, /today|mission|train|home/i);
  expect(failures).toEqual([]);
});

test("one user navigation action does not emit duplicate route events", async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await seedReturningPlayer(page);
  await page.goto("/");
  await page.evaluate(() => { window.__pitchiqRouteEvents = []; });

  await clickFirstVisible(page, [
    "[data-route='player']",
    "[data-nav='player']",
    "#nav button:has-text('Player')",
    "#nav a:has-text('Player')",
  ]);
  await expectAppText(page, /player|profile|level|reset/i);

  const routeEvents = await page.evaluate(() => window.__pitchiqRouteEvents);
  expect(routeEvents.length).toBeLessThanOrEqual(1);
  expect(failures).toEqual([]);
});
