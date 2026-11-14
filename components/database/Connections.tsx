"use client";
import { useState } from "react";

type Link = { from_table: string; to_table: string };
export function Connections({ names, links }: { names: Record<string, string>; links: Link[] }) {
  const [selected, setSelected] = useState("kingdoms");
  const ids = Object.keys(names);
  const point = (id: string) => { const i = ids.indexOf(id); return { x: 90 + (i % 4) * 175, y: 30 + Math.floor(i / 4) * 70 }; };
  const connected = links.filter(l => l.from_table === selected || l.to_table === selected);
  return <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr]">
    <div>
    <svg viewBox="0 0 760 430" role="img" aria-label="Lines showing which lists connect. Use the buttons below to explore each connection." className="mb-6 hidden w-full sm:block">
      {links.map((link, i) => { const a = point(link.from_table); const b = point(link.to_table); const active = link.from_table === selected || link.to_table === selected; return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? "var(--bh-territory-selected)" : "var(--bh-border)"} strokeOpacity={active ? 0.85 : 0.3} />; })}
      {ids.map(id => { const p = point(id); return <g key={id}><circle cx={p.x} cy={p.y} r="4" fill={id === selected ? "var(--bh-territory-selected)" : "var(--bh-ink-muted)"}/><text x={p.x + 8} y={p.y + 4} fontSize="9" fill="var(--bh-ink)">{names[id]}</text></g>; })}
    </svg>
    <div aria-label="Lists in the database" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Object.entries(names).map(([id, name]) => <button key={id} type="button" aria-pressed={selected === id} onClick={() => setSelected(id)} className={`border px-3 py-4 text-left font-sans text-sm ${selected === id ? "border-territory-selected text-ink" : "border-border text-ink-muted hover:text-ink"}`}>{name}</button>)}
    </div></div>
    <section aria-live="polite"><h2 className="font-display text-3xl text-ink">{names[selected]}</h2><p className="mt-3 text-ink-muted">This list connects to:</p>
      {connected.length ? <ul className="mt-3 space-y-2">{[...new Set(connected.map(l => l.from_table === selected ? l.to_table : l.from_table))].map(id => <li key={id}><button type="button" onClick={() => setSelected(id)} className="text-left text-ink underline underline-offset-4">{names[id]}</button></li>)}</ul> : <p className="mt-3 text-ink-muted">No direct links to another list.</p>}
    </section>
  </div>;
}
