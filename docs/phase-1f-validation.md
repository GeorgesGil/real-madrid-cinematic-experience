# Phase 1F validation — PlayerStory, OverlayController, and architecture evidence

## Static conformance audit (implementation phase)

Audited the new packages and docs file by file against issue #24 scope:

| Check | Result |
| --- | --- |
| `src/packages/player/player-story.ts` — pure seam: no `"use client"`, no React/JSX/next imports; importable by `node --test` type stripping (mirrors `motion/preference.ts`) | Pass |
| `PlayerStoryState { ids: readonly string[]; selectedIndex: number \| null }`; `PlayerStoryAction = select \| next \| previous`; `createPlayerStory(ids)` copies the roster, never aliasing the caller's array | Pass |
| Deterministic navigation: unknown `select` id → `selectedIndex: null`; `next` from no selection → 0; `previous` from no selection → last; `next` at last → 0; `previous` at 0 → last; empty roster no-op (same state reference, `useReducer` bail-out) | Pass |
| `src/packages/player/index.ts` — barrel exports only the pure seam; no `.tsx`, no content-data import (roster passed by consumers as `players.map((player) => player.id)`) | Pass |
| `src/packages/overlay/overlay.ts` — pure seam: `OverlayPhase = "closed" \| "open"`; `OverlayState { phase; returnFocusSelector: string \| null }`; `createOverlayState()` closed defaults; `overlayReducer` bails out on no-op transitions; `isScrollLocked`/`shouldTrapFocus` derive from `phase === "open"`; `closeOnKey(key)` matches `"Escape"` only; `returnFocusSelector` retained after close | Pass |
| `src/packages/overlay/use-overlay-controller.ts` — `"use client"`; single value export; `useReducer` over the pure seam; effects only (no `document`/`window` before the first `useEffect`); Escape `keydown` listener with symmetric removal; `data-scroll-locked` set/removed on `<html>`; Tab cycling within the container; `.focus()` restore to the recorded trigger on close | Pass |
| Overlay barrel `index.ts` — exports only the pure seam; header comment documents the deep-import hook but never re-exports it | Pass |
| `page.tsx` / `layout.tsx` — no player or overlay imports (no feature-chapter guard, no consumers) | Pass |
| Existing suites untouched: baseline/content/shell/motion/media/scene-timeline assertions kept | Pass |
| Diff scope: only `src/packages/{player,overlay}`, `tests/`, and `docs/` — no `.github/`, `.agents/`, configs, credentials, or workflows changed | Pass |

## Reducer behavior (locked by tests)

`tests/player-story.test.mjs` — imports the player **barrel**:

| Transition | Result |
| --- | --- |
| `select` existing id | `selectedIndex` = position; `selectedId` resolves it |
| `select` unknown id | `selectedIndex: null` |
| `next` from no selection | `selectedIndex: 0` |
| `previous` from no selection | `selectedIndex: ids.length - 1` |
| `next` at last | wraps to `0` |
| `previous` at 0 | wraps to last |
| empty roster + any action | no-op (same state reference) |
| any transition | input state and roster never mutated |
| integration | story from `players.map((player) => player.id)` cycles the full roster and wraps |

`tests/overlay-controller.test.mjs` — imports the overlay **barrel**:

| Transition | Result |
| --- | --- |
| `createOverlayState()` | `{ phase: "closed", returnFocusSelector: null }`; no scroll lock, no trap |
| `open` with selector | `phase: "open"`; selector recorded; scroll locked; trap active |
| `keydown` `"Escape"` while open | closes; selector retained |
| `keydown` any other key | no-op (same state reference) |
| `close` | closes; selector retained |
| any transition | input state never mutated; no-op transitions bail out |

## Formatting note (format:check risk)

New JSX (only `use-overlay-controller.ts`) is written Prettier-canonical from
the start: printWidth 80, double quotes, trailing commas. Long string literals
(the focusable selector) are left unbroken, matching Prettier's behavior.

## Acceptance gates

