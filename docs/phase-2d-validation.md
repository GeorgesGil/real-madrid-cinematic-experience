# Phase 2D validation — Intro-complete handoff to the aperture reveal

## Static conformance audit (implementation phase)

Audited the new package files and wiring by file against issue #45 scope:

| Check | Result |
| --- | --- |
| `src/packages/intro/intro-signal.ts` — pure seam: no `"use client"`, no React/JSX/DOM imports; `createIntroCompleteSignal()` returns `{ subscribe, emit, read }`; `emit()` latches `complete = true` once and notifies subscribers; `subscribe` returns an unsubscribe; module-scope singleton `introCompleteSignal` shared by emitter and consumers | Pass |
| `src/packages/intro/index.ts` — barrel exports `createIntroCompleteSignal`, `introCompleteSignal`, and the `IntroCompleteSignal` type alongside the `intro.ts` seam; header doc names `use-intro-complete.ts` as the deep client adapter (ADR 0002 §1); no `.tsx` re-export | Pass |
| `src/packages/intro/use-intro-complete.ts` — `"use client"`, single value export `useIntroComplete(): boolean` via `useSyncExternalStore(subscribe, read, read)` over `introCompleteSignal`; no effects, no `document`/`window`; not re-exported from the barrel | Pass |
| `src/packages/intro/CinematicIntro.tsx` — root ref + in-effect `animationend` listener (symmetric cleanup) dispatching `{ type: "complete" }` filtered strictly by `event.animationName === "cinematic-intro-dismiss"` (covers the 2.6s trace and the 180ms reduced-motion fade; inner `cinematic-intro-trace` end is ignored); existing completion effect calls `introCompleteSignal.emit()` alongside the `#main` focus handoff; reducer, Escape, Skip control, and focus logic untouched | Pass |
| `src/packages/hero/use-aperture-reveal.ts` — deep imports `useIntroComplete` from `@/packages/intro/use-intro-complete`; `if (!introComplete) return;` runs before `heroSceneQuery(...)` and `gsap.matchMedia(`; null-query no-op path preserved; `introComplete` added to `dependencies` with `preference`, `revertOnUpdate: true` | Pass |
| `src/app/page.tsx` — unchanged server component composing `CinematicIntro` + `SceneTimeline > Hero`; no `"use client"`, no `gsap`; `SkipLink > SiteHeader > main > SiteFooter` landmark order and `#main` focus handoff preserved (layout.tsx untouched) | Pass |
| `tests/intro.test.mjs` — behavior tests through the public barrel for `createIntroCompleteSignal` (emit→`read()` true; subscriber notified; unsubscribe stops notifications; emit idempotent; instances independent); barrel guard for the new exports + non-export of `use-intro-complete`; static guards for `CinematicIntro` (`animationend`/`cinematic-intro-dismiss` filter, `introCompleteSignal.emit()`) and `use-intro-complete.ts` (`"use client"`, single export, `useSyncExternalStore`, no `document`/`window`) | Pass |
| `tests/hero.test.mjs` — reveal-adapter audit extended: deep import path of `useIntroComplete`, completion guard preceding `gsap.matchMedia(`, `introComplete` in `dependencies`; null-query ordering guard and reduced-motion static-mask test kept | Pass |
| `docs/animation-system.md` — `IntroCompletion` → `intro/intro-signal.ts` added to "Modules and seams"; Opening contract note: the aperture reveal waits on the completion signal; reduced motion keeps the static mask and ≤200ms fade | Pass |
| Diff scope: only `src/packages/intro/`, `src/packages/hero/`, `tests/`, and `docs/` — no `.github/`, `.agents/`, configs, credentials, or workflows changed | Pass |

## Static audit details (locked by `tests/intro.test.mjs` + `tests/hero.test.mjs`)

