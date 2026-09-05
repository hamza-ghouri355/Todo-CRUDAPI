const fs = require('fs/promises');
const cheerio = require('cheerio');
const { z } = require('zod');

const BookSchema = z.object({
  title: z.string().min(1),
  product_url: z.string().url(),
  price_gbp: z.number().positive(),
  price_text: z.string(),
  availability_text: z.string(),
  rating_text: z.string().nullable(),
  description: z.string().nullable(),
  source_page: z.string().url(),
  fetched_at: z.string()
});

async function fetchwithCache(url, cachedpath, attempt = 1) {
  try {
    const html = await fs.readFile(cachedpath, 'utf-8');
    console.log('cache hit', html.length);
    return { html, fromCache: true };
  }
  catch (readErr) {
  }

  const abortcontoller = new AbortController();
  const timeout = setTimeout(() => { abortcontoller.abort(); }, 8000);

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'FlyRankInternshipA9/1.0 (+https://github.com/hamza-ghouri355/Todo-CRUDAPI)'
      },
      signal: abortcontoller.signal
    });
  } catch (networkErr) {
    clearTimeout(timeout);
    if (attempt < 2) {
      console.log('retrying after network/timeout error:', networkErr.message);
      return fetchwithCache(url, cachedpath, attempt + 1);
    }
    throw new Error(`Request failed after retry: ${networkErr.message}`);
  }
  clearTimeout(timeout);

  if (response.status === 404 || response.status === 403) {
    throw new Error(`Non-retryable status ${response.status} for ${url}`);
  }

  if (response.status >= 500 && attempt < 2) {
    console.log('retrying after server error', response.status);
    return fetchwithCache(url, cachedpath, attempt + 1);
  }

  if (response.status !== 200) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  await fs.writeFile(cachedpath, html);
  console.log('saved to', cachedpath);
  return { html, fromCache: false };
}

async function main() {

  const startTime = Date.now();
  let cacheHits = 0;
  let pagesFetched = 0;
  let failedPages = 0;

  let currentUrl = 'https://books.toscrape.com/catalogue/page-1.html';
  let pageNum = 1;
  let book_records = [];

  while (true) {
    const cachePath = `cache/catalogue-page-${pageNum}.html`;
    const { html, fromCache } = await fetchwithCache(currentUrl, cachePath);
    if (fromCache) { cacheHits++; } else { pagesFetched++; await new Promise(resolve => setTimeout(resolve, 500)); }

    const $ = cheerio.load(html);

    $('.product_pod h3 a').each((index, element) => {
      const link = $(element).attr('href');
      const absolute = new URL(link, currentUrl).href;
      book_records.push({ url: absolute, sourcePage: currentUrl });
    });

    console.log('After page', pageNum, '- total links so far:', book_records.length);
    const next = $('li.next a');
    if (next.length === 0 || pageNum >= 3) {
      break;
    }
    const nextlink = next.attr('href');
    currentUrl = new URL(nextlink, currentUrl).href;
    pageNum++;
  }
  const seenUrls = new Set();
  const unique_records = [];
  book_records.forEach(record => {
    if (!seenUrls.has(record.url)) {
      seenUrls.add(record.url);
      unique_records.push(record);
    }
  });

  console.log('catalogue_pages=3 discovered=' + book_records.length + ' unique_urls=' + unique_records.length);
  let good_books = [];
  let bad_records = [];

  for (let i = 0; i < unique_records.length; i++) {
    const bookUrl = unique_records[i].url;
    const sourcePage = unique_records[i].sourcePage;
    const bookCachePath = `cache/book-${i + 1}.html`;

    let html, fromCache;
    try {
      const result = await fetchwithCache(bookUrl, bookCachePath);
      html = result.html;
      fromCache = result.fromCache;
    } catch (fetchErr) {
      console.log('FAILED page', bookUrl, '-', fetchErr.message);
      failedPages++;
      bad_records.push({ url: bookUrl, reason: fetchErr.message });
      continue; 
    }

    if (fromCache) { cacheHits++; } else { pagesFetched++; await new Promise(resolve => setTimeout(resolve, 500)); }

    const $ = cheerio.load(html);

    const title = $('h1').text().trim();
    const price_text = $('.product_main .price_color').first().text().trim();
    const availability_text = $('.product_main .availability').text().trim().replace(/\s+/g, ' ');

    const ratingClass = $('.star-rating').attr('class') || '';
    const rating_text = ratingClass.replace('star-rating', '').trim() || null;

    const descriptionEl = $('#product_description').next('p');
    const description = descriptionEl.length ? descriptionEl.text().trim() : null;

    const price_gbp = parseFloat(price_text.replace(/[^0-9.]/g, ''));

    const record = {
      title: title,
      product_url: bookUrl,
      price_gbp: price_gbp,
      price_text: price_text,
      availability_text: availability_text,
      rating_text: rating_text,
      description: description,
      source_page: sourcePage,
      fetched_at: new Date().toISOString()
    };

    const validation = BookSchema.safeParse(record);
    if (validation.success) {
      good_books.push(record);
    } else {
      console.log('INVALID record for', bookUrl, '-', validation.error.issues[0].message);
      bad_records.push({ url: bookUrl, reason: validation.error.issues[0].message });
    }

    console.log('processed', i + 1, 'of', unique_records.length, '-', title || '(failed)');
  }

  await fs.mkdir('output', { recursive: true });
  await fs.writeFile('output/books.json', JSON.stringify(good_books, null, 2));
  await fs.writeFile('output/errors.json', JSON.stringify(bad_records, null, 2));

  const durationMs = Date.now() - startTime;

  const runReport = {
    start_time: new Date(startTime).toISOString(),
    duration_ms: durationMs,
    pages_fetched: pagesFetched,
    cache_hits: cacheHits,
    valid_records: good_books.length,
    invalid_records: bad_records.length,
    failed_pages: failedPages
  };

  await fs.writeFile('output/run-report.json', JSON.stringify(runReport, null, 2));

  console.log('----------------------------------------');
  console.log('books.json:', good_books.length, 'valid records');
  console.log('errors.json:', bad_records.length, 'bad records');
  console.log('run-report.json:', JSON.stringify(runReport, null, 2));
}

main().catch((err) => {
  console.error('Run failed:', err.message);
  process.exit(1);
});