# Hero prototype verdict

## Decision

Use **Variant A — Monumental Aperture** as the opening language for the production experience.

The question tested was: *which visual structure can feel unmistakably monumental and Madrid-like without copying Rockstar's composition or depending on protected club photography?*

## What each variant proved

- **A — Monumental Aperture:** strongest signature. The abstract stadium arch, oversized `RM` linework, restrained navy field, and editorial white typography create a distinctive first scene that can scale from mobile to desktop.
- **B — Architectural Tunnel:** strongest spatial rhythm. Reuse its split light/dark geometry and tunnel-like transitions in the Bernabéu chapter, not in the opening hero.
- **C — European Royalty:** strongest trophy storytelling. Reserve the black-and-gold numerical language for the Honours chapter so gold remains scarce and meaningful.

## Production constraints

- Rebuild the selected direction as React components; do not copy the prototype markup wholesale.
- Use original CSS/SVG geometry and licensed or generated media only. Do not copy Real Madrid, Rockstar, or GTA VI assets.
- Keep the club crest out unless its use is explicitly licensed; the experience must identify itself as an independent concept.
- Preserve the mobile result validated at `390x844`: no horizontal overflow, readable headline, reachable controls, and keyboard-operable variant/navigation behavior.
- Honor `prefers-reduced-motion` and provide static fallbacks for every cinematic sequence.

## Evidence

The throwaway implementation remains isolated on [`prototype/hero-directions`](https://github.com/GeorgesGil/real-madrid-cinematic-experience/tree/prototype/hero-directions/prototype/hero). It was checked at desktop and mobile widths, cycled by keyboard, and produced no browser warnings or errors.
