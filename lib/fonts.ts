import localFont from "next/font/local";
import { Anek_Devanagari, Tiro_Devanagari_Hindi } from "next/font/google";

/**
 * Display face. Self-hosted from Fontshare (Zodiak only ships 400/700).
 * Used for large editorial headings — polity names, hero titles.
 */
export const zodiak = localFont({
  src: [
    { path: "../public/fonts/Zodiak-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Zodiak-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-zodiak",
  display: "swap",
});

/**
 * Interface face. Self-hosted from Fontshare.
 * Used for body copy, labels, metadata, navigation.
 */
export const ranade = localFont({
  src: [
    { path: "../public/fonts/Ranade-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Ranade-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Ranade-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ranade",
  display: "swap",
});

/** Multilingual interface face for transliterated/Indic labels in running text. */
export const anekDevanagari = Anek_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-anek-devanagari",
  display: "swap",
});

/** Historical Devanagari display face — used sparingly for epigraphic/manuscript framing. */
export const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-tiro-devanagari",
  display: "swap",
});

export const fontVariables = `${zodiak.variable} ${ranade.variable} ${anekDevanagari.variable} ${tiroDevanagari.variable}`;
