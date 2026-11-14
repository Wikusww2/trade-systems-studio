const puppeteer = require("puppeteer-core");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1600,1200"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log("Navigating to http://localhost:3000/funnel-redesign...");
  await page.goto("http://localhost:3000/funnel-redesign", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1500));

  const outDir = "C:\\Users\\samue\\.gemini\\antigravity\\brain\\09243a69-de21-4d19-a283-1b735ac16628";

  // 1. Capture Variation A initial view (The CFO Diagnostic Hook)
  await page.screenshot({ path: path.join(outDir, "funnel_variation_a_cfo_step1.png") });
  console.log("Saved funnel_variation_a_cfo_step1.png");

  // Click Step 2 button or run simulation in Variation A
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes("2. Verified Recovery"));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Toggle dispute letter
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes("View Remittance Dispute Package"));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, "funnel_variation_a_cfo_dispute.png") });
  console.log("Saved funnel_variation_a_cfo_dispute.png");

  // 2. Switch to Variation B: Legal Defense
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes("Variation B: Legal Defense"));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, "funnel_variation_b_counsel_step1.png") });
  console.log("Saved funnel_variation_b_counsel_step1.png");

  // In Variation B, switch to Step 2 (Safe-Harbor Prior Disclosure preview)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes("2. Safe-Harbor Prior Disclosure"));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, "funnel_variation_b_counsel_disclosure.png") });
  console.log("Saved funnel_variation_b_counsel_disclosure.png");

  await browser.close();
  console.log("FUNNEL_VARIATIONS_CAPTURED");
})();

