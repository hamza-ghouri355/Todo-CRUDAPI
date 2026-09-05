# The Polite Scraper

A small, polite scraping pipeline that downloads the first three catalogue pages of
[Books to Scrape](https://books.toscrape.com), visits all 60 book pages, turns messy HTML
into clean, checked JSON records, survives a broken page without crashing, and ends every
run with a short report of what happened.

## Target classification

- **Site:** [books.toscrape.com](https://books.toscrape.com)
- **Why this site:** it is explicitly built and maintained as a public sandbox for people to
  practice web scraping on. It exists for exactly this purpose.
- **Scope:** the first 3 catalogue pages only (60 books total). No other pages, sections, or
  sites are touched.
- **Data collected:** book title, product URL, price, availability, star rating, description,
  the catalogue page it was found on, and the time it was fetched.
- **`robots.txt` check:** a request to `https://books.toscrape.com/robots.txt` returns a
  `404 Not Found` — no robots file exists. A missing file is not permission, it is just a
  missing file; permission comes from the site's own stated purpose as a scraping sandbox.
- **Why this is appropriate here:** the site is designed to absorb automated traffic from
  learners, the data is public and non-sensitive (book listings), and the scrape is scoped
  tightly to a small, fixed slice of the site.

**I will not reuse this code on another site without checking its rules and terms first.**

## Lane & setup

- **Language:** Node.js (JavaScript lane)
- **Dependencies:** `cheerio` (HTML parsing), `zod` (schema validation)

Install:

```bash
cd scraper
npm install
```

Run:

```bash
node src/index.js
```

This produces:
- `output/books.json` - 60 validated book records
- `output/errors.json` - any records that failed validation or fetching, with reasons
- `output/run-report.json` - honest numbers about the run

On a fresh machine with no cache, the run takes roughly 1-2 minutes due to the built-in
politeness delay between real requests. On a rerun, cached pages are read from disk instantly.

## Record schema

Each entry in `books.json` has this shape:

```json
{
  "title": "A Light in the Attic",
  "product_url": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
  "price_gbp": 51.77,
  "price_text": "£51.77",
  "availability_text": "In stock (22 available)",
  "rating_text": "Three",
  "description": "It's hard to imagine a world without A Light in the Attic...",
  "source_page": "https://books.toscrape.com/catalogue/page-1.html",
  "fetched_at": "2026-09-05T09:59:09.052Z"
}
```

- `price_gbp` is a real number, parsed from `price_text` for sorting/filtering.
- `rating_text` and `description` can be `null` if genuinely missing - never invented.
- `source_page` and `fetched_at` are provenance: where and when the fact came from.
- Records are validated with Zod before being allowed into `books.json`. Anything that fails
  validation goes to `errors.json` with a reason instead.

## Politeness rules

Every real request to the site:
- Sends an honest `User-Agent`: `FlyRankInternshipA9/1.0 (+https://github.com/hamza-ghouri355/Todo-CRUDAPI)`
- Has an 8-second timeout, enforced with `AbortController`
- Waits at least 500ms after a real fetch before the next real request
- Checks the status code before trusting the response
- Retries once on a timeout or `5xx` server error; never retries a `404` or `403`

Cached pages (already saved in `cache/` from a previous run) are read from disk instead,
with no network request and no delay - the site should only ever feel the scrape once.

## Proof of a real run

```json
{
  "start_time": "2026-09-05T10:15:33.007Z",
  "duration_ms": 1987,
  "pages_fetched": 0,
  "cache_hits": 63,
  "valid_records": 60,
  "invalid_records": 1,
  "failed_pages": 1
}
```

This run included a deliberately broken URL added to the book list on purpose (Stage 5's
failure test). The run finished successfully, all 60 real books were still validated and
saved, and the one broken page was logged in `errors.json` and counted as a failed page -
proving one bad page doesn't take down the whole run.

## Why no browser was needed

The book data (title, price, availability, description) is already present in the plain
HTML the server sends back - there's no JavaScript rendering step hiding the content behind
a client-side app. A browser (e.g. Playwright) would only add cost (memory, startup time,
complexity) with no benefit here, since a simple HTTP request already gets the full page.

## Ethics note

- Use an official API when one exists, rather than scraping.
- Never bypass logins, paywalls, CAPTCHAs, or explicit blocks - if a site says no, that's the
  answer.
- Collect only the data actually needed for the task, not everything reachable.
- Identify the scraper honestly (a real `User-Agent`) so a site owner can see what's hitting
  their logs and why.
- This code is scoped to one practice sandbox and will not be pointed at another site without
  first checking that site's own rules and terms.

## Known limitation

The scraper re-fetches and re-validates all 60 books on every run rather than diffing against
a previous result - this keeps the logic simple, at the cost of doing full work each time
even when nothing has changed on the source site.