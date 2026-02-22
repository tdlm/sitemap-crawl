# AGENTS.md — AI Agent Instructions

## Documentation index

- [.agents/BRIEF.md](.agents/BRIEF.md) — Product brief: goal, motivation, audience, principles, non-goals
- [.agents/ARCHITECTURE.md](.agents/ARCHITECTURE.md) — Technical reference: data flow, modules, APIs, concurrency

## Quick reference

| Entry | Path |
|-------|------|
| **CLI entry** | `src/index.ts` → `bin/sitemap-crawl.js` → `dist/index.js` |
| **Core modules** | `src/sitemap.ts`, `src/checker.ts`, `src/output.ts`, `src/csv-report.ts`, `src/proxy.ts`, `src/types.ts` |
| **Tests** | `src/__tests__/*.test.ts` |

## Commands

```bash
pnpm install      # Install dependencies
pnpm build        # Compile TypeScript to dist/
pnpm crawl <url>  # Run compiled version (or: node bin/sitemap-crawl.js <url>)
pnpm dev <url>    # Run in development mode with tsx
```

## Data flow (summary)

```
CLI args → fetchSitemaps(url) → [Sitemap, Sitemap, ...]
  → for each Sitemap (sequentially):
      → create progress bar
      → checkUrls() with p-limit concurrency
      → aggregate into SitemapReport
  → printReport(reports, verbose)
  → writeCsvReport(reports, csvPath) if --csv
```

See [.agents/ARCHITECTURE.md](.agents/ARCHITECTURE.md) for the full diagram and module details.

## Key patterns

- **ESM**: Project uses `"type": "module"` — all imports use `.js` extensions
- **fast-xml-parser `isArray`**: The parser's `isArray` option is set for `sitemap` and `url` elements to prevent the single-item-not-array bug
- **p-limit concurrency**: URL checking uses `p-limit` to cap concurrent HTTP requests
- **HEAD-then-GET**: Tries HEAD first, falls back to GET on 405/403 responses
- **Manual redirects**: Uses `redirect: 'manual'` with manual `Location` header following, configurable max redirects
- **Gzip support**: Detects `.gz` URL extension and decompresses with `zlib.gunzipSync()`

## Error handling

- **Fatal** (exit 1): invalid URL, root sitemap fetch/parse failure
- **Partial** (warn + continue): sub-sitemap fetch failures
- **Expected** (recorded in results): individual URL 4xx/5xx/timeouts (statusCode 0 for network errors)
