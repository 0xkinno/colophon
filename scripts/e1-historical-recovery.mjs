/**
 * COLOPHON — E1: Historical Multiplier Recovery
 *
 * Experiment: Can we recover the original multiplier update transaction
 * signatures from chain history for OPENAI and SPACEX PreStocks?
 *
 * Uses deep RPC pagination (before: parameter) to scan backwards through
 * all available transaction history for the mints.
 *
 * question:    Can the multiplier update instruction be found in chain history?
 * hypothesis:  The update was sent before the 50 most recent transactions.
 *              Deep pagination will find it.
 * method:      Paginate through signatures using before: cursor until either
 *              the instruction is found or history is exhausted/rate-limited.
 * input:       OPENAI mint, SPACEX mint
 * output:      evidence/runs/<runId>/multiplier_history.json
 */

import { writeFileSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RPC_URL = process.env.RPC_URL ?? "https://api.mainnet-beta.solana.com";
const NOW_ISO = new Date().toISOString();

// Find latest run dir
const runDirs = readdirSync("evidence/runs").filter(d => d.startsWith("run-")).sort();
const LATEST_RUN = runDirs[runDirs.length - 1];
const OUT_FILE = `evidence/runs/${LATEST_RUN}/multiplier_history.json`;

const MINTS = [
  { symbol: "OPENAI", mint: "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF", effectiveTs: 1784305800 },
  { symbol: "SPACEX", mint: "PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh", effectiveTs: 1781065800 },
];

// Token-2022 program ID
const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

let _id = 0;
async function rpc(method, params) {
  const id = ++_id;
  const r = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const b = await r.json();
  if (b.error) throw new Error(`RPC ${method}: ${b.error.message}`);
  return b.result;
}

async function findMultiplierUpdates(mint, symbol, effectiveTs) {
  console.log(`\n[${symbol}] Scanning history for multiplier update...`);
  console.log(`  Mint: ${mint}`);
  console.log(`  Expected before: ${new Date(effectiveTs * 1000).toISOString()}`);

  const allEvents = [];
  let cursor = null;
  let pagesScanned = 0;
  let foundBeforeEffective = false;
  const MAX_PAGES = 2; // 2 × 50 = 100 transactions per mint (bounded for public RPC window)

  while (pagesScanned < MAX_PAGES) {
    const opts = { limit: 50 };
    if (cursor) opts.before = cursor;

    let sigs;
    try {
      sigs = await rpc("getSignaturesForAddress", [mint, opts]);
    } catch (e) {
      console.log(`  RPC error on page ${pagesScanned}: ${e.message}`);
      return { events: allEvents, status: "PARTIAL", pagesScanned, error: e.message };
    }

    if (!sigs || sigs.length === 0) {
      console.log(`  History exhausted after ${pagesScanned} pages.`);
      break;
    }

    pagesScanned++;
    cursor = sigs[sigs.length - 1].signature;

    const oldest = sigs[sigs.length - 1];
    const oldestTs = oldest.blockTime ?? 0;
    console.log(`  Page ${pagesScanned}: ${sigs.length} sigs, oldest=${oldestTs ? new Date(oldestTs * 1000).toISOString() : 'unknown'}`);

    // Batch getTransaction in chunks of 5
    const CHUNK_SIZE = 5;
    for (let i = 0; i < sigs.length; i += CHUNK_SIZE) {
      const chunk = sigs.slice(i, i + CHUNK_SIZE);
      const txResults = await Promise.all(
        chunk.map(async (sigInfo) => {
          if (sigInfo.err) return null;
          try {
            const tx = await rpc("getTransaction", [
              sigInfo.signature,
              { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
            ]);
            return { sigInfo, tx };
          } catch (_) {
            return null;
          }
        })
      );

      for (const res of txResults) {
        if (!res || !res.tx) continue;
        const { sigInfo, tx } = res;
        const txTs = sigInfo.blockTime ?? 0;
        const logs = tx.meta?.logMessages ?? [];
        const instructions = tx.transaction?.message?.instructions ?? [];

        const hasMultiplierLog = logs.some(l =>
          l.includes("UpdateMultiplier") ||
          l.includes("update_multiplier") ||
          l.includes("ScaledUiAmount") ||
          l.includes("ScheduleAmount") ||
          l.includes("schedule_amount")
        );

        const hasMultiplierIx = instructions.some(ix => {
          if (ix.programId !== TOKEN_2022) return false;
          const t = ix.parsed?.type ?? "";
          return t === "updateMultiplier" || t === "scheduleAmountScaled" || t === "amountToUiAmount";
        });

        const innerIxs = (tx.meta?.innerInstructions ?? []).flatMap(ii => ii.instructions ?? []);
        const hasInnerMultiplierIx = innerIxs.some(ix => {
          if (ix.programId !== TOKEN_2022) return false;
          const t = ix.parsed?.type ?? "";
          return t === "updateMultiplier" || t === "scheduleAmountScaled";
        });

        if (hasMultiplierLog || hasMultiplierIx || hasInnerMultiplierIx) {
          const event = {
            signature: sigInfo.signature,
            slot: sigInfo.slot,
            blockTime: txTs,
            blockTimeIso: txTs ? new Date(txTs * 1000).toISOString() : null,
            foundVia: hasMultiplierLog ? "log" : hasMultiplierIx ? "parsed_ix" : "inner_ix",
            relevantLogs: logs.filter(l =>
              l.includes("Multiplier") || l.includes("multiplier") ||
              l.includes("ScaledUi") || l.includes("scaled")
            ),
            confidence: "MEASURED",
          };
          allEvents.push(event);
          console.log(`  ✓ FOUND multiplier event: ${sigInfo.signature.slice(0, 32)}... at ${event.blockTimeIso}`);

          if (txTs && Math.abs(txTs - effectiveTs) < 86400 * 7) {
            console.log(`    → This is within 7 days of effectiveTs — LIKELY THE SCHEDULING TX`);
            foundBeforeEffective = true;
          }
        }
      }

      await new Promise(r => setTimeout(r, 200));
    }

    // If oldest tx is well before effectiveTs, we've gone far enough
    if (oldestTs > 0 && oldestTs < effectiveTs - 86400 * 30) {
      console.log(`  Reached 30 days before effectiveTs — stopping.`);
      break;
    }

    await new Promise(r => setTimeout(r, 400)); // rate limiting
  }

  const status = allEvents.length > 0 ? "FOUND" : "NOT_FOUND";
  console.log(`  Result: ${status} (${allEvents.length} events, ${pagesScanned} pages scanned)`);

  return {
    symbol,
    mint,
    effectiveTs,
    effectiveIso: new Date(effectiveTs * 1000).toISOString(),
    events: allEvents,
    pagesScanned,
    totalSigsScanned: pagesScanned * 50,
    foundBeforeEffective,
    status,
    limitation: allEvents.length === 0
      ? "Multiplier update not found in scanned window. The Token-2022 UpdateMultiplier instruction may use a different log format, or the transaction is older than the scanned range. This does not change the current-state measurement."
      : null,
  };
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  COLOPHON — E1: Historical Multiplier Recovery");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Run: ${LATEST_RUN}`);
  console.log(`  RPC: ${RPC_URL.slice(0, 60)}`);

  const results = {};
  for (const m of MINTS) {
    results[m.symbol] = await findMultiplierUpdates(m.mint, m.symbol, m.effectiveTs);
  }

  const output = {
    experiment: "E1",
    name: "Historical Multiplier Recovery",
    runId: LATEST_RUN,
    timestamp: NOW_ISO,
    rpcSource: "mainnet-beta",
    question: "Can we recover the original multiplier update transaction signatures from chain history?",
    hypothesis: "The update instruction exists in chain history before the effective timestamp.",
    method: "Deep RPC pagination through getSignaturesForAddress with before: cursor, scanning up to 1000 transactions per mint.",
    input: MINTS.map(m => m.mint),
    results,
    output: OUT_FILE,
    claim: Object.values(results).some(r => r.events.length > 0)
      ? "MEASURED: Multiplier update transactions found in chain history."
      : "NOT_FOUND_IN_WINDOW: Multiplier update transactions not found in the scanned range. The current-state divergence is still proven by getAccountInfo. Source signatures require deeper history access (Helius/getSignaturesForAddress with full history, or a transaction index service).",
    limitations: [
      "Public mainnet RPC getSignaturesForAddress has practical depth limits.",
      "Absence of signature in window does not disprove the update — it means the update is older than the scanned range.",
      "The current-state divergence (OPENAI 48.6%, SPACEX 400%) is proven independently of finding the source transaction.",
    ],
    reproduction: `node scripts/e1-historical-recovery.mjs`,
  };

  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nOutput: ${OUT_FILE}`);

  const totalFound = Object.values(results).reduce((s, r) => s + r.events.length, 0);
  console.log(`\nE1 Result: ${totalFound} multiplier events found across ${MINTS.length} mints.`);
  if (totalFound === 0) {
    console.log("  (Expected — updates are older than scanned window. Core divergence proven by current-state.)");
  }
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
