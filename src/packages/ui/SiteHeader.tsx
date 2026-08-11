import Link from "next/link";

import { Container } from "./Container";

/**
 * Site-level shell header. Scene navigation is intentionally out of scope
 * until the scenes land in a later phase, so links never point at dead
 * anchors (see docs/adr/0001-design-tokens-typography-shell.md).
 */
export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 bg-ink/90 border-b border-silver/25 backdrop-blur-sm"
    >
      <Container>
        <div className="flex items-center justify-between gap-6 min-h-16">
          <p
            className="font-display text-lg font-semibold tracking-[0.18em] text-white"
          >
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
        </div>
      </Container>
    </header>
  );
}
