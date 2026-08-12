import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createIntroCompleteSignal,
  createIntroState,
  introReducer,
  isIntroComplete,
  shouldPlayIntro,
} from "../src/packages/intro/index.ts";

/*
 * Behavior tests import the intro barrel directly: it re-exports only the
 * pure `.ts` seam, so Node type stripping can parse it and the tests exercise
 * the public entry point (no React/JSX anywhere in the package barrel).
 */
const root = new URL("..", import.meta.url);

function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("createIntroState starts in the loading phase", () => {
  const state = createIntroState();
  assert.deepEqual(state, { phase: "loading" });
  assert.equal(isIntroComplete(state), false);
});

test("ready advances loading to ready and bails out once ready or complete", () => {
  const ready = introReducer(createIntroState(), { type: "ready" });
  assert.equal(ready.phase, "ready");
  assert.equal(isIntroComplete(ready), false);

  const readyAgain = introReducer(ready, { type: "ready" });
  assert.equal(readyAgain, ready);

  const completed = introReducer(ready, { type: "complete" });
  assert.equal(completed.phase, "complete");
  const readyAfterComplete = introReducer(completed, { type: "ready" });
  assert.equal(readyAfterComplete, completed);
});

test("skip finishes the intro from loading or ready and is a no-op once complete", () => {
  const fromLoading = introReducer(createIntroState(), { type: "skip" });
  assert.equal(fromLoading.phase, "complete");
  assert.equal(isIntroComplete(fromLoading), true);

  const ready = introReducer(createIntroState(), { type: "ready" });
  const fromReady = introReducer(ready, { type: "skip" });
  assert.equal(fromReady.phase, "complete");

  const again = introReducer(fromReady, { type: "skip" });
  assert.equal(again, fromReady);
});

test("complete finishes the intro from loading or ready and bails out once complete", () => {
  const fromLoading = introReducer(createIntroState(), { type: "complete" });
  assert.equal(fromLoading.phase, "complete");
  assert.equal(isIntroComplete(fromLoading), true);

  const ready = introReducer(createIntroState(), { type: "ready" });
  const fromReady = introReducer(ready, { type: "complete" });
  assert.equal(fromReady.phase, "complete");

  const again = introReducer(fromReady, { type: "complete" });
  assert.equal(again, fromReady);
});

test("the reducer is pure and never mutates its inputs", () => {
  const state = Object.freeze(createIntroState());
  assert.throws(() => {
    state.phase = "ready";
  }, TypeError);
  const before = { ...state };
  const ready = introReducer(state, { type: "ready" });
  assert.deepEqual(state, before);
  const skipped = introReducer(state, { type: "skip" });
  assert.equal(skipped.phase, "complete");
  assert.deepEqual(state, before);
  const completed = introReducer(skipped, { type: "complete" });
  assert.equal(completed, skipped);
  assert.deepEqual(state, before);
});

test("shouldPlayIntro allows the trace only when motion is allowed", () => {
  assert.equal(shouldPlayIntro(true), false);
  assert.equal(shouldPlayIntro(false), true);
});

test("createIntroCompleteSignal starts uncompleted and latches on emit", () => {
  const signal = createIntroCompleteSignal();
  assert.equal(signal.read(), false);
  signal.emit();
  assert.equal(signal.read(), true);
});

test("emit notifies subscribers once the completion latches", () => {
  const signal = createIntroCompleteSignal();
  let notified = 0;
  signal.subscribe(() => {
    notified += 1;
  });
  signal.emit();
  assert.equal(notified, 1);
  assert.equal(signal.read(), true);
});

test("unsubscribe stops further notifications", () => {
  const signal = createIntroCompleteSignal();
  let notified = 0;
  const unsubscribe = signal.subscribe(() => {
    notified += 1;
  });
  unsubscribe();
  signal.emit();
  assert.equal(notified, 0);
  assert.equal(signal.read(), true);
});

test("emit is idempotent and late subscribers see the latched value", () => {
  const signal = createIntroCompleteSignal();
  let first = 0;
  let second = 0;
  signal.subscribe(() => {
    first += 1;
  });
  signal.emit();
  signal.emit();
  signal.subscribe(() => {
    second += 1;
  });
  signal.emit();
  assert.equal(first, 1, "listener notified exactly once");
  assert.equal(second, 0, "late listener is not notified for past emission");
  assert.equal(signal.read(), true);
});

test("signal instances are independent", () => {
  const a = createIntroCompleteSignal();
  const b = createIntroCompleteSignal();
  a.emit();
  assert.equal(a.read(), true);
  assert.equal(b.read(), false);
  b.emit();
  assert.equal(b.read(), true);
});

