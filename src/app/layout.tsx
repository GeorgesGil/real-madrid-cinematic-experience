import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Oswald } from "next/font/google";

import { MotionPreferenceProvider } from "@/packages/motion";
import { SiteFooter, SiteHeader, SkipLink } from "@/packages/ui";

import "./globals.css";

export const metadata: Metadata = {
  title: "Real Madrid — Cinematic Concept",
  description: "An independent cinematic editorial concept.",
};

/*
 * Licensed typography (see docs/adr/0001-design-tokens-typography-shell.md):
 * Oswald is the condensed display face for monumental headlines, Inter is the
 * neutral grotesk body, and IBM Plex Mono is the tabular utility face. All
 * three are SIL Open Font License families, self-hosted by next/font at build
 * time with no runtime third-party requests.
 */
const display = Oswald({
  variable: "--font-oswald",
  display: "swap",
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

/*
 * IBM Plex Mono is not a variable font, so an explicit weight range is
 * required (Oswald and Inter above ship default weights).
 */
const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="bg-ink font-sans text-white antialiased">
        <MotionPreferenceProvider>
          <SkipLink />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </MotionPreferenceProvider>
      </body>
    </html>
  );
}
