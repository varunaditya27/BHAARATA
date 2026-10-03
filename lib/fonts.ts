import localFont from "next/font/local";
import {
  Anek_Devanagari,
  Anek_Kannada,
  Anek_Tamil,
  Anek_Telugu,
  Tiro_Devanagari_Hindi,
  Tiro_Kannada,
  Tiro_Tamil,
  Tiro_Telugu,
} from "next/font/google";

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

/*
 * Indic scripts. Native names in the data are Tamil (Chola, Pandya,
 * Chera), Kannada (Rashtrakuta, Chalukya, Hoysala), and Telugu
 * (Vijayanagara) — not Devanagari, which is all that used to be loaded,
 * so every native name was rendering in a system fallback. Each family
 * covers one script plus Latin; stacking them in one CSS font-family lets
 * the browser pick per glyph. Not preloaded: they're only needed on pages
 * that show a native name, and swap in without layout shift at these sizes.
 */
// next/font reads these option objects statically at build time — they
// must be literal in each call (no shared spread), or the build fails.
const anekTamil = Anek_Tamil({ subsets: ["tamil"], variable: "--font-anek-tamil", display: "swap", preload: false });
const anekKannada = Anek_Kannada({ subsets: ["kannada"], variable: "--font-anek-kannada", display: "swap", preload: false });
const anekTelugu = Anek_Telugu({ subsets: ["telugu"], variable: "--font-anek-telugu", display: "swap", preload: false });
export const anekDevanagari = Anek_Devanagari({ subsets: ["devanagari"], variable: "--font-anek-devanagari", display: "swap", preload: false });

const tiroTamil = Tiro_Tamil({ subsets: ["tamil"], weight: "400", variable: "--font-tiro-tamil", display: "swap", preload: false });
const tiroKannada = Tiro_Kannada({ subsets: ["kannada"], weight: "400", variable: "--font-tiro-kannada", display: "swap", preload: false });
const tiroTelugu = Tiro_Telugu({ subsets: ["telugu"], weight: "400", variable: "--font-tiro-telugu", display: "swap", preload: false });
export const tiroDevanagari = Tiro_Devanagari_Hindi({ subsets: ["devanagari"], weight: "400", variable: "--font-tiro-devanagari", display: "swap", preload: false });

export const fontVariables = [
  zodiak,
  ranade,
  anekTamil,
  anekKannada,
  anekTelugu,
  anekDevanagari,
  tiroTamil,
  tiroKannada,
  tiroTelugu,
  tiroDevanagari,
]
  .map((f) => f.variable)
  .join(" ");
