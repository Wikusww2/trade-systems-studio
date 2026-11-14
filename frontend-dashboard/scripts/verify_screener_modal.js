const puppeteer = require('puppeteer-core');
const path = require('path');

const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const ARTIFACTS_DIR = 'C:\\Users\\samue\\.gemini\\antigravity\\brain\\62069630-cfbe-4fde-8800-430dad2b9c07';
const TARGET_URL = 'https://sssammyboyyy.github.io/trade-systems-studio/';

async function run() {
  console.log('Launching headless Brave to verify Tab 06 Screener & Interview Defense...');
  const browser = await puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080, deviceScaleFactor: 1 });

  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 45000 });

  // Open Architecture Modal
  console.log('Opening Architecture Modal...');
  const archBtn = await page.waitForSelector('button ::-p-text(Architecture & Tests (41/41 Passing))', { timeout: 10000 });
  if (archBtn) {
    await archBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // Click Tab 06: Screener & Interview Defense
    console.log('Clicking Tab 06 Screener & Interview Defense...');
    const screenerTab = await page.waitForSelector('button ::-p-text(Screener)', { timeout: 10000 });
    if (screenerTab) {
      await screenerTab.click();
      await new Promise(r => setTimeout(r, 1200));
    }

    // Capture Screener tab view
    const shotPath = path.join(ARTIFACTS_DIR, 'modal_screener_defense_verified.png');
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved Screener modal screenshot: ${shotPath}`);
  }

  await browser.close();
  console.log('Screener modal verification complete.');
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
