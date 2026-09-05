const fs = require('fs/promises');
const cheerio = require('cheerio');

async function fetchwithCache(url,cachedpath){
    try{
        const html = await fs.readFile(cachedpath,'utf-8');
        console.log('cache hit',html.length);
        return {html,fromCache:true};
    }
    catch{
        const abortcontoller=new AbortController();
        const timeout= setTimeout(()=>{abortcontoller.abort()},5000);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FlyRankInternshipA9/1.0 (+https://github.com/hamza-ghouri355/Todo-CRUDAPI)'
        },
        signal: abortcontoller.signal
      });
      clearTimeout(timeout);
      if (response.status !== 200) {
        throw new Error(`Fetch failed with status ${response.status}`);
    }
      const html =await response.text();
      await fs.writeFile(cachedpath,html);
      console.log('saved to', cachedpath);
      return {html,fromCache:false};
}
}

async function main(){

let currentUrl = 'https://books.toscrape.com/catalogue/page-1.html';
let pageNum = 1;
let book_records = []; // will hold {url, sourcePage} for each book

while (true) {
  const cachePath = `cache/catalogue-page-${pageNum}.html`;
  const {html,fromCache} = await fetchwithCache(currentUrl, cachePath);
  if (!fromCache) {
  await new Promise(resolve => setTimeout(resolve, 500));
}
  const $ = cheerio.load(html);

  $('.product_pod h3 a').each((index, element) => {
    const link = $(element).attr('href');
    const absolute = new URL(link, currentUrl).href;
    book_records.push({ url: absolute, sourcePage: currentUrl });
  });

  console.log('After page', pageNum, '- total links so far:', book_records.length);
  const next = $('li.next a');
  if(next.length === 0|| pageNum >= 3){
    break;
  }
  const nextlink=next.attr('href');
    currentUrl = new URL(nextlink, currentUrl).href;
    pageNum++;
}

// dedupe by url
const seenUrls = new Set();
const unique_records = [];
book_records.forEach(record => {
  if (!seenUrls.has(record.url)) {
    seenUrls.add(record.url);
    unique_records.push(record);
  }
});

console.log('catalogue_pages=3 discovered=' + book_records.length + ' unique_urls=' + unique_records.length);

// ---- Stage 3: visit every book page and pull out the 8 fields ----

let all_books = [];

for (let i = 0; i < unique_records.length; i++) {
  const bookUrl = unique_records[i].url;
  const sourcePage = unique_records[i].sourcePage;
  const bookCachePath = `cache/book-${i + 1}.html`;

  const {html, fromCache} = await fetchwithCache(bookUrl, bookCachePath);
  if (!fromCache) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const $ = cheerio.load(html);

  const title = $('h1').text().trim();
  const price_text = $('.product_main .price_color').first().text().trim();
  const availability_text = $('.product_main .availability').text().trim().replace(/\s+/g, ' ');

  const ratingClass = $('.star-rating').attr('class') || '';
  const rating_text = ratingClass.replace('star-rating', '').trim() || null;

  const descriptionEl = $('#product_description').next('p');
  const description = descriptionEl.length ? descriptionEl.text().trim() : null;

  const record = {
    title: title,
    product_url: bookUrl,
    price_text: price_text,
    availability_text: availability_text,
    rating_text: rating_text,
    description: description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString()
  };

  all_books.push(record);
  console.log('extracted book', i + 1, 'of', unique_records.length, '-', title);
}

console.log('detail_pages=' + all_books.length);
console.log('sample record:', all_books[0]);

await fs.mkdir('output', { recursive: true });
await fs.writeFile('output/raw-records.json', JSON.stringify(all_books, null, 2));
console.log('saved output/raw-records.json');

}

main();