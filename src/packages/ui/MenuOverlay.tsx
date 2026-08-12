"use client";

import { useEffect, useRef, useState } from "react";

import { scenes } from "@/packages/content";
import { useOverlayController } from "@/packages/overlay/use-overlay-controller";

/**
 * Client-only full-screen chapter menu (Phase 2C).
 *
 * The component owns only the `open` decision; every modal behavior is
 * delegated to the OverlayController adapter: focus trapping, Escape-only
 * close, `data-scroll-locked` scroll locking, and focus restoration to the
 * trigger. The seven chapter links and the home-page section ids are both
 * derived from the single `scenes` fixture, so no chapter anchor can dangle
 * (ADR 0001 no-dead-links rule). Deliberately not exported from the ui barrel
 * — consumers opt in via `@/packages/ui/MenuOverlay` (ADR 0002 §1).
 */
export function MenuOverlay() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useOverlayController({
    containerRef,
    returnFocusSelector: "#menu-trigger",
    open,
  });

  // Move focus into the dialog when it opens. Component-level, in-effect DOM
  // access only, so the render stays SSR-safe (ADR 0002 §2).
  useEffect(() => {
    if (!open) {
      return;
    }
    containerRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        id="menu-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="menu-overlay"
        aria-label="Menu"
        className="font-mono text-xs uppercase tracking-[0.22em] text-silver transition-colors hover:text-white"
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>
      {open ? (
        <div
          id="menu-overlay"
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Chapters"
          tabIndex={-1}
          className="menu-overlay"
        >
          <ul className="menu-overlay-list">
            {scenes.map((scene) => (
              <li key={scene.id}>
                <a
                  href={`#${scene.id}`}
                  className="menu-overlay-link"
                  onClick={() => setOpen(false)}
                >
                  {scene.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
