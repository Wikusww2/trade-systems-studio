const puppeteer = require("puppeteer-core");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1600,1200"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
  await page.waitForSelector("canvas", { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1500));

  const outDir = "C:\\Users\\samue\\.gemini\\antigravity\\brain\\09243a69-de21-4d19-a283-1b735ac16628";

  // Force dark theme if not already dark
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  });
  await new Promise(r => setTimeout(r, 500));

  // 1. Hero
  await page.screenshot({ path: path.join(outDir, "audit_hero_dark.png") });
  console.log("Saved audit_hero_dark.png");

  // 2. Concept 1 (Customs) Console
  const consoleEl = await page.$("#audit-workspace");
  if (consoleEl) {
    await consoleEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, "audit_console_dark_concept1.png") });
    console.log("Saved audit_console_dark_concept1.png");
  }

  // 3. Concept 2 (Freight Overbilling)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes("Freight Overbilling"));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, "audit_console_dark_concept2.png") });
  console.log("Saved audit_console_dark_concept2.png");

  // 4. Concept 3 (Duty Drawback)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes("Duty Drawback"));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, "audit_console_dark_concept3.png") });
  console.log("Saved audit_console_dark_concept3.png");

  // 5. ROI Calculator
  const roi = await page.$("#roi-calculator");
  if (roi) {
    await roi.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, "audit_roi_calculator_dark.png") });
    console.log("Saved audit_roi_calculator_dark.png");
  }

  // 6. Differentialist Matrix
  const matrix = await page.$("#comparison-matrix");
  if (matrix) {
    await matrix.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, "audit_differentialist_matrix_dark.png") });
    console.log("Saved audit_differentialist_matrix_dark.png");
  }

  // 7. Executive Services Menu
  const services = await page.$("#services-menu");
  if (services) {
    await services.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, "audit_executive_services_dark.png") });
    console.log("Saved audit_executive_services_dark.png");
  }

  // 8. Lead Capture Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find(btn => btn.textContent && (btn.textContent.includes("Claim Free 25-Invoice Audit") || btn.textContent.includes("Schedule Strategy Call")));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, "audit_lead_modal_dark.png") });
  console.log("Saved audit_lead_modal_dark.png");

  await browser.close();
  console.log("ALL_CAPTURES_SUCCESSFUL");
})();
