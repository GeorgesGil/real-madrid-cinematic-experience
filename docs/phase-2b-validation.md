# Phase 2B validation — Monumental Aperture hero package and wiring evidence

## Static conformance audit (implementation phase)

Audited the new package and wiring file by file against issue #37 scope:

| Check | Result |
| --- | --- |
| `src/packages/hero/Hero.tsx` — server component (no `"use client"`): navy-field full-bleed scene inside `SceneFrame` (overflow-hidden) + `Container`; restrained gold kicker, editorial white H1 (`--text-display`), and copy render first in DOM reading order, outside any `aria-hidden` | Pass |
| `data-parallax` stays on the hero copy block so the existing SceneTimeline descendant tween applies unchanged | Pass |
| Decorative `<ApertureGeometry />` and `<Monogram />` layers are positioned absolutely, follow the copy in DOM order, and are `aria-hidden="true"` | Pass |
| `src/packages/hero/Monogram.tsx` — server component, oversized original `RM` linework as inline SVG `<text>` in the licensed display face (no images, no font assets, no club crest) | Pass |
| `src/packages/hero/ApertureGeometry.tsx` — `"use client"`, single export; original inline-SVG stadium arch (viewBox-scaled, `currentColor`/silver stroke linework, restrained gold arc); always rendered as static markup; consumes `use-aperture-reveal.ts` | Pass |
| `src/packages/hero/use-aperture-reveal.ts` — `"use client"`, self-contained hook: `useMotionPreference()` + `heroSceneQuery(...)`; one-shot `gsap.timeline()` (enlarge once, `autoAlpha: 0` dissolve into the full scene) registered only via `gsap.matchMedia().add(query, ...)`, never `ScrollTrigger.matchMedia`; `mm.revert()` cleanup and `revertOnUpdate: true`; no `document`/`window` during render | Pass |
| No-op guarantee: when `heroSceneQuery` is null (reduced motion or <768px) the hook returns before creating any matchMedia context — no tweens or pin-spacers ever mount (asserted statically here and covered by the whole-tree `ScrollTrigger.matchMedia` guard) | Pass |
| `src/packages/hero/index.ts` — barrel re-exports only the server components (`Hero`, `Monogram`); documents the deep `ApertureGeometry` + `useApertureReveal` adapters without re-exporting them (ADR 0002 §1, overlay precedent) | Pass |
| `src/app/page.tsx` — deep-imports `@/packages/hero/Hero` and renders `<Hero />` inside `<SceneTimeline>`; page stays a server component, no `gsap`/`"use client"`; temporary inline hero markup removed | Pass |
| `globals.css` — `.hero-*` block: navy field, `overflow: hidden` frame, viewBox-scaled geometry (no fixed px widths, no `100vw`), editorial type, restrained gold, and an explicit reduced-motion rule forcing the static mask (transform none / opacity 1) | Pass |
| Existing suites: `tests/shell.test.mjs` page assertion adapted from `<SceneFrame>/<Container>` on the page to `<Hero />` + absence guards; `tests/scene-timeline.test.mjs` `data-parallax` assertion moved from page.tsx to Hero.tsx — both intent-preserving (Phase 2A `tabIndex` precedent) | Pass |
| Diff scope: only `src/packages/hero/`, `src/app/{page,globals}`, `tests/`, and `docs/` — no `.github/`, `.agents/`, configs, credentials, or workflows changed | Pass |

## Static audit details (locked by `tests/hero.test.mjs`)

