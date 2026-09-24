import { chromium } from "playwright";
import fs from "node:fs";

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  COLOPHON — Capturing UI Screenshots for docs/screenshot");
  console.log("═══════════════════════════════════════════════════════");

  fs.mkdirSync("docs/screenshot", { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Landing Page (for README banner)
  console.log("Capturing Landing page -> docs/screenshot/landing.png...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "docs/screenshot/landing.png", fullPage: false });

  // 2. Statement Page
  console.log("Capturing Statement page -> docs/screenshot/statement.png...");
  await page.goto("http://localhost:3000/statement", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "docs/screenshot/statement.png", fullPage: false });

  // 3. Board Page
  console.log("Capturing Board page -> docs/screenshot/board.png...");
  await page.goto("http://localhost:3000/board", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "docs/screenshot/board.png", fullPage: false });

  // 4. Lab Page
  console.log("Capturing Lab page -> docs/screenshot/lab.png...");
  await page.goto("http://localhost:3000/lab", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "docs/screenshot/lab.png", fullPage: false });

  // 5. Proof Page
  console.log("Capturing Proof page -> docs/screenshot/proof.png...");
  await page.goto("http://localhost:3000/proof", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "docs/screenshot/proof.png", fullPage: false });

  await browser.close();
  console.log("✔ ALL 5 SCREENSHOTS CAPTURED TO docs/screenshot/");
}

main().catch((e) => {
  console.error("Error capturing screenshots:", e);
  process.exit(1);
});
