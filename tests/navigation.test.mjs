import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { scenes } from "../src/packages/content/index.ts";

/*
 * Phase 2C navigation behavior: trigger semantics, overlay–seam integration,
 * Escape ownership, scroll lock, focus restoration, and the no-dead-links
 * rule between the menu overlay and the home-page scene sections.
 */
const root = new URL("..", import.meta.url);

function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

const NARRATIVE_ORDER = [
  "crest",
  "bernabeu",
  "team",
  "european-royalty",
  "history",
  "moments",
  "future",
];

test("scenes is the single source for exactly seven chapters in narrative order", () => {
  assert.equal(scenes.length, 7);
  assert.deepEqual(
    scenes.map((scene) => scene.id),
    NARRATIVE_ORDER,
  );
});

test("the menu trigger carries labelled disclosure semantics bound to open", async () => {
  const overlay = await read("src/packages/ui/MenuOverlay.tsx");
  assert.match(overlay, /id="menu-trigger"/);
  assert.match(overlay, /type="button"/);
  assert.match(overlay, /aria-label="Menu"/);
  assert.match(overlay, /aria-controls="menu-overlay"/);
  assert.match(overlay, /aria-expanded=\{open\}/);
});

test("the overlay dialog is a labelled modal rendering the seven chapters", async () => {
  const overlay = await read("src/packages/ui/MenuOverlay.tsx");
  assert.match(overlay, /id="menu-overlay"/);
  assert.match(overlay, /role="dialog"/);
  assert.match(overlay, /aria-modal="true"/);
  assert.match(overlay, /aria-label="Chapters"/);
  assert.match(overlay, /scenes\.map\(/);
});

test("the overlay consumes the seam via deep import with the trigger as return target", async () => {
  const overlay = await read("src/packages/ui/MenuOverlay.tsx");
  assert.match(
    overlay,
    /from\s+["']@\/packages\/overlay\/use-overlay-controller["']/,
  );
  assert.match(overlay, /useOverlayController\(\{/);
  assert.match(overlay, /containerRef/);
  assert.match(overlay, /returnFocusSelector:\s*"#menu-trigger"/);
  assert.match(overlay, /useRef/);
  assert.match(overlay, /useState/);
});

test("Escape ownership stays with the seam: MenuOverlay registers no keydown listener", async () => {
  const overlay = await read("src/packages/ui/MenuOverlay.tsx");
  assert.doesNotMatch(overlay, /addEventListener/);
  assert.doesNotMatch(overlay, /removeEventListener/);
});

test("focus moves into the dialog on open and restores to the trigger selector", async () => {
  const overlay = await read("src/packages/ui/MenuOverlay.tsx");
  assert.match(overlay, /useEffect\(/);
  assert.match(overlay, /containerRef\.current\?\.focus\(\)/);
  const hook = await read("src/packages/overlay/use-overlay-controller.ts");
  assert.match(hook, /returnFocusSelector/);
  assert.match(hook, /querySelector<HTMLElement>\(/);
});

test("scroll lock is wired end-to-end and never gated behind reduced motion", async () => {
  const css = await read("src/app/globals.css");
  const hook = await read("src/packages/overlay/use-overlay-controller.ts");
  assert.match(hook, /dataset\.scrollLocked = ""/);
  assert.match(css, /html\[data-scroll-locked\]\s*\{/);
  assert.match(css, /overflow:\s*hidden/);
  const scrollLockRule = css.indexOf("html[data-scroll-locked]");
  const firstMediaQuery = css.indexOf("@media (");
  assert.ok(scrollLockRule >= 0);
  assert.ok(scrollLockRule < firstMediaQuery);
});

test("every chapter anchor resolves to a rendered section id via the shared fixture", async () => {
  const overlay = await read("src/packages/ui/MenuOverlay.tsx");
  const page = await read("src/app/page.tsx");
  // Both files derive their anchors/ids from the same `scenes` import, so the
  // seven hrefs (#<scene.id>) and the seven section ids (<scene.id>) can
  // never diverge (ADR 0001 no-dead-links rule).
  assert.match(overlay, /from\s+["']@\/packages\/content["']/);
  assert.match(page, /from\s+["']@\/packages\/content["']/);
  assert.match(overlay, /scenes\.map\(/);
  assert.match(page, /scenes\.map\(/);
  assert.match(overlay, /href=\{\`#\$\{scene\.id\}\`\}/);
  assert.match(page, /id=\{scene\.id\}/);
  for (const scene of scenes) {
    assert.ok(
      NARRATIVE_ORDER.includes(scene.id),
      `scene ${scene.id} must be in narrative order`,
    );
  }
});

test("MenuOverlay is a single-export client component outside the ui barrel", async () => {
  const overlay = await read("src/packages/ui/MenuOverlay.tsx");
  assert.match(overlay, /"use client"/);
  const exportMatches = overlay.match(/^export\b/gm);
  assert.equal(exportMatches?.length, 1);
  const index = await read("src/packages/ui/index.ts");
  assert.doesNotMatch(index, /MenuOverlay/);
  // The render stays SSR-safe: no document/window access before the first
  // effect (ADR 0002 §2).
  const beforeFirstEffect = overlay.slice(0, overlay.indexOf("useEffect("));
  assert.doesNotMatch(beforeFirstEffect, /\bdocument\b/);
  assert.doesNotMatch(beforeFirstEffect, /\bwindow\b/);
});
