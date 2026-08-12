import { Container, SceneFrame } from "@/packages/ui";

import { ApertureGeometry } from "./ApertureGeometry.tsx";
import { Monogram } from "./Monogram.tsx";

/**
 * Monumental Aperture opening scene (docs/prototype-verdict.md, Variant A).
 *
 * Server composition: the restrained gold kicker, editorial headline, and
 * copy render in DOM reading order first; the decorative aperture mask and RM
 * monogram layers follow as aria-hidden enhancements. The frame owns the navy
 * field and clips every geometry layer (viewBox-scaled inline SVG only), so
 * the scene cannot overflow horizontally from 390px up. `data-parallax` stays
 * on the copy block so the SceneTimeline descendant tween applies unchanged.
 */
export function Hero() {
  return (
    <SceneFrame className="hero-frame">
      <Container className="hero-container">
        <div className="hero-copy" data-parallax>
          <p className="hero-kicker">Independent cinematic concept</p>
          <h1 className="hero-title">The Bernabéu is a character.</h1>
          <p className="hero-summary">
            An original tribute to the stadium and the nights that built it.
          </p>
        </div>
      </Container>
      <ApertureGeometry />
      <Monogram />
    </SceneFrame>
  );
}
