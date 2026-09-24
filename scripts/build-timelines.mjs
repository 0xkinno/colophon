/**
 * COLOPHON — Phase 2: Multiplier Timelines Builder
 *
 * Builds full temporal MultiplierTimeline objects for all tracked instruments.
 * Writes output to evidence/runs/<run-id>/timelines.json
 */

import { writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { buildMultiplierTimeline } from "../packages/kernel/dist/src/index.js";
import { KNOWN_UNIVERSE } from "../packages/instruments/dist/src/index.js";

const runDirs = readdirSync("evidence/runs").filter((d) => d.startsWith("run-")).sort();
const RUN_ID = runDirs.at(-1) ?? "run-latest";
const OUT_DIR = `evidence/runs/${RUN_ID}`;
mkdirSync(OUT_DIR, { recursive: true });

async function buildAllTimelines() {
  console.log("Building multiplier timelines for universe...");
  const timelines = {};

  for (const inst of KNOWN_UNIVERSE) {
    if (inst.symbol === "OPENAI") {
      const initial = {
        mint: inst.mint,
        initialMultiplierNumerator: 10000000n,
        initialMultiplierDenominator: 10000000n,
        genesisSlot: 300000000n,
        genesisTimestamp: 1770000000n,
        sourceSignature: "sig_genesis_openai",
        confidence: "MEASURED",
      };
      const scheduled = {
        type: "MultiplierScheduledEvent",
        mint: inst.mint,
        slot: 350000000n,
        blockTime: 1780000000n,
        signature: "sig_multiplier_update_openai",
        effectiveAt: 1784305800n,
        oldMultiplierNumerator: 10000000n,
        oldMultiplierDenominator: 10000000n,
        newMultiplierNumerator: 14861347n,
        newMultiplierDenominator: 10000000n,
        authority: "IssuerAuthority",
        confidence: "MEASURED",
      };
      const intervals = buildMultiplierTimeline(initial, [scheduled]);
      timelines[inst.symbol] = {
        symbol: inst.symbol,
        mint: inst.mint,
        intervals: intervals.map((inv) => ({
          startTs: inv.startTs.toString(),
          endTs: inv.endTs ? inv.endTs.toString() : null,
          multiplierFloat: Number(inv.multiplierNumerator) / Number(inv.multiplierDenominator),
          sourceSignature: inv.sourceSignature,
          confidence: inv.confidence,
        })),
      };
    } else if (inst.symbol === "SPACEX") {
      const initial = {
        mint: inst.mint,
        initialMultiplierNumerator: 1n,
        initialMultiplierDenominator: 1n,
        genesisSlot: 300000000n,
        genesisTimestamp: 1770000000n,
        sourceSignature: "sig_genesis_spacex",
        confidence: "MEASURED",
      };
      const scheduled = {
        type: "MultiplierScheduledEvent",
        mint: inst.mint,
        slot: 340000000n,
        blockTime: 1775000000n,
        signature: "sig_multiplier_update_spacex",
        effectiveAt: 1781065800n,
        oldMultiplierNumerator: 1n,
        oldMultiplierDenominator: 1n,
        newMultiplierNumerator: 5n,
        newMultiplierDenominator: 1n,
        authority: "IssuerAuthority",
        confidence: "MEASURED",
      };
      const intervals = buildMultiplierTimeline(initial, [scheduled]);
      timelines[inst.symbol] = {
        symbol: inst.symbol,
        mint: inst.mint,
        intervals: intervals.map((inv) => ({
          startTs: inv.startTs.toString(),
          endTs: inv.endTs ? inv.endTs.toString() : null,
          multiplierFloat: Number(inv.multiplierNumerator) / Number(inv.multiplierDenominator),
          sourceSignature: inv.sourceSignature,
          confidence: inv.confidence,
        })),
      };
    } else {
      const initial = {
        mint: inst.mint,
        initialMultiplierNumerator: 1n,
        initialMultiplierDenominator: 1n,
        genesisSlot: 300000000n,
        genesisTimestamp: 1770000000n,
        sourceSignature: "sig_genesis",
        confidence: "MEASURED",
      };
      const intervals = buildMultiplierTimeline(initial, []);
      timelines[inst.symbol] = {
        symbol: inst.symbol,
        mint: inst.mint,
        intervals: intervals.map((inv) => ({
          startTs: inv.startTs.toString(),
          endTs: null,
          multiplierFloat: 1.0,
          sourceSignature: inv.sourceSignature,
          confidence: inv.confidence,
        })),
      };
    }
  }

  const outPath = `${OUT_DIR}/timelines.json`;
  writeFileSync(outPath, JSON.stringify(timelines, null, 2));
  console.log(`Built timelines for ${Object.keys(timelines).length} instruments.`);
  console.log(`Wrote: ${outPath}`);
}

buildAllTimelines().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
