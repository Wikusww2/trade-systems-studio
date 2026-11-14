const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  const consoleMessages = [];
  const networkErrors = [];

  page.on("console", msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`));
  page.on("pageerror", err => consoleMessages.push(`PAGE_ERROR: ${err.message}`));
  page.on("requestfailed", req => networkErrors.push(`${req.url()} (${req.failure()?.errorText})`));

  await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 3000));

  const state = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const docText = document.body.innerText;
    return {
      hasCanvas: !!canvas,
      canvasWidth: canvas?.width,
      canvasHeight: canvas?.height,
      discrepancyCards: document.querySelectorAll("[id^='card-']").length,
      textSnippet: docText.slice(0, 300)
    };
  });

  console.log("PAGE STATE:", JSON.stringify(state, null, 2));
  console.log("CONSOLE MESSAGES:", consoleMessages);
  console.log("NETWORK ERRORS:", networkErrors);

  await browser.close();
})();
