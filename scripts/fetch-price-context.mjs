/**
 * COLOPHON — Price Context Fetcher
 *
 * Augments divergence_cases.json with real-world price context from:
 *   1. Jupiter Lite API (on-chain xStock price)
 *   2. PreStocks API (for PreStock mints)
 *
 * This script runs AFTER dollar-divergence-hunt.mjs and adds dollar
 * estimates to MEASURED divergence cases.
 *
 * Never invents prices. If a price cannot be fetched, estimates are
 * labeled UNKNOWN.
 *
 * Usage:
 *   node scripts/fetch-price-context.mjs <run-id>
 *   e.g. node scripts/fetch-price-context.mjs run-2026-09-24T00-00-00
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const EVIDENCE_DIR = "evidence/runs";

// Find the most recent run if no arg provided
let runId = process.argv[2];
if (!runId) {
  const runs = readdirSync(EVIDENCE_DIR).filter((d) => d.startsWith("run-")).sort();
  runId = runs[runs.length - 1];
  if (!runId) {
    console.error("No runs found. Run dollar-divergence-hunt.mjs first.");
    process.exit(1);
  }
}

const runDir = join(EVIDENCE_DIR, runId);
const divergencePath = join(runDir, "divergence_cases.json");

let divergenceCases;
try {
  divergenceCases = JSON.parse(readFileSync(divergencePath, "utf8"));
} catch (e) {
  console.error(`Cannot read ${divergencePath}:`, e.message);
  process.exit(1);
}

if (divergenceCases.length === 0) {
  console.log("No divergence cases to enrich.");
  process.exit(0);
}

console.log(`Enriching ${divergenceCases.length} divergence cases with price context...`);

async function fetchJupiterPrice(mint) {
  try {
    const r = await fetch(`https://lite-api.jup.ag/price/v3?ids=${mint}`, {
      headers: { "user-agent": "colophon-research/0.1" },
    });
    if (!r.ok) return null;
    const j = await r.json();
    const item = j[mint];
    if (!item?.usdPrice) return null;
    return {
      usdPrice: item.usdPrice,
      stockData: item.stockData ?? null,
      source: "jupiter-lite-v3",
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.warn(`  Jupiter price fetch failed for ${mint}:`, e.message);
    return null;
  }
}

async function fetchPreStocksPrice(symbol) {
  try {
    const r = await fetch("https://prestocks.com/api/prestocks", {
      headers: { "user-agent": "colophon-research/0.1" },
    });
    if (!r.ok) return null;
    const j = await r.json();
    if (!Array.isArray(j)) return null;
    const item = j.find((x) => x.symbol?.toUpperCase() === symbol?.toUpperCase());
    if (!item) return null;
    return {
      tokenPrice: item.tokenPrice,
      impliedValuation: item.impliedValuation,
      markPrice: item.markPrice,
      markValuation: item.markValuation,
      supply: item.supply,
      source: "prestocks-api",
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.warn(`  PreStocks API failed:`, e.message);
    return null;
  }
}

const enriched = [];
for (const dc of divergenceCases) {
  console.log(`  [${dc.instrument}] Fetching price...`);
  let priceInfo = null;

  if (dc.category === "xStocks") {
    priceInfo = await fetchJupiterPrice(dc.mint);
  } else if (dc.category === "PreStocks") {
    priceInfo = await fetchPreStocksPrice(dc.instrument);
    if (!priceInfo) {
      priceInfo = await fetchJupiterPrice(dc.mint);
    }
  }

  // Compute dollar delta if we have a price
  let estimatedDollarDelta = "UNKNOWN";
  let pricePerUiUnit = null;
  let priceSource = "UNKNOWN";

  if (priceInfo) {
    // For xStocks: usdPrice is price per UI token unit
    if (priceInfo.usdPrice != null) {
      pricePerUiUnit = priceInfo.usdPrice;
      priceSource = priceInfo.source;
    } else if (priceInfo.tokenPrice != null) {
      // PreStocks: tokenPrice is price per UI token unit
      pricePerUiUnit = priceInfo.tokenPrice;
      priceSource = priceInfo.source;
    }
  }

  if (pricePerUiUnit != null && dc.uiSupplyDelta != null) {
    const dollarDelta = Math.abs(dc.uiSupplyDelta * pricePerUiUnit);
    estimatedDollarDelta = dollarDelta;
    console.log(
      `    price/ui = $${pricePerUiUnit.toFixed(4)} → estimated supply-level dollar delta = $${dollarDelta.toFixed(2)}`
    );
  } else {
    console.log(`    Price: ${priceInfo ? JSON.stringify(priceInfo).slice(0, 80) : "UNAVAILABLE"}`);
  }

  enriched.push({
    ...dc,
    pricePerUiUnit,
    priceSource,
    priceInfo,
    estimatedDollarDelta,
    evidenceLabel:
      estimatedDollarDelta !== "UNKNOWN" ? "MEASURED" : "MEASURED_NO_PRICE",
    enrichedAt: new Date().toISOString(),
  });

  await new Promise((r) => setTimeout(r, 300));
}

const enrichedPath = join(runDir, "divergence_cases_enriched.json");
writeFileSync(enrichedPath, JSON.stringify(enriched, null, 2));

console.log(`\nEnriched results: ${enrichedPath}`);

// Print proof statement for each enriched case
console.log("\n═══════════════════════════════════════════════════════════");
console.log("  PROOF STATEMENTS");
console.log("═══════════════════════════════════════════════════════════\n");

for (const dc of enriched) {
  console.log(`── ${dc.instrument} (${dc.category}) ──────────────────────`);
  console.log(`mint            : ${dc.mint}`);
  console.log(`raw supply      : ${dc.rawSupply}`);
  console.log(`stale mult.     : ${dc.staleMultiplier}  ← what naive current-state reader sees`);
  console.log(`correct mult.   : ${dc.correctMultiplier}  ← what time-aware reconstruction computes`);
  console.log(`effective since : ${dc.effectiveIso} (${dc.daysSinceEffective} days ago)`);
  console.log(`relative error  : ${dc.relativeErrorPct}`);
  console.log(`ui supply (correct) : ${dc.correctUiSupply?.toFixed(6)} tokens`);
  console.log(`ui supply (stale)   : ${dc.staleUiSupply?.toFixed(6)} tokens`);
  console.log(`ui delta            : ${dc.uiSupplyDelta?.toFixed(6)} tokens`);
  if (typeof dc.estimatedDollarDelta === "number") {
    console.log(`DOLLAR DELTA (supply-level) : $${dc.estimatedDollarDelta.toFixed(2)}`);
    console.log(`price source    : ${dc.priceSource}`);
  } else {
    console.log(`dollar delta    : ${dc.estimatedDollarDelta}`);
  }
  console.log(`evidence label  : ${dc.evidenceLabel}`);
  console.log("");
}
