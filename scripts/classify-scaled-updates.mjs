/**
 * COLOPHON — Phase 2: Multiplier Updates Classifier
 *
 * Evaluates ScaledUiAmountConfig states and classifies them into:
 *   - ACTIVE_DIVERGENT (newMultiplier is active but on-chain multiplier field is stale)
 *   - ACTIVE_SYNCHRONIZED (newMultiplier is active and multipliers match)
 *   - SCHEDULED_FUTURE (update scheduled for future timestamp)
 *   - STATIC (no scheduled update)
 */

import { writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { SolanaReadOnlyClient, parseMintAccountInfo } from "../packages/chain/dist/src/index.js";
import { KNOWN_UNIVERSE } from "../packages/instruments/dist/src/index.js";

const RPC_URL = process.env.RPC_URL ?? "https://api.mainnet-beta.solana.com";
const NOW_TS = Math.floor(Date.now() / 1000);
const runDirs = readdirSync("evidence/runs").filter((d) => d.startsWith("run-")).sort();
const RUN_ID = runDirs.at(-1) ?? "run-latest";
const OUT_DIR = `evidence/runs/${RUN_ID}`;
mkdirSync(OUT_DIR, { recursive: true });

async function classify() {
  console.log("Classifying multiplier states on-chain...");
  const client = new SolanaReadOnlyClient({ endpoint: RPC_URL });
  const classifications = [];

  for (const inst of KNOWN_UNIVERSE.slice(0, 6)) {
    try {
      const acct = await client.getAccountInfoParsed(inst.mint);
      const parsed = parseMintAccountInfo(inst.mint, acct);
      if (!parsed || !parsed.scaledUiAmountConfig) {
        classifications.push({
          symbol: inst.symbol,
          mint: inst.mint,
          classification: "STATIC",
          reason: "No ScaledUiAmountConfig extension present",
        });
        continue;
      }

      const cfg = parsed.scaledUiAmountConfig;
      let classification = "STATIC";
      let details = "";

      if (cfg.newMultiplierEffectiveTimestamp === 0) {
        classification = "STATIC";
        details = "No future multiplier update scheduled";
      } else if (NOW_TS < cfg.newMultiplierEffectiveTimestamp) {
        classification = "SCHEDULED_FUTURE";
        details = `New multiplier ${cfg.newMultiplier} becomes effective at ${new Date(
          cfg.newMultiplierEffectiveTimestamp * 1000
        ).toISOString()}`;
      } else if (Math.abs(cfg.newMultiplier - cfg.multiplier) > 1e-10) {
        classification = "ACTIVE_DIVERGENT";
        const relErr = (Math.abs(cfg.newMultiplier - cfg.multiplier) / (cfg.multiplier || 1)) * 100;
        details = `Effective since ${new Date(
          cfg.newMultiplierEffectiveTimestamp * 1000
        ).toISOString()} (${relErr.toFixed(2)}% divergence)`;
      } else {
        classification = "ACTIVE_SYNCHRONIZED";
        details = "Multiplier and newMultiplier are equal";
      }

      classifications.push({
        symbol: inst.symbol,
        mint: inst.mint,
        category: inst.category,
        staleMultiplier: cfg.multiplier,
        newMultiplier: cfg.newMultiplier,
        effectiveTimestamp: cfg.newMultiplierEffectiveTimestamp,
        classification,
        details,
        scanTimestamp: NOW_TS,
      });

      console.log(`  [${inst.symbol}] ${classification}: ${details}`);
    } catch (err) {
      classifications.push({
        symbol: inst.symbol,
        mint: inst.mint,
        classification: "UNKNOWN",
        error: err.message,
      });
    }
  }

  const outPath = `${OUT_DIR}/classified_updates.json`;
  writeFileSync(outPath, JSON.stringify(classifications, null, 2));
  console.log(`Wrote: ${outPath}`);
}

classify().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
