import Link from "next/link";

import { MenuOverlay } from "@/packages/ui/MenuOverlay";

import { Container } from "./Container";

/**
 * Site-level shell header. The wordmark and Home link stay server-rendered;
 * the chapter menu is composed as a client overlay via deep import
 * (`@/packages/ui/MenuOverlay`, ADR 0002 §1), so no client JS enters the
 * route bundle until the menu mounts. Chapter anchors live only in
 * `MenuOverlay` and resolve to sections derived from the same `scenes`
 * fixture on the home page (ADR 0001 no-dead-links rule).
 */
export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 bg-ink/90 border-b border-silver/25 backdrop-blur-sm"
    >
      <Container>
        <div className="flex items-center justify-between gap-6 min-h-16">
          <p className="font-display text-lg font-semibold tracking-[0.18em] text-white">
            RM — Cinematic Concept
          </p>
          <nav aria-label="Site">
            <ul className="flex items-center gap-6">
              <li>
                <Link
                  href="/"
                  className="font-mono text-xs uppercase tracking-[0.22em] text-silver transition-colors hover:text-white"
                >
                  Home
                </Link>
              </li>
            </ul>
          </nav>
          <MenuOverlay />
        </div>
      </Container>
    </header>
  );
}
