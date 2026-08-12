/**
 * Public entry point of the motion package.
 *
 * Exports the pure preference seam, the SSR-safe hook, and the document-root
 * provider. The optional `LenisProvider` adapter is deliberately NOT
 * re-exported: it is the only module that imports `lenis`, and consumers must
 * opt in via `@/packages/motion/LenisProvider` so the dependency stays out of
 * every route's client bundle until mounted.
 */
export type { MotionPreference } from "./preference.ts";
export {
  MOTION_QUERY,
  SSR_MOTION_PREFERENCE,
  isReducedMotion,
  parseMotionPreference,
  resolveMotionPreference,
} from "./preference.ts";
export { MotionPreferenceProvider } from "./MotionPreferenceProvider.tsx";
export { useMotionPreference } from "./use-motion-preference.ts";
