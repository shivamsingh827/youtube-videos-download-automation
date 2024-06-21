const puppeteer = require('puppeteer');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');

(async () => {
  const playlistURL = 'https://www.youtube.com/playlist?list='; // Replace with your playlist URL

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(playlistURL, { waitUntil: 'networkidle2' });
  
  const videoUrls = await page.evaluate(() => {
    const videoElements = Array.from(document.querySelectorAll('#video-title'));
    return videoElements.map(el => el.href);
  });

  await browser.close();

  fs.writeFileSync('videoUrls.json', JSON.stringify(videoUrls, null, 2));
  console.log(`Extracted ${videoUrls.length} video URLs`);

  // Download videos using youtube-dl
  for (const url of videoUrls) {
    console.log(`Downloading ${url}`);
    await youtubedl(url, {
      output: '%(title)s.%(ext)s'
    });
  }
})();