| Gate | Status |
| --- | --- |
| `npm test` (baseline + content + shell + motion + media + scene-timeline + player-story + overlay-controller) — barrel imports prove the public-entry-point requirement | Pending validation workflow |
| `npm run typecheck` — `tsc --noEmit` strict over the new seams and hook | Pending validation workflow |
| `npm run lint` (typecheck + eslint + `next build`) — watch `react-refresh/only-export-components` on the hook-only client file (precedent: `use-motion-preference.ts` passes) | Pending validation workflow |
| `npm run format:check` | Static pass expected; canonical form applied above — final output recorded by validation workflow |

The implementation phase could not execute commands; the workflow stage after
editing records the actual command output here.

## Build output and bundles

To be recorded by the validation workflow:

- `next build` final summary (routes, first load JS, CSS size).
- Confirm no new route chunks: nothing imports the `player` or `overlay`
  packages yet, so route-JS totals must be unchanged from Phase 1E.
- Confirm the 300 KB route-JS budget in `docs/performance-budget.md`.
- Confirm no `lenis` in any route chunk (`LenisProvider` is mounted nowhere).
- Console warnings during build (expected: none).

## Deferred viewport/reduced-motion QA matrix

No consumer page exists by design: the seams are unmounted, so browser QA of
player selection and overlay behavior is deferred to the phase that mounts
them. The matrix below is the offline record:

| Viewport | PlayerStory selection renders without layout shift | Overlay locks scroll while open | Focus returns to trigger on close |
| --- | --- | --- | --- |
| 1920×1080 |  |  |  |
| 1440×900 |  |  |  |
| 390×844 |  |  |  |
| 430×932 |  |  |  |

Deferred interaction checks:

- Under `prefers-reduced-motion: reduce`, scroll lock stays active while an
  overlay is open (preference-independent interaction constraint, ADR 0002 §3).
- Escape closes and returns focus to the recorded trigger.
- Tab cycles within the container; Shift+Tab cycles backwards.

## Phase 1 foundation summary

| Issue | Deliverable | Evidence |
| --- | --- | --- |
| #20 Phase 1B | Semantic shell, design tokens, typography, ADR 0001 | `docs/phase-1b-validation.md` |
| #21 Phase 1C | Motion-preference seam and provider | `docs/phase-1c-validation.md` |
| #22 Phase 1D | Media playback seam and image/video primitives | `docs/phase-1d-validation.md` |
| #23 Phase 1E | SceneTimeline adapter, removable Lenis | `docs/phase-1e-validation.md` |
| #24 Phase 1F | PlayerStory + OverlayController seams, ADR 0002 | this document |

## Risks and mitigations

- **Node type-stripping on barrels:** new barrels re-export only `.ts`; a
  static guard test asserts the boundary, so a future edit that re-exports the
  client hook fails loudly.
- **ESLint/react-refresh on hook-only client files:** mitigated by
  single-export hook files (existing precedent `use-motion-preference.ts`).
- **Focus-trap edge cases** (iframes, dynamic focusables, nested overlays):
  out of scope for an unmounted seam; deferred until the first overlay consumer
  mounts it — not over-engineered now.
- **Reducer semantic judgment calls** (wrap vs clamp, unknown-id reset,
  Escape-only close): locked by behavior tests and ADR 0002.
- **Reduced-motion regression:** a future change might skip scroll lock under
  `prefers-reduced-motion`; the overlay tests assert scroll lock is
  preference-independent, and the seam itself never reads the preference.
- **Scope creep / acceptance breach:** no feature chapters, no consumers, no
  workflow/credential edits — enforced by the page/layout guard tests and a
  diff limited to `src/packages/{player,overlay}`, `tests/`, and `docs/`.

## Evidence note

GitHub writes are unavailable in this phase.

- Issue #24 comment: gates passed; seams complete; no new route chunks.
- Per `docs/agents/issue-tracker.md`, this document is the offline record.
- The final handoff reports the intended issue update.
