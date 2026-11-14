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
  await new Promise(r => setTimeout(r, 1000));

  const outDir = "C:\\Users\\samue\\.gemini\\antigravity\\brain\\09243a69-de21-4d19-a283-1b735ac16628";

  // Open Lead Capture Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const target = btns.find(b => b.textContent && (b.textContent.includes("Claim Free 25-Invoice Audit") || b.textContent.includes("Schedule Strategy Call")));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, "audit_06_lead_modal.png") });
  console.log("Saved audit_06_lead_modal.png");

  // Scroll to Differentialist Matrix
  const matrix = await page.$("#comparison-matrix");
  if (matrix) {
    await matrix.scrollIntoView();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, "audit_07_comparison_matrix.png") });
    console.log("Saved audit_07_comparison_matrix.png");
  }

  // Scroll to Executive Services Menu
  const services = await page.$("#services-menu");
  if (services) {
    await services.scrollIntoView();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, "audit_08_executive_services.png") });
    console.log("Saved audit_08_executive_services.png");
  }

  await browser.close();
  console.log("ALL_ADDITIONAL_CAPTURES_DONE");
})();
