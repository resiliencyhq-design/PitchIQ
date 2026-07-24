import { test, expect } from "@playwright/test";
import { establishReturningPlayer } from "./helpers/app-state.js";
import { monitorBrowserHealth } from "./helpers/browser-health.js";
import { waitForPitchIQ } from "./helpers/journeys.js";

test("app startup has no uncaught browser or first-party request errors", async ({ page }) => {
  await establishReturningPlayer(page);
  const health = monitorBrowserHealth(page);
  await waitForPitchIQ(page);
  await expect(page.locator("#home")).toBeVisible();
  await page.waitForTimeout(500);
  health.assertClean(expect);
});
