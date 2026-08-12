# Phase 2A validation — CinematicIntro package and wiring evidence

## Static conformance audit (implementation phase)

Audited the new package and wiring file by file against issue #36 scope:

| Check | Result |
| --- | --- |
| `src/packages/intro/intro.ts` — pure seam: no `"use client"`, no React/JSX/`document`/`window`/GSAP imports; importable by `node --test` type stripping (mirrors `overlay/overlay.ts`) | Pass |
| `IntroPhase = "loading" \| "ready" \| "complete"`; `IntroState { phase }`; `IntroAction = ready \| skip \| complete`; `createIntroState()` → `{ phase: "loading" }` | Pass |
| `introReducer` no-op bails (same state reference, `useReducer` bail-out): `ready` from `ready`/`complete`; `skip` from `complete`; `complete` from `complete`; `skip`/`complete` valid from `loading` and `ready` | Pass |
| `shouldPlayIntro(reducedMotion)` → `!reducedMotion` (opening contract: trace only when motion allowed, else immediate static mark ≤200ms fade) | Pass |
| `isIntroComplete(state)` helper for the adapter | Pass |
| `src/packages/intro/index.ts` — barrel exports only the pure seam; header comment documents the deep `CinematicIntro` adapter but never re-exports it; no `.tsx` (ADR 0002 §1, overlay precedent) | Pass |
| `src/packages/intro/CinematicIntro.tsx` — `"use client"`; single export; `useReducer(introReducer, undefined, createIntroState)`; `useMotionPreference()` deep motion import; all `document`/`window` access inside effects only | Pass |
| Static crest/mark markup always rendered in SSR HTML; decorative parts `aria-hidden="true"` | Pass |
| Visible, keyboard-reachable `Skip intro` button dispatching `skip`; window `keydown` listener dispatching `skip` on `Escape` only, with symmetric removal | Pass |
| CSS-only trace animation (no GSAP/ScrollTrigger — zero new deps) gated on `shouldPlayIntro(isReducedMotion(preference))`; `animation-fill-mode: forwards` ends at `visibility: hidden; opacity: 0; pointer-events: none` so the layer self-dismisses without JS | Pass |
| On `complete`, effect focuses `#main`; the mark node returns `null` in the same commit so handoff happens after removal | Pass |
| `layout.tsx` — `<main id="main" tabIndex={-1}>` enables the programmatic focus handoff | Pass |
| `page.tsx` — deep-imports `CinematicIntro` from `@/packages/intro/CinematicIntro` and renders it before `<SceneTimeline>`; stable hero and SSR content untouched (enhancement, never a blocker) | Pass |
| `globals.css` — `.cinematic-intro` layer (fixed inset-0, ink background, `overflow: hidden`), crest mark, skip-button styles, trace keyframes, and an explicit reduced-motion rule (immediate static mark, ≤180ms fade) overriding the global collapse block | Pass |
| Existing suites: `tests/shell.test.mjs` landmark regex adapted from `/<main id="main">/` to `/<main\s+id="main"[^>]*>/` so the `tabIndex` addition keeps the main-landmark assertion passing (one-character-class change, intent preserved) | Pass |
| Overlay/player-free page/layout guard regex (`@\/packages\/(player|overlay)`) still passes — intro wiring cannot collide with it | Pass |
| Diff scope: only `src/packages/intro/`, `src/app/{page,layout,globals}`, `tests/`, and `docs/` — no `.github/`, `.agents/`, configs, credentials, or workflows changed | Pass |

## Reducer behavior (locked by tests)

`tests/intro.test.mjs` — imports the intro **barrel**:

| Transition | Result |
| --- | --- |
| `createIntroState()` | `{ phase: "loading" }`; `isIntroComplete` false |
| `ready` from loading | `phase: "ready"` |
| `ready` from ready / complete | no-op (same state reference) |
| `skip` from loading / ready | `phase: "complete"` |
| `skip` from complete | no-op (same state reference) |
| `complete` from loading / ready | `phase: "complete"` |
| `complete` from complete | no-op (same state reference) |
| `shouldPlayIntro(true)` / `shouldPlayIntro(false)` | `false` / `true` |
| any transition | input state never mutated; no-op transitions bail out |

