import type { Metadata } from "next";
import { Colophon } from "@/components/layout/Colophon";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  // Share images need absolute URLs. Set NEXT_PUBLIC_SITE_URL to the
  // deployed origin; local builds fall back to the dev server.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "BHĀRATA — an atlas of the Indian subcontinent, 600 to 1700",
  description:
    "A map of the Indian subcontinent from 600 to 1700: which kingdoms held which land, when, and what evidence that rests on.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:font-sans focus:text-sm focus:text-paper"
        >
          Skip to the page content
        </a>
        <GlobalNav />
        <main id="main" className="flex-1">{children}</main>
        <Colophon />
      </body>
    </html>
  );
}
