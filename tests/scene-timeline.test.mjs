import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

import {
  HERO_MIN_WIDTH,
  desktopScrubAllowed,
  heroSceneQuery,
} from "../src/packages/motion/scene-conditions.ts";

/*
 * Behavior tests import the pure scene-conditions seam directly (Node type
 * stripping parses `.ts`, mirroring motion/preference.ts); the motion barrel
 * is never imported because it re-exports `.tsx` JSX that Node cannot parse.
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

// --- scene-conditions behavior ---

test("HERO_MIN_WIDTH is the canonical 768px desktop breakpoint", () => {
  assert.equal(HERO_MIN_WIDTH, 768);
});

test("desktopScrubAllowed gates on width and motion preference", () => {
  assert.equal(desktopScrubAllowed(false, 768), true);
  assert.equal(desktopScrubAllowed(false, 1920), true);
  assert.equal(desktopScrubAllowed(true, 1920), false);
  assert.equal(desktopScrubAllowed(false, 767), false);
  assert.equal(desktopScrubAllowed(false, 390), false);
  assert.equal(desktopScrubAllowed(false), true);
  assert.equal(desktopScrubAllowed(true), false);
});

test("heroSceneQuery returns the canonical query or null", () => {
  const query = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
  assert.equal(heroSceneQuery(false, 1440), query);
  assert.equal(heroSceneQuery(false, 768), query);
  assert.equal(heroSceneQuery(true, 1440), null);
  assert.equal(heroSceneQuery(false, 390), null);
  assert.equal(heroSceneQuery(true, 390), null);
});

test("the conditions seam stays JSX- and dependency-free", async () => {
  const source = await read("src/packages/motion/scene-conditions.ts");
  assert.doesNotMatch(source, /"use client"/);
  assert.doesNotMatch(source, /from\s+["']react["']/);
  assert.doesNotMatch(source, /from\s+["']gsap[\/\w-]*["']/);
  assert.doesNotMatch(source, /from\s+["']lenis["']/);
  assert.match(source, /prefers-reduced-motion: no-preference/);
});

// --- SceneTimeline static audit ---

test("SceneTimeline wraps useGSAP and gsap.matchMedia", async () => {
  const scene = await read("src/packages/motion/SceneTimeline.tsx");
  assert.match(scene, /"use client"/);
  assert.match(
    scene,
    /import\s*\{\s*useGSAP\s*\}\s*from\s+["']@gsap\/react["']/,
  );
  assert.match(
    scene,
    /import\s*\{\s*ScrollTrigger\s*\}\s*from\s+["']gsap\/ScrollTrigger["']/,
  );
  assert.match(scene, /gsap\.registerPlugin\(useGSAP,\s*ScrollTrigger\)/);
  assert.match(scene, /gsap\.matchMedia\(/);
  assert.match(scene, /mm\.add\(query,/);
  assert.match(scene, /mm\.revert\(\)/);
  assert.match(scene, /revertOnUpdate:\s*true/);
  assert.doesNotMatch(scene, /ScrollTrigger\.matchMedia/);
});

test("SceneTimeline pins the root and animates descendants only", async () => {
  const scene = await read("src/packages/motion/SceneTimeline.tsx");
  assert.match(scene, /data-scene-timeline/);
  assert.match(scene, /ScrollTrigger\.create\(\{/);
  assert.match(scene, /pin:\s*root/);
  assert.match(scene, /trigger:\s*root/);
  assert.match(scene, /scrub:\s*true/);
  assert.match(scene, /anticipatePin:\s*1/);
  // The only tween target is a descendant attribute selector, never the root.
  assert.match(scene, /gsap\.to\("\[data-parallax\]"/);
  assert.doesNotMatch(scene, /gsap\.to\(root/);
});

test("ScrollTrigger.matchMedia is forbidden anywhere under src/", async () => {
  const files = await listSourceFiles(SRC_DIR);
  assert.ok(files.length > 0, "expected source files to scan");
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(
      source,
      /ScrollTrigger\.matchMedia/,
      `found ScrollTrigger.matchMedia in ${file}`,
    );
  }
});

test("the motion barrel never re-exports SceneTimeline", async () => {
  const index = await read("src/packages/motion/index.ts");
  assert.doesNotMatch(index, /SceneTimeline/);
});

// --- LenisProvider sync audit ---

test("LenisProvider syncs ScrollTrigger and removes the listener", async () => {
  const lenis = await read("src/packages/motion/LenisProvider.tsx");
  assert.match(lenis, /"use client"/);
  assert.match(
    lenis,
    /import\s*\{\s*ScrollTrigger\s*\}\s*from\s+["']gsap\/ScrollTrigger["']/,
  );
  assert.match(lenis, /gsap\.registerPlugin\(ScrollTrigger\)/);
  assert.match(lenis, /ScrollTrigger\.update\(\)/);
  assert.match(lenis, /lenis\.on\("scroll",\s*onScroll\)/);
  assert.match(lenis, /lenis\.off\("scroll",\s*onScroll\)/);
  assert.match(lenis, /autoRaf:\s*true/);
  assert.match(lenis, /destroy\(\)/);
  assert.match(lenis, /isReducedMotion/);
});

// --- page wiring audit ---

test("page.tsx mounts SceneTimeline and stays a server component", async () => {
  const page = await read("src/app/page.tsx");
  assert.match(page, /from\s+["']@\/packages\/motion\/SceneTimeline["']/);
  assert.match(page, /<SceneTimeline>/);
  assert.match(page, /<\/SceneTimeline>/);
  assert.doesNotMatch(page, /"use client"/);
  assert.doesNotMatch(page, /gsap/);
});

test("Hero.tsx carries the parallax copy block for the SceneTimeline tween", async () => {
  const hero = await read("src/packages/hero/Hero.tsx");
  assert.match(hero, /data-parallax/);
  assert.match(hero, /hero-copy/);
});

// --- dependency contract ---

test("@gsap/react is pinned and accepts installed gsap and React", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.equal(pkg.dependencies["@gsap/react"], "2.1.2");
  assert.equal(pkg.dependencies["gsap"], "3.15.0");
  const lock = JSON.parse(await read("package-lock.json"));
  assert.equal(lock.packages[""].dependencies["@gsap/react"], "2.1.2");
  const gsapReact = lock.packages["node_modules/@gsap/react"];
  assert.equal(gsapReact.version, "2.1.2");
  assert.match(gsapReact.peerDependencies.gsap, />=\s*3\.12/);
});
