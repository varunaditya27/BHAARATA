import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ImageKey } from "@/lib/domain/types";
import { getAtlasData } from "@/lib/data/atlas-server";
import { atlasAccess } from "@/lib/data/atlas-data";
import { formatDateRange } from "@/lib/domain/time";
import { polityGeometry, silhouettePath } from "@/lib/geo/silhouette";
import { darkenHex } from "@/lib/utils/color";

export const alt = "A kingdom in the BHĀRATA atlas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";



const font = (file: string) => readFile(join(process.cwd(), "assets/og-fonts", file));

/** The card shown when a kingdom's page is shared: its photograph, its
 * outline, its name and dates — and the placeholder-data note. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getAtlasData();
  const { images } = data;
  const { getPolityBySlug } = atlasAccess(data);
  const { slug } = await params;
  const polity = getPolityBySlug(slug);
  const [zodiak, ranade] = await Promise.all([font("Zodiak-400.ttf"), font("Ranade-400.ttf")]);

  const hero = polity?.heroImageKey ? images[polity.heroImageKey as ImageKey] : undefined;
  const photo = hero
    ? `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "public", hero.file))).toString("base64")}`
    : null;
  const geometry = polity ? polityGeometry(polity.id, data) : undefined;
  const name = polity?.name ?? "Unknown kingdom";
  // Shrink long names so they stay inside the text panel.
  const nameSize = Math.min(104, Math.floor(880 / Math.max(6, name.length)));

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: 1200, height: 630, background: "#031c22", color: "#fff7e8" }}>
        {photo && (
          <img src={photo} alt="" width={680} height={630} style={{ position: "absolute", left: 520, top: 0, width: 680, height: 630, objectFit: "cover" }} />
        )}
        {/* Satori has no "inset"; the fade is an explicit box over the photo's left edge. */}
        <div
          style={{
            position: "absolute",
            left: 520,
            top: 0,
            width: 260,
            height: 630,
            display: "flex",
            backgroundImage: "linear-gradient(90deg, #031c22, rgba(11,7,32,0))",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 0 56px 64px", width: 600, height: 630 }}>
          <div style={{ display: "flex", fontFamily: "Ranade", fontSize: 20, color: "rgba(255,247,232,0.7)" }}>
            BHĀRATA, a historical atlas
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {polity && geometry && (
              <svg width="88" height="88" viewBox="0 0 100 100" style={{ marginBottom: 22 }}>
                <path d={silhouettePath(geometry, 100, 4)} fill={polity.accentColor} stroke={darkenHex(polity.accentColor, 0.4)} strokeWidth="1.5" />
              </svg>
            )}
            <div style={{ display: "flex", fontFamily: "Ranade", fontSize: 22, color: "rgba(255,247,232,0.75)" }}>
              {polity ? `${polity.polityType} in ${polity.region}` : "Kingdom"}
            </div>
            <div style={{ display: "flex", fontFamily: "Zodiak", fontSize: nameSize, lineHeight: 1.05, marginTop: 10 }}>
              {name}
            </div>
            {polity && (
              <div style={{ display: "flex", fontFamily: "Zodiak", fontSize: 36, marginTop: 14, color: "rgba(255,247,232,0.9)" }}>
                {formatDateRange(polity.period)}
              </div>
            )}
          </div>
          <div style={{ display: "flex", fontFamily: "Ranade", fontSize: 18, color: "rgba(255,247,232,0.55)" }}>
            Borders: Cliopatria. Summary: Wikipedia.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Zodiak", data: zodiak, style: "normal", weight: 400 },
        { name: "Ranade", data: ranade, style: "normal", weight: 400 },
      ],
    },
  );
}
