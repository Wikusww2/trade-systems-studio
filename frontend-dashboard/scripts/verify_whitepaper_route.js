const puppeteer = require('puppeteer-core');
const path = require('path');

const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const ARTIFACTS_DIR = 'C:\\Users\\samue\\.gemini\\antigravity\\brain\\62069630-cfbe-4fde-8800-430dad2b9c07';
const TARGET_URL = 'https://sssammyboyyy.github.io/trade-systems-studio/whitepaper/';

async function run() {
  console.log('Launching headless Brave to verify /whitepaper route on GitHub Pages...');
  const browser = await puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080, deviceScaleFactor: 1 });

  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 45000 });

  const shotPath = path.join(ARTIFACTS_DIR, 'live_whitepaper_page_verified.png');
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log(`Saved /whitepaper screenshot to: ${shotPath}`);

  await browser.close();
  console.log('Whitepaper verification complete.');
}

run().catch(err => {
  console.error('Error during whitepaper verification:', err);
  process.exit(1);
});
