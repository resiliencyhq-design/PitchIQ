import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const bindScreenUrl = new URL("../js/app/ui/bind-screen.js", import.meta.url);
const runtimeUrl = new URL("../js/app/academy-runtime-canonical.js", import.meta.url);

async function source(url) {
  return readFile(url, "utf8");
}

test("strengths handoff preserves the completed player identity", async () => {
  const bindScreen = await source(bindScreenUrl);

  assert.match(bindScreen, /const existingProfile = app\.state\.profile \|\| \{\}/);
  assert.match(bindScreen, /app\.selectedPosition \|\| existingProfile\.position/);
  assert.match(bindScreen, /input\?\.value\?\.trim\(\) \|\| existingProfile\.name/);
  assert.doesNotMatch(bindScreen, /input\?\.value\?\.trim\(\) \|\| "Player",\s*app\.selectedPosition/);
});

test("player style remains the only final completion handoff", async () => {
  const runtime = await source(runtimeUrl);

  assert.match(runtime, /completeStep\("player-style"\);\s*goHome\(\)/);
  assert.match(runtime, /data-complete-first-run/);
});
