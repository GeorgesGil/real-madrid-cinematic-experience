/**
 * Public entry point of the overlay package.
 *
 * Exports the pure OverlayController seam only: it is JSX- and dependency-free,
 * so the Node test runner imports this barrel directly (type stripping),
 * satisfying the test-through-public-entry-points rule. The
 * `useOverlayController` hook is a client-only adapter and is deliberately NOT
 * re-exported here: consumers must opt in via
 * `@/packages/overlay/use-overlay-controller` so no client JS enters a route
 * bundle until an overlay is actually mounted (deep-import boundary, see
 * docs/adr/0002-deep-modules-seams-policy.md).
 */
export type { OverlayAction, OverlayPhase, OverlayState } from "./overlay.ts";
export {
  closeOnKey,
  createOverlayState,
  isScrollLocked,
  overlayReducer,
  shouldTrapFocus,
} from "./overlay.ts";
