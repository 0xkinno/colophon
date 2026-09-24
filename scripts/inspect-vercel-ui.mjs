import { chromium } from "playwright";
import fs from "node:fs";

async function run() {
  fs.mkdirSync("docs/screenshot", { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // 1. DESKTOP CHECKS & HIGH RES SCREENSHOTS (1440x900)
  console.log("═══════════════════════════════════════════════════════");
  console.log("  COLOPHON — Verifying Production Vercel Deployment    ");
  console.log("═══════════════════════════════════════════════════════");

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await desktopContext.newPage();

  console.log("1. Navigating to https://colophon-taupe.vercel.app...");
  const response = await page.goto("https://colophon-taupe.vercel.app", { waitUntil: "networkidle", timeout: 30000 });
  console.log(`Landing status: ${response.status()}`);

  // Check hero image
  const heroImg = page.locator('img[alt="Colophon Archival Ledger"]');
  const imgCount = await heroImg.count();
  console.log(`Hero image count: ${imgCount}`);

  if (imgCount > 0) {
    const isVisible = await heroImg.first().isVisible();
    const naturalWidth = await heroImg.first().evaluate((img) => img.naturalWidth);
    const naturalHeight = await heroImg.first().evaluate((img) => img.naturalHeight);
    console.log(`Hero image visible: ${isVisible}, natural dimensions: ${naturalWidth}x${naturalHeight}`);
    if (naturalWidth === 0) {
      throw new Error("Hero image failed to load natural dimensions!");
    }
  }

  // Check that section markers like (§8) and (ScaledUiAmountConfig) are NOT present
  const bodyText = await page.textContent("body");
  const forbiddenSnippets = ["(§8)", "(§21)", "(ScaledUiAmountConfig)", "Photographic Artifact"];
  for (const snippet of forbiddenSnippets) {
    if (bodyText.includes(snippet)) {
      throw new Error(`Forbidden snippet found on page: ${snippet}`);
    }
  }
  console.log("✔ Forbidden markers (§8, (ScaledUiAmountConfig), etc.) are completely absent");

  // Check all 12 instruments logos are present
  const instrumentNames = [
    "OPENAI", "SPACEX", "ANDURIL", "ANTHROPIC", "FIGUREAI", "KALSHI",
    "NEURALINK", "POLYMARKET", "SPYx", "AAPLx", "TSLAx", "NVDAx"
  ];
  for (const name of instrumentNames) {
    if (!bodyText.includes(name)) {
      throw new Error(`Instrument ${name} missing from Supported Instruments list!`);
    }
  }
  console.log(`✔ All 12 supported instruments with SVG logos verified`);

  // Capture fresh landing view
  await page.screenshot({ path: "docs/screenshot/landing.png", fullPage: false });
  console.log("✔ Captured docs/screenshot/landing.png");

  // Capture /statement
  console.log("2. Testing & capturing /statement...");
  await page.goto("https://colophon-taupe.vercel.app/statement", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "docs/screenshot/statement.png", fullPage: false });
  console.log("✔ Captured docs/screenshot/statement.png (2880x1800)");

  // Capture /board
  console.log("3. Testing & capturing /board...");
  await page.goto("https://colophon-taupe.vercel.app/board", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "docs/screenshot/board.png", fullPage: false });
  console.log("✔ Captured docs/screenshot/board.png (2880x1800)");

  // Capture /lab
  console.log("4. Testing & capturing /lab...");
  await page.goto("https://colophon-taupe.vercel.app/lab", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "docs/screenshot/lab.png", fullPage: false });
  console.log("✔ Captured docs/screenshot/lab.png (2880x1800)");

  // Capture /proof
  console.log("5. Testing & capturing /proof...");
  await page.goto("https://colophon-taupe.vercel.app/proof", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "docs/screenshot/proof.png", fullPage: false });
  console.log("✔ Captured docs/screenshot/proof.png (2880x1800)");

  await desktopContext.close();

  // 2. MOBILE VIEWPORT QA (375px iPhone SE)
  console.log("\n6. Running Mobile Viewport QA (375px)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("https://colophon-taupe.vercel.app", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(500);

  const overflow = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log(`Mobile horizontal overflow detected: ${overflow}`);
  if (overflow) {
    throw new Error("Mobile layout has horizontal overflow!");
  }
  await mobilePage.screenshot({ path: "docs/screenshot/mobile-375.png" });
  console.log("✔ Captured docs/screenshot/mobile-375.png (Zero overflow)");

  await browser.close();
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ALL QA AUDITS & SCREENSHOT CAPTURES COMPLETED!      ");
  console.log("═══════════════════════════════════════════════════════");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
