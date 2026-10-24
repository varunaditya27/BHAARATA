"use client";

// Replaces the root layout when it fails, so the site's stylesheet and fonts are not loaded here: styles are inline.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", background: "#f3ede0", color: "#241f17", fontFamily: "Georgia, serif" }}>
        <title>BHĀRATA could not load</title>
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px" }}>
          <h1 style={{ fontSize: 44, fontWeight: 400, margin: 0 }}>The atlas could not load</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 18, lineHeight: 1.5, color: "#5c5447" }}>
            Something went wrong before any page could be shown. Check your connection and try again.
          </p>
          <button
            onClick={() => retry()}
            style={{ marginTop: 16, minHeight: 44, padding: "0 20px", border: 0, background: "#241f17", color: "#f3ede0", fontSize: 15, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
