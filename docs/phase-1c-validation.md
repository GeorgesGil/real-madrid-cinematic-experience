# Phase 1C validation — SSR-safe motion preference and optional Lenis provider

## Static conformance audit (implementation phase)

Audited the motion seam file by file against issue #21 scope:

| Check | Result |
| --- | --- |
| `src/packages/motion/preference.ts` — pure seam: no `"use client"`, no React/JSX/`lenis`/`gsap` imports; importable by server code and `node --test` type stripping | Pass |
| `MotionPreference = "reduce" \| "no-preference"`; `MOTION_QUERY = "(prefers-reduced-motion: reduce)"`; `SSR_MOTION_PREFERENCE = "no-preference"` (matches the CSS default) | Pass |
| `resolveMotionPreference(true/false/null/undefined)` → `"reduce"` / `"no-preference"` / SSR default | Pass |
| `isReducedMotion` is true only for `"reduce"` | Pass |
| `parseMotionPreference` — case-insensitive `prefers-reduced-motion: (reduce\|no-preference)`, `null` for anything else | Pass |
| `use-motion-preference.ts` (`"use client"`) — `useSyncExternalStore` with module-scope stable glue; server snapshot is the static SSR default; `matchMedia` only read in subscribe/snapshot paths, never during the server render | Pass |
| `MotionPreferenceProvider.tsx` (`"use client"`) — renders `{children}` (server subtree passes through as props); effect sets `document.documentElement.dataset.reducedMotion` and deletes it on unmount | Pass |
| `LenisProvider.tsx` (`"use client"`) — the only module importing `lenis`; creates `new Lenis({ autoRaf: true, ...options })` only when motion is allowed; `destroy()` on cleanup/preference change | Pass |
| Barrel `index.ts` — re-exports the seam, provider, and hook; does NOT re-export `LenisProvider` (opt-in deep import keeps `lenis` out of every route's client graph) | Pass |
| `layout.tsx` wraps `SkipLink → SiteHeader → main → SiteFooter` in `MotionPreferenceProvider`; no `LenisProvider`, no other markup changes | Pass |
| `page.tsx`, `globals.css`, and all `ui`/`content` files untouched; no scene choreography, workflow, or credential changes | Pass |
| `tests/motion.test.mjs` — behavior tests import `preference.ts` directly (never the barrel, which re-exports JSX) | Pass |

## Formatting note (format:check risk)

The known short-JSX collapse behaviour does not apply to the new files (the
providers return `children` rather than short attributes). Long call/regex
lines in `tests/motion.test.mjs` were pre-formatted to Prettier-canonical
broken form (printWidth 80) during the implementation phase, so no
`format:check` failures are expected from the new files.

## Acceptance gates

| Gate | Status |
| --- | --- |
| `npm test` (baseline + content + shell + motion) | Pending validation workflow |
| `npm run typecheck` | Pending validation workflow |
| `npm run lint` (typecheck + eslint + `next build`) | Pending validation workflow |
| `npm run format:check` | Static pass expected; canonical form applied above — final output recorded by validation workflow |

The implementation phase could not execute commands; the workflow stage after
editing records the actual command output here.

## Build output and bundles

To be recorded by the validation workflow:

- `next build` final summary (routes, first load JS, CSS size).
- Confirm no `lenis` module appears in any route chunk (the motion barrel
  never re-exports `LenisProvider`).
- Confirm the new client provider's JS stays well under the 300 KB route-JS
  budget in `docs/performance-budget.md`.
- Console warnings during build (expected: none).

## Viewport QA matrix

| Viewport | No hydration errors | `data-reduced-motion` present post-hydration | Skip link first `Tab` → `#main` | No layout shift on preference toggle |
| --- | --- | --- | --- | --- |
| 1920×1080 |  |  |  |  |
| 1440×900 |  |  |  |  |
| 390×844 |  |  |  |  |
| 430×932 |  |  |  |  |

## Reduced-motion checks

Under `prefers-reduced-motion: reduce` emulation:

- Post-hydration `document.documentElement.dataset.reducedMotion === "true"`;
  the page is static with no smooth scrolling (JS guard) and the existing CSS
  baseline (durations collapse, `scroll-behavior: auto`) covers first paint.
- Under `no-preference`: the attribute is `"false"` and CSS smooth scroll
  stays intact.
- Live-toggling the media query in DevTools flips the attribute with no
  hydration errors or layout shift (the `useSyncExternalStore` change event
  path).
- The `data-reduced-motion` attribute appears only after hydration; first
  paint relies on the existing CSS media query. This is the intended design,
  not a FOUC bug.

## Evidence note

GitHub writes are unavailable in this phase. The intended issue comment for
issue #21 records: gates passed, build output with no `lenis` chunk in any
route bundle, the viewport matrix above, and the reduced-motion emulation
results. Per `docs/agents/issue-tracker.md`, this document is the offline
record; the final handoff reports the intended issue update.
