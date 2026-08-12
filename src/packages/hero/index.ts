/**
 * Public entry point of the hero package.
 *
 * Re-exports the server components only: `Hero` composes the Monumental
 * Aperture scene and `Monogram` is the decorative RM linework layer. The
 * `ApertureGeometry` mask (client component) and the `useApertureReveal` hook
 * (`use-aperture-reveal.ts`, imports `gsap`) are deliberately NOT re-exported
 * here: both are deep adapters per ADR 0002, keeping client JS out of every
 * route bundle until the hero is actually mounted.
 */
export { Hero } from "./Hero.tsx";
export { Monogram } from "./Monogram.tsx";
