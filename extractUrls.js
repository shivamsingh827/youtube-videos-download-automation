const puppeteer = require('puppeteer');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');

(async () => {
  const playlistURL = 'https://www.youtube.com/playlist?list='; 

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto(playlistURL, { waitUntil: 'networkidle2' });
  
  await page.evaluate(async () => {
    let lastHeight = document.body.scrollHeight;
    while (true) {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 2000));
      let newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) break;
      lastHeight = newHeight;
    }
  });

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  await delay(30000); 

  const videoUrls = await page.evaluate(() => {
    const videoElements = Array.from(document.querySelectorAll('#video-title'));
    return videoElements.map(el => el.href);
  });

  await browser.close();

  fs.writeFileSync('videoUrls.json', JSON.stringify(videoUrls, null, 2));
  console.log(`Extracted ${videoUrls.length} video URLs`);

  for (const url of videoUrls) {
    console.log(`Downloading ${url}`);
    await youtubedl(url, {
      output: '%(title)s.%(ext)s'
    });
  }
})();
