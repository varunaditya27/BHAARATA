"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  CircleDot,
  Compass,
  ExternalLink,
  GitBranch,
  Layers3,
  Map,
  Menu,
  Search,
  ShieldCheck,
  X
} from "lucide-react";

type Polity = {
  id: string;
  name: string;
  era: string;
  span: string;
  capital: string;
  region: string;
  summary: string;
  color: string;
  coordinates: [number, number];
  tags: string[];
};

const POLITIES: Polity[] = [
  { id: "maurya", name: "Maurya", era: "Imperial polity", span: "c. 322–185 BCE", capital: "Pāṭaliputra", region: "North & Central India", summary: "A major early imperial polity with a substantial inscriptional record, especially under Aśoka.", color: "#8d3b25", coordinates: [28, 33], tags: ["early empire", "inscriptions", "Ashoka"] },
  { id: "satavahana", name: "Sātavāhana", era: "Deccan polity", span: "c. 1st c. BCE–3rd c. CE", capital: "Pratiṣṭhāna", region: "Deccan", summary: "A long-lived Deccan polity visible through inscriptions, coinage, trade networks and religious sites.", color: "#8b6e32", coordinates: [51, 56], tags: ["Deccan", "coinage", "trade"] },
  { id: "gupta", name: "Gupta", era: "Imperial polity", span: "c. 4th–6th c. CE", capital: "Pāṭaliputra / Ujjain", region: "North India", summary: "A polity documented by inscriptions and coinage across northern India, with changing centres of political power.", color: "#675649", coordinates: [47, 34], tags: ["coins", "inscriptions", "northern India"] },
  { id: "chalukya", name: "Cālukya", era: "Deccan polity", span: "c. 6th–8th c. CE", capital: "Vātāpi", region: "Karnataka & Deccan", summary: "A major Deccan dynasty associated with a rich inscriptional and monumental record centred on the northern Karnataka region.", color: "#4f6151", coordinates: [55, 60], tags: ["Karnataka", "architecture", "inscriptions"] },
  { id: "chola", name: "Cōḻa", era: "Tamil polity", span: "c. 9th–13th c. CE", capital: "Taṃjāvūr / Gaṅgaikoṇḍacōḻapuram", region: "Tamil country & Indian Ocean", summary: "A richly documented polity whose inscriptions record administration, land, temple endowments and local institutions.", color: "#a0552f", coordinates: [64, 72], tags: ["Tamil country", "temples", "maritime"] },
  { id: "vijayanagara", name: "Vijayanagara", era: "South Indian empire", span: "c. 14th–17th c. CE", capital: "Vijayanagara", region: "South India", summary: "A complex imperial network documented through inscriptions, monuments, coins, architecture and travel accounts.", color: "#5a4764", coordinates: [52, 67], tags: ["empire", "monuments", "Karnataka"] }
];

const EVIDENCE = [
  { icon: BookOpen, label: "INSCRIPTIONS", title: "Words fixed in stone", body: "Epigraphic records connect people, places, institutions and political claims to a physical object and a find context.", count: "08 records" },
  { icon: CircleDot, label: "COINS", title: "Power in metal", body: "Numismatic records bring rulers, mints, metals, legends and iconography into the same historical model.", count: "14 records" },
  { icon: Layers3, label: "MONUMENTS", title: "History with coordinates", body: "Sites and structures link historical actors to surviving places, building traditions and archaeological documentation.", count: "11 records" }
];

const TIMELINE_EVENTS = [
  { year: 322, label: "Maurya rises", tone: "#8d3b25" },
  { year: 185, label: "Maurya ends", tone: "#8d3b25" },
  { year: 78, label: "Sātavāhana horizon", tone: "#8b6e32" },
  { year: 320, label: "Gupta era", tone: "#675649" },
  { year: 543, label: "Early Cālukyas", tone: "#4f6151" },
  { year: 850, label: "Cōḻa expansion", tone: "#a0552f" },
  { year: 1336, label: "Vijayanagara", tone: "#5a4764" },
  { year: 1565, label: "Battle of Tāḷikōṭa", tone: "#4f6151" }
];

