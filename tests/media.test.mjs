import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

import {
  decidePlayback,
  shouldRenderVideoElement,
} from "../src/packages/media/playback.ts";

/*
 * Behavior tests import the pure seam directly (Node type stripping parses
 * `.ts`); the media barrel is never imported because it re-exports `.tsx`
 * JSX that Node cannot parse (same convention as motion).
 */
const root = new URL("..", import.meta.url);
const SRC_DIR = join(root.pathname, "src");

function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

async function listSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(fullPath)));
    } else if (/\.(ts|tsx|mjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// --- decidePlayback behavior ---

test("reduced motion always wins over every other input", () => {
  assert.deepEqual(
    decidePlayback({
      reducedMotion: true,
      inView: true,
      state: "idle",
      canPlay: true,
    }),
    { action: "none", reason: "reduced-motion" },
  );
  assert.deepEqual(
    decidePlayback({
      reducedMotion: true,
      inView: false,
      state: "playing",
      canPlay: true,
    }),
    { action: "none", reason: "reduced-motion" },
  );
  assert.deepEqual(
    decidePlayback({
      reducedMotion: true,
      inView: true,
      state: "error",
      canPlay: true,
    }),
    { action: "none", reason: "reduced-motion" },
  );
});

test("off-screen media pauses", () => {
  assert.deepEqual(
    decidePlayback({ reducedMotion: false, inView: false, state: "playing" }),
    { action: "pause", reason: "off-screen" },
  );
  assert.deepEqual(
    decidePlayback({ reducedMotion: false, inView: false, state: "paused" }),
    { action: "pause", reason: "off-screen" },
  );
});

test("error blocks play even when in view and ready", () => {
  assert.deepEqual(
    decidePlayback({
      reducedMotion: false,
      inView: true,
      state: "error",
      canPlay: true,
    }),
    { action: "none", reason: "error" },
  );
  assert.deepEqual(
    decidePlayback({
      reducedMotion: false,
      inView: true,
      state: "error",
      canPlay: false,
    }),
    { action: "none", reason: "error" },
  );
});

test("unready media in view defers playback (buffering)", () => {
  assert.deepEqual(
    decidePlayback({
      reducedMotion: false,
      inView: true,
      state: "idle",
      canPlay: false,
    }),
    { action: "none", reason: "buffering" },
  );
  assert.deepEqual(
    decidePlayback({
      reducedMotion: false,
      inView: true,
      state: "playing",
      canPlay: false,
    }),
    { action: "none", reason: "buffering" },
  );
});

test("in view and ready plays", () => {
  assert.deepEqual(
    decidePlayback({
      reducedMotion: false,
      inView: true,
      state: "idle",
      canPlay: true,
    }),
    { action: "play", reason: "in-view" },
  );
  assert.deepEqual(
    decidePlayback({
      reducedMotion: false,
      inView: true,
      state: "paused",
      canPlay: undefined,
    }),
    { action: "play", reason: "in-view" },
  );
});

test("shouldRenderVideoElement gates the video mount", () => {
  assert.equal(shouldRenderVideoElement(true), false);
  assert.equal(shouldRenderVideoElement(false), true);
});

// --- static source assertions ---

test("the playback seam stays JSX- and dependency-free", async () => {
  const source = await read("src/packages/media/playback.ts");
  assert.doesNotMatch(source, /"use client"/);
  assert.doesNotMatch(source, /from\s+["']react["']/);
  assert.doesNotMatch(source, /from\s+["']next[\/\w-]*["']/);
  assert.doesNotMatch(source, /<[A-Za-z]/);
});

test("CinematicImage is a server component: sizes and preload", async () => {
  const image = await read("src/packages/media/CinematicImage.tsx");
  assert.doesNotMatch(image, /"use client"/);
  assert.match(image, /from\s+["']next\/image["']/);
  assert.match(image, /\bsizes\b/);
  assert.match(image, /\bpreload=/);
  assert.doesNotMatch(image, /\bpriority\b/);
  assert.doesNotMatch(image, /\.\.\./);
});

test("CinematicVideo is client-only with intersection playback", async () => {
  const video = await read("src/packages/media/CinematicVideo.tsx");
  assert.match(video, /"use client"/);
  assert.match(video, /IntersectionObserver/);
  assert.match(video, /preload="none"/);
  assert.match(video, /\bmuted\b/);
  assert.match(video, /\bplaysInline\b/);
  assert.match(video, /\bposter\b/);
  assert.match(video, /decidePlayback/);
  assert.match(video, /shouldRenderVideoElement/);
  assert.match(video, /useMotionPreference/);
  assert.match(video, /\.catch\(/);
});

test("the barrel exports the primitives and the pure seam", async () => {
  const index = await read("src/packages/media/index.ts");
  assert.match(index, /export\s*\{\s*CinematicImage\s*\}/);
  assert.match(index, /export\s*\{\s*CinematicVideo\s*\}/);
  assert.match(index, /decidePlayback/);
  assert.match(index, /shouldRenderVideoElement/);
});

test("priority is forbidden anywhere under src/", async () => {
  const files = await listSourceFiles(SRC_DIR);
  assert.ok(files.length > 0, "expected source files to scan");
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, /\bpriority\b/, `found "priority" in ${file}`);
  }
});
