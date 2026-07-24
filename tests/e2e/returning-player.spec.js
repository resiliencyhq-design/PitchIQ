import { test, expect } from "@playwright/test";
import { establishReturningPlayer } from "./helpers/app-state.js";
import { monitorBrowserHealth } from "./helpers/browser-health.js";
import { waitForPitchIQ } from "./helpers/journeys.js";

test("returning player reloads directly into Home", async ({ page }) => {
  await establishReturningPlayer(page);
  const health = monitorBrowserHealth(page);
  await waitForPitchIQ(page);

  await expect(page.locator("#home")).toBeVisible();
  await expect(page.locator("#splash")).toHaveCount(0);
  await expect(page.locator("#onboard")).toHaveCount(0);

  await page.reload();
  await page.waitForFunction(() => window.__PITCHIQ_READY__ === true);
  await expect(page.locator("#home")).toBeVisible();
  health.assertClean(expect);
});
