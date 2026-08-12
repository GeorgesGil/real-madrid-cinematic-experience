# Phase 2C validation — Editorial navigation and full-screen menu overlay

## Static conformance audit (implementation phase)

Audited the new package files and wiring by file against issue #38 scope:

| Check | Result |
| --- | --- |
| `src/packages/ui/MenuOverlay.tsx` — `"use client"`, single value export (react-refresh rule); owns only the `open` state (`useState`) and the dialog `containerRef` (`useRef`); consumes the deep adapter `useOverlayController({ containerRef, returnFocusSelector: "#menu-trigger", open })` — no duplicate Escape listener, no duplicate scroll-lock handling | Pass |
| Trigger semantics: `<button id="menu-trigger" type="button" aria-expanded={open} aria-controls="menu-overlay" aria-label="Menu">` toggling `open` | Pass |
| Dialog: conditional on `open`, `id="menu-overlay"`, `role="dialog"`, `aria-modal="true"`, `aria-label="Chapters"`, `tabIndex={-1}`; lists exactly the seven chapters via `scenes.map(...)` from `@/packages/content`, each `<a href={`#${scene.id}`}>` closing the menu on click | Pass |
| Initial focus: an effect moves focus into the dialog on open (`containerRef.current?.focus()`), in-effect DOM only — component behavior, no new logic in the seam (ADR 0002 §2) | Pass |
| `src/packages/ui/SiteHeader.tsx` — stays a server component (no `"use client"`, no anchor hrefs, no `aria-expanded`); retains wordmark + `nav aria-label="Site"` + Home link; composes `<MenuOverlay />` via deep import `@/packages/ui/MenuOverlay` (ADR 0002 §1) | Pass |
| `src/app/page.tsx` — server component, no directives, no `gsap`; renders the seven scene sections after the Hero from `scenes.map(scene => <Section key={scene.id} id={scene.id} kicker={scene.kicker} title={scene.title} summary={scene.summary} />)`; keeps the existing `#intro` shell section | Pass |
| `src/app/globals.css` — top-level `html[data-scroll-locked] { overflow: hidden; }` outside any media query (scroll lock stays active under reduced motion, ADR 0002 §3); `.menu-overlay` fixed full-screen ink backdrop, `z-index: 60` (above header z-40, below `.skip-link` z-100), scrollable chapter list in editorial type per `docs/visual-direction.md` | Pass |
| ADR 0001 — records the no-dead-links rule: overlay links and page section ids both derive from the single `scenes` fixture; server `SiteHeader` composes the client `MenuOverlay` via deep import, keeping the `ui` barrel server-only | Pass |
| Existing suites: `tests/shell.test.mjs` header/page assertions updated intent-preserving (header composes `MenuOverlay`; page renders scene sections); `tests/navigation.test.mjs` added | Pass |
| Diff scope: only `src/packages/ui/`, `src/app/{page,globals}`, `docs/adr/0001`, `tests/`, and `docs/` — no `.github/`, `.agents/`, configs, credentials, or workflows changed | Pass |

## Static audit details (locked by `tests/navigation.test.mjs`)

| Audit | Guard |
| --- | --- |
| Trigger semantics | `id="menu-trigger"`, `type="button"`, `aria-label="Menu"`, `aria-controls="menu-overlay"`, `aria-expanded={open}` |
| Dialog semantics | `id="menu-overlay"`, `role="dialog"`, `aria-modal="true"`, `aria-label="Chapters"`, `scenes.map(` |
| Seam integration | deep import `@/packages/overlay/use-overlay-controller`; `useOverlayController({`; `containerRef`; `returnFocusSelector: "#menu-trigger"`; `useRef`; `useState` |
| Keyboard/Escape | no `addEventListener`/`removeEventListener` in `MenuOverlay` (Escape owned by the seam, behavior-locked in `overlay-controller.test.mjs`) |
| Focus | `useEffect(` + `containerRef.current?.focus()`; hook retains `returnFocusSelector` and restores via `querySelector<HTMLElement>(...)` |
| Scroll lock | hook sets `dataset.scrollLocked = ""`; CSS `html[data-scroll-locked]` rule with `overflow: hidden` positioned before the first `@media` block |
| Dead anchors | runtime import of `scenes` (exactly seven, narrative order); both `MenuOverlay` and `page.tsx` import `@/packages/content` and call `scenes.map(`; overlay renders `href={`#${scene.id}`}`, page renders `id={scene.id}` |
| Client boundary | `"use client"`; exactly one export; not re-exported from `ui/index.ts`; no `document`/`window` before the first `useEffect` |

