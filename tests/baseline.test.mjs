import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the autonomous implementation context is committed", async () => {
  const context = await readFile(new URL("../CONTEXT.md", import.meta.url), "utf8");
  const verdict = await readFile(new URL("../docs/prototype-verdict.md", import.meta.url), "utf8");
  assert.match(context, /Real Madrid/i);
  assert.match(verdict, /Monumental Aperture/i);
});
