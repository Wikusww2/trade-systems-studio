const puppeteer = require("puppeteer-core");
const path = require("path");

async function verifyAllPillars() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const consoleLogs = [];
  const networkErrors = [];

  page.on("console", (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on("requestfailed", (req) => {
    networkErrors.push(`Failed: ${req.url()} (${req.failure()?.errorText})`);
  });

  console.log("Navigating to live GitHub Pages: https://sssammyboyyy.github.io/trade-systems-studio/ ...");
  await page.goto("https://sssammyboyyy.github.io/trade-systems-studio/", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  await new Promise((r) => setTimeout(r, 2500));

  const outDir = "C:\\Users\\samue\\.gemini\\antigravity\\brain\\62069630-cfbe-4fde-8800-430dad2b9c07";

  // 1. Overview screenshot
  const shot1 = path.join(outDir, "live_all_pillars_overview.png");
  await page.screenshot({ path: shot1 });
  console.log(`Saved overview screenshot to ${shot1}`);

  // 2. Click Tab 05 / HTS Classification Copilot
  console.log("Switching to Tab 05: HTS Classification Copilot...");
  const htsTab = await page.waitForSelector("button:has-text('05 / HTS Classification Copilot')", { timeout: 5000 }).catch(async () => {
    // Fallback XPath / text evaluation
    return await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.find((b) => b.textContent.includes("05 / HTS"));
    });
  });

  if (htsTab) {
    await htsTab.click();
    await new Promise((r) => setTimeout(r, 1500));
    const shot2 = path.join(outDir, "live_pillar_05_hts_copilot.png");
    await page.screenshot({ path: shot2 });
    console.log(`Saved HTS Copilot screenshot to ${shot2}`);
  }

  // 3. Click Tab 06 / CBP Assist & Valuation Register
  console.log("Switching to Tab 06: CBP Assist & Valuation Register...");
  const valTab = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    return btns.find((b) => b.textContent.includes("06 / CBP Assist"));
  });

  if (valTab) {
    await valTab.click();
    await new Promise((r) => setTimeout(r, 1500));
    const shot3 = path.join(outDir, "live_pillar_06_valuation_register.png");
    await page.screenshot({ path: shot3 });
    console.log(`Saved Valuation Register screenshot to ${shot3}`);
  }

  console.log("\n--- VERIFICATION COMPLETE ---");
  await browser.close();
}

verifyAllPillars().catch(console.error);