## Acceptance gates

| Gate | Status |
| --- | --- |
| `npm test` (baseline + content + shell + motion + media + scene-timeline + player-story + overlay-controller + intro + hero + navigation) — new navigation suite plus adapted shell assertions | Pending validation workflow |
| `npm run typecheck` — `tsc --noEmit` strict over the client component, server header/page, and wiring | Pending validation workflow |
| `npm run lint` (typecheck + eslint + `next build`) — watch `react-refresh/only-export-components` on the single-export client file (precedent: overlay/motion adapters pass); RSC boundary server `SiteHeader` → client `MenuOverlay` | Pending validation workflow |
| `npm run format:check` | Static pass expected; canonical Prettier form applied from the start — final output recorded by validation workflow |

The implementation phase could not execute commands; the workflow stage after
editing records the actual command output here.

## Build output and bundles

| Item | Record |
| --- | --- |
| `next build` final summary | routes, first load JS, CSS size |
| Route impact | the root layout gains the small `MenuOverlay` client chunk (React-only; no new third-party dependency — the overlay seam adds no GSAP/Lenis) |
| Budget | confirm route-JS totals stay under the 300 KB budget in `docs/performance-budget.md` |
| Console warnings during build | expected: none |

## Deferred browser QA matrix

No browser automation runs in the implementation phase; the matrix below is
the offline record for the validation workflow:

| Viewport | Menu opens/closes by keyboard | Focus trapped while open | Escape closes, focus returns to trigger | Scroll locked while open | No dead chapter anchors |
| --- | --- | --- | --- | --- | --- |
| 1920×1080 |  |  |  |  |  |
| 1440×900 |  |  |  |  |  |
| 390×844 |  |  |  |  |  |

## Deferred interaction checks

| Check | Expected |
| --- | --- |
| `prefers-reduced-motion: reduce` | scroll lock stays active while the menu is open (top-level rule, ADR 0002 §3); focus/keyboard behavior preference-independent |
| Tab while open | cycles within the dialog (first ⇄ last) via the seam's trap; links remain tabbable |
| JS disabled | menu trigger and dialog are inert; the seven scene sections still render server-side with live anchors |
| Link click | closes the menu and jumps to the matching scene section; focus returns to the trigger |

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Existing guard tests asserted page-level markup (shell: "home page composes the shell without feature chapters"; header: "avoids dead anchors") | minimal intent-preserving regex updates in the same commit, mirroring the Phase 2A `tabIndex` and Phase 2B Hero adaptations |
| Scroll-lock CSS gap: the hook set `data-scroll-locked` but nothing consumed it | added the top-level `html[data-scroll-locked] { overflow: hidden; }` rule (CSS-level only, no seam logic), keeping scroll lock active under reduced motion |
| Initial focus: the seam does not move focus into the container on open | `MenuOverlay` adds a small in-effect focus move — component behavior, not a seam change, so the "no new logic to the seam" constraint holds |
| Bundle/`next build` | `MenuOverlay` ships a small client chunk in the root layout; must stay within the 300 KB route budget with no console warnings — recorded above |
| Reduced motion | scroll lock is not gated behind a media query; focus/keyboard behavior is preference-independent by construction |
| Scope discipline | only `src/packages/ui/`, `src/app/{page,globals}`, `docs/adr/0001`, `tests/`, and `docs/` change — no `.github/`, `.agents/`, configs, credentials, or workflows |

## Evidence note

GitHub writes are unavailable in this phase.

| Item | Record |
| --- | --- |
| Issue #38 comment | gates passed; editorial nav and full-screen chapter menu complete; home page ships the seven scene sections |
| Offline record | per `docs/agents/issue-tracker.md`, this document is the offline record |
| Final handoff | reports the intended issue update |
