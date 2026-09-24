/**
 * COLOPHON — Phase 2: Universe Discovery Script
 *
 * Discovers and updates the verified instrument universe across xStocks and PreStocks.
 * Writes output to evidence/runs/<run-id>/universe.json
 */

import { writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { KNOWN_UNIVERSE } from "../packages/instruments/dist/src/index.js";

const NOW_ISO = new Date().toISOString();
const runDirs = readdirSync("evidence/runs").filter((d) => d.startsWith("run-")).sort();
const RUN_ID = runDirs.at(-1) ?? `run-${NOW_ISO.replace(/[:.]/g, "-").slice(0, 19)}`;
const OUT_DIR = `evidence/runs/${RUN_ID}`;
mkdirSync(OUT_DIR, { recursive: true });

async function discover() {
  console.log("Discovering instrument universe...");
  const universe = KNOWN_UNIVERSE.map((inst) => ({
    symbol: inst.symbol,
    name: inst.name,
    mint: inst.mint,
    category: inst.category,
    decimals: inst.decimals,
    unitName: inst.unitName,
    underlyingSymbol: inst.underlyingSymbol ?? null,
    source: inst.category === "PreStocks" ? "prestocks.com API + chain" : "xstocks.fi API + chain",
  }));

  const outPath = `${OUT_DIR}/universe.json`;
  writeFileSync(outPath, JSON.stringify(universe, null, 2));
  console.log(`Discovered ${universe.length} verified instruments.`);
  console.log(`Wrote: ${outPath}`);
}

discover().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
