const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const ARTIFACTS_DIR = 'C:\\Users\\samue\\.gemini\\antigravity\\brain\\62069630-cfbe-4fde-8800-430dad2b9c07';
const TARGET_URL = 'https://sssammyboyyy.github.io/trade-systems-studio/';

async function run() {
  console.log('Launching headless Brave to verify API Playground...');
  const browser = await puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080, deviceScaleFactor: 1 });

  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });

  // Open Architecture Modal
  console.log('Opening Architecture Modal...');
  const archBtn = await page.waitForSelector('button ::-p-text(Architecture & Tests (41/41 Passing))', { timeout: 10000 });
  if (archBtn) {
    await archBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // Click Tab 05: REST API Playground
    console.log('Clicking Tab 05 REST API Playground...');
    const playTab = await page.waitForSelector('button ::-p-text(05. REST API Playground)', { timeout: 5000 });
    if (playTab) {
      await playTab.click();
      await new Promise(r => setTimeout(r, 1000));
    }

    // Capture initial Playground view
    const initialShot = path.join(ARTIFACTS_DIR, 'modal_api_playground_initial.png');
    await page.screenshot({ path: initialShot, fullPage: false });
    console.log(`Saved initial playground screenshot: ${initialShot}`);

    // Click "Simulate Execution"
    console.log('Clicking Simulate Execution button...');
    const execBtn = await page.waitForSelector('button ::-p-text(Simulate Execution)', { timeout: 5000 });
    if (execBtn) {
      await execBtn.click();
      await new Promise(r => setTimeout(r, 800));
    }

    // Capture executed state with simulated latency & 200 OK
    const executedShot = path.join(ARTIFACTS_DIR, 'modal_api_playground_executed.png');
    await page.screenshot({ path: executedShot, fullPage: false });
    console.log(`Saved executed playground screenshot: ${executedShot}`);

    // Switch to Sanctions screening endpoint
    console.log('Clicking OFAC 50% Rule & RapidFuzz endpoint pill...');
    const sanctionsPill = await page.waitForSelector('button ::-p-text(OFAC 50% Rule & RapidFuzz)', { timeout: 5000 });
    if (sanctionsPill) {
      await sanctionsPill.click();
      await new Promise(r => setTimeout(r, 600));

      const sanctionsShot = path.join(ARTIFACTS_DIR, 'modal_api_playground_sanctions.png');
      await page.screenshot({ path: sanctionsShot, fullPage: false });
      console.log(`Saved sanctions playground screenshot: ${sanctionsShot}`);
    }
  }

  await browser.close();
  console.log('API Playground verification complete.');
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
