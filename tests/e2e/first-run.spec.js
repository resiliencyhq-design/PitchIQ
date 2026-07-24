import { test, expect } from "@playwright/test";
import { establishFirstRun, readPitchIQStorage } from "./helpers/app-state.js";
import { monitorBrowserHealth } from "./helpers/browser-health.js";
import { completeFirstRun, waitForPitchIQ } from "./helpers/journeys.js";

test("complete first-run journey reaches Home", async ({ page }) => {
  await establishFirstRun(page);
  const health = monitorBrowserHealth(page);
  await waitForPitchIQ(page);
  await completeFirstRun(page);

  const storage = await readPitchIQStorage(page);
  const firstRun = JSON.parse(storage.local.pitchiqFirstRun);
  expect(firstRun.status).toBe("complete");
  expect(firstRun.currentStep).toBe("complete");
  expect(storage.local.pitchiqPlayerName).toBe("Test Player");
  expect(storage.local.pitchiqJerseyNumber).toBe("10");
  expect(storage.local.pitchiqSelectedPosition).toBe("CAM");
  health.assertClean(expect);
});
