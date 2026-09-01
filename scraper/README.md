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

## Status

Work in progress — stages will be documented here as they're completed.