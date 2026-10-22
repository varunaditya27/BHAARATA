"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-24 sm:px-6">
      <h1 className="font-display text-5xl text-ink">This page did not load</h1>
      <p className="mt-4 max-w-prose font-sans text-lg text-ink-muted">
        Something went wrong while showing it. The connection may have dropped, or there is a fault in the site. Try
        again; if it keeps happening, start from the atlas.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-sans text-sm">
        <button onClick={() => retry()} className="min-h-11 bg-ink px-5 font-medium text-paper hover:bg-ink/90">
          Try again
        </button>
        <Link href="/atlas" className="text-ink underline underline-offset-4 hover:text-territory-selected">
          Open the atlas
        </Link>
        <Link href="/" className="text-ink-muted underline underline-offset-4 hover:text-ink">
          Home page
        </Link>
      </div>
    </div>
  );
}
