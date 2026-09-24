/**
 * COLOPHON — Phase 2 & 4: Bundle Verification Script
 *
 * Runs offline verification on generated proof bundles and writes verification_report.json.
 */

import { writeFileSync, readdirSync, mkdirSync } from "node:fs";
import {
  buildMultiplierTimeline,
  reconstructHoldingsAt,
  generateStatement,
} from "../packages/kernel/dist/src/index.js";
import { buildProofBundle } from "../packages/proof/dist/src/index.js";
import { verifyProofBundleOffline } from "../packages/verifier/dist/src/index.js";

const runDirs = readdirSync("evidence/runs").filter((d) => d.startsWith("run-")).sort();
const RUN_ID = runDirs.at(-1) ?? "run-latest";
const OUT_DIR = `evidence/runs/${RUN_ID}`;
mkdirSync(OUT_DIR, { recursive: true });

async function verifySample() {
  console.log("Generating and verifying proof bundle...");

  const MINT = "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF";
  const WALLET = "Holder1111111111111111111111111111111111111";
  const EFFECTIVE_TS = 1784305800n;

  const initial = {
    mint: MINT,
    initialMultiplierNumerator: 10000000n,
    initialMultiplierDenominator: 10000000n,
    genesisSlot: 300000000n,
    genesisTimestamp: 1770000000n,
    sourceSignature: "sig_genesis",
    confidence: "MEASURED",
  };

  const scheduled = {
    type: "MultiplierScheduledEvent",
    mint: MINT,
    slot: 350000000n,
    blockTime: 1780000000n,
    signature: "sig_update_openai",
    effectiveAt: EFFECTIVE_TS,
    oldMultiplierNumerator: 10000000n,
    oldMultiplierDenominator: 10000000n,
    newMultiplierNumerator: 14861347n,
    newMultiplierDenominator: 10000000n,
    authority: "auth",
    confidence: "MEASURED",
  };

  const timeline = buildMultiplierTimeline(initial, [scheduled]);

  const transfer = {
    type: "TransferEvent",
    mint: MINT,
    from: "MintAuthority",
    to: WALLET,
    rawAmount: 1901815775765n,
    slot: 310000000n,
    blockTime: 1775000000n,
    signature: "sig_mint_transfer",
    confidence: "MEASURED",
  };

  const holdings = reconstructHoldingsAt({
    wallet: WALLET,
    mint: MINT,
    decimals: 9,
    asOfTs: EFFECTIVE_TS + 1000n,
    transfers: [transfer],
    timeline,
    naiveCurrentMultiplierFloat: 1.0,
    pricePerUnit: 1309.18,
  });

  const statement = generateStatement({
    holdings,
    symbol: "OPENAI",
    category: "PreStocks",
    pricePerUnit: 1309.18,
    priceSource: "prestocks-api",
  });

  const bundle = buildProofBundle({
    statement,
    events: [transfer],
    gitCommit: "HEAD",
    rpcSource: "mainnet-beta",
  });

  const report = verifyProofBundleOffline(bundle);

  console.log(`Verification Passed: ${report.passed}`);
  console.log(`Tamper Detected: ${report.tamperDetected}`);
  for (const c of report.checks) {
    console.log(`  [${c.checkId}] ${c.passed ? "PASS" : "FAIL"}: ${c.name}`);
  }

  const outPath = `${OUT_DIR}/verification_report.json`;
  const serialized = JSON.stringify(
    { bundle, report },
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );
  writeFileSync(outPath, serialized);
  console.log(`Wrote: ${outPath}`);
}

verifySample().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
