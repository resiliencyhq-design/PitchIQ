import { expect, test } from "@playwright/test";
import { clearPitchIQState, integratedKey, returningPlayerState, seedReturningPlayer } from "./helpers/state.js";

function collectRuntimeFailures(page) {
  const failures = [];
  page.on("pageerror", error => failures.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", request => failures.push(`request: ${request.url()} ${request.failure()?.errorText || "failed"}`));
  return failures;
}

test("clean launch resolves to the first-run landing experience", async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await clearPitchIQState(page);
  await page.goto("/");

  await expect(page.locator("#app")).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/pitchiq-splash-active/);
  await expect(page.locator("#nav")).not.toHaveClass(/visible/);
  expect(await page.evaluate(() => localStorage.getItem("pitchiqFirstRun"))).toBeNull();
  expect(await page.evaluate(() => window.__pitchiqBrowserErrors || [])).toEqual([]);
  expect(failures).toEqual([]);
});

test("returning player resolves directly to Home and persists canonical state", async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await seedReturningPlayer(page);
  await page.goto("/");

  await expect(page.locator("#app")).toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/pitchiq-splash-active/);
  await expect(page.locator("#nav")).toHaveClass(/visible/);
  await expect(page.locator("#app")).toContainText(/Test Player|Today|Mission|Train/i);

  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), integratedKey);
  expect(stored.version).toBe(1);
  expect(stored.data.profile.name).toBe("Test Player");
  expect(stored.data.firstRun.status).toBe("complete");
  expect(failures).toEqual([]);
});

test("mid-onboarding refresh resumes the canonical current step", async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  const state = returningPlayerState();
  state.data.profile.name = "Resume Player";
  state.data.profile.number = "1";
  state.data.profile.position = "";
  state.data.firstRun = {
    version: 1,
    status: "in_progress",
    currentStep: "number",
    completedSteps: ["landing", "name"],
    completedAt: null,
  };

  await page.addInitScript(({ key, value }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem("pitchiqPlayerServiceMigrationV1", "true");
  }, { key: integratedKey, value: state });

  await page.goto("/");
  await expect(page.locator("#app")).toBeVisible();
  await expect(page.locator("#nav")).not.toHaveClass(/visible/);
  await expect(page.locator("#app")).toContainText(/number|jersey/i);

  await page.reload();
  await expect(page.locator("#app")).toContainText(/number|jersey/i);
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), integratedKey);
  expect(stored.data.firstRun.currentStep).toBe("number");
  expect(failures).toEqual([]);
});

test("developer reset returns a valid returning player to Landing", async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await seedReturningPlayer(page);
  page.on("dialog", dialog => dialog.accept());
  await page.goto("/?dev=1");

  await page.locator("#pitchiq-dev-toggle").click();
  await page.locator("[data-dev-reset]").click();

  await expect(page.locator("body")).toHaveClass(/pitchiq-splash-active/);
  await expect(page.locator("#nav")).not.toHaveClass(/visible/);
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), integratedKey);
  expect(stored.data.profile.name).toBe("");
  expect(stored.data.firstRun.currentStep).toBe("landing");
  expect(stored.data.firstRun.status).toBe("not_started");
  expect(failures).toEqual([]);
});
