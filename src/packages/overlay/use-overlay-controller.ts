"use client";

import { useEffect, useReducer, type RefObject } from "react";

import {
  createOverlayState,
  isScrollLocked,
  overlayReducer,
  shouldTrapFocus,
} from "./overlay.ts";

/** Options accepted by the overlay controller hook. */
export interface UseOverlayControllerOptions {
  /** Ref to the overlay container; attached before the overlay opens. */
  containerRef: RefObject<HTMLElement | null>;
  /** Selector of the element that receives focus back when the overlay closes. */
  returnFocusSelector: string;
  /** True while the overlay is open; the consumer owns this decision. */
  open: boolean;
}

/**
 * Client-only overlay adapter over the pure `overlay.ts` seam. All DOM access
 * happens inside effects, never during render, so the hook is SSR-safe.
 *
 * - The `open` prop is mirrored into the reducer, keeping the seam the single
 *   source of truth.
 * - Escape (and only Escape) closes the overlay through the seam.
 * - While open, `data-scroll-locked` is set on `<html>` and removed
 *   symmetrically on close.
 * - While open, Tab cycles within the overlay container; on close, focus is
 *   restored to the recorded trigger selector.
 *
 * Deliberately not exported from the overlay barrel — consumers opt in via
 * `@/packages/overlay/use-overlay-controller`.
 */
export function useOverlayController({
  containerRef,
  returnFocusSelector,
  open,
}: UseOverlayControllerOptions): void {
  const [state, dispatch] = useReducer(
    overlayReducer,
    undefined,
    createOverlayState,
  );

  // Mirror the consumer's open decision into the reducer.
  useEffect(() => {
    if (open) {
      dispatch({ type: "open", returnFocusSelector });
      return;
    }
    dispatch({ type: "close" });
  }, [open, returnFocusSelector]);

  // Escape closes the overlay; the listener exists only while open.
  useEffect(() => {
    if (!isScrollLocked(state)) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      dispatch({ type: "keydown", key: event.key });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [state]);

  // Scroll lock: data-scroll-locked on <html> while open, symmetric removal.
  useEffect(() => {
    if (!isScrollLocked(state)) {
      return;
    }
    document.documentElement.dataset.scrollLocked = "";
    return () => {
      delete document.documentElement.dataset.scrollLocked;
    };
  }, [state]);

  // Focus trap: Tab cycles inside the container while open; focus is restored
  // to the recorded trigger when the overlay closes.
  useEffect(() => {
    const container = containerRef.current;
    if (!shouldTrapFocus(state) || container === null) {
      if (state.returnFocusSelector !== null) {
        const trigger = document.querySelector<HTMLElement>(
          state.returnFocusSelector,
        );
        trigger?.focus();
      }
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }
      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
    };
  }, [state, containerRef]);
}
