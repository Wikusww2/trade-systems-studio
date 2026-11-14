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

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
  await page.waitForSelector("canvas", { timeout: 15000 }).catch(() => console.log("No canvas found within 15s"));
  await new Promise(r => setTimeout(r, 2000));

  const outDir = "C:\\Users\\samue\\.gemini\\antigravity\\brain\\09243a69-de21-4d19-a283-1b735ac16628";

  // 1. Hero and top section
  await page.screenshot({ path: path.join(outDir, "audit_01_hero.png") });
  console.log("Saved audit_01_hero.png");

  // 2. Click Concept 2 (Freight Audit)
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes("Freight Overbilling")) {
      await b.click();
      console.log("Clicked Freight Overbilling tab");
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }
  await page.screenshot({ path: path.join(outDir, "audit_02_concept2_freight.png") });
  console.log("Saved audit_02_concept2_freight.png");

  // 3. Click Concept 3 (Duty Drawback)
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes("Duty Drawback")) {
      await b.click();
      console.log("Clicked Duty Drawback tab");
      await new Promise(r => setTimeout(r, 1500));
      break;
    }
  }
  await page.screenshot({ path: path.join(outDir, "audit_03_concept3_drawback.png") });
  console.log("Saved audit_03_concept3_drawback.png");

  // 4. Scroll to ROI Calculator
  const calc = await page.$("#roi-calculator");
  if (calc) {
    await calc.scrollIntoView();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, "audit_04_roi_calculator.png") });
    console.log("Saved audit_04_roi_calculator.png");
  }

  // 5. Scroll to Services & Funnel CTA
  const footerCta = await page.$("footer");
  if (footerCta) {
    await footerCta.scrollIntoView();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, "audit_05_footer_funnel.png") });
    console.log("Saved audit_05_footer_funnel.png");
  }

  // 6. Open Lead Capture Modal
  await page.evaluate(() => {
    const cta = document.querySelector("button:has-text('Claim Free 25-Invoice Audit')") ||
      Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Claim Free 25-Invoice Audit") || b.textContent.includes("Schedule Strategy Call"));
    if (cta) cta.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, "audit_06_lead_modal.png") });
  console.log("Saved audit_06_lead_modal.png");

  await browser.close();
  console.log("AUDIT_CAPTURES_COMPLETE");
})();

