# ADR 0001 — Design tokens, typography, and semantic shell

- Status: Accepted
- Date: 2026-08-11
- Related: `docs/visual-direction.md`, `docs/animation-system.md`, `docs/performance-budget.md`, `CONTEXT.md`

## Context

Phase 1B establishes the stable visual and semantic shell: centralized palette
tokens, licensed typography, and the landmark structure every later scene
builds on. The existing `globals.css` hardcoded `#05070f`/`#f7f8fc`, which
diverged from the documented tokens in `docs/visual-direction.md`
(`--ink #050713`, `--white #F7F8FC`), and the root layout rendered no
landmark structure.

## Decision

### 1. Token source of truth

The six canonical palette custom properties are declared once in
`src/app/globals.css` on `:root`, exactly per `docs/visual-direction.md`:

| Token | Value |
| --- | --- |
| `--ink` | `#050713` |
| `--navy` | `#0a1a3a` |
| `--white` | `#f7f8fc` |
| `--silver` | `#b7c2d2` |
| `--gold` | `#c7a34b` |
| `--pitch` | `#102b25` |

Non-color primitives: `--container-width: 80rem`, `--gutter:
clamp(1rem, 4vw, 2.5rem)`, `--section-space: clamp(4rem, 10vw, 8rem)`, and a
fluid type scale (`--text-display`, `--text-title`, `--text-body`) using
`clamp()`.

### 2. `@theme inline` mapping

Tailwind v4 utilities are generated from the canonical props via
`@theme inline` (`--color-ink: var(--ink)`, etc.), so `bg-ink`, `text-white`,
and `border-silver` all resolve to the same `:root` declarations. `inline`
inlines the reference into each utility, keeping the canonical props the only
place the palette is defined. Component-level redefinition of a canonical prop
would silently alter utilities; this is an accepted contract documented in
this ADR.

### 3. `--color-white` override

Redefining `--color-white` changes the project-wide meaning of `text-white`,
`bg-white`, and friends from `#fff` to floodlight `#f7f8fc`. This is
deliberate per the palette; later phases must not assume `#fff`.

### 4. Deliberate color shift

Replacing `#05070f` with `#050713` (and aligning case) is a near-invisible
change made to align with `docs/visual-direction.md`; it is recorded here as
intentional, not a regression.

### 5. Typography

Three SIL Open Font License families configured via `next/font/google` in the
root layout, with `variable`, `display: "swap"`, `subsets: ["latin"]`, and
default preload. `next/font` self-hosts the files at build time, so there are
no runtime third-party font requests. Oswald and Inter use their default
weights; IBM Plex Mono is not a variable font, so it is given an explicit
`weight: ["400", "500"]` (the tabular utility range).

| Family | License | Role |
| --- | --- | --- |
| Oswald | SIL OFL 1.1 | Condensed display for monumental headlines |
| Inter | SIL OFL 1.1 | Neutral grotesk body copy |
| IBM Plex Mono | SIL OFL 1.1 | Tabular utility face for dates/stats (`font-variant-numeric: tabular-nums`) |

The Next-injected variables (`--font-oswald`, `--font-inter`,
`--font-plex-mono`) are applied to `<html>`; `@theme inline` exposes them as
the `font-display`, `font-sans`, and `font-mono` utilities.

**Network risk (contingency):** `next/font/google` fetches font files at build
time. If the build environment has no network access, `npm run lint` (which
runs `next build`) would fail. The contingency is to vendor OFL woff2 files
via `next/font/local` with license files committed. `npm install` already
requires network in this workflow, so the Google-font fetch is expected to
succeed; the contingency is recorded here so later phases know the switch
point.

### 6. Semantic shell

`src/packages/ui` mirrors the content-package pattern: a single public
`index.ts` and default server components (no `"use client"`, no event
handlers, no runtime JS).

- `SkipLink` — `href="#main"`, `.skip-link` visually hidden until focus.
- `SiteHeader` — semantic `<header>` with wordmark and a minimal
  `<nav aria-label="Site">`, composing the client chapter menu
  (`MenuOverlay`) via deep import. Chapter anchors and their targets are
  governed by the no-dead-links rule in section 8.
- `SiteFooter` — semantic `<footer>` with the mandatory independent,
  non-affiliated notice (CONTEXT.md / primary-sources §2).
- `Container` — max-width wrapper owning the responsive gutter.
- `Section` — `<section>` with optional `id`, `aria-labelledby`,
  kicker/title/summary composition, and a consistent `--section-space`
  rhythm.
- `SceneFrame` — stable full-bleed frame; it never transforms or animates
  itself (later phases animate descendants only, per
  `docs/animation-system.md`).

Root layout order: `SkipLink → SiteHeader → <main id="main"> → SiteFooter`.

### 7. Reduced-motion baseline

- `html { scroll-behavior: smooth }` only under
  `prefers-reduced-motion: no-preference`.
- Under `prefers-reduced-motion: reduce`, animation/transition durations
  collapse to `0.01ms` and `scroll-behavior` is forced to `auto`.
- A gold `:focus-visible` ring provides a palette-consistent focus indicator.

### 8. Chapter anchors and the no-dead-links rule

Phase 2C lands the full-screen chapter menu. The no-dead-links rule is
satisfied structurally rather than by hand-maintained href lists: both the
menu links in `MenuOverlay` and the home-page section ids are rendered from
the same `scenes` fixture in `@/packages/content` via `scenes.map(...)` (the
overlay renders `` href={`#${scene.id}`} ``, the page renders
`<Section id={scene.id} ... />`). An id can therefore never appear in the
menu without a matching rendered section on the same page, and adding a
chapter to the fixture automatically creates both the link and its target.
`SiteHeader` remains a server component and composes the client `MenuOverlay`
through a deep import (`@/packages/ui/MenuOverlay`, ADR 0002 §1); the `ui`
barrel stays server-only and never re-exports the overlay.

## Consequences

- The palette, fonts, and landmarks are stable inputs for every later phase;
  scenes compose inside `SceneFrame`/`Section` without redefining tokens.
- Chapter anchors and their targets derive from the same `scenes` fixture, so
  the no-dead-links rule holds by construction; the `ui` barrel stays
  server-only with `MenuOverlay` consumed as a deep import.
- `format:check`, `test`, `typecheck`, and `lint` exercise the shell directly.
- Later phases must keep canonical props defined only in `globals.css` and
  must not assume `#fff` for `--color-white`.
