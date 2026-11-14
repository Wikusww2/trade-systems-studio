const puppeteer = require('puppeteer-core');

async function testInteractions() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Test Modal Opening
  const ctaBtn = await page.$('header button');
  if (ctaBtn) {
    await ctaBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'C:\\Users\\samue\\.gemini\\antigravity\\brain\\03f02f91-ced1-432d-877f-4b62b163ab11\\modal_view.png' });
    console.log('Saved modal view');
  }

  await browser.close();
}

testInteractions().catch(console.error);
