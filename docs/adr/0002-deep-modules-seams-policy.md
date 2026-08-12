# ADR 0002 — Deep-module boundaries, seam ownership, and loading invariants

- Status: Accepted
- Date: 2026-08-12
- Related: `docs/animation-system.md`, `docs/performance-budget.md`, `docs/responsive-strategy.md`, ADR 0001

## Context

Phase 1F completes the last two state seams named in `docs/animation-system.md`
(`PlayerStory`, `OverlayController`) and, with them, the Phase 1 foundation
(issues #20–#24). The repository now has six packages under `src/packages/`
(`content`, `media`, `motion`, `overlay`, `player`, `ui`), each with a single
public barrel, pure `.ts` seams importable by `node --test` type stripping,
and optional client adapters imported as deep modules. This ADR records the
boundary and ownership rules those packages already follow so later phases
extend them without divergence.

## Decision

### 1. Deep-module boundary rule

- Each package exposes exactly one public barrel (`index.ts`).
- Pure, JSX-free seams are re-exported from the barrel: they are the tested
  contract, importable by both server code and the Node test runner.
- Heavy or optional adapters (React/DOM glue, third-party integrations such as
  `lenis`) are deep imports and are never re-exported from the barrel.
  Consumers opt in via `@/packages/<name>/<adapter>`. Keeping them out of the
  barrel keeps them out of every route's client bundle until a consumer
  actually mounts them.
- Existing examples: `LenisProvider` and `SceneTimeline` (motion), and
  `use-overlay-controller.ts` (overlay). The overlay barrel documents the deep
  hook without re-exporting it; a static guard test enforces the boundary.

### 2. Seam ownership

- Each seam named in `docs/animation-system.md` has exactly one owner module:
  `MotionPreference` → `motion/preference.ts`, `MediaPlayback` →
  `media/playback.ts`, `PlayerStory` → `player/player-story.ts`,
  `OverlayController` → `overlay/overlay.ts`.
- Pure seams are the tested contract: behavior tests import the public barrel
  (or the pure module directly when the barrel re-exports JSX) and lock the
  deterministic semantics.
- React/DOM adapters stay thin: they reduce to the pure seam, perform effects
  only (no `document`/`window` during render), and are statically audited by
  regex guards in the test suites.
- Reducer semantics are locked by behavior tests so later scene adapters
  cannot silently diverge: PlayerStory wrap-around navigation and unknown-id
  reset; OverlayController Escape-only close and retained focus trigger.

### 3. Reduced-motion invariant

- CSS provides the baseline (`globals.css`: animation/transition durations
  collapse and `scroll-behavior` is forced to `auto` under
  `prefers-reduced-motion: reduce`).
- `MotionPreference` is the shared JS decision; every motion seam re-checks it
  (`LenisProvider`, `SceneTimeline` via `heroSceneQuery`, `media/playback.ts`
  via `decidePlayback`).
- The stable state is the mobile/reduced-motion baseline per
  `docs/responsive-strategy.md`: all text immediately available in DOM order,
  no scrub/parallax, no large masks, no smooth scrolling, and no decorative
  autoplay.
- Scroll lock is an interaction constraint, not decoration: `isScrollLocked`
  is preference-independent and must remain active under reduced motion (a
  modal that scrolls behind it is an accessibility failure, not a motion
  choice).

### 4. Removable Lenis

- `lenis` is an opt-in adapter (`motion/LenisProvider.tsx`), mounted nowhere by
  default. Scene code never imports `lenis`; the only import site in `src/` is
  the adapter itself. Removing the dependency later is a one-file change plus
  the pinned `package.json`/lockfile entry.

### 5. Single-LCP preload rule

- Next.js 16 deprecated `priority`; it is forbidden across `src/` (whole-tree
  guard in `tests/media.test.mjs`).
- `preload` is used only for the single measured LCP image (the `lcp` prop on
  `CinematicImage`); every other image is lazy.
- All `fill` images carry accurate `sizes` so the browser picks the correct
  responsive variant with zero layout shift (see `docs/performance-budget.md`).

## Consequences

- New packages must ship a barrel plus pure seams, with adapters as deep
  imports; tests assert the boundary statically, so a future edit that
  re-exports a client hook fails loudly.
- Focus-trap edge cases (iframes, dynamic focusables, nested overlays) remain
  deferred until the first overlay consumer mounts the adapter; the seam is
  not over-engineered for them now.
- The Phase 1 foundation is complete and documented: shell (ADR 0001), motion
  preference, media playback, SceneTimeline, and the two state seams with this
  ADR.
