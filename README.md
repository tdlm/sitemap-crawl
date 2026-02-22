# sitemap-crawl

CLI tool that crawls sitemap XML files (indexes or single sitemaps), checks the HTTP status of every URL, and reports results with pretty terminal output.

## Install

```bash
npm install -g sitemap-crawl
# or
pnpm add -g sitemap-crawl
```

Or run without installing:

```bash
npx sitemap-crawl <url>
```

## Usage

```bash
sitemap-crawl [options] <url>
```

### Examples

```bash
# Basic crawl with summary output
sitemap-crawl https://www.sitemaps.org/sitemap.xml

# Verbose output showing every URL
sitemap-crawl -v https://www.sitemaps.org/sitemap.xml

# Export results to CSV (writes to reports/<filename>)
sitemap-crawl --csv report.csv https://www.sitemaps.org/sitemap.xml

# Custom concurrency and timeout
sitemap-crawl -c 20 -t 5000 https://example.com/sitemap.xml

# Crawl through Zyte Smart Proxy Manager (requires ZYTE_API_KEY in .env)
sitemap-crawl https://example.com/sitemap.xml

# Use a custom proxy URL
sitemap-crawl -p http://localhost:8011 https://example.com/sitemap.xml
```

## Options

| Flag | Description |
|------|--------------|
| `-v, --verbose` | Show full URL listing instead of summary counts |
| `--csv <filepath>` | Write results to a CSV file (writes to `reports/<filename>`) |
| `-c, --concurrency <n>` | Max concurrent requests (default: 10) |
| `-t, --timeout <ms>` | Per-request timeout in ms (default: 10000) |
| `-r, --max-redirects <n>` | Max redirects to follow per URL (default: 3) |
| `-d, --delay <ms>` | Delay in ms between requests (default: 10) |
| `--max-retries <n>` | Max retries for 503/timeout errors (default: 3) |
| `-p, --proxy-url [url]` | Enable Zyte proxy, optionally specify URL (default: http://proxy.zyte.com:8011) |
| `-h, --help` | Display help |

## Output

### Default (summary)

Shows status code counts per sitemap, color-coded:

```
=== Crawl Results ===

https://example.com/sitemap.xml
  Total: 42 URLs — 200: 38, 301: 2, 404: 2
```

### Verbose (`-v`)

Shows every URL with its status code, plus the summary:

```
=== Crawl Results ===

https://example.com/sitemap.xml
  200  https://example.com/page1
  200  https://example.com/page2
  404  https://example.com/old-page

  Total: 3 URLs — 200: 2, 404: 1
```

## Features

- Supports sitemap index files and single sitemaps
- Handles gzipped (`.xml.gz`) sitemaps
- Concurrent HTTP checking with configurable limits
- HEAD-first requests with GET fallback
- Manual redirect following with configurable max
- Color-coded terminal output (2xx green, 3xx yellow, 4xx/5xx red)
- Progress bars for each sitemap
- CSV report export
- Verbose mode with full URL listing
- Zyte Smart Proxy Manager support

## Proxy support

To route requests through [Zyte Smart Proxy Manager](https://www.zyte.com/smart-proxy-manager/):

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Add your API key to `.env`:
   ```
   ZYTE_API_KEY=your-api-key-here
   ```
3. Run normally — the proxy is activated automatically when `ZYTE_API_KEY` is set:
   ```bash
   sitemap-crawl https://example.com/sitemap.xml
   ```

The default proxy endpoint is `http://proxy.zyte.com:8011`. Override it with `--proxy-url` if needed.

## Requirements

- Node.js 20+

## Development

```bash
pnpm install
pnpm build
pnpm dev <url>   # Run in development mode (no build needed)
```

## License

MIT
