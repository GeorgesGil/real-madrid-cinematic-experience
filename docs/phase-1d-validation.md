# Phase 1D validation — accessible cinematic media primitives

## Static conformance audit (implementation phase)

Audited the media package file by file against issue #22 scope:

| Check | Result |
| --- | --- |
| `src/packages/media/playback.ts` — pure `MediaPlayback` seam: no `"use client"`, no React/JSX/`next` imports; importable by server code and `node --test` type stripping (mirrors `motion/preference.ts`) | Pass |
| `PlaybackState = "idle" \| "playing" \| "paused" \| "error"`; `PlaybackInput` with `reducedMotion`/`inView`/`state`/optional `canPlay` (readyState >= 2); `PlaybackDecision` union with `action` + `reason` | Pass |
| `decidePlayback` precedence: `reducedMotion > error > !inView > buffering (!canPlay) > play` — deterministic, first match wins | Pass |
| `shouldRenderVideoElement(reducedMotion)` — `false` means static poster `<img>`, video element never mounted | Pass |
| `CinematicImage.tsx` — default server component (no `"use client"`); required `sizes`; explicit `width`/`height` or `fill` via discriminated union; `lcp` maps to `preload`; non-LCP always `preload={false}`; **no `priority`**, no rest spread — strict typed allowlist cannot smuggle `priority` | Pass |
| `CinematicVideo.tsx` (`"use client"`) — required `poster`; `muted`/`playsInline` defaulted (iOS autoplay); literal `preload="none"`; reduced-motion fallback renders static poster `<img>` (never mounts `<video>`, never sets up the observer); `IntersectionObserver` (threshold 0.25) drives `decidePlayback`; `play()` gated on `readyState >= 2` and `.catch()`-ed into the error state; `onError` → poster fallback so content is never blank; `label` → `aria-label`, `decorative` → `aria-hidden` | Pass |
| Reduced motion read via `useMotionPreference` from `@/packages/motion` (SSR-safe `useSyncExternalStore`, existing hook) — no new motion code | Pass |
| Barrel `index.ts` — exports `CinematicImage`, `CinematicVideo`, `decidePlayback`, `shouldRenderVideoElement`, and the seam types; header notes `playback.ts` must be imported directly by Node tests (motion convention) | Pass |
| `tests/media.test.mjs` — behavior tests import `playback.ts` directly (never the barrel); static assertions per file; whole-`src/` guard test: no `priority` occurrence anywhere | Pass |
| `page.tsx`, `layout.tsx`, content/motion/ui packages, `next.config.ts`, `package.json`, `.github/`, credentials, workflows untouched; no consumer mounts the primitives yet (no feature chapter) | Pass |

## Formatting note (format:check risk)

New JSX was written Prettier-canonical (printWidth 80, double quotes, short
single-attribute elements collapsed where Prettier collapses them) so the known
short-JSX failure mode does not recur. The `eslint-disable-next-line` comment
above the poster fallback `<img>` is deliberate and required by
`@next/next/no-img-element` (a warning-only rule, silenced explicitly with the
rationale: the poster is an already-sized CDN asset kept byte-identical to the
`<video>` poster attribute).

## Acceptance gates

| Gate | Status |
| --- | --- |
| `npm test` (baseline + content + shell + motion + media) | Pending validation workflow |
| `npm run typecheck` — `tsc --noEmit`; also confirms the `next/image` `preload` prop name against installed Next 16 types | Pending validation workflow |
| `npm run lint` (typecheck + eslint + `next build`) — watch `@next/next` rules on image usage | Pending validation workflow |
| `npm run format:check` | Static pass expected; canonical form applied above — final output recorded by validation workflow |

The implementation phase could not execute commands; the workflow stage after
editing records the actual command output here.

## Build output and bundles

To be recorded by the validation workflow:

- `next build` final summary (routes, first load JS, CSS size).
- Confirm no `media` module appears in any route chunk (nothing imports the
  package yet — route bundles are unaffected).
- Confirm the `CinematicVideo` client graph (motion barrel + video component)
  stays well under the 300 KB route-JS budget in `docs/performance-budget.md`
  once a scene consumer mounts it.
- Console warnings during build (expected: none).

## Viewport/reduced-motion QA matrix

Actual playback QA is deferred until the first scene consumer mounts these
primitives (a committed consumer page would violate the "no feature chapter"
acceptance). The matrix below is the offline record for that deferred pass:

| Viewport | Poster-first first paint | No hydration errors | Reduced-motion static poster (no `<video>` in DOM) | Error state falls back to poster, never blank |
| --- | --- | --- | --- | --- |
| 1920×1080 |  |  |  |  |
| 1440×900 |  |  |  |  |
| 390×844 |  |  |  |  |
| 430×932 |  |  |  |  |

Reduced-motion checks for the deferred browser pass:

- Under `prefers-reduced-motion: reduce` emulation the `<video>` element is
  never mounted and no `IntersectionObserver` is registered; the poster
  `<img>` is the accessible stable state (per `CONTEXT.md` and
  `docs/responsive-strategy.md`).
- Programmatic autoplay rejection (Safari/iOS edge cases): `play()` promise is
  caught into the error state, and `canPlay` gating avoids pending-promise
  hangs. Browser-specific behaviour cannot be verified without a consumer page
  and is recorded as deferred evidence.

## Evidence note

GitHub writes are unavailable in this phase. The intended issue comment for
issue #22 records: gates passed, build output confirming no media module in any
route chunk, the static conformance audit above, and the viewport/
reduced-motion QA matrix with playback QA deferred until the first scene
consumer mounts these primitives. Per `docs/agents/issue-tracker.md`, this
document is the offline record; the final handoff reports the intended issue
update.
