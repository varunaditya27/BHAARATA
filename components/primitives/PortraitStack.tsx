import Image from "next/image";
import { Tilt } from "@/components/primitives/Tilt";

export type Plate = { src: string; alt: string };

/** Three tall pictures at staggered heights, arriving one after another and drifting at different speeds on scroll. */
export function PortraitStack({ plates }: { plates: Plate[] }) {
  const offsets = ["mt-0", "mt-32", "-mt-10"];
  const drift = ["-90px", "-30px", "-60px"];
  return (
    <div className="bh-stagger -mr-6 grid grid-cols-3 items-start gap-5">
      {plates.slice(0, 3).map((p, i) => (
        <div
          key={p.src}
          className={`${offsets[i]} bh-float`}
          style={{ "--i": i + 1, "--bh-float": drift[i] } as unknown as React.CSSProperties}
        >
          <Tilt>
            <div className="relative aspect-[3/5] overflow-hidden bg-black/20">
              <Image src={p.src} alt={p.alt} fill loading="eager" sizes="(min-width: 1024px) 22vw, 0px" className="object-cover" />
            </div>
          </Tilt>
        </div>
      ))}
    </div>
  );
}
