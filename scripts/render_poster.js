const puppeteer = require('puppeteer-core');
const path = require('path');

async function renderPoster() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 1900, deviceScaleFactor: 2 });
  
  const posterFile = 'file://' + path.resolve(__dirname, '../The-Dining-Co-Pitch-Poster.html');
  console.log('Loading poster from:', posterFile);
  await page.goto(posterFile, { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const bar = document.querySelector('.top-action-bar');
    if (bar) bar.style.display = 'none';
  });

  const canvasSelector = '.poster-canvas';
  const posterCanvas = await page.waitForSelector(canvasSelector);
  if (posterCanvas) {
    await posterCanvas.screenshot({
      path: path.resolve(__dirname, '../The-Dining-Co-Executive-Poster.png'),
      type: 'png'
    });
    console.log('Saved high-res PNG: The-Dining-Co-Executive-Poster.png');
  }

  await page.pdf({
    path: path.resolve(__dirname, '../The-Dining-Co-Executive-Poster.pdf'),
    printBackground: true,
    width: '1200px',
    height: '1720px',
    margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
  });
  console.log('Saved print-ready PDF: The-Dining-Co-Executive-Poster.pdf');

  await browser.close();
}

renderPoster().catch(err => {
  console.error(err);
  process.exit(1);
});

