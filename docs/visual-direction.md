# Visual direction

## Thesis

An independent cinematic tribute in which the Bernabéu behaves like a character: floodlights reveal history, architecture frames the team, and European nights provide the emotional peak.

## Tokens

| Role | Token | Value |
| --- | --- | --- |
| Stadium night | `--ink` | `#050713` |
| Midnight blue | `--navy` | `#0A1A3A` |
| Floodlight | `--white` | `#F7F8FC` |
| Architectural silver | `--silver` | `#B7C2D2` |
| European gold | `--gold` | `#C7A34B` |
| Pitch shadow | `--pitch` | `#102B25` |

Typography should pair a licensed condensed display face for monumental headlines, a neutral grotesk for body copy, and a tabular utility face for dates and statistics. Use `next/font`; never extract proprietary font files from a reference site.

## Layout concept

```text
BLACK / CREST TRACE
┌──────────────────────────────────────┐
│  RM aperture       minimal nav       │
│             BERNABÉU                 │
│     full-bleed layered night scene   │
└──────────────────────────────────────┘
                 ↓ camera push
┌──────────────────────────────────────┐
│ HOME OF                              │
│ REAL MADRID        architecture      │
└──────────────────────────────────────┘
                 ↓ editorial chapters
TEAM → 15 → HISTORY → MOMENTS → FUTURE
```

## Signature

The `RM aperture` is the single aesthetic risk: two oversized typographic forms reveal moving stadium light, enlarge once, and dissolve into the full scene. It must have a static mask fallback and disappear entirely under reduced motion.

## Self-critique

The dark cinematic palette could become a generic luxury-sports default. Counter it with subject-specific materials—Bernabéu louvres, tunnel light, white fabric, pitch geometry, historical dates—and reserve gold for European honours rather than using it as constant decoration.
