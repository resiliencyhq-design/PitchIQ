import { expect } from "@playwright/test";

export async function waitForPitchIQ(page) {
  await page.goto("/");
  await page.waitForFunction(() => window.__PITCHIQ_READY__ === true);
}

export async function completeFirstRun(page) {
  await expect(page.locator("#splash")).toBeVisible();
  await page.evaluate(() => window.PitchIQApp.enterFromLanding());

  await expect(page.locator('[data-onboard-phase="name"]')).toBeVisible();
  await page.getByLabel("Player name").fill("Test Player");
  await page.locator('[data-action="onboard-next-name"]').click();

  await expect(page.locator('[data-onboard-phase="number"]')).toBeVisible();
  await page.locator('[data-jersey-number="10"]').click();
  await page.locator('[data-action="onboard-next-number"]').click();

  await expect(page.locator(".position-pitch-layer")).toBeVisible();
  await expect(page.locator(".position-marker-box")).toBeVisible();
  await page.locator('[data-pos="CAM"]').click();
  await page.locator('[data-action="onboard-next-position"]').click();

  await page.locator('[data-action="enter-academy"]').click();
  await expect(page.locator(".academy-runtime-canonical")).toBeVisible();

  await page.locator("[data-canonical-next]").click();
  await page.locator("[data-canonical-next]").click();
  await page.locator("[data-canonical-next]").click();
  await page.locator("[data-canonical-next]").click();
  await page.locator("[data-reaction-tap]").click({ timeout: 5_000 });
  await page.locator("[data-canonical-next]").click();

  await page.locator("[data-contract-email]").fill("guardian@example.com");
  await page.locator("[data-contract-accept]").check();
  await page.locator("[data-contract-submit]").click();

  await page.locator('[data-canonical-avatar="captain"]').click();
  await page.locator("[data-canonical-next]").click();
  await page.locator('[data-player-style="playmaker"]').click();
  await page.locator("[data-complete-first-run]").click();

  await expect(page.locator("#home")).toBeVisible();
}
