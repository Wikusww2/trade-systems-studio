const puppeteer = require('puppeteer-core');
const path = require('path');

const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const ARTIFACTS_DIR = 'C:\\Users\\samue\\.gemini\\antigravity\\brain\\62069630-cfbe-4fde-8800-430dad2b9c07';
const TARGET_URL = 'https://sssammyboyyy.github.io/trade-systems-studio/#tour';

async function run() {
  console.log('Launching headless Brave to verify 60-Second Executive Tour (#tour)...');
  const browser = await puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080, deviceScaleFactor: 1 });

  console.log(`Navigating directly to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 45000 });

  // Wait for Tour Modal to appear automatically via hash deep-link
  console.log('Waiting for Tour modal overlay...');
  await page.waitForSelector('span ::-p-text(60-Second Executive Walkthrough)', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  // Capture Step 1 screenshot
  const shotStep1 = path.join(ARTIFACTS_DIR, 'live_tour_step1_verified.png');
  await page.screenshot({ path: shotStep1, fullPage: false });
  console.log(`Saved Step 1 screenshot: ${shotStep1}`);

  // Click Next to advance to Step 2 using explicit data-testid
  const nextBtn = await page.waitForSelector('button[data-testid="tour-next-btn"]', { timeout: 5000 });
  if (nextBtn) {
    await nextBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // Wait specifically for Step 2 badge
    await page.waitForSelector('span ::-p-text(02 / ZERO-BUDGET OCR)', { timeout: 5000 });

    // Capture Step 2 screenshot
    const shotStep2 = path.join(ARTIFACTS_DIR, 'live_tour_step2_verified.png');
    await page.screenshot({ path: shotStep2, fullPage: false });
    console.log(`Saved Step 2 screenshot: ${shotStep2}`);
  }

  await browser.close();
  console.log('Executive Tour verification complete.');
}

run().catch(err => {
  console.error('Error during tour verification:', err);
  process.exit(1);
});
