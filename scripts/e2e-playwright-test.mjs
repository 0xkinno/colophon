import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = process.argv[2] || "http://localhost:3001";
const SCREENSHOT_DIR = "docs/screenshot/e2e_verification";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runE2ETests() {
  console.log("=================================================");
  console.log("  COLOPHON — PLAYWRIGHT CHROMIUM E2E & WALLET TEST");
  console.log("=================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const results = [];

  function record(name, passed, detail = "") {
    console.log(`  ${passed ? "✔ PASS" : "✖ FAIL"} [${name}] ${detail}`);
    results.push({ name, passed, detail });
  }

  try {
    // ----------------------------------------------------
    // TEST 1: LANDING PAGE (/)
    // ----------------------------------------------------
    console.log("\n--- Testing Landing Page (/) ---");
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });

    const title = await page.title();
    record("LANDING_TITLE", title.toUpperCase().includes("COLOPHON"), `Title: "${title}"`);

    // Verify stock logos render on landing
    const logos = await page.locator("img[src*='/logos/tokens/']").all();
    record("LANDING_LOGOS", logos.length > 0, `Found ${logos.length} official token logos on landing`);

    // Check logo image load integrity
    let loadedLogos = 0;
    for (const logo of logos) {
      const naturalWidth = await logo.evaluate((img) => img.naturalWidth);
      if (naturalWidth > 0) loadedLogos++;
    }
    record("LANDING_LOGOS_LOADED", loadedLogos > 0, `${loadedLogos}/${logos.length} logos loaded with naturalWidth > 0`);

    // Verify glow card styles
    const glowCards = await page.locator("[class*='hover:shadow-']").count();
    record("LANDING_GLOW_CARDS", glowCards > 0, `Found ${glowCards} interactive cards with hover glow`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_landing_desktop.png"), fullPage: false });

    // ----------------------------------------------------
    // TEST 2: DISCOVERY BOARD (/board)
    // ----------------------------------------------------
    console.log("\n--- Testing Multi-Token Board (/board) ---");
    await page.goto(`${BASE_URL}/board`, { waitUntil: "domcontentloaded" });

    const rows = await page.locator("table tbody tr").count();
    record("BOARD_INSTRUMENT_ROWS", rows >= 10, `Found ${rows} instrument rows in discovery table`);

    const boardLogos = await page.locator("table tbody tr td:first-child").count();
    record("BOARD_STOCK_LOGOS", boardLogos >= 10, `Found ${boardLogos} squircle stock logo containers in table`);

    // Verify Audit action link
    const firstActionLink = page.locator("table tbody tr a").first();
    const href = await firstActionLink.getAttribute("href");
    record("BOARD_ACTION_LINK", href?.includes("/statement"), `Action link: ${href}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_board_desktop.png"), fullPage: false });

    // ----------------------------------------------------
    // TEST 3: STATEMENT PAGE (/statement) — WALLET & KEEPER
    // ----------------------------------------------------
    console.log("\n--- Testing Statement Page (/statement) ---");
    await page.goto(`${BASE_URL}/statement?mint=PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500); // Allow React to hydrate interactive event handlers

    // 3a: Verify Primary Connect Wallet UI
    const connectWalletBtn = page.locator("header button:has-text('Connect')").first();
    const connectWalletVisible = await connectWalletBtn.isVisible();
    record("WALLET_CONNECT_CTA", connectWalletVisible, "Connect Wallet button is visible in navigation header");

    // 3b: Verify Reconstructed Values & Terminology
    const pageHeading = await page.locator("h1:has-text('Ownership Statement')").isVisible();
    record("STATEMENT_PAGE_HEADING", pageHeading, "Ownership Statement main heading is rendered");

    const instName = (await page.locator("text=OPENAI").count()) > 0;
    record("STATEMENT_INSTRUMENT_NAME", instName, "Target instrument symbol 'OPENAI' is rendered");

    // Verify Dual-Reader Differential (Naive vs Protocol-Correct vs Colophon)
    const naiveCard = await page.locator("text=Naive Current-State Reader").first().isVisible();
    const protocolCard = await page.locator("text=Protocol-Correct Time-Aware").first().isVisible();
    const colophonCard = await page.locator("text=Colophon Temporal Kernel").first().isVisible();
    record("DUAL_READER_DIFFERENTIAL", naiveCard && protocolCard && colophonCard, "All 3 differential comparison cards render");

    // 3c: Test Line-Item Provenance Modal ("Why this number?")
    const provenanceBtn = page.locator("button:has-text('Why this number?')").first();
    const provBtnVisible = await provenanceBtn.isVisible();
    record("PROVENANCE_BUTTON", provBtnVisible, "Line-item provenance button is present in Box 3");

    if (provBtnVisible) {
      await provenanceBtn.scrollIntoViewIfNeeded();
      await provenanceBtn.click({ force: true });
      await page.waitForTimeout(1000);
      const provModal = page.locator("text=LINE-ITEM PROVENANCE").first();
      const provModalVisible = await provModal.isVisible();
      record("PROVENANCE_MODAL_OPEN", provModalVisible, "Provenance modal opened on click");

      // Verify formula and Merkle branch in modal
      const hasMerkleBranch = await page.locator("text=Evidence Merkle Proof Path").first().isVisible();
      record("PROVENANCE_MODAL_DETAILS", provModalVisible && hasMerkleBranch, "Mathematical derivation and Merkle proof path rendered");

      // Close provenance modal
      const closeBtn = page.locator("button:has-text('✕')").first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click({ force: true });
      } else {
        await page.keyboard.press("Escape");
      }
      await page.waitForTimeout(300);
      record("PROVENANCE_MODAL_CLOSE", !(await provModal.isVisible()), "Provenance modal closed cleanly");
    }

    // 3d: Test Statement Watch Keeper
    const watchHeader = page.locator("text=Statement Watch Keeper").first();
    const watchVisible = await watchHeader.isVisible();
    record("STATEMENT_WATCH_PANEL", watchVisible, "Statement Watch Keeper panel is present");

    // Verify state badge (for OpenAI it detects divergence -> RECONCILIATION_REQUIRED)
    const reconAlert = page.locator("text=RECONCILIATION REQUIRED").first();
    record("WATCH_DIVERGENCE_STATE", await reconAlert.isVisible(), "Watch Keeper accurately detects mainnet split divergence");

    // Test Policy selector inside StatementWatch
    const policySelect = page.locator("select").filter({ hasText: "Strict Multiplier Split" }).first();
    if (await policySelect.isVisible()) {
      await policySelect.selectOption({ label: "All Corporate Actions" });
      await page.waitForTimeout(200);
      record("WATCH_POLICY_SWITCH", true, "Switched watch policy to All Corporate Actions");
    }

    // Test Review & Reconcile modal
    const reviewBtn = page.locator("button:has-text('Review & Reconcile')").first();
    if (await reviewBtn.isVisible()) {
      await reviewBtn.scrollIntoViewIfNeeded();
      await reviewBtn.click({ force: true });
      await page.waitForTimeout(500);
      const reviewModal = page.locator("text=Reconciliation Review").first();
      record("WATCH_REVIEW_MODAL", await reviewModal.isVisible(), "Reconciliation review modal rendered before/after diff");

      // Close modal
      const modalClose = page.locator("button:has-text('Cancel')").first();
      if (await modalClose.isVisible()) {
        await modalClose.click({ force: true });
      } else {
        await page.keyboard.press("Escape");
      }
      await page.waitForTimeout(300);
    }

    // 3e: Verify Real Devnet On-Chain Proof Section
    const anchorProofSection = page.locator("text=On-Chain Cryptographic Anchor (Solana Devnet)");
    record("ANCHOR_PROOF_SECTION", await anchorProofSection.isVisible(), "Devnet proof anchoring section is present");

    const progId = await page.locator("text=7pPKsqAg9AFZzSEJbygpbqAVKGFgXpaN5AcqNKrwhCe2").first().isVisible();
    record("DEVNET_PROGRAM_ID", progId, "Verified Colophon Devnet Program ID displayed");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_statement_desktop.png"), fullPage: false });

    // ----------------------------------------------------
    // TEST 4: FOUNDER LAB (/lab)
    // ----------------------------------------------------
    console.log("\n--- Testing Founder Lab (/lab) ---");
    await page.goto(`${BASE_URL}/lab`, { waitUntil: "domcontentloaded" });
    const slider = page.locator("input[type='range']").first();
    record("LAB_SLIDER", await slider.isVisible(), "Continuous timeline date scrubber slider is present");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_lab_desktop.png"), fullPage: false });

    // ----------------------------------------------------
    // TEST 5: PROOF BENCH (/proof)
    // ----------------------------------------------------
    console.log("\n--- Testing Proof Bench (/proof) ---");
    await page.goto(`${BASE_URL}/proof`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const benchmarkBaseline = await page.locator("text=Arm 1: Baseline").isVisible();
    const benchmarkColophon = await page.locator("text=Arm 2: Colophon").isVisible();
    record("PROOF_BENCHMARK_EVAL", benchmarkBaseline && benchmarkColophon, "Benchmark evidence arms 1 & 2 verified");

    // Click Break Bench tab
    const tamperTab = page.locator("button:has-text('Break Bench')").first();
    if (await tamperTab.isVisible()) {
      await tamperTab.click();
      await page.waitForTimeout(500);
      const attackHeader = await page.locator("text=Select Tamper Attack").first().isVisible();
      record("PROOF_TAMPER_TAB", attackHeader, "Tamper break bench loaded with attack selector");
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_proof_desktop.png"), fullPage: false });

    // ----------------------------------------------------
    // TEST 6: RESPONSIVE MOBILE VERIFICATION (iPhone 14)
    // ----------------------------------------------------
    console.log("\n--- Testing Mobile Viewport (iPhone 14: 390x844) ---");
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });

    const pagesToTest = [
      { path: "/", name: "Landing" },
      { path: "/board", name: "Board" },
      { path: "/statement?mint=PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF", name: "Statement" },
      { path: "/lab", name: "Lab" },
      { path: "/proof", name: "Proof" },
    ];

    for (const p of pagesToTest) {
      await mobilePage.goto(`${BASE_URL}${p.path}`, { waitUntil: "domcontentloaded" });
      const overflow = await mobilePage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      record(`MOBILE_OVERFLOW_${p.name.toUpperCase()}`, !overflow, `${p.name} horizontal overflow: ${overflow ? "DETECTED" : "NONE (PERFECT)"}`);
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, `06_mobile_${p.name.toLowerCase()}.png`), fullPage: false });
    }

    await mobilePage.close();

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    record("UNEXPECTED_ERROR", false, err.message);
  } finally {
    await browser.close();
  }

  console.log("\n=================================================");
  console.log("  PLAYWRIGHT TEST SUMMARY");
  console.log("=================================================");
  const allPassed = results.every((r) => r.passed);
  console.log(`Total Checks: ${results.length}`);
  console.log(`Passed: ${results.filter((r) => r.passed).length}`);
  console.log(`Failed: ${results.filter((r) => !r.passed).length}`);
  console.log(`Overall Result: ${allPassed ? "100% PASS ✔" : "FAIL ✖"}`);

  if (!allPassed) {
    process.exit(1);
  }
}

runE2ETests();