function yearLabel(year: number) {
  return year < 1 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

export default function Atlas() {
  const [year, setYear] = useState(1200);
  const [selectedId, setSelectedId] = useState("chola");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const selected = POLITIES.find((p) => p.id === selectedId) ?? POLITIES[0];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POLITIES;
    return POLITIES.filter((p) => [p.name, p.region, p.capital, p.era, ...p.tags].join(" ").toLowerCase().includes(q));
  }, [query]);

  const activePolities = POLITIES.filter((p) => {
    const [rawStart] = p.span.match(/-?\d+/) ?? ["0"];
    const start = Number(rawStart);
    return year >= start || p.id === "vijayanagara";
  });

  return (
    <main>
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(245,240,231,.92)] backdrop-blur">
        <div className="mx-auto flex h-[62px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#" className="focus-ring flex items-baseline gap-3">
            <span className="editorial-serif text-[19px] tracking-[.1em]">BHĀRATA</span>
            <span className="mono hidden text-[9px] uppercase tracking-[.19em] text-[var(--muted)] sm:inline">Historical Atlas</span>
          </a>
          <nav className="hidden items-center gap-7 text-[10px] uppercase tracking-[.16em] text-[var(--muted)] md:flex">
            <a className="focus-ring hover:text-[var(--ink)]" href="#atlas">Atlas</a>
            <a className="focus-ring hover:text-[var(--ink)]" href="#evidence">Evidence</a>
            <a className="focus-ring hover:text-[var(--ink)]" href="#method">Method</a>
          </nav>
          <button onClick={() => setMobileOpen((v) => !v)} aria-label={mobileOpen ? "Close menu" : "Open menu"} className="focus-ring md:hidden">
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-[var(--line)] px-5 py-4 md:hidden">
            <div className="grid gap-3 text-[11px] uppercase tracking-[.14em] text-[var(--muted)]">
              <a href="#atlas" onClick={() => setMobileOpen(false)}>Atlas</a>
              <a href="#evidence" onClick={() => setMobileOpen(false)}>Evidence</a>
              <a href="#method" onClick={() => setMobileOpen(false)}>Method</a>
            </div>
          </div>
        )}
      </header>

      <section className="mx-auto max-w-[1500px] px-5 pb-14 pt-14 sm:px-8 lg:px-12 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_.72fr] lg:items-end">
          <div>
            <p className="mono mb-6 text-[9px] uppercase tracking-[.24em] text-[var(--accent)]">A source-led atlas of Indian polities</p>
            <h1 className="editorial-serif max-w-[1080px] text-[clamp(4.2rem,8.6vw,9.3rem)] font-normal leading-[.83] tracking-[-.065em]">India, <em>in time.</em></h1>
          </div>
          <div className="border-l border-[var(--line)] pl-6 pb-1">
            <p className="max-w-[410px] text-[15px] leading-7 text-[#514b43]">Explore rulers, political entities and places through time, then follow the inscriptions, coins, monuments and sources behind the record.</p>
            <div className="mt-7 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span className="mono text-[9px] uppercase tracking-[.16em] text-[var(--muted)]">prototype / evidence-led</span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid border-y border-[var(--line)] lg:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[["06","polities"],["14","rulers"],["33","sites"],["48","sources"]].map(([value,label], i) => (
              <div key={label} className={`px-4 py-5 sm:px-6 ${i > 0 ? "border-l border-[var(--line)]" : ""}`}>
                <div className="editorial-serif text-3xl">{value}</div>
                <div className="mono mt-1 text-[8px] uppercase tracking-[.15em] text-[var(--muted)]">{label}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--line)] px-5 py-5 lg:border-l lg:border-t-0 lg:px-7">
            <div className="flex items-center gap-2"><ShieldCheck size={14} /><span className="mono text-[9px] uppercase tracking-[.15em]">Claims stay attached to sources</span></div>
          </div>
        </div>
      </section>

      <section id="atlas" className="mx-auto max-w-[1500px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="mono text-[9px] uppercase tracking-[.2em] text-[var(--muted)]">01 / Atlas</div><h2 className="editorial-serif mt-2 text-4xl font-normal">A map that changes with time.</h2></div>
          <div className="mono text-[9px] uppercase tracking-[.13em] text-[var(--muted)]">Schematic geography / not modern borders</div>
        </div>

        <div className="grid border-y border-[var(--line)] lg:grid-cols-[1.2fr_.54fr]">
          <div className="relative min-h-[650px] overflow-hidden border-b border-[var(--line)] lg:border-b-0 lg:border-r">
            <div className="absolute left-5 top-5 z-10 flex items-center gap-2 bg-[rgba(245,240,231,.88)] px-3 py-2 backdrop-blur sm:left-7 sm:top-7"><Map size={13} /><span className="mono text-[8px] uppercase tracking-[.16em]">Historical geography</span></div>
            <div className="map-grid relative h-full min-h-[650px] overflow-hidden">
              <div className="absolute inset-[8%_10%]">
                <div className="absolute left-[4%] top-[13%] h-[70%] w-[42%] rotate-6 rounded-[48%_45%_54%_46%] border border-[#6e665a]/40" />
                <div className="absolute left-[29%] top-[6%] h-[72%] w-[44%] -rotate-[12deg] rounded-[51%_48%_46%_52%] border border-[#6e665a]/35" />
                <div className="absolute left-[22%] top-[35%] h-[40%] w-[58%] rotate-[9deg] rounded-[56%_42%_55%_45%] border border-[#6e665a]/28" />
                <div className="absolute left-[10%] top-[34%] h-px w-[72%] rotate-[18deg] bg-[#6e665a]/25" />
                <div className="absolute left-[14%] top-[60%] h-px w-[65%] -rotate-[9deg] bg-[#6e665a]/24" />
                <div className="absolute left-[54%] top-[12%] h-[70%] w-px rotate-[13deg] bg-[#6e665a]/22" />
                {POLITIES.map((p) => {
                  const active = activePolities.some((x) => x.id === p.id);
                  const [x, y] = p.coordinates;
                  return (
                    <button key={p.id} onClick={() => setSelectedId(p.id)} aria-label={`Select ${p.name}`} className="focus-ring group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                      <span className="relative block h-3 w-3 rounded-full border border-[var(--ink)] bg-[var(--paper)] transition-transform duration-150 group-hover:scale-125" style={{ opacity: active ? 1 : .35 }}>
                        {selected.id === p.id && <span className="absolute -inset-2 rounded-full border border-current" style={{ color: p.color }} />}
                      </span>
                      <span className={`mono absolute left-5 top-0 whitespace-nowrap text-[8px] uppercase tracking-[.08em] ${selected.id === p.id ? "opacity-100" : "opacity-55 group-hover:opacity-100"}`}>{p.capital}</span>
                    </button>
                  );
                })}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 border border-[var(--line)] bg-[rgba(245,240,231,.8)] px-3 py-2"><Compass size={12} /><span className="mono text-[8px] uppercase tracking-[.12em]">north</span></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--line)] bg-[rgba(245,240,231,.95)] px-5 py-4 sm:px-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><div className="mono text-[8px] uppercase tracking-[.16em] text-[var(--muted)]">Selected year</div><div className="editorial-serif text-2xl">{yearLabel(year)}</div></div>
                  <div className="flex-1 sm:max-w-[720px]">
                    <input aria-label="Historical year" className="range" type="range" min="300" max="1700" value={year} onChange={(e) => setYear(Number(e.target.value))} />
                    <div className="flex justify-between">{["300","700","1100","1500","1700"].map((x) => <span key={x} className="mono text-[8px] text-[var(--faint)]">{x}</span>)}</div>
                  </div>
                  <div className="mono hidden max-w-[180px] text-right text-[8px] uppercase tracking-[.11em] text-[var(--muted)] sm:block">Use the timeline as a window into the database</div>
                </div>
              </div>
            </div>
          </div>

          <aside className="flex flex-col">
            <div className="border-b border-[var(--line)] p-5 sm:p-7">
              <div className="flex items-center justify-between"><span className="mono text-[8px] uppercase tracking-[.18em] text-[var(--muted)]">Selected polity</span><button className="focus-ring inline-flex items-center gap-1 text-[9px] uppercase tracking-[.12em]" onClick={() => setSelectedId("chola")}>Home state <ChevronRight size={12} /></button></div>
              <div className="mt-7 flex items-start justify-between gap-4">
                <div><h3 className="editorial-serif text-[42px] font-normal leading-[.9]">{selected.name}</h3><p className="mono mt-3 text-[9px] uppercase tracking-[.1em] text-[var(--muted)]">{selected.era}</p></div>
                <span className="h-3 w-3 rounded-full" style={{ background: selected.color }} />
              </div>
              <p className="mt-6 text-[13px] leading-6 text-[#504a42]">{selected.summary}</p>
              <dl className="mt-7 grid grid-cols-2 border-t border-[var(--line)] pt-4">
                <div><dt className="mono text-[8px] uppercase tracking-[.13em] text-[var(--muted)]">Period</dt><dd className="mt-1 text-[12px]">{selected.span}</dd></div>
                <div><dt className="mono text-[8px] uppercase tracking-[.13em] text-[var(--muted)]">Capital</dt><dd className="mt-1 text-[12px]">{selected.capital}</dd></div>
              </dl>
              <div className="mt-5"><div className="mono text-[8px] uppercase tracking-[.13em] text-[var(--muted)]">Keywords</div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
              <button className="focus-ring mt-7 inline-flex items-center gap-2 border-b border-[var(--ink)] pb-1 text-[9px] uppercase tracking-[.15em]">Open full record <ArrowUpRight size={12} /></button>
            </div>
            <div className="flex-1 p-5 sm:p-7">
              <div className="flex items-center justify-between"><span className="mono text-[8px] uppercase tracking-[.18em] text-[var(--muted)]">Browse</span><Search size={14} className="text-[var(--muted)]" /></div>
              <label className="mt-5 block"><span className="sr-only">Search polity</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="dynasty, region, capital..." className="focus-ring w-full border-b border-[var(--line-strong)] bg-transparent py-3 text-[12px] outline-none placeholder:text-[var(--faint)]" /></label>
              <div className="mt-4">{filtered.map((p) => <button key={p.id} onClick={() => setSelectedId(p.id)} className={`focus-ring flex w-full items-center justify-between border-b border-[var(--line)] py-4 text-left ${p.id === selected.id ? "bg-[var(--paper-3)] px-2" : "hover:bg-[rgba(229,218,200,.45)]"}`}><span><span className="editorial-serif text-[19px]">{p.name}</span><span className="mt-1 block text-[10px] text-[var(--muted)]">{p.region}</span></span><span className="mono text-[8px] uppercase tracking-[.1em] text-[var(--muted)]">{p.span.split(" ")[0]}</span></button>)}</div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="border-y border-[var(--line)] py-5">
          <div className="flex items-center gap-3"><GitBranch size={14} /><span className="mono text-[9px] uppercase tracking-[.18em]">Timeline / selected window</span><span className="ml-auto text-[12px] text-[var(--muted)]">{yearLabel(year)}</span></div>
          <div className="relative mt-6 h-[86px]">
            <div className="absolute left-0 right-0 top-7 h-px bg-[var(--line-strong)]" />
            {TIMELINE_EVENTS.map((event) => {
              const clamped = Math.max(300, Math.min(1700, event.year));
              const left = ((clamped - 300) / (1700 - 300)) * 100;
              return <div key={event.label} className="absolute top-0 -translate-x-1/2" style={{ left: `${left}%` }}><button onClick={() => setYear(clamped)} className="focus-ring group" title={`Jump to ${event.label}`}><span className="mx-auto block h-3 w-3 rounded-full border border-[var(--ink)] bg-[var(--paper)] transition-transform duration-150 group-hover:scale-125" style={{ borderColor: event.tone }} /><span className="mono mt-3 block whitespace-nowrap text-[7px] uppercase tracking-[.05em] text-[var(--muted)]">{event.label}</span></button></div>;
            })}
            <div className="absolute top-12 left-0 right-0 flex justify-between">{["300","700","1100","1500","1700"].map((t) => <span className="mono text-[8px] text-[var(--faint)]" key={t}>{t}</span>)}</div>
          </div>
        </div>
      </section>

      <section id="evidence" className="mx-auto max-w-[1500px] px-5 pb-24 sm:px-8 lg:px-12">
        <div className="grid gap-10 border-t border-[var(--line)] pt-8 lg:grid-cols-[.54fr_1.4fr]">
          <div><div className="mono text-[9px] uppercase tracking-[.2em] text-[var(--muted)]">02 / Evidence</div><h2 className="editorial-serif mt-4 max-w-[390px] text-[42px] font-normal leading-[.98]">The record is bigger than the ruler.</h2><p className="mt-5 max-w-[360px] text-[13px] leading-6 text-[var(--muted)]">BHĀRATA treats material and textual evidence as first-class records. A historical claim can point back to the thing that supports it.</p></div>
          <div>{EVIDENCE.map((item) => { const Icon = item.icon; return <article key={item.label} className="grid border-b border-[var(--line)] py-7 sm:grid-cols-[.4fr_1fr_.85fr] sm:gap-8"><div className="flex items-start gap-3"><Icon size={15}/><div className="mono text-[8px] uppercase tracking-[.14em] text-[var(--muted)]">{item.label}</div></div><div><h3 className="editorial-serif text-2xl font-normal">{item.title}</h3><p className="mt-2 max-w-[470px] text-[12px] leading-6 text-[var(--muted)]">{item.body}</p></div><div className="mt-4 flex items-center gap-3 sm:mt-0 sm:justify-end"><span className="mono text-[8px] uppercase tracking-[.1em] text-[var(--muted)]">{item.count}</span><ArrowUpRight size={14}/></div></article>; })}</div>
        </div>
      </section>

      <section id="method" className="border-y border-[var(--line)] bg-[var(--paper-2)]">
        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[.65fr_1fr]">
            <div><div className="mono text-[9px] uppercase tracking-[.2em] text-[var(--muted)]">03 / Method</div><h2 className="editorial-serif mt-4 text-[42px] font-normal leading-[.98]">A history interface built like an archive.</h2></div>
            <div className="grid gap-8 sm:grid-cols-2">{[
              ["01","Entities stay distinct","Ruler, polity, dynasty, region, place and source are not collapsed into one convenient blob."],
              ["02","Claims carry provenance","Records can point to inscriptions, coins, monuments and published sources rather than floating as unsupported facts."],
              ["03","Time is a dimension","The atlas is designed around reigns, periods, events and changing political geography."],
              ["04","Uncertainty remains visible","Conflicting dates or interpretations can coexist with their source context instead of being silently flattened."]
            ].map(([n,title,body]) => <div key={n} className="border-t-2 border-[var(--ink)] pt-3"><div className="mono text-[8px] text-[var(--muted)]">{n}</div><h3 className="editorial-serif mt-2 text-xl font-normal">{title}</h3><p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">{body}</p></div>)}</div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="editorial-serif text-lg">BHĀRATA</div><div className="mono mt-1 text-[8px] uppercase tracking-[.16em] text-[var(--muted)]">Historical atlas / frontend prototype</div></div>
          <div className="flex items-center gap-5 text-[9px] uppercase tracking-[.14em] text-[var(--muted)]"><span className="inline-flex items-center gap-2"><Search size={11}/> Search</span><span className="inline-flex items-center gap-2"><Map size={11}/> Atlas</span><span className="inline-flex items-center gap-2"><ExternalLink size={11}/> Sources</span></div>
        </div>
      </footer>
    </main>
  );
}
