import type { Metadata } from "next";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "BHĀRATA — a source-aware atlas of the Indian subcontinent",
  description:
    "A source-aware, time-aware digital atlas for exploring the political, geographic, and evidential history of the Indian subcontinent.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <GlobalNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
