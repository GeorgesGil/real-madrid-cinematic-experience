"use client";

import { useApertureReveal } from "./use-aperture-reveal.ts";

/**
 * Monumental Aperture mask layer: an original inline-SVG stadium arch drawn
 * as stroke linework (architectural silver `currentColor` with a restrained
 * gold arc). Always rendered as static markup so the mask exists in SSR HTML,
 * under reduced motion, and with JS off; the client adapter only enhances it.
 * Purely decorative: hidden from assistive technology and never intercepts
 * pointer events. Deep import — not re-exported from the hero barrel.
 */
export function ApertureGeometry() {
  useApertureReveal();
  return (
    <div className="hero-aperture" data-aperture-mask aria-hidden="true">
      <svg
        className="hero-aperture-svg"
        viewBox="0 0 1440 900"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 96 764 C 96 300 420 120 720 120 C 1020 120 1344 300 1344 764"
        />
        <path
          d="M 208 764 C 208 400 460 240 720 240 C 980 240 1232 400 1232 764"
        />
        <path d="M 96 764 H 1344" />
        <path className="hero-aperture-rib" d="M 151 764 L 151 468" />
        <path className="hero-aperture-rib" d="M 295 764 L 295 268" />
        <path className="hero-aperture-rib" d="M 496 764 L 496 155" />
        <path className="hero-aperture-rib" d="M 620 764 L 620 132" />
        <path className="hero-aperture-rib" d="M 820 764 L 820 132" />
        <path className="hero-aperture-rib" d="M 944 764 L 944 155" />
        <path className="hero-aperture-rib" d="M 1145 764 L 1145 268" />
        <path className="hero-aperture-rib" d="M 1289 764 L 1289 468" />
        <path
          className="hero-aperture-gold"
          d="M 420 600 C 460 400 580 330 720 330 C 860 330 980 400 1020 600"
        />
      </svg>
    </div>
  );
}