test("the intro-complete signal seam stays JSX- and DOM-free for Node stripping", async () => {
  const source = await read("src/packages/intro/intro-signal.ts");
  assert.doesNotMatch(source, /"use client"/);
  assert.doesNotMatch(source, /from\s+["']react["']/);
  assert.doesNotMatch(source, /\bdocument\b/);
  assert.doesNotMatch(source, /\bwindow\b/);
  assert.doesNotMatch(source, /<[A-Za-z]/);
  assert.match(source, /export function createIntroCompleteSignal/);
  assert.match(source, /export const introCompleteSignal/);
});

test("the seam stays JSX- and dependency-free for Node type stripping", async () => {
  const source = await read("src/packages/intro/intro.ts");
  assert.doesNotMatch(source, /"use client"/);
  assert.doesNotMatch(source, /from\s+["']react["']/);
  assert.doesNotMatch(source, /\bdocument\b/);
  assert.doesNotMatch(source, /\bwindow\b/);
  assert.doesNotMatch(source, /<[A-Za-z]/);
});

test("the adapter is client-only and touches document/window only inside effects", async () => {
  const adapter = await read("src/packages/intro/CinematicIntro.tsx");
  assert.match(adapter, /"use client"/);
  assert.match(adapter, /useReducer/);
  assert.match(adapter, /useMotionPreference/);
  assert.match(adapter, /addEventListener\("keydown"/);
  assert.match(adapter, /removeEventListener\("keydown"/);
  assert.match(adapter, /\.focus\(\)/);
  assert.match(adapter, /#main/);
  assert.match(adapter, /Skip intro/);
  assert.match(adapter, /shouldPlayIntro/);
  assert.match(adapter, /isReducedMotion/);
  const beforeFirstEffect = adapter.slice(0, adapter.indexOf("useEffect("));
  assert.doesNotMatch(beforeFirstEffect, /\bdocument\b/);
  assert.doesNotMatch(beforeFirstEffect, /\bwindow\b/);
});

test("CinematicIntro publishes the completion signal on the dismiss animation end", async () => {
  const adapter = await read("src/packages/intro/CinematicIntro.tsx");
  assert.match(adapter, /introCompleteSignal\.emit\(\)/);
  assert.match(adapter, /addEventListener\("animationend"/);
  assert.match(adapter, /removeEventListener\("animationend"/);
  assert.match(adapter, /event\.animationName === "cinematic-intro-dismiss"/);
  assert.match(adapter, /dispatch\(\{ type: "complete" \}\)/);
  assert.match(adapter, /ref=\{rootRef\}/);
});

test("the intro-complete adapter is a single-export client deep module", async () => {
  const adapter = await read("src/packages/intro/use-intro-complete.ts");
  assert.match(adapter, /"use client"/);
  assert.match(adapter, /useSyncExternalStore/);
  assert.match(adapter, /introCompleteSignal/);
  assert.match(adapter, /export function useIntroComplete/);
  assert.doesNotMatch(adapter, /export\s*\{/);
  assert.doesNotMatch(adapter, /\bdocument\b/);
  assert.doesNotMatch(adapter, /\bwindow\b/);
  assert.doesNotMatch(adapter, /useEffect/);
});

test("the intro barrel exports only the seam and documents the deep adapter", async () => {
  const index = await read("src/packages/intro/index.ts");
  assert.match(index, /introReducer/);
  assert.match(index, /createIntroState/);
  assert.match(index, /shouldPlayIntro/);
  assert.match(index, /isIntroComplete/);
  assert.match(index, /CinematicIntro/);
  assert.doesNotMatch(index, /export\s*\{[^}]*\bCinematicIntro\b/);
  assert.doesNotMatch(index, /from\s+["']\.\/CinematicIntro["']/);
  assert.doesNotMatch(index, /\.tsx/);
});

test("the barrel exports the completion signal seam but never the client adapter", async () => {
  const index = await read("src/packages/intro/index.ts");
  assert.match(index, /createIntroCompleteSignal/);
  assert.match(index, /introCompleteSignal/);
  assert.match(index, /IntroCompleteSignal/);
  assert.match(index, /use-intro-complete/);
  assert.doesNotMatch(index, /export\s*\{[^}]*\buseIntroComplete\b/);
  assert.doesNotMatch(index, /from\s+["']\.\/use-intro-complete["']/);
});

test("page mounts the intro adapter before the stable hero and keeps guard regexes", async () => {
  const page = await read("src/app/page.tsx");
  assert.match(page, /from\s+["']@\/packages\/intro\/CinematicIntro["']/);
  assert.match(page, /<CinematicIntro \/>/);
  assert.match(page, /<SceneTimeline>/);
  assert.match(page, /<\/SceneTimeline>/);
  assert.doesNotMatch(page, /from\s+["']@\/packages\/(player|overlay)/);
  assert.doesNotMatch(page, /"use client"/);
  assert.doesNotMatch(page, /gsap/);
});

test("layout gains the focusable main landmark and stays free of player/overlay imports", async () => {
  const layout = await read("src/app/layout.tsx");
  assert.match(layout, /<main\s+id="main"\s+tabIndex=\{-1\}>/);
  assert.doesNotMatch(layout, /from\s+["']@\/packages\/(player|overlay)/);
});

test("globals.css styles the intro layer, trace, and reduced-motion fade", async () => {
  const css = await read("src/app/globals.css");
  assert.match(css, /\.cinematic-intro\s*\{/);
  assert.match(css, /cinematic-intro-trace/);
  assert.match(css, /cinematic-intro-dismiss/);
  assert.match(css, /animation-fill-mode:\s*forwards/);
  assert.match(css, /visibility:\s*hidden/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /overflow:\s*hidden/);
  assert.match(css, /\.cinematic-intro\[data-trace="false"\]/);
  assert.match(css, /180ms/);
  assert.match(css, /\.cinematic-intro-skip\s*\{/);
});
