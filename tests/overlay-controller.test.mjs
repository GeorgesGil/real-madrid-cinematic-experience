import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  closeOnKey,
  createOverlayState,
  isScrollLocked,
  overlayReducer,
  shouldTrapFocus,
} from "../src/packages/overlay/index.ts";

/*
 * Behavior tests import the overlay barrel directly: it re-exports only the
 * pure `.ts` seam, so Node type stripping can parse it and the tests exercise
 * the public entry point (no React/JSX anywhere in the package barrel).
 */
const root = new URL("..", import.meta.url);

function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("createOverlayState starts fully closed with no recorded trigger", () => {
  const state = createOverlayState();
  assert.deepEqual(state, { phase: "closed", returnFocusSelector: null });
  assert.equal(isScrollLocked(state), false);
  assert.equal(shouldTrapFocus(state), false);
});

test("open records the trigger selector and locks scroll and focus", () => {
  const state = overlayReducer(createOverlayState(), {
    type: "open",
    returnFocusSelector: "#menu-trigger",
  });
  assert.equal(state.phase, "open");
  assert.equal(state.returnFocusSelector, "#menu-trigger");
  assert.equal(isScrollLocked(state), true);
  assert.equal(shouldTrapFocus(state), true);
});

test("Escape closes the overlay; other keys are no-ops", () => {
  const open = overlayReducer(createOverlayState(), {
    type: "open",
    returnFocusSelector: "#menu-trigger",
  });
  const escaped = overlayReducer(open, { type: "keydown", key: "Escape" });
  assert.equal(escaped.phase, "closed");
  assert.equal(isScrollLocked(escaped), false);
  assert.equal(shouldTrapFocus(escaped), false);

  const arrowDown = overlayReducer(open, {
    type: "keydown",
    key: "ArrowDown",
  });
  assert.equal(arrowDown, open);
  const tab = overlayReducer(open, { type: "keydown", key: "Tab" });
  assert.equal(tab, open);
  const letter = overlayReducer(open, { type: "keydown", key: "x" });
  assert.equal(letter, open);
});

test("returnFocusSelector is retained after close", () => {
  const open = overlayReducer(createOverlayState(), {
    type: "open",
    returnFocusSelector: "#video-trigger",
  });
  const closed = overlayReducer(open, { type: "close" });
  assert.equal(closed.phase, "closed");
  assert.equal(closed.returnFocusSelector, "#video-trigger");
  const escaped = overlayReducer(open, { type: "keydown", key: "Escape" });
  assert.equal(escaped.phase, "closed");
  assert.equal(escaped.returnFocusSelector, "#video-trigger");
});

test("closeOnKey matches Escape only", () => {
  assert.equal(closeOnKey("Escape"), true);
  assert.equal(closeOnKey("escape"), false);
  assert.equal(closeOnKey("Enter"), false);
  assert.equal(closeOnKey("Tab"), false);
  assert.equal(closeOnKey(""), false);
});

test("the reducer is pure and bails out on no-op transitions", () => {
  const state = Object.freeze(
    overlayReducer(createOverlayState(), {
      type: "open",
      returnFocusSelector: "#trigger",
    }),
  );
  assert.throws(() => {
    state.phase = "closed";
  }, TypeError);
  const before = { ...state };
  const arrowDown = overlayReducer(state, {
    type: "keydown",
    key: "ArrowDown",
  });
  assert.equal(arrowDown, state);
  const openAgain = overlayReducer(state, {
    type: "open",
    returnFocusSelector: "#trigger",
  });
  assert.equal(openAgain, state);
  assert.deepEqual(state, before);
  const closed = overlayReducer(state, { type: "keydown", key: "Escape" });
  assert.deepEqual(closed, {
    phase: "closed",
    returnFocusSelector: "#trigger",
  });
  assert.deepEqual(state, before);
  // Once closed, close and a stray Escape key are both no-ops.
  const closeAgain = overlayReducer(closed, { type: "close" });
  assert.equal(closeAgain, closed);
  const escapeAgain = overlayReducer(closed, {
    type: "keydown",
    key: "Escape",
  });
  assert.equal(escapeAgain, closed);
});

test("the seam stays JSX- and dependency-free for Node type stripping", async () => {
  const source = await read("src/packages/overlay/overlay.ts");
  assert.doesNotMatch(source, /"use client"/);
  assert.doesNotMatch(source, /from\s+["']react["']/);
  assert.doesNotMatch(source, /\bdocument\b/);
  assert.doesNotMatch(source, /\bwindow\b/);
  assert.doesNotMatch(source, /<[A-Za-z]/);
});

test("the hook is client-only and touches document only inside effects", async () => {
  const hook = await read("src/packages/overlay/use-overlay-controller.ts");
  assert.match(hook, /"use client"/);
  assert.match(hook, /useReducer/);
  assert.match(hook, /addEventListener\("keydown"/);
  assert.match(hook, /removeEventListener\("keydown"/);
  assert.match(hook, /dataset\.scrollLocked = ""/);
  assert.match(hook, /delete document\.documentElement\.dataset\.scrollLocked/);
  assert.match(hook, /\.focus\(\)/);
  const beforeFirstEffect = hook.slice(0, hook.indexOf("useEffect("));
  assert.doesNotMatch(beforeFirstEffect, /\bdocument\b/);
  assert.doesNotMatch(beforeFirstEffect, /\bwindow\b/);
});

test("the overlay barrel exports only the seam and documents the deep hook", async () => {
  const index = await read("src/packages/overlay/index.ts");
  assert.match(index, /overlayReducer/);
  assert.match(index, /createOverlayState/);
  assert.match(index, /useOverlayController/);
  assert.doesNotMatch(index, /export\s*\{[^}]*\buseOverlayController\b/);
  assert.doesNotMatch(index, /from\s+["']\.\/use-overlay-controller["']/);
  assert.doesNotMatch(index, /\.tsx/);
});

test("page and layout stay free of player and overlay imports", async () => {
  const page = await read("src/app/page.tsx");
  const layout = await read("src/app/layout.tsx");
  assert.doesNotMatch(page, /from\s+["']@\/packages\/(player|overlay)/);
  assert.doesNotMatch(layout, /from\s+["']@\/packages\/(player|overlay)/);
});
