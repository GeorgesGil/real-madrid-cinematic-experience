# Performance budget

## User-facing targets

- Core Web Vitals at p75 when field data exists: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
- Target 60 FPS on a defined mid-range desktop and recent mid-range mobile; record hardware and throttling when reporting.
- Zero layout shift from images, video posters, or font swaps.

## Transfer budgets

- Initial HTML/CSS/critical JS: ≤250KB compressed.
- Initial hero imagery across all requested variants: ≤700KB desktop, ≤350KB mobile.
- No video requested before interaction or intersection unless it is the measured hero LCP strategy.
- Route JavaScript target: ≤300KB compressed before optional media/player code.

## Loading policy

- In Next.js 16 use `preload` only for the single LCP image; the deprecated `priority` prop is forbidden.
- All `fill` images require accurate `sizes`; non-LCP scenes are lazy.
- Supply AVIF/WebP variants and explicit dimensions or aspect ratios.
- Video provides poster, `muted`, `playsInline`, and multiple resolutions; trailers use `preload="none"` and explicit play.

## Evidence

Record build output, bundle sizes, Lighthouse lab values, console warnings, chosen responsive resources, video network behavior, and a performance trace for pinned scroll. Lab results are not presented as field data.
