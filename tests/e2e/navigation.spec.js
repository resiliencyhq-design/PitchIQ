import { test, expect } from "@playwright/test";
import { establishReturningPlayer } from "./helpers/app-state.js";
import { monitorBrowserHealth } from "./helpers/browser-health.js";
import { waitForPitchIQ } from "./helpers/journeys.js";

test("bottom navigation opens each protected destination and returns Home", async ({ page }) => {
  await establishReturningPlayer(page);
  const health = monitorBrowserHealth(page);
  await waitForPitchIQ(page);

  const routes = [
    ["training", "#training"],
    ["results", "#results"],
    ["player", "#player"],
  ];

  for (const [route, selector] of routes) {
    await page.locator(`[data-nav-route="${route}"]`).click();
    await expect(page.locator(selector)).toBeVisible();
    await page.locator('[data-nav-route="home"]').click();
    await expect(page.locator("#home")).toBeVisible();
  }

  health.assertClean(expect);
});
