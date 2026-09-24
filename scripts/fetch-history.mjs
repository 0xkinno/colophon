/**
 * COLOPHON — Phase 2: History Fetcher Script
 *
 * Scans recent signatures for tracked mints and writes history.json.
 */

import { writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { SolanaReadOnlyClient } from "../packages/chain/dist/src/index.js";
import { KNOWN_UNIVERSE } from "../packages/instruments/dist/src/index.js";

const RPC_URL = process.env.RPC_URL ?? "https://api.mainnet-beta.solana.com";
const runDirs = readdirSync("evidence/runs").filter((d) => d.startsWith("run-")).sort();
const RUN_ID = runDirs.at(-1) ?? "run-latest";
const OUT_DIR = `evidence/runs/${RUN_ID}`;
mkdirSync(OUT_DIR, { recursive: true });

async function fetchHistory() {
  console.log(`Fetching history using RPC: ${RPC_URL.slice(0, 60)}...`);
  const client = new SolanaReadOnlyClient({ endpoint: RPC_URL });

  const history: Record<string, any> = {};

  for (const inst of KNOWN_UNIVERSE.slice(0, 4)) {
    console.log(`  [${inst.symbol}] Scanning recent signatures for ${inst.mint.slice(0, 16)}...`);
    try {
      const sigs = await client.getSignaturesForAddress(inst.mint, { limit: 10 });
      history[inst.symbol] = {
        mint: inst.mint,
        category: inst.category,
        signaturesScanned: sigs.length,
        signatures: sigs.map((s) => ({
          signature: s.signature,
          slot: s.slot,
          blockTime: s.blockTime,
        })),
        status: "MEASURED",
      };
    } catch (err: any) {
      history[inst.symbol] = {
        mint: inst.mint,
        status: "PARTIAL",
        error: err.message,
      };
    }
  }

  const outPath = `${OUT_DIR}/history.json`;
  writeFileSync(outPath, JSON.stringify(history, null, 2));
  console.log(`Wrote: ${outPath}`);
}

fetchHistory().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
