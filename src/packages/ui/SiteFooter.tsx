import { Container } from "./Container";

/**
 * Shell footer carrying the mandatory independent, non-affiliated notice
 * (CONTEXT.md: "Public test experience").
 */
export function SiteFooter() {
  return (
    <footer className="bg-navy/50 border-t border-silver/25">
      <Container>
        <div className="flex flex-col gap-2 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="font-mono text-xs uppercase tracking-[0.22em] text-silver"
          >
            RM — Cinematic Concept
          </p>
          <p className="max-w-prose text-sm text-silver">
            An independent, non-commercial concept experience. Not affiliated
            with, endorsed by, or authorized by Real Madrid C.F.
          </p>
        </div>
      </Container>
    </footer>
  );
}
