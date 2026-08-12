/**
 * Oversized `RM` linework for the Monumental Aperture hero.
 *
 * Original typographic geometry drawn as inline SVG text in the licensed
 * display face (no images, no font assets, no emblem). Purely decorative:
 * the layer is hidden from assistive technology and never intercepts pointer
 * events.
 */
export function Monogram() {
  return (
    <div className="hero-monogram" aria-hidden="true">
      <svg
        className="hero-monogram-svg"
        viewBox="0 0 900 340"
        fill="none"
        aria-hidden="true"
      >
        <text x="450" y="270" textAnchor="middle" letterSpacing="0.12em">
          RM
        </text>
      </svg>
    </div>
  );
}
