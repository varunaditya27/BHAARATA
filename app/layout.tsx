import type { Metadata } from "next";
import { Colophon } from "@/components/layout/Colophon";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  // Share images need absolute URLs. Set NEXT_PUBLIC_SITE_URL to the
  // deployed origin; local builds fall back to the dev server.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "BHĀRATA — an atlas of the Indian subcontinent, 700 to 1650",
  description:
    "A map of the Indian subcontinent from 700 to 1650: which kingdoms held which land, when, and what evidence that rests on.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <GlobalNav />
        <main className="flex-1">{children}</main>
        <Colophon />
      </body>
    </html>
  );
}
