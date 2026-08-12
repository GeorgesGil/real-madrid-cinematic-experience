import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  MOTION_QUERY,
  SSR_MOTION_PREFERENCE,
  isReducedMotion,
  parseMotionPreference,
  resolveMotionPreference,
} from "../src/packages/motion/preference.ts";

/*
 * Behavior tests import the pure seam directly (Node type stripping parses
 * `.ts`); the motion barrel is never imported because it re-exports `.tsx`
 * JSX that Node cannot parse.
 */
const root = new URL("..", import.meta.url);

function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("the SSR default matches the CSS baseline (no-preference)", () => {
  assert.equal(SSR_MOTION_PREFERENCE, "no-preference");
  assert.equal(MOTION_QUERY, "(prefers-reduced-motion: reduce)");
});

test("resolveMotionPreference maps matchMedia booleans and nullish input", () => {
  assert.equal(resolveMotionPreference(true), "reduce");
  assert.equal(resolveMotionPreference(false), "no-preference");
  assert.equal(resolveMotionPreference(null), SSR_MOTION_PREFERENCE);
  assert.equal(resolveMotionPreference(undefined), SSR_MOTION_PREFERENCE);
});

test("isReducedMotion distinguishes the two preferences", () => {
  assert.equal(isReducedMotion("reduce"), true);
  assert.equal(isReducedMotion("no-preference"), false);
});

test("parseMotionPreference accepts the canonical values case-insensitively", () => {
  assert.equal(
    parseMotionPreference("prefers-reduced-motion: reduce"),
    "reduce",
  );
  assert.equal(
    parseMotionPreference("prefers-reduced-motion: no-preference"),
    "no-preference",
  );
  assert.equal(
    parseMotionPreference("Prefers-Reduced-Motion: Reduce"),
    "reduce",
  );
  assert.equal(
    parseMotionPreference("  prefers-reduced-motion: reduce  "),
    "reduce",
  );
  assert.equal(parseMotionPreference("(prefers-reduced-motion: reduce)"), null);
  assert.equal(parseMotionPreference("prefers-color-scheme: dark"), null);
  assert.equal(parseMotionPreference("prefers-reduced-motion:"), null);
  assert.equal(parseMotionPreference(""), null);
});

test("the pure seam stays JSX- and dependency-free for Node type stripping", async () => {
  const source = await read("src/packages/motion/preference.ts");
  assert.doesNotMatch(source, /"use client"/);
  assert.doesNotMatch(source, /from\s+["']react["']/);
  assert.doesNotMatch(source, /from\s+["']lenis["']/);
  assert.doesNotMatch(source, /from\s+["']gsap["']/);
});

test("the hook is client-only and SSR-safe via useSyncExternalStore", async () => {
  const hook = await read("src/packages/motion/use-motion-preference.ts");
  assert.match(hook, /"use client"/);
  assert.match(hook, /useSyncExternalStore/);
  assert.match(hook, /SSR_MOTION_PREFERENCE/);
});

test("the provider reflects reduced motion onto the document root", async () => {
  const provider = await read(
    "src/packages/motion/MotionPreferenceProvider.tsx",
  );
  assert.match(provider, /"use client"/);
  assert.match(
    provider,
    /document\.documentElement\.dataset\.reducedMotion/,
  );
  assert.match(
    provider,
    /delete\s+document\.documentElement\.dataset\.reducedMotion/,
  );
});

test("LenisProvider is client-only and guarded by reduced motion", async () => {
  const lenis = await read("src/packages/motion/LenisProvider.tsx");
  assert.match(lenis, /"use client"/);
  assert.match(lenis, /from\s+["']lenis["']/);
  assert.match(lenis, /isReducedMotion/);
  assert.match(lenis, /destroy\(\)/);
  assert.match(lenis, /autoRaf:\s*true/);
});

test("the barrel exports the seam and provider but never Lenis", async () => {
  const index = await read("src/packages/motion/index.ts");
  assert.match(index, /export\s*\{ MotionPreferenceProvider \}/);
  assert.match(index, /export\s*\{ useMotionPreference \}/);
  assert.match(index, /resolveMotionPreference/);
  assert.doesNotMatch(index, /export\s*\{[^}]*\bLenisProvider\b/);
  assert.doesNotMatch(index, /from\s+["']lenis["']/);
});

test("layout.tsx mounts the provider and never Lenis", async () => {
  const layout = await read("src/app/layout.tsx");
  assert.match(layout, /<MotionPreferenceProvider>/);
  assert.match(layout, /from\s+["']@\/packages\/motion["']/);
  assert.doesNotMatch(layout, /LenisProvider/);
});
