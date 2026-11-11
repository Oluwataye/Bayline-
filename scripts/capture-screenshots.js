const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function capture() {
  const screenshotDir = path.join(__dirname, "../tasks/screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const viewports = [
    { name: "desktop-1440px.png", width: 1440, height: 900 },
    { name: "tablet-1024px.png", width: 1024, height: 768 },
    { name: "mobile-390px.png", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
    // Wait for animations / charts to fully render
    await new Promise((r) => setTimeout(r, 1500));

    const filePath = path.join(screenshotDir, vp.name);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Captured ${vp.name} at ${vp.width}x${vp.height} -> ${filePath}`);
  }

  await browser.close();
  console.log("All screenshots captured successfully.");
}

capture().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});

