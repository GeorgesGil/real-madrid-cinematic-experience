import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Madrid — Cinematic Concept",
  description: "An independent cinematic editorial concept.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
