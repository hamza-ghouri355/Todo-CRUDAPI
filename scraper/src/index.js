const fs = require('fs/promises');

async function main(){
    const abortcontoller=new AbortController();
    const timeout= setTimeout(()=>{abortcontoller.abort()},5000);
    const cachedpath='cache/catalogue-page-1.html';
    try{
        const html = await fs.readFile(cachedpath,'utf-8');
        console.log('cache hit',html.length);
        return;
    }
    catch{
      const response = await fetch('https://books.toscrape.com/catalogue/page-1.html', {
        headers: {
          'User-Agent': 'FlyRankInternshipA9/1.0 (+https://github.com/hamza-ghouri355/Todo-CRUDAPI)'
        },
        signal: abortcontoller.signal
      });
      clearTimeout(timeout);
      if (response.status !== 200) {
        throw new Error(`Fetch failed with status ${response.status}`);
    }
      console.log('status:', response.status);
      const html =await response.text();
      console.log('fetched', html.length);
      await fs.writeFile('cache/catalogue-page-1.html',html);
      console.log('saved to cache/catalogue-page-1.html');
}
}

main();