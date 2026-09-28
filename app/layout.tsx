import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BHĀRATA — Historical Atlas of Indian Polities",
  description:
    "An evidence-led historical atlas connecting rulers, polities, places, events, monuments, inscriptions and sources across time."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
