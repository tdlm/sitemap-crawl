# sitemap-crawl — Product Brief

## Goal

sitemap-crawl crawls sitemap XML files (indexes or single sitemaps), checks the HTTP status of every URL, and reports results with pretty terminal output. It is publishable to npm and runnable via `npx sitemap-crawl`.

## Motivation

- Discover URLs from sitemaps for SEO audits, link validation, or scraping pipelines
- Validate that all URLs in a sitemap return expected status codes
- Export URL lists to CSV for further processing
- Optional Zyte Smart Proxy Manager support for sites that require proxy access

## Target audience

- SEO professionals auditing site health
- Site owners checking for broken links
- Developers and scrapers building URL discovery pipelines

## Design principles

- **Robustness** — HEAD-first requests with GET fallback for 405/403; retries for 503/timeout; manual redirect following
- **Efficiency** — Configurable concurrency (p-limit), delay between requests, gzip support for sitemaps
- **Clear CLI** — Commander-based options, color-coded output, progress bars
- **Testability** — Modular design with unit tests

## Non-goals

- Not a full-site crawler — only processes URLs listed in sitemap XML
- Not a general spider — does not follow links from HTML pages
- Does not crawl robots.txt or discover sitemaps automatically; the sitemap URL must be provided