## Formatting note (format:check risk)

New files are written Prettier-canonical from the start: printWidth 80,
double quotes, trailing commas. The `data-trace` ternary and the SVG attribute
lists are left in the multiline form Prettier produces; long string literals
(the star path `d`) are unbroken.

## Acceptance gates

| Gate | Status |
| --- | --- |
| `npm test` (baseline + content + shell + motion + media + scene-timeline + player-story + overlay-controller + intro) — barrel import proves the public-entry-point requirement | Pending validation workflow |
| `npm run typecheck` — `tsc --noEmit` strict over the seam, adapter, and wiring | Pending validation workflow |
| `npm run lint` (typecheck + eslint + `next build`) — watch `react-refresh/only-export-components` on the single-export client file (precedent: overlay/motion adapters pass) | Pending validation workflow |
| `npm run format:check` | Static pass expected; canonical form applied above — final output recorded by validation workflow |

The implementation phase could not execute commands; the workflow stage after
editing records the actual command output here.

## Build output and bundles

To be recorded by the validation workflow:

- `next build` final summary (routes, first load JS, CSS size).
- The home route gains the small intro client chunk (CSS-only animation, no
  `gsap`/`ScrollTrigger`); confirm route-JS totals stay under the 300 KB
  budget in `docs/performance-budget.md`.
- Console warnings during build (expected: none).

## Deferred browser QA matrix

No browser automation runs in the implementation phase; the matrix below is
the offline record for the validation workflow:

| Viewport | Static mark in SSR HTML (JS off) | Layer self-dismisses via CSS animation | No horizontal overflow |
| --- | --- | --- | --- |
| 1920×1080 |  |  |  |
| 1440×900 |  |  |  |
| 390×844 |  |  |  |
| 430×932 |  |  |  |

Deferred interaction checks:

- `Skip intro` button and `Escape` both finish the intro and hand focus to
  `#main` (keyboard reachable, visible control).
- Under `prefers-reduced-motion: reduce`: immediate static mark, ≤200ms fade,
  layer removed from the accessibility tree via `visibility: hidden`.
- With JavaScript disabled: layer hides via the CSS `forwards` end state;
  content reachable; skip link still works for keyboard users.
- Trace animation runs only with motion allowed and holds a static end state
  (no lingering pointer-events on the dismissed layer).

## Risks and mitigations

- **JS-off reachability:** mitigated by CSS-only self-dismissal (`forwards`
  to `visibility: hidden` + `pointer-events: none`) plus the existing
  `SkipLink`; statically guarded in tests.
- **Focus-handoff ordering:** mitigated by an effect keyed on the `complete`
  phase with the node returning `null` in the same commit; `#main` carries
  `tabIndex={-1}`; statically guarded in tests, browser behavior recorded in
  the deferred QA matrix.
- **ESLint `react-refresh/only-export-components`:** single-export client
  file; existing precedent passes (overlay/motion adapters).
- **Existing guard conflict:** the overlay test's page/layout regex only
  forbids `player|overlay` imports, so the intro wiring cannot break it; the
  new audit regexes coexist. The shell landmark regex was adapted minimally
  for the `tabIndex` addition.
- **Reduced-motion fade vs global collapse:** the explicit intro rule uses
  `!important` + a higher-specificity selector to keep the ≤200ms fade
  perceptible while every other animation still collapses.
- **Scope discipline:** no `.github/`, `.agents/`, configs, credentials, or
  workflow changes; diff limited to `src/packages/intro/`,
  `src/app/{page,layout,globals}`, `tests/`, and `docs/`.

## Evidence note

GitHub writes are unavailable in this phase.

- Issue #36 comment: gates passed; intro package complete; home route gains
  the small intro client chunk.
- Per `docs/agents/issue-tracker.md`, this document is the offline record.
- The final handoff reports the intended issue update.