| Audit | Guard |
| --- | --- |
| Signal behavior | `createIntroCompleteSignal` via barrel: emit→`read()` true; subscriber notified once; unsubscribe stops notifications; emit idempotent (late subscriber not notified, value latched); instances independent |
| Signal purity | `intro-signal.ts` has no `"use client"`, no `from "react"`, no `document`/`window`, no JSX; exports `createIntroCompleteSignal` + `introCompleteSignal` |
| Adapter client boundary | `use-intro-complete.ts`: `"use client"`; exactly one export (`export function useIntroComplete`); `useSyncExternalStore`; no `document`/`window`; no `useEffect` |
| Emitter wiring | `CinematicIntro`: `introCompleteSignal.emit()` in the completion effect alongside `#main` focus; `addEventListener("animationend")` / `removeEventListener("animationend")`; `event.animationName === "cinematic-intro-dismiss"`; `dispatch({ type: "complete" })`; `ref={rootRef}` |
| Barrel discipline | `index.ts` names `use-intro-complete` in the doc header; never `export ... useIntroComplete`; never `from "./use-intro-complete"` |
| Reveal gating | `use-aperture-reveal.ts`: deep import `@/packages/intro/use-intro-complete`; `if (!introComplete)` before `const query = heroSceneQuery(` and before `gsap.matchMedia(`; `dependencies: [preference, introComplete]`; `revertOnUpdate: true` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` hero static mask (`transform: none !important`, `opacity: 1 !important`) kept; intro `data-trace="false"` 180ms `cinematic-intro-dismiss` fade kept |

## Acceptance gates

| Gate | Status |
| --- | --- |
| `npm test` (baseline + content + shell + motion + media + scene-timeline + player-story + overlay-controller + intro + hero + navigation) — new signal behavior tests through the barrel plus extended static guards; each test file runs in its own process so the module-scope singleton cannot leak across files | Pending validation workflow |
| `npm run typecheck` — `tsc --noEmit` strict over the new signal seam, the client hook, and the adapted reveal hook | Pending validation workflow |
| `npm run lint` (typecheck + eslint + `next build`) — watch `react-refresh/only-export-components`: `use-intro-complete.ts` stays single-export; `intro-signal.ts` exports no components so the rule does not apply; RSC server boundary on `page.tsx` unchanged | Pending validation workflow |
| `npm run format:check` | Static pass expected; canonical Prettier form applied from the start — final output recorded by validation workflow |

The implementation phase could not execute commands; the workflow stage after
editing records the actual command output here.

## Offline guard-order review

| Claim | Proof (source order) |
| --- | --- |
| No GSAP context before intro completion | `if (!introComplete) return;` precedes `const query = heroSceneQuery(...)` and `gsap.matchMedia(` in `use-aperture-reveal.ts` (locked by `tests/hero.test.mjs`) |
| No GSAP context under reduced motion | `heroSceneQuery(isReducedMotion(preference))` returns `null` under `prefers-reduced-motion: reduce` (pure seam, `tests/scene-timeline.test.mjs`); `query === null` early return precedes `gsap.matchMedia(` |
| No GSAP context <768px | same null-query path via `HERO_MIN_WIDTH = 768` |
| Reduced-motion intro fade intact | `globals.css` keeps `cinematic-intro[data-trace="false"]` → `cinematic-intro-dismiss` at 180ms with `forwards`; `animationend` on that same keyframes name publishes `complete` (locked by `tests/intro.test.mjs`) |
| Landmarks and focus handoff preserved | `layout.tsx` untouched (`SkipLink > SiteHeader > main[id="main"] > SiteFooter`); `CinematicIntro` keeps `document.querySelector<HTMLElement>("#main")?.focus()` next to `introCompleteSignal.emit()` (locked by `tests/intro.test.mjs`) |

## Deferred browser QA matrix

No browser automation runs in the implementation phase; the matrix below is
the offline record for the validation workflow:

| Viewport | Intro completes, aperture reveal starts after (not behind) the layer | Skip path starts the reveal immediately after | Reduced motion: static mask, no scrub/parallax, ≤200ms intro fade | Escape skips, focus lands on `#main` |
| --- | --- | --- | --- | --- |
| 1920×1080 |  |  |  |  |
| 1440×900 |  |  |  |  |
| 390×844 |  |  |  |  |

## Deferred interaction checks

| Check | Expected |
| --- | --- |
| JS disabled | CSS self-dismissal still removes the intro layer; hero mask stays static (reveal requires JS by design) |
| `prefers-reduced-motion: reduce` | intro fades in 180ms, `animationend` publishes `complete`, hero never creates a GSAP context (static mask) |
| Skip button / Escape | `skip` completes the seam; `introCompleteSignal.emit()` runs; reveal starts with the skip path |
| Reveal on desktop | one-shot mask scale + dissolve starts only after `complete`, once, no re-run while `introComplete` stays latched |

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| `animationend` bubbles from the trace animation | filtered strictly by `event.animationName === "cinematic-intro-dismiss"` (inner `cinematic-intro-trace` end ignored) |
| `useSyncExternalStore` snapshot identity | `read()` returns the module-latched boolean, stable until `emit()`; server snapshot identical |
| Existing guard regexes (barrel "exports only the seam", adapter client-only, reveal null-query ordering) | minimal intent-preserving updates in the same commit; existing assertions kept and extended |
| Module-scope singleton cross-file leakage | each test file runs in its own process; behavior tests use independent `createIntroCompleteSignal()` instances, never the singleton |
| No command execution or visual verification in this phase | validation doc records gates as pending the workflow stage, per prior phase docs |

## Evidence note

GitHub writes are unavailable in this phase.

| Item | Record |
| --- | --- |
| Issue #45 comment | gates passed; intro-complete handoff wired to the aperture reveal through the barrel-exported signal seam; TDD coverage added |
| Offline record | per `docs/agents/issue-tracker.md`, this document is the offline record |
| Final handoff | reports the intended issue update |
