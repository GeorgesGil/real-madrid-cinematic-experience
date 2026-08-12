/**
 * Public entry point of the intro package.
 *
 * Exports the pure CinematicIntro seam only: it is JSX- and dependency-free,
 * so the Node test runner imports this barrel directly (type stripping),
 * satisfying the test-through-public-entry-points rule. The `CinematicIntro`
 * component is a client-only adapter and is deliberately NOT re-exported
 * here: consumers must opt in via `@/packages/intro/CinematicIntro` so no
 * client JS enters a route bundle until the intro is actually mounted
 * (deep-import boundary, see docs/adr/0002-deep-modules-seams-policy.md).
 */
export type { IntroAction, IntroPhase, IntroState } from "./intro.ts";
export {
  createIntroState,
  introReducer,
  isIntroComplete,
  shouldPlayIntro,
} from "./intro.ts";
