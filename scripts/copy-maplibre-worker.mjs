// MapLibre GL JS resolves its web worker via `import.meta.url` inside
// node_modules at runtime. Turbopack (Next.js 16) doesn't serve that
// correctly — the worker fails with "Worker failed to load. Check that
// the worker URL is correct." — so we self-host a copy in public/ and
// point MapLibre at it explicitly (see components/map/HistoricalMap.tsx).
//
// The worker file is itself an ES module that imports
// "./maplibre-gl-shared.mjs" as a sibling — that file must be copied
// alongside it (same filename) or the browser 404s on the import and
// throws the same misleading "Worker failed to load" error.
//
// Runs on every `npm install` via the postinstall hook.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "node_modules/maplibre-gl/dist");
const destDir = join(root, "public/vendor");

const files = [
  { src: "maplibre-gl-worker.mjs", dest: "maplibre-gl-worker.js" },
  // Must keep this exact filename — the worker's `import` statement
  // references it literally.
  { src: "maplibre-gl-shared.mjs", dest: "maplibre-gl-shared.mjs" },
];

mkdirSync(destDir, { recursive: true });

for (const { src, dest } of files) {
  const srcPath = join(distDir, src);
  if (!existsSync(srcPath)) {
    console.warn("[copy-maplibre-worker] source not found, skipping:", srcPath);
    continue;
  }
  copyFileSync(srcPath, join(destDir, dest));
  console.log(`[copy-maplibre-worker] copied ${src} -> public/vendor/${dest}`);
}
