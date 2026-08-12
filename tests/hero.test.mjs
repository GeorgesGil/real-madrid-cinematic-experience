import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

/*
 * Static audits of the hero package (src/packages/hero/) plus the adapted
 * page wiring. The package is pure composition — inline SVG geometry and one
 * client adapter — so every assertion reads source directly, mirroring the
 * shell/scene-timeline suites; the behavior contract (heroSceneQuery gating)
 * is owned by tests/scene-timeline.test.mjs.
 */
const root = new URL("..", import.meta.url);

function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

const COMPONENTS = [
  "src/packages/hero/Hero.tsx",
  "src/packages/hero/Monogram.tsx",
  "src/packages/hero/ApertureGeometry.tsx",
];

test("all hero geometry is inline SVG with no images or asset imports", async () => {
  const monogram = await read("src/packages/hero/Monogram.tsx");
  const aperture = await read("src/packages/hero/ApertureGeometry.tsx");
  assert.match(monogram, /<svg/);
  assert.match(aperture, /<svg/);
  for (const file of COMPONENTS) {
    const source = await read(file);
    assert.doesNotMatch(source, /<img\b/);
    assert.doesNotMatch(
      source,
      /from\s+["'][^"']*\.(png|jpe?g|webp|avif|gif|svg)["']/,
    );
    assert.doesNotMatch(source, /url\(/);
    assert.doesNotMatch(source, /crest/i);
    assert.doesNotMatch(source, /badge/i);
  }
});

test("decorative layers are aria-hidden and copy renders in reading order first", async () => {
  const monogram = await read("src/packages/hero/Monogram.tsx");
  assert.match(monogram, /aria-hidden="true"/);
  const aperture = await read("src/packages/hero/ApertureGeometry.tsx");
  assert.match(aperture, /aria-hidden="true"/);
  assert.match(aperture, /data-aperture-mask/);

  const hero = await read("src/packages/hero/Hero.tsx");
  assert.doesNotMatch(hero, /"use client"/);
  assert.match(hero, /<h1\b/);
  assert.match(hero, /hero-kicker/);
  assert.match(hero, /data-parallax/);
  const copy = hero.indexOf("hero-copy");
  const apertureNode = hero.indexOf("<ApertureGeometry");
  const monogramNode = hero.indexOf("<Monogram");
  assert.ok(copy > -1, "hero-copy present");
  assert.ok(apertureNode > -1, "<ApertureGeometry present");
  assert.ok(monogramNode > -1, "<Monogram present");
  assert.ok(copy < apertureNode, "copy renders before the aperture mask");
  assert.ok(copy < monogramNode, "copy renders before the monogram");
});

test("ApertureGeometry is the only client geometry component", async () => {
  const aperture = await read("src/packages/hero/ApertureGeometry.tsx");
  const monogram = await read("src/packages/hero/Monogram.tsx");
  assert.match(aperture, /"use client"/);
  assert.doesNotMatch(aperture, /\bdocument\b/);
  assert.doesNotMatch(aperture, /\bwindow\b/);
  assert.doesNotMatch(monogram, /"use client"/);
  assert.doesNotMatch(monogram, /gsap/);
  assert.match(monogram, /RM/);
});

test("geometry scales from viewBoxes with no fixed widths or viewport-unit overflow", async () => {
  const monogram = await read("src/packages/hero/Monogram.tsx");
  const aperture = await read("src/packages/hero/ApertureGeometry.tsx");
  assert.match(monogram, /viewBox="/);
  assert.match(aperture, /viewBox="/);

  const css = await read("src/app/globals.css");
  const heroCss = css.slice(css.indexOf(".hero-frame"));
  assert.match(heroCss, /overflow:\s*hidden/);
  assert.doesNotMatch(heroCss, /100vw/);
  assert.doesNotMatch(heroCss, /width:\s*[1-9]\d*px/);
  assert.match(heroCss, /hero-aperture-svg\s*\{/);
  assert.match(heroCss, /hero-monogram-svg\s*\{/);
});

test("the reveal adapter is a self-contained client deep module", async () => {
  const hook = await read("src/packages/hero/use-aperture-reveal.ts");
  assert.match(hook, /"use client"/);
  assert.match(hook, /heroSceneQuery/);
  assert.match(hook, /useMotionPreference/);
  assert.match(hook, /isReducedMotion/);
  assert.match(hook, /gsap\.matchMedia\(/);
  assert.match(hook, /mm\.add\(query,/);
  assert.match(hook, /mm\.revert\(\)/);
  assert.match(hook, /revertOnUpdate:\s*true/);
  assert.match(hook, /gsap\.timeline\(/);
  assert.match(hook, /\[data-aperture-mask\]/);
  assert.doesNotMatch(hook, /ScrollTrigger\.matchMedia/);
  assert.doesNotMatch(hook, /from\s+["']gsap\/ScrollTrigger["']/);
  assert.doesNotMatch(hook, /scrollTrigger/i);
  const beforeHook = hook.slice(0, hook.indexOf("useGSAP("));
  assert.doesNotMatch(beforeHook, /\bdocument\b/);
  assert.doesNotMatch(beforeHook, /\bwindow\b/);
});

test("the reveal no-ops before creating any GSAP context when the query is null", async () => {
  const hook = await read("src/packages/hero/use-aperture-reveal.ts");
  const nullIndex = hook.indexOf("query === null");
  const mmIndex = hook.indexOf("gsap.matchMedia(");
  assert.ok(nullIndex > -1, "null-query guard present");
  assert.ok(mmIndex > -1, "gsap.matchMedia present");
  assert.ok(nullIndex < mmIndex, "guard runs before any matchMedia context");
  assert.match(hook, /if\s*\(query === null\)\s*\{/);
  assert.match(hook, /return;/);
});

test("client adapters stay single-export for the react-refresh rule", async () => {
  const hook = await read("src/packages/hero/use-aperture-reveal.ts");
  const aperture = await read("src/packages/hero/ApertureGeometry.tsx");
  for (const source of [hook, aperture]) {
    assert.doesNotMatch(source, /export\s*\{/);
  }
  assert.match(hook, /export function useApertureReveal/);
  assert.match(aperture, /export function ApertureGeometry/);
});

test("the hero barrel exports server components only and documents deep adapters", async () => {
  const index = await read("src/packages/hero/index.ts");
  assert.match(index, /export\s*\{\s*Hero\s*\}\s*from\s+["']\.\/Hero\.tsx["']/);
  assert.match(
    index,
    /export\s*\{\s*Monogram\s*\}\s*from\s+["']\.\/Monogram\.tsx["']/,
  );
  assert.match(index, /useApertureReveal/);
  assert.match(index, /ApertureGeometry/);
  assert.doesNotMatch(index, /export\s*\{[^}]*\bApertureGeometry\b/);
  assert.doesNotMatch(index, /export\s*\{[^}]*\buseApertureReveal\b/);
  assert.doesNotMatch(index, /from\s+["']\.\/use-aperture-reveal["']/);
  assert.doesNotMatch(index, /from\s+["']\.\/ApertureGeometry["']/);
});

test("reduced motion keeps the static mask composition", async () => {
  const css = await read("src/app/globals.css");
  assert.match(
    css,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.hero-aperture/,
  );
  assert.match(css, /transform:\s*none\s*!important/);
  assert.match(css, /opacity:\s*1\s*!important/);
});

test("page deep-imports Hero inside SceneTimeline and keeps the server boundary", async () => {
  const page = await read("src/app/page.tsx");
  assert.match(page, /from\s+["']@\/packages\/hero\/Hero["']/);
  assert.match(page, /<Hero \/>/);
  assert.match(page, /<SceneTimeline>/);
  assert.match(page, /<\/SceneTimeline>/);
  assert.doesNotMatch(page, /"use client"/);
  assert.doesNotMatch(page, /gsap/);
  assert.doesNotMatch(page, /<SceneFrame/);
  assert.doesNotMatch(page, /<Container/);
});
