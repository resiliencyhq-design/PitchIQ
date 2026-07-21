import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const runtimeUrl = new URL("../js/app/academy-runtime-canonical.js", import.meta.url);
const indexUrl = new URL("../index.html", import.meta.url);
const auditUrl = new URL("../docs/academy-architecture-audit-c3.md", import.meta.url);

async function source(url){ return readFile(url, "utf8"); }

test("canonical runtime owns the Academy route and complete first-run journey", async () => {
  const runtime = await source(runtimeUrl);
  assert.match(runtime, /const CANONICAL_ROUTE = "academy-trial"/);
  assert.match(runtime, /Welcome to PitchIQ Academy/);
  assert.match(runtime, /Meet Your Coach/);
  assert.match(runtime, /Camera Finder/);
  assert.match(runtime, /Quick Challenge/);
  assert.match(runtime, /ACADEMY<br><em>ACCEPTED<\/em>/);
  assert.match(runtime, /Choose Your Avatar/);
});

test("Discover transition removes the isolated identity overlay before direct rendering", async () => {
  const runtime = await source(runtimeUrl);
  assert.match(runtime, /function clearIdentityOverlay\(\)/);
  assert.match(runtime, /document\.getElementById\("identity-complete-scene"\)\?\.remove\(\)/);
  assert.match(runtime, /event\.stopImmediatePropagation\(\)/);
  assert.match(runtime, /queueMicrotask\(render\)/);
});

test("legacy Learn the Tools route is redirect-only", async () => {
  const runtime = await source(runtimeUrl);
  assert.match(runtime, /const LEGACY_ROUTE = "academy-trials"/);
  assert.match(runtime, /window\.location\.replace/);
  assert.doesNotMatch(runtime, /Learn the Tools/);
});

test("production loads one canonical orientation owner", async () => {
  const index = await source(indexUrl);
  assert.match(index, /academy-runtime-canonical\.js\?v=sprint-c3-academy-architecture-consolidation-20260721/);
  assert.doesNotMatch(index, /src="js\/app\/academy-orientation-polish\.js/);
  assert.doesNotMatch(index, /src="js\/app\/academy-orientation-interactive\.js/);
  assert.match(index, /window\.__PITCHIQ_BUILD__ = "sprint-c3-academy-architecture-consolidation-20260721"/);
});

test("architecture audit records route and renderer ownership", async () => {
  const audit = await source(auditUrl);
  assert.match(audit, /Consolidated ownership/);
  assert.match(audit, /academy-runtime-canonical\.js/);
  assert.match(audit, /#academy-trial/);
  assert.match(audit, /#lab-juggling/);
});
