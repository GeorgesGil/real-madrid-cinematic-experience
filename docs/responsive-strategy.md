# Responsive strategy

## Breakpoint intent

- Wide desktop (≥1920): full cinematic composition, generous negative space, maximum three active pinned scenes.
- Desktop/laptop (1024–1919): preserve composition while reducing media crop risk and headline scale.
- Tablet (768–1023): shorter pins, touch-first controls, fewer simultaneous layers.
- Mobile (<768): vertical editorial flow, 2–3 layers, poster-first media, explicit controls, and no interaction available only through hover.

## Required viewport QA

Validate 2560×1440, 1920×1080, 1440×900, tablet portrait/landscape, 390×844, and 430×932. The acceptance screenshots for the implementation are 1920×1080, 1440×900, 390×844, and 430×932.

## Content and interaction

- Giant headings use `clamp()` plus tested maximum line lengths; never shrink below legibility to preserve a desktop composition.
- Team navigation exposes previous/next buttons and selection state to assistive technology.
- Fullscreen menu and video dialog trap focus only while modal, close on Escape, and return focus to their trigger.
- Coarse pointers keep the native cursor and replace hover-only metadata with visible/tappable disclosure.

## Reduced motion

The stable state is the mobile baseline: no smooth scrolling, no parallax/scrub, no large zoom, no autoplay decorative video, and all text immediately available in DOM order.
