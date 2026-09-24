import { chromium } from "playwright";
import fs from "node:fs";

const VIEWPORTS = [
  { name: "Galaxy S9+", width: 360, height: 740 },
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 14 Pro", width: 393, height: 852 },
  { name: "Pixel 7", width: 412, height: 915 },
  { name: "iPad Mini", width: 768, height: 1024 },
  { name: "iPad Pro 11", width: 834, height: 1194 },
  { name: "HD Desktop", width: 1280, height: 720 },
  { name: "MacBook 14", width: 1440, height: 900 },
  { name: "FHD Desktop", width: 1920, height: 1080 },
  { name: "QHD Desktop", width: 2560, height: 1440 },
];

const ROUTES = [
  { path: "/", name: "Landing" },
  { path: "/statement", name: "Statement" },
  { path: "/board", name: "Board" },
  { path: "/lab", name: "Lab" },
  { path: "/proof", name: "Proof" },
];

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  COLOPHON — Responsive QA & Playwright Capture");
  console.log("═══════════════════════════════════════════════════════");

  fs.mkdirSync("apps/web/public/screenshots", { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = [];

  // 1. High-Resolution Screenshots for README (1440x900)
  console.log("\n1. Capturing high-resolution product views...");
  const captureContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await captureContext.newPage();

  // Capture /statement
  console.log("  Capturing Statement view...");
  await page.goto("http://localhost:3000/statement", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "apps/web/public/screenshots/statement.png", fullPage: false });

  // Capture /board
  console.log("  Capturing Board view...");
  await page.goto("http://localhost:3000/board", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "apps/web/public/screenshots/board.png", fullPage: false });

  // Capture /lab
  console.log("  Capturing Lab view...");
  await page.goto("http://localhost:3000/lab", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "apps/web/public/screenshots/lab.png", fullPage: false });

  // Capture /proof
  console.log("  Capturing Proof view...");
  await page.goto("http://localhost:3000/proof", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "apps/web/public/screenshots/proof.png", fullPage: false });

  // 2. Test Wallet Connect Modal
  console.log("\n2. Testing Wallet Connect Modal end-to-end...");
  await page.goto("http://localhost:3000/statement", { waitUntil: "networkidle" });
  const connectBtn = page.getByRole("button", { name: /Connect Wallet/i });
  if (await connectBtn.isVisible()) {
    await connectBtn.click();
    await page.waitForTimeout(500);
    const modal = page.locator(".wallet-adapter-modal");
    const modalVisible = await modal.isVisible();
    console.log(`  ✔ Connect Wallet Modal Opened: ${modalVisible ? "PASS" : "FAIL"}`);
    // Close modal
    const closeBtn = page.locator(".wallet-adapter-modal-button-close");
    if (await closeBtn.isVisible()) await closeBtn.click();
  }

  await captureContext.close();

  // 3. Responsive Audit across 10 Viewports
  console.log("\n3. Executing Responsive Audit across 10 Viewports...");
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const vpPage = await context.newPage();

    let vpPass = true;
    for (const route of ROUTES) {
      await vpPage.goto(`http://localhost:3000${route.path}`, { waitUntil: "networkidle" });

      // Check horizontal overflow: scrollWidth should equal clientWidth on documentElement
      const hasOverflow = await vpPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasOverflow) {
        console.log(`  ✖ OVERFLOW: ${vp.name} (${vp.width}px) on ${route.path}`);
        vpPass = false;
      }
    }

    results.push({ viewport: vp.name, width: vp.width, height: vp.height, passed: vpPass });
    console.log(`  ${vpPass ? "✔ PASS" : "✖ FAIL"}   ${vp.name} (${vp.width}x${vp.height})`);
    await context.close();
  }

  await browser.close();

  const allPassed = results.every((r) => r.passed);
  console.log("\n───────────────────────────────────────────────────────");
  console.log(`RESPONSIVE AUDIT RESULT: ${allPassed ? "10/10 VIEWPORTS PASS" : "FAILURES DETECTED"}`);
  console.log("───────────────────────────────────────────────────────");

  fs.writeFileSync(
    "evidence/responsive_qa_report.json",
    JSON.stringify({ timestamp: new Date().toISOString(), results, allPassed }, null, 2)
  );
}

main().catch((e) => {
  console.error("Error in QA script:", e);
  process.exit(1);
});
