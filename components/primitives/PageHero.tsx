import { RisingTitle } from "@/components/entity/RisingTitle";

/**
 * The opening of an index page: a full-width field of one flat colour, the title set very large,
 * a single sentence, and room for real pictures beside it.
 */
export function PageHero({
  title,
  intro,
  field,
  ink = "#fff7e8",
  tall = true,
  media,
  children,
}: {
  title: string;
  intro: string;
  field: string;
  ink?: string;
  tall?: boolean;
  media?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: field, color: ink }}>
      <div
        className="mx-auto grid max-w-[1400px] items-end gap-12 px-6 pb-14 pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
        style={{ minHeight: tall ? "min(84vh, 52rem)" : "min(42vh, 24rem)" }}
      >
        <div className="relative z-10">
          <RisingTitle text={title} className="text-[clamp(4.5rem,11.5vw,10.5rem)] leading-[0.86] tracking-[-0.035em]" />
          <p className="mt-8 max-w-xl font-sans text-xl leading-relaxed">{intro}</p>
          {children}
        </div>
        {media && <div className="relative hidden lg:block">{media}</div>}
      </div>
    </section>
  );
}
