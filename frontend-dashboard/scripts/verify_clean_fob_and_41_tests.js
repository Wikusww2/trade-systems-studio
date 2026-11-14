const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const ARTIFACTS_DIR = 'C:\\Users\\samue\\.gemini\\antigravity\\brain\\62069630-cfbe-4fde-8800-430dad2b9c07';
const TARGET_URL = 'https://sssammyboyyy.github.io/trade-systems-studio/';

async function run() {
  console.log('Launching headless Brave to verify live deployment...');
  const browser = await puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080, deviceScaleFactor: 1 });

  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 45000 });

  // 1. Capture Hero with 41/41 Architecture Button & Document Switcher
  const heroShot = path.join(ARTIFACTS_DIR, 'live_hero_with_switcher.png');
  await page.screenshot({ path: heroShot, fullPage: false });
  console.log(`Saved hero screenshot to: ${heroShot}`);

  // 2. Click "Clean Production (100% Pre-Clearance)" button
  console.log('Clicking Clean Production button...');
  const cleanBtn = await page.waitForSelector('button ::-p-text(Clean Production (100% Pre-Clearance))', { timeout: 10000 });
  if (cleanBtn) {
    await cleanBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    
    const cleanShot = path.join(ARTIFACTS_DIR, 'live_clean_production_preclearance.png');
    await page.screenshot({ path: cleanShot, fullPage: false });
    console.log(`Saved clean production pre-clearance screenshot to: ${cleanShot}`);
  }

  // 3. Open Architecture Modal and capture 41/41 tests tab
  console.log('Opening Architecture Modal...');
  const archBtn = await page.waitForSelector('button ::-p-text(Architecture & Tests (43/43 Passing))', { timeout: 10000 });
  if (archBtn) {
    await archBtn.click();
    await new Promise(r => setTimeout(r, 1500));

    // Click tab 02 Pytest Execution
    const testTab = await page.waitForSelector('button ::-p-text(02. Pytest Execution (43/43))', { timeout: 5000 });
    if (testTab) {
      await testTab.click();
      await new Promise(r => setTimeout(r, 1000));
    }

    const modalShot = path.join(ARTIFACTS_DIR, 'live_modal_41_tests_passing.png');
    await page.screenshot({ path: modalShot, fullPage: false });
    console.log(`Saved 43/43 tests modal screenshot to: ${modalShot}`);
  }

  await browser.close();
  console.log('Verification finished successfully.');
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
