import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const indexUrl = new URL("../index.html", import.meta.url);
const runtimeUrl = new URL("../js/app/academy-runtime-canonical.js", import.meta.url);
const loaderUrl = new URL("../js/app/academy-lab-loader.js", import.meta.url);

async function source(url) {
  return readFile(url, "utf8");
}

test("canonical Academy runtime remains the only eager Academy screen owner", async () => {
  const index = await source(indexUrl);
  assert.match(index, /academy-runtime-canonical\.js/);
  assert.doesNotMatch(index, /<script[^>]+academy-trial\.js/);
  assert.match(index, /academy-lab-loader\.js/);
});

test("legacy Academy route remains redirect-only", async () => {
  const runtime = await source(runtimeUrl);
  assert.match(runtime, /const LEGACY_ROUTE = "academy-trials"/);
  assert.match(runtime, /window\.location\.replace/);
  assert.doesNotMatch(runtime, /Enter the Academy/);
});

test("canonical delegated controller owns the complete locked journey", async () => {
  const runtime = await source(runtimeUrl);
  assert.match(runtime, /document\.addEventListener\("click"/);
  assert.match(runtime, /stage === "welcome"/);
  assert.match(runtime, /stage === "step-0"/);
  assert.match(runtime, /stage === "step-1"/);
  assert.match(runtime, /stage === "step-2"/);
  assert.match(runtime, /stage === "accepted"/);
  assert.match(runtime, /stage === "avatar"/);
  assert.match(runtime, /goHome\(\)/);
});

test("experimental lab runtime is lazy-loaded only for lab-juggling", async () => {
  const loader = await source(loaderUrl);
  assert.match(loader, /lab-juggling/);
  assert.match(loader, /import\("\.\/academy-trial\.js/);
});
