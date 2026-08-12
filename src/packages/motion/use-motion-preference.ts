"use client";

import { useSyncExternalStore } from "react";

import {
  MOTION_QUERY,
  SSR_MOTION_PREFERENCE,
  resolveMotionPreference,
  type MotionPreference,
} from "./preference.ts";

/**
 * Module-scope store glue, stable across renders so the hook never re-subscribes
 * on re-render. The server snapshot is the static SSR default, which keeps
 * hydration and first paint identical to the CSS baseline.
 */
function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mediaQueryList = window.matchMedia(MOTION_QUERY);
  mediaQueryList.addEventListener("change", onStoreChange);
  return () => {
    mediaQueryList.removeEventListener("change", onStoreChange);
  };
}

function getSnapshot(): MotionPreference {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return SSR_MOTION_PREFERENCE;
  }
  return resolveMotionPreference(window.matchMedia(MOTION_QUERY).matches);
}

/**
 * SSR-safe motion-preference hook. `matchMedia` is only ever read through the
 * store glue, never during the server render, and the server snapshot is the
 * static default.
 */
export function useMotionPreference(): MotionPreference {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => SSR_MOTION_PREFERENCE,
  );
}
