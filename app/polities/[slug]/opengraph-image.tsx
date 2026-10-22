import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { images, type ImageKey } from "@/lib/data/images";
import { getPolityBySlug, polities } from "@/lib/data/prototype";
import { formatDateRange } from "@/lib/domain/time";
import { polityGeometry, silhouettePath } from "@/lib/geo/silhouette";
import { darkenHex } from "@/lib/utils/color";

export const alt = "A kingdom in the BHĀRATA atlas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return polities.map((p) => ({ slug: p.slug }));
}

const font = (file: string) => readFile(join(process.cwd(), "assets/og-fonts", file));

/** The card shown when a kingdom's page is shared: its photograph, its
 * outline, its name and dates — and the placeholder-data note. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const polity = getPolityBySlug(slug);
  const [zodiak, ranade] = await Promise.all([font("Zodiak-400.ttf"), font("Ranade-400.ttf")]);

  const hero = polity?.heroImageKey ? images[polity.heroImageKey as ImageKey] : undefined;
  const photo = hero
    ? `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "public", hero.file))).toString("base64")}`
    : null;
  const geometry = polity ? polityGeometry(polity.id) : undefined;
  const name = polity?.name ?? "Unknown kingdom";
  // Shrink long names so they stay inside the text panel.
  const nameSize = Math.min(104, Math.floor(880 / Math.max(6, name.length)));

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: 1200, height: 630, background: "#1b1813", color: "#f3ede0" }}>
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
            backgroundImage: "linear-gradient(90deg, #1b1813, rgba(27,24,19,0))",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 0 56px 64px", width: 600, height: 630 }}>
          <div style={{ display: "flex", fontFamily: "Ranade", fontSize: 20, color: "rgba(243,237,224,0.7)" }}>
            BHĀRATA, a historical atlas
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {polity && geometry && (
              <svg width="88" height="88" viewBox="0 0 100 100" style={{ marginBottom: 22 }}>
                <path d={silhouettePath(geometry, 100, 4)} fill={polity.accentColor} stroke={darkenHex(polity.accentColor, 0.4)} strokeWidth="1.5" />
              </svg>
            )}
            <div style={{ display: "flex", fontFamily: "Ranade", fontSize: 22, color: "rgba(243,237,224,0.75)" }}>
              {polity ? `${polity.polityType} in ${polity.region}` : "Kingdom"}
            </div>
            <div style={{ display: "flex", fontFamily: "Zodiak", fontSize: nameSize, lineHeight: 1.05, marginTop: 10 }}>
              {name}
            </div>
            {polity && (
              <div style={{ display: "flex", fontFamily: "Zodiak", fontSize: 36, marginTop: 14, color: "rgba(243,237,224,0.9)" }}>
                {formatDateRange(polity.period)}
              </div>
            )}
          </div>
          <div style={{ display: "flex", fontFamily: "Ranade", fontSize: 18, color: "rgba(243,237,224,0.55)" }}>
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
