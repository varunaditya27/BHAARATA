# BHĀRATA

A source-aware, time-aware digital atlas of the Indian subcontinent.

See `PROJECT_BIBLE.md` for product/content canon, and `IMPLEMENTATION_PLAN.md`
/ `GUIDANCE.md` for the engineering direction. `AGENTS.md` (mirrored by
`CLAUDE.md`) has the current build status and the rules agents working on
this repo must follow — read it before making architectural changes.

## Development

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Status

Phase 0–3 of the implementation plan: Next.js App Router shell, design
tokens, a MapLibre-based Atlas with a time scrubber, a Chronology page, and
minimal Polity entity pages. All domain data currently in the app is
illustrative prototype data — see `/method` in the running app.
