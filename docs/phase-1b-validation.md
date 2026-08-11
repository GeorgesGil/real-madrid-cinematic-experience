# Phase 1B validation — design tokens, typography, semantic shell

## Acceptance gates

| Gate | Status |
| --- | --- |
| `npm test` (baseline + content + shell) | Pending validation workflow |
| `npm run typecheck` | Pending validation workflow |
| `npm run lint` (typecheck + eslint + `next build`) | Pending validation workflow |
| `npm run format:check` | Pending validation workflow |

The implementation phase could not execute commands; the workflow stage after
editing records the actual command output here.

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
