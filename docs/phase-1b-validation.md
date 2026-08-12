# Phase 1B validation — design tokens, typography, semantic shell

## Static conformance audit (implementation phase)

Audited the shell file by file against issue #20 scope and ADR 0001:

| Check | Result |
| --- | --- |
| `globals.css` declares the six canonical tokens on `:root` (`--ink #050713`, `--navy #0a1a3a`, `--white #f7f8fc`, `--silver #b7c2d2`, `--gold #c7a34b`, `--pitch #102b25`) | Pass |
| Layout primitives (`--container-width: 80rem`, `--gutter`, `--section-space`) and fluid type scale (`--text-display/title/body` via `clamp()`) | Pass |
| `@theme inline` maps all six colors plus `--font-display/sans/mono` to the canonical vars | Pass |
| `color-scheme: dark`, ink canvas paint, gold `:focus-visible` ring | Pass |
| Reduced-motion baseline (`no-preference` smooth scroll; `reduce` collapses durations to `0.01ms`, forces `scroll-behavior: auto`) | Pass |
| `.skip-link` visually hidden until focus; `.scene-frame` has no self-animation | Pass |
| `layout.tsx` — `next/font/google` Oswald/Inter/IBM Plex Mono (`weight: ["400","500"]`), each with `variable`, `display: "swap"`, `subsets: ["latin"]`; vars applied on `<html>` | Pass |
| Landmark order `SkipLink → SiteHeader → <main id="main"> → SiteFooter` | Pass |
| `src/packages/ui` — six default server components, single public `index.ts`, no `"use client"` | Pass |
| Header has no dead scene anchors (`aria-label="Site"`); footer carries the independent/non-affiliated notice | Pass |
| `page.tsx` composes only `SceneFrame`/`Container`/`Section`; no chapters, GSAP, or media | Pass |
| No changes touch `.github/`, `.agents/`, config, credentials, or content-package fixtures | Pass |

### Formatting correction (format:check risk)

`format:check` was expected to fail: four short multi-line `className` attributes
would be collapsed by Prettier (default `printWidth: 80`). Corrected to
Prettier-canonical single-line form:

- `src/app/page.tsx` — kicker `<p>` (71 chars collapsed).
- `src/packages/ui/Section.tsx` — kicker `<p>` (71 chars collapsed).
- `src/packages/ui/SiteFooter.tsx` — wordmark `<p>` (72 chars collapsed).
- `src/packages/ui/SiteHeader.tsx` — wordmark `<p>` (79 chars collapsed).

All remaining multi-line attributes exceed 80 chars or carry multiple
attributes, so they stay broken per Prettier. Class order inside every
attribute already matches the Tailwind canonical order, so no reordering is
expected from `prettier-plugin-tailwindcss`. No test assertions were affected
(the collapsed elements keep their text content and surrounding structure).

### Computed contrast evidence (static)

Relative-luminance ratios derived from the token values (WCAG 2.1):

| Pair | Contrast | Requirement |
| --- | --- | --- |
| `#f7f8fc` text on `#050713` ink | 18.9:1 | ≥ 7:1 (AAA) — Pass |
| `#c7a34b` gold kicker on `#050713` ink | 8.4:1 | ≥ 4.5:1 (AA small text) — Pass |

## Acceptance gates

| Gate | Status |
| --- | --- |
| `npm test` (baseline + content + shell) | Pending validation workflow |
| `npm run typecheck` | Pending validation workflow |
| `npm run lint` (typecheck + eslint + `next build`) | Pending validation workflow |
| `npm run format:check` | Static pass expected; four collapse fixes applied above — final output recorded by validation workflow |

The implementation phase could not execute commands; the workflow stage after
editing records the actual command output here. Expected outcomes: shell tests
are static regex assertions verified against the audited files, and the
formatting corrections above remove the known `format:check` failures.

## Build output and bundles

To be recorded by the validation workflow:

- `next build` final summary (routes, first load JS, CSS size).
- Font subset sizes for Oswald, Inter, and IBM Plex Mono (self-hosted by
  `next/font`; the automated fetch also confirms the network contingency in
  ADR 0001 is not needed).
- Console warnings during build (expected: none).

## Viewport QA matrix

Acceptance viewports from `docs/research/primary-sources.md` and the plan:

| Viewport | No horizontal overflow | Skip link first `Tab` → `#main` | `header`/`main`/`footer` landmarks | White-on-ink contrast ≥ 7:1 | Fonts applied (display on headings, mono on utility text) |
| --- | --- | --- | --- | --- | --- |
| 1920×1080 |  |  |  |  |  |
| 1440×900 |  |  |  |  |  |
| 390×844 |  |  |  |  |  |
| 430×932 |  |  |  |  |  |

Expected contrast: `#f7f8fc` on `#050713` exceeds the 7:1 AAA threshold; the
gold kicker `#c7a34b` on ink also exceeds 4.5:1 for small text.

## Reduced-motion checks

Under `prefers-reduced-motion: reduce` emulation:

- The page is static: no transforms, animations, or smooth scrolling.
- All content is present in DOM order immediately (no JS-gated reveals).
- The skip link still appears on keyboard focus (transition collapses to
  ~0ms).

## Evidence note

GitHub writes are unavailable in this phase. The intended issue comment for
issue #20 records: gates passed, build/font sizes, the viewport matrix above,
and reduced-motion emulation results. Per `docs/agents/issue-tracker.md`, this
document is the offline record; the final handoff reports the intended issue
update.
