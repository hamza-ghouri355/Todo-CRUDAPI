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
    // const html=await fetchwithCache('https://books.toscrape.com/catalogue/page-1.html',
    // 'cache/catalogue-page-1.html');
    // const $=cheerio.load(html);
    // const book_links=[];
    // $('.product_pod h3 a').each((index,element)=>{
    //     const link=$(element).attr('href');
    //     book_links.push(link);
    // });
    // console.log('book links:', book_links);
    // const absolute=book_links.map(link=>{
    //     const absolute=new URL(link,'https://books.toscrape.com/catalogue/page-1.html').href;
    //     return absolute;
    // })
    // console.log('absolute link:',absolute);
    // const next=$('li.next a');
    // console.log('next page link:',next.length, next.attr('href'));

let currentUrl = 'https://books.toscrape.com/catalogue/page-1.html';
let pageNum = 1;
let allBookLinks = [];

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
    allBookLinks.push(absolute);
  });

  console.log('After page', pageNum, '- total links so far:', allBookLinks.length);
  const next = $('li.next a');
  if(next.length === 0|| pageNum >= 3){ 
    break;
  }
  const nextlink=next.attr('href');
    currentUrl = new URL(nextlink, currentUrl).href;
    pageNum++;
}
console.log('Final list:', allBookLinks);
const uniqueLinks = [...new Set(allBookLinks)];
console.log('unique urls:', uniqueLinks.length);
}

main();