/**
 * COLOPHON — Offline Verifier CLI
 *
 * Standalone CLI tool to verify any Colophon proof bundle offline.
 *
 * Usage:
 *   node scripts/verify-offline-cli.mjs [path-to-bundle.json]
 *   Default: evidence/runs/<latest>/verification_report.json
 */

import { readFileSync, readdirSync } from "node:fs";
import { verifyProofBundleOffline } from "../packages/verifier/dist/src/index.js";

const runDirs = readdirSync("evidence/runs").filter((d) => d.startsWith("run-")).sort();
const RUN_ID = runDirs.at(-1) ?? "run-latest";

const targetPath = process.argv[2] ?? `evidence/runs/${RUN_ID}/verification_report.json`;

console.log("═══════════════════════════════════════════════════════");
console.log("  COLOPHON — Independent Offline Proof Verifier");
console.log("═══════════════════════════════════════════════════════");
console.log(`Verifying target: ${targetPath}`);

try {
  const content = JSON.parse(readFileSync(targetPath, "utf8"));
  const bundle = content.bundle ?? content;

  const report = verifyProofBundleOffline(bundle);

  console.log(`Bundle ID   : ${report.bundleId}`);
  console.log(`Statement ID: ${report.statementId}`);
  console.log(`Verified At : ${report.timestamp}`);
  console.log("───────────────────────────────────────────────────────");

  for (const c of report.checks) {
    const badge = c.passed ? "✔ PASS" : "✖ FAIL";
    console.log(`  ${badge.padEnd(8)} [${c.checkId}] ${c.name}`);
    if (!c.passed) {
      console.log(`           ${c.message}`);
    }
  }

  console.log("───────────────────────────────────────────────────────");
  if (report.passed) {
    console.log("VERIFICATION RESULT: ALL 7 CHECKS PASSED (AUTHENTIC)");
    process.exit(0);
  } else {
    console.error(`VERIFICATION RESULT: TAMPER DETECTED — ${report.tamperReason}`);
    process.exit(1);
  }
} catch (err) {
  console.error("Verification failed with error:", err.message);
  process.exit(1);
}
