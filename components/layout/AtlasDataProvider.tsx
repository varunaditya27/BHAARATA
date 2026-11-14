'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { atlasAccess, type AtlasData } from '@/lib/data/atlas-data';

const Context = createContext<AtlasData | null>(null);
export function AtlasDataProvider({data, children}: {data:AtlasData; children:React.ReactNode}) {
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<{pathname:string; data:AtlasData|null}>({pathname, data});
  useEffect(() => {
    if (snapshot.pathname === pathname) return;
    const controller = new AbortController();
    fetch('/api/atlas-data', {cache:'no-store', signal:controller.signal})
      .then(response => { if (!response.ok) throw new Error('Atlas data could not be loaded.'); return response.json() as Promise<AtlasData>; })
      .then(next => setSnapshot({pathname, data:next}))
      .catch(() => { if (!controller.signal.aborted) setSnapshot({pathname, data:null}); });
    return () => controller.abort();
  }, [pathname, snapshot.pathname]);
  if (snapshot.pathname !== pathname) return <p role="status" className="mx-auto max-w-[1100px] px-4 py-16 text-ink-muted">Loading the atlas…</p>;
  if (!snapshot.data) return <p role="alert" className="mx-auto max-w-[1100px] px-4 py-16 text-ink-muted">The atlas could not load. Please refresh the page and try again.</p>;
  return <Context.Provider value={snapshot.data}>{children}</Context.Provider>;
}
export function useAtlasData() {
  const data = useContext(Context);
  if (!data) throw new Error('Atlas data is unavailable.');
  return data;
}
export function useAtlasAccess() {
  const data = useAtlasData();
  return useMemo(() => atlasAccess(data), [data]);
}