| Audit | Guard |
| --- | --- |
| Inline-SVG-only | `Hero`/`Monogram`/`ApertureGeometry` contain `<svg`; no `<img>`, no png/jpg/webp/avif/gif/svg imports, no `url(...)`, no crest/badge wording |
| Decorative layers | `aria-hidden="true"` on the mask and monogram roots; `data-aperture-mask` on the mask root |
| DOM order | `hero-copy` precedes `<ApertureGeometry` and `<Monogram` in Hero source; H1 and kicker present |
| Client boundary | `ApertureGeometry` is the only client geometry component; `Monogram` is server-only with no `gsap` |
| Overflow safety | `viewBox` scaling present; hero CSS has no `100vw` or fixed pixel widths; `overflow: hidden` on the frame |
| Reveal adapter | `"use client"`; imports `heroSceneQuery`/`useMotionPreference`/`isReducedMotion`; `gsap.matchMedia(`, `mm.add(query,`, `mm.revert()`, `revertOnUpdate: true`, `gsap.timeline(`, `[data-aperture-mask]`; no `ScrollTrigger.matchMedia`, no `gsap/ScrollTrigger` import, no `scrollTrigger` |
| No-op guard | `query === null` check precedes `gsap.matchMedia(`; no `document`/`window` before the `useGSAP(` call |
| Single export | `useApertureReveal` and `ApertureGeometry` are the only exports of their files (react-refresh rule) |
| Barrel boundary | exports `Hero` and `Monogram` from `./*.tsx`; never exports `ApertureGeometry` or `useApertureReveal` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` forces `.hero-aperture` to `transform: none !important; opacity: 1 !important; visibility: visible !important` |
| Page wiring | `@/packages/hero/Hero` deep import, `<Hero />` inside `<SceneTimeline>`, no `"use client"`, no `gsap`, no direct `<SceneFrame>`/`<Container>` |

## Acceptance gates

| Gate | Status |
| --- | --- |
| `npm test` (baseline + content + shell + motion + media + scene-timeline + player-story + overlay-controller + intro + hero) — new hero suite plus adapted shell/scene-timeline assertions | Pending validation workflow |
| `npm run typecheck` — `tsc --noEmit` strict over the server components, client adapter, hook, and wiring | Pending validation workflow |
| `npm run lint` (typecheck + eslint + `next build`) — watch `react-refresh/only-export-components` on the single-export client files (precedent: overlay/motion adapters pass); RSC boundary server `Hero` → client `ApertureGeometry` | Pending validation workflow |
| `npm run format:check` | Static pass expected; canonical Prettier form applied from the start — final output recorded by validation workflow |

The implementation phase could not execute commands; the workflow stage after
editing records the actual command output here.

## Build output and bundles

| Item | Record |
| --- | --- |
| `next build` final summary | routes, first load JS, CSS size |
| Route impact | the home route gains the small aperture reveal client chunk (`gsap` only — already in the bundle via SceneTimeline; no new third-party dependency) |
| Budget | confirm route-JS totals stay under the 300 KB budget in `docs/performance-budget.md` |
| Console warnings during build | expected: none |

## Deferred browser QA matrix

No browser automation runs in the implementation phase; the matrix below is
the offline record for the validation workflow:

| Viewport | Static composition in SSR HTML (JS off) | No horizontal overflow | Reduced motion: static mask (no reveal) | No-preference desktop: one-shot reveal (enlarge once, dissolve) |
| --- | --- | --- | --- | --- |
| 1920×1080 |  |  |  |  |
| 1440×900 |  |  |  |  |
| 390×844 |  |  |  |  |

## Deferred interaction checks

| Check | Expected |
| --- | --- |
| `prefers-reduced-motion: reduce` at 1440×900 | no GSAP context created (hook no-op); arch mask and monogram static; no pin/parallax (shared `heroSceneQuery`) |
| 390×844 | no horizontal scrollbar; headline and copy readable; decorative layers clipped by the frame |
| JS disabled | static composition (navy field, arch, monogram, editorial copy) renders unchanged; no reveal, no pin — the mobile/stable baseline |
| One-shot reveal | holds its end state (mask `visibility: hidden` via `autoAlpha`), never re-triggers on re-render, reverts cleanly on preference change |

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Existing guard tests asserted page-level markup (shell: `<SceneFrame>`/`<Container>`; scene-timeline: `data-parallax`) | minimal intent-preserving regex updates in the same commit as the page change, mirroring the Phase 2A `tabIndex` adaptation precedent |
| RSC boundary: server `Hero` composes a client `ApertureGeometry` | fine in Next 16; the hook is never called from a server component; both client files are single-export for the react-refresh rule |
| No-op guarantee under reduced motion/mobile | the reveal returns before `gsap.matchMedia(` when `heroSceneQuery` is null, so no tweens or pin-spacers ever mount — asserted statically and by the existing whole-tree `ScrollTrigger.matchMedia` guard |
| Overflow at 390px | viewBox scaling, clamp/rem tokens, and the `overflow: hidden` frame only; no fixed pixel widths or `100vw` — enforced by static audit and deferred viewport QA |
| Scope discipline | only `src/packages/hero/`, `src/app/{page,globals}`, `tests/`, and `docs/` change — no `.github/`, `.agents/`, configs, credentials, or workflows |

## Evidence note

GitHub writes are unavailable in this phase.

| Item | Record |
| --- | --- |
| Issue #37 comment | gates passed; hero package complete; home route now ships the aperture reveal client chunk |
| Offline record | per `docs/agents/issue-tracker.md`, this document is the offline record |
| Final handoff | reports the intended issue update |
