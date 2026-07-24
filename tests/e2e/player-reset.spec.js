import { test, expect } from "@playwright/test";
import { establishReturningPlayer, readPitchIQStorage } from "./helpers/app-state.js";
import { monitorBrowserHealth } from "./helpers/browser-health.js";
import { waitForPitchIQ } from "./helpers/journeys.js";

test("Player Reset clears player and onboarding state", async ({ page }) => {
  await establishReturningPlayer(page);
  const health = monitorBrowserHealth(page);
  page.on("dialog", (dialog) => dialog.accept());
  await waitForPitchIQ(page);

  await page.locator('[data-nav-route="player"]').click();
  await expect(page.locator("#player")).toBeVisible();
  await page.locator('[data-action="player-settings-open"]').click();
  await expect(page.locator("#playerSettingsPanel")).toBeVisible();
  await page.locator('[data-player-option="reset"]').click();

  await expect(page.locator("#splash")).toBeVisible();
  const storage = await readPitchIQStorage(page);
  expect(storage.local.pitchiqFirstRun).toBeUndefined();
  expect(storage.local.pitchiqPlayerName).toBeUndefined();
  expect(storage.local.pitchiqJerseyNumber).toBeUndefined();
  expect(storage.local.pitchiqSelectedPosition).toBeUndefined();
  expect(storage.local.pitchiqPlayerStyle).toBeUndefined();
  expect(storage.local.pitchiqAcademyAvatar).toBeUndefined();
  expect(storage.local.pitchiqAcademyAccepted).toBeUndefined();
  expect(storage.local.pitchiqGuardianEmail).toBeUndefined();
  expect(storage.local.pitchiqPlayerContract).toBeUndefined();
  expect(storage.session["pitchiq-onboarding-step"]).toBeUndefined();
  expect(storage.session["pitchiq-number-flow-lock"]).toBeUndefined();
  expect(storage.session["pitchiq-onboarding-lock"]).toBeUndefined();
  health.assertClean(expect);
});
