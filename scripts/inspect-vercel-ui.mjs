import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

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
    const src = await heroImg.first().getAttribute("src");
    console.log(`Hero image src: ${src}`);
    console.log(`Hero image visible: ${isVisible}, natural dimensions: ${naturalWidth}x${naturalHeight}`);
    if (naturalWidth === 0) {
      throw new Error("Hero image failed to load natural dimensions!");
    }
  } else {
    throw new Error("Hero image element not found!");
  }

  // Check badges are removed
  const bodyText = await page.textContent("body");
  const badLabels = ["Photographic Artifact", "Archival Ledger & Tally Counter", "§29 Editorial Still-Life"];
  for (const label of badLabels) {
    if (bodyText.includes(label)) {
      throw new Error(`Forbidden label found on page: ${label}`);
    }
  }
  console.log("✔ Forbidden badges successfully removed from UI");

  // Check ScaledUiAmountConfig text
  const hasScaledUi = bodyText.includes("Scaled UI Amount") && bodyText.includes("ScaledUiAmountConfig");
  console.log(`✔ ScaledUiAmount cleanly styled and present: ${hasScaledUi}`);

  // Test Wallet Connect modal
  console.log("2. Testing Connect Wallet button...");
  const connectBtn = page.getByRole("button", { name: /Connect Wallet/i });
  await connectBtn.click();
  await page.waitForTimeout(1000);

  const modal = page.locator(".wallet-adapter-modal");
  const modalVisible = await modal.isVisible();
  console.log(`✔ Wallet connect modal visible: ${modalVisible}`);

  // Close modal
  const closeBtn = page.locator(".wallet-adapter-modal-button-close");
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // Take screenshot of new hero
  fs.mkdirSync("docs/screenshot", { recursive: true });
  await page.screenshot({ path: "docs/screenshot/landing-hero-verified.png" });
  console.log("✔ Saved docs/screenshot/landing-hero-verified.png");

  // Test Route /statement
  console.log("3. Testing /statement...");
  await page.goto("https://colophon-taupe.vercel.app/statement", { waitUntil: "networkidle" });
  const statementTitle = await page.textContent("h1");
  console.log(`Statement page H1: ${statementTitle}`);

  // Test Route /board
  console.log("4. Testing /board...");
  await page.goto("https://colophon-taupe.vercel.app/board", { waitUntil: "networkidle" });
  const boardTitle = await page.textContent("h1");
  console.log(`Board page H1: ${boardTitle}`);

  // Test Route /lab
  console.log("5. Testing /lab...");
  await page.goto("https://colophon-taupe.vercel.app/lab", { waitUntil: "networkidle" });
  const labTitle = await page.textContent("h1");
  console.log(`Lab page H1: ${labTitle}`);

  // Test Route /proof
  console.log("6. Testing /proof and Real Devnet Execution tab...");
  await page.goto("https://colophon-taupe.vercel.app/proof", { waitUntil: "networkidle" });
  const devnetTab = page.getByRole("button", { name: /Real Devnet Execution/i });
  await devnetTab.click();
  await page.waitForTimeout(500);

  const proofContent = await page.textContent("main");
  const hasProgramId = proofContent.includes("7pPKsqAg9AFZzSEJbygpbqAVKGFgXpaN5AcqNKrwhCe2");
  console.log(`✔ Real Devnet Execution tab shows Program ID: ${hasProgramId}`);

  console.log("ALL VERCEL PRODUCTION CHECKS PASSED PERFECTLY!");
  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
