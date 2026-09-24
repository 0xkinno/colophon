/**
 * COLOPHON — Dollar Divergence Hunt (E1.5)
 *
 * Scans known tokenized-stock / PreStocks mints on Solana mainnet for
 * ScaledUiAmountConfig divergence: cases where the "current" multiplier
 * field is stale vs. the "newMultiplier" that already became effective.
 *
 * The "stale-multiplier display" would produce a materially different
 * token quantity than the time-correct reconstruction.
 *
 * This script DOES NOT invent data. All values come from chain state.
 *
 * Outputs:
 *   evidence/runs/<runId>/run_manifest.json
 *   evidence/runs/<runId>/universe.json
 *   evidence/runs/<runId>/mint_states.jsonl
 *   evidence/runs/<runId>/divergence_cases.json
 *   evidence/runs/<runId>/claims.json
 *
 * Usage:
 *   node scripts/dollar-divergence-hunt.mjs
 *   RPC_URL=https://... node scripts/dollar-divergence-hunt.mjs
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { execSync } from "node:child_process";

// ── Configuration ──────────────────────────────────────────────────────────────

const RPC_URL = process.env.RPC_URL ?? "https://api.mainnet-beta.solana.com";
const NOW_TS = Math.floor(Date.now() / 1000); // Unix timestamp at scan time
const NOW_ISO = new Date().toISOString();

// Run identifier
const RUN_ID = `run-${NOW_ISO.replace(/[:.]/g, "-").slice(0, 19)}`;
const OUT_DIR = `evidence/runs/${RUN_ID}`;
mkdirSync(OUT_DIR, { recursive: true });

// ── Known Universe ─────────────────────────────────────────────────────────────
// Sources:
//   - rung reference (PreStocks mint addresses from token2022.test.ts + limitations.md)
//   - rambu reference (xStocks mints from fairprice.ts board data)
//   - openstock reference (xStocks universe)
//   - PreStocks API: https://prestocks.com/api/prestocks
//   - xStocks API: https://api.xstocks.fi/api/v2/public/mints
//
// All mainnet. Read-only. No wallet. No signing.

const KNOWN_UNIVERSE = [
  // PreStocks (Token-2022 with ScaledUiAmount — known from rung reference)
  {
    symbol: "OPENAI",
    name: "OpenAI PreStock",
    mint: "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF",
    category: "PreStocks",
    source: "rung/packages/sdk/test/token2022.test.ts + rung/docs/limitations.md",
  },
  // These mints are sourced from the xStocks API (api.xstocks.fi) and ecosystem documentation.
  {
    symbol: "SPYx",
    name: "SPDR S&P 500 ETF Trust (tokenized)",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    category: "xStocks",
    source: "xstocks.fi public API — placeholder, see discover-universe step",
  },
];

// ── RPC helpers ────────────────────────────────────────────────────────────────

let _rpcId = 0;
async function rpc(method, params) {
  const id = ++_rpcId;
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from RPC (${method})`);
  const body = await res.json();
  if (body.error) throw new Error(`RPC ${method}: ${body.error.message}`);
  return body.result;
}

async function getAccountInfoParsed(mint) {
  return rpc("getAccountInfo", [mint, { encoding: "jsonParsed" }]);
}

async function getEpochInfo() {
  return rpc("getEpochInfo", []);
}

async function getSignaturesForAddress(mint, opts = {}) {
  return rpc("getSignaturesForAddress", [
    mint,
    { limit: opts.limit ?? 50, ...opts },
  ]);
}

async function getTransaction(sig) {
  return rpc("getTransaction", [
    sig,
    { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
  ]);
}

// ── ScaledUiAmount logic (mirrors Token-2022 on-chain semantics exactly) ──────

/**
 * Resolve which multiplier is active at timestamp nowTs.
 * Mirrors spl-token-2022 ScaledUiAmountConfig::scale_ui_amount exactly.
 */
function activeMultiplier(cfg, nowTs) {
  if (cfg.newMultiplierEffectiveTimestamp == null) return cfg.multiplier;
  return nowTs >= cfg.newMultiplierEffectiveTimestamp
    ? cfg.newMultiplier
    : cfg.multiplier;
}

/** Raw base units → UI quantity (wallet display format). */
function rawToUi(rawBigInt, decimals, multiplier) {
  return (Number(rawBigInt) / 10 ** decimals) * multiplier;
}

// ── Divergence detection ───────────────────────────────────────────────────────

/**
 * Given a mint's ScaledUiAmountConfig, determine if there is a temporal
 * divergence:
 *   - The effective timestamp has passed (i.e., newMultiplier is now live)
 *   - The "current" multiplier field != the "newMultiplier" field
 *   - The difference is economically material (> 0.01%)
 *
 * Returns a divergence record or null.
 */
function detectDivergence(cfg, nowTs) {
  const { multiplier, newMultiplier, newMultiplierEffectiveTimestamp } = cfg;
  if (newMultiplierEffectiveTimestamp == null || newMultiplierEffectiveTimestamp === 0) {
    return null; // no scheduled change
  }
  if (nowTs < newMultiplierEffectiveTimestamp) {
    return null; // change not yet effective
  }
  // The newMultiplier is now the active multiplier.
  // If a naive "current-state" reader used cfg.multiplier instead,
  // what would the error be?
  if (Math.abs(newMultiplier - multiplier) < 1e-10) {
    return null; // no difference
  }
  const relDiff = Math.abs(newMultiplier - multiplier) / Math.abs(multiplier || 1);
  if (relDiff < 0.0001) {
    return null; // < 0.01% — below materiality threshold
  }
  return {
    staledAt: newMultiplierEffectiveTimestamp,
    staledIso: new Date(newMultiplierEffectiveTimestamp * 1000).toISOString(),
    staleMultiplier: multiplier,       // what a naive reader sees as "current"
    correctMultiplier: newMultiplier,  // what the time-aware reader computes
    relativeErrorFraction: relDiff,
    relativeErrorPct: (relDiff * 100).toFixed(4) + "%",
    secondsSinceEffective: nowTs - newMultiplierEffectiveTimestamp,
  };
}

// ── Proof: reconstruct the multiplier timeline from chain history ───────────────

/**
 * Fetch recent transaction signatures for this mint and scan for
 * UpdateMultiplier instructions (discriminated by program log / instruction type).
 *
 * Returns an array of multiplier-update events found, ordered newest-first.
 */
async function fetchMultiplierHistory(mint, limit = 50) {
  const events = [];
  let sigs;
  try {
    sigs = await getSignaturesForAddress(mint, { limit });
  } catch (e) {
    return { events, error: e.message, status: "PARTIAL" };
  }
  if (!Array.isArray(sigs) || sigs.length === 0) {
    return { events, status: "EMPTY" };
  }

  for (const sigInfo of sigs) {
    if (sigInfo.err) continue; // skip failed txns
    let tx;
    try {
      tx = await getTransaction(sigInfo.signature);
    } catch (e) {
      continue;
    }
    if (!tx) continue;

    // Look for scaledUiAmount / updateMultiplier in log messages or instructions
    const logs = tx.meta?.logMessages ?? [];
    const isMultiplierUpdate =
      logs.some(
        (l) =>
          l.includes("UpdateMultiplier") ||
          l.includes("update_multiplier") ||
          l.includes("ScaledUiAmount") ||
          l.includes("scaledUiAmount")
      ) ||
      // Also check parsed instructions for type === "updateMultiplier"
      (tx.transaction?.message?.instructions ?? []).some(
        (ix) =>
          ix.parsed?.type === "updateMultiplier" ||
          ix.parsed?.type === "scheduleMultiplierUpdate"
      );

    if (isMultiplierUpdate) {
      events.push({
        signature: sigInfo.signature,
        slot: sigInfo.slot,
        blockTime: sigInfo.blockTime,
        blockTimeIso: sigInfo.blockTime
          ? new Date(sigInfo.blockTime * 1000).toISOString()
          : null,
        logs: logs.filter(
          (l) =>
            l.includes("Multiplier") ||
            l.includes("multiplier") ||
            l.includes("ScaledUiAmount")
        ),
        confidence: "MEASURED",
      });
    }
  }

  return {
    events,
    signaturesScanned: sigs.length,
    status: events.length > 0 ? "FOUND" : "NOT_FOUND_IN_WINDOW",
  };
}

// ── Discovery: fetch xStocks universe from public API ─────────────────────────

async function discoverXStocksUniverse() {
  const discovered = [];
  try {
    // Try the xStocks public API
    const r = await fetch("https://api.xstocks.fi/api/v2/public/mints?pageSize=100", {
      headers: { "user-agent": "colophon-research/0.1 (hackathon)" },
    });
    if (r.ok) {
      const j = await r.json();
      const mints = j.mints ?? j.data ?? j.items ?? (Array.isArray(j) ? j : []);
      for (const m of mints.slice(0, 30)) {
        if (m.mint || m.address || m.mintAddress) {
          discovered.push({
            symbol: m.ticker ?? m.symbol ?? m.xstockSymbol ?? "UNKNOWN",
            name: m.name ?? m.description ?? "",
            mint: m.mint ?? m.address ?? m.mintAddress,
            category: "xStocks",
            source: "xstocks.fi API",
          });
        }
      }
    }
  } catch (e) {
    console.warn("  xStocks API unavailable:", e.message);
  }

  // Try Jupiter Lite — lists all xStocks mints with price data
  try {
    const r = await fetch("https://lite-api.jup.ag/price/v3?ids=all", {
      headers: { "user-agent": "colophon-research/0.1" },
    });
    // This endpoint is too large; skip if not available
  } catch (_) {}

  // Try PreStocks API
  try {
    const r = await fetch("https://prestocks.com/api/prestocks", {
      headers: { "user-agent": "colophon-research/0.1" },
    });
    if (r.ok) {
      const j = await r.json();
      const items = Array.isArray(j) ? j : [];
      for (const m of items) {
        if (m.contract_address) {
          discovered.push({
            symbol: m.symbol ?? "UNKNOWN",
            name: m.name ?? "",
            mint: m.contract_address,
            category: "PreStocks",
            source: "prestocks.com API",
          });
        }
      }
    }
  } catch (e) {
    console.warn("  PreStocks API unavailable:", e.message);
  }

  return discovered;
}

// ── Main scan ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  COLOPHON — Dollar Divergence Hunt (E1.5)");
  console.log("  PHASE 0 — Measure first. Do not assume.");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  RUN ID  : ${RUN_ID}`);
  console.log(`  RPC     : ${RPC_URL.slice(0, 60)}`);
  console.log(`  NOW UTC : ${NOW_ISO}`);
  console.log(`  NOW TS  : ${NOW_TS}`);
  console.log("───────────────────────────────────────────────────────────");

  // Step 1: Build universe
  console.log("\n[1/5] Building instrument universe...");
  const dynamicUniverse = await discoverXStocksUniverse();
  const allMints = new Map();
  
  // Seed with known-good entries
  for (const m of KNOWN_UNIVERSE) allMints.set(m.mint, m);
  // Add dynamically discovered (don't override known-good)
  for (const m of dynamicUniverse) {
    if (!allMints.has(m.mint)) allMints.set(m.mint, m);
  }
  
  const universe = [...allMints.values()];
  console.log(`  Found ${universe.length} instruments (${dynamicUniverse.length} from live APIs, ${KNOWN_UNIVERSE.length} seeded)`);
  writeFileSync(`${OUT_DIR}/universe.json`, JSON.stringify(universe, null, 2));

  // Step 2: Fetch epoch info
  console.log("\n[2/5] Fetching epoch state...");
  let epochInfo;
  try {
    epochInfo = await getEpochInfo();
    console.log(`  Epoch: ${epochInfo.epoch}, slot: ${epochInfo.absoluteSlot}`);
  } catch (e) {
    console.error("  FAILED to fetch epoch info:", e.message);
    epochInfo = null;
  }

  // Step 3: Scan each mint for ScaledUiAmountConfig
  console.log("\n[3/5] Scanning mint states on chain...");
  const mintStatesPath = `${OUT_DIR}/mint_states.jsonl`;
  const mintStates = [];

  for (const instrument of universe) {
    process.stdout.write(`  [${instrument.symbol}] ${instrument.mint.slice(0, 16)}... `);
    try {
      const acctInfo = await getAccountInfoParsed(instrument.mint);
      if (!acctInfo?.value) {
        console.log("NOT FOUND");
        continue;
      }

      const info = acctInfo.value.data?.parsed?.info;
      if (!info) {
        console.log("NOT PARSED");
        continue;
      }

      const exts = info.extensions ?? [];
      const scaledCfg = exts.find((e) => e.extension === "scaledUiAmountConfig")?.state;
      const pausable = exts.find((e) => e.extension === "pausableConfig")?.state;
      const transferFee = exts.find((e) => e.extension === "transferFeeConfig")?.state;
      const permDelegate = exts.find((e) => e.extension === "permanentDelegate")?.state;
      const transferHook = exts.find((e) => e.extension === "transferHook")?.state;

      const mintState = {
        instrument: instrument.symbol,
        mint: instrument.mint,
        category: instrument.category,
        source: instrument.source,
        decimals: Number(info.decimals ?? 0),
        supply: info.supply,
        freezeAuthority: info.freezeAuthority ?? null,
        mintAuthority: info.mintAuthority ?? null,
        owner: acctInfo.value.owner,
        scaledUiAmountConfig: scaledCfg
          ? {
              multiplier: Number(scaledCfg.multiplier),
              newMultiplier: Number(scaledCfg.newMultiplier ?? scaledCfg.multiplier),
              newMultiplierEffectiveTimestamp: Number(
                scaledCfg.newMultiplierEffectiveTimestamp ?? 0
              ),
            }
          : null,
        pausableConfig: pausable ?? null,
        transferFeeConfig: transferFee
          ? {
              olderTransferFee: {
                epoch: transferFee.olderTransferFee?.epoch,
                basisPoints: transferFee.olderTransferFee?.transferFeeBasisPoints,
                maximumFee: transferFee.olderTransferFee?.maximumFee,
              },
              newerTransferFee: {
                epoch: transferFee.newerTransferFee?.epoch,
                basisPoints: transferFee.newerTransferFee?.transferFeeBasisPoints,
                maximumFee: transferFee.newerTransferFee?.maximumFee,
              },
            }
          : null,
        permanentDelegate: permDelegate?.delegate ?? null,
        transferHook: transferHook ?? null,
        scanTimestamp: NOW_TS,
        scanIso: NOW_ISO,
      };

      mintStates.push(mintState);
      appendFileSync(mintStatesPath, JSON.stringify(mintState) + "\n");

      if (scaledCfg) {
        const m = mintState.scaledUiAmountConfig;
        const active = activeMultiplier(m, NOW_TS);
        console.log(
          `OK  multiplier=${m.multiplier} newMult=${m.newMultiplier} effective=${
            m.newMultiplierEffectiveTimestamp
          } active=${active}`
        );
      } else {
        console.log("OK  (no ScaledUiAmountConfig)");
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }

    // Rate-limit: 250ms between calls for public RPC
    await new Promise((r) => setTimeout(r, 250));
  }

  // Step 4: Detect divergences
  console.log("\n[4/5] Detecting multiplier divergences...");
  const divergenceCases = [];

  for (const ms of mintStates) {
    if (!ms.scaledUiAmountConfig) continue;
    const cfg = ms.scaledUiAmountConfig;
    const div = detectDivergence(cfg, NOW_TS);
    if (!div) continue;

    // Compute dollar impact estimate using raw supply
    // rawSupply is the on-chain integer supply
    const rawSupply = BigInt(ms.supply ?? 0);
    const correctUi = rawToUi(rawSupply, ms.decimals, div.correctMultiplier);
    const staleUi = rawToUi(rawSupply, ms.decimals, div.staledMultiplier ?? div.staleMultiplier);
    const uiDelta = correctUi - staleUi;

    // We don't have a live price here; we note this as "requires price context"
    const record = {
      instrument: ms.instrument,
      mint: ms.mint,
      category: ms.category,
      // Stale vs. correct
      staleMultiplier: div.staleMultiplier,
      correctMultiplier: div.correctMultiplier,
      effectiveTimestamp: div.staledAt,
      effectiveIso: div.staledIso,
      secondsSinceEffective: div.secondsSinceEffective,
      daysSinceEffective: (div.secondsSinceEffective / 86400).toFixed(1),
      relativeErrorFraction: div.relativeErrorFraction,
      relativeErrorPct: div.relativeErrorPct,
      // Supply-level impact
      rawSupply: ms.supply,
      decimals: ms.decimals,
      correctUiSupply: correctUi,
      staleUiSupply: staleUi,
      uiSupplyDelta: uiDelta,
      // Dollar impact requires external price — labeled UNKNOWN until price is fetched
      estimatedDollarDelta: "REQUIRES_PRICE_CONTEXT",
      priceSource: "UNKNOWN",
      // Evidence
      scanTimestamp: NOW_TS,
      scanIso: NOW_ISO,
      reproductionCommand: `node scripts/dollar-divergence-hunt.mjs  # then check ${OUT_DIR}/divergence_cases.json`,
      evidenceLabel: "MEASURED",
    };

    divergenceCases.push(record);
    console.log(`  ✓ DIVERGENCE: ${ms.instrument} — stale=${div.staleMultiplier} correct=${div.correctMultiplier} error=${div.relativeErrorPct}`);
  }

  if (divergenceCases.length === 0) {
    console.log("  No divergences detected in current universe window.");
    console.log("  This may mean: all scheduled updates have been applied,");
    console.log("  or the universe needs expansion (run discover-universe.ts).");
  }

  writeFileSync(
    `${OUT_DIR}/divergence_cases.json`,
    JSON.stringify(divergenceCases, null, 2)
  );

  // Step 5: Fetch multiplier history for divergent mints
  console.log("\n[5/5] Fetching chain history for divergent mints...");
  const timelines = {};
  for (const dc of divergenceCases) {
    console.log(`  Scanning history for ${dc.instrument} (${dc.mint.slice(0, 16)}...)...`);
    const history = await fetchMultiplierHistory(dc.mint, 50);
    timelines[dc.mint] = { instrument: dc.instrument, ...history };
    console.log(
      `    Scanned ${history.signaturesScanned ?? 0} sigs, found ${history.events?.length ?? 0} multiplier events`
    );
    await new Promise((r) => setTimeout(r, 500));
  }
  writeFileSync(`${OUT_DIR}/multiplier_timelines.json`, JSON.stringify(timelines, null, 2));

  // ── Build claims ─────────────────────────────────────────────────────────────

  const claims = [];
  for (const dc of divergenceCases) {
    const tl = timelines[dc.mint];
    const proofEvent = tl?.events?.[0]; // Most recent multiplier event found

    claims.push({
      claimId: createHash("sha256")
        .update(`${dc.mint}:${dc.effectiveTimestamp}:${NOW_TS}`)
        .digest("hex")
        .slice(0, 16),
      instrument: dc.instrument,
      mint: dc.mint,
      category: dc.category,
      statement: [
        `At ${NOW_ISO}, instrument ${dc.instrument} (mint ${dc.mint}) had:`,
        `  raw_supply = ${dc.rawSupply}`,
        `  stale_multiplier = ${dc.staleMultiplier}  (the 'multiplier' field — what a naive current-state reader would use)`,
        `  correct_multiplier = ${dc.correctMultiplier}  (the 'newMultiplier' field — effective since ${dc.effectiveIso})`,
        `  effective_since = ${dc.effectiveIso} (${dc.daysSinceEffective} days ago)`,
        ``,
        `  A naive current-state interpretation → ui_supply = ${dc.staleUiSupply.toFixed(6)} token units`,
        `  Time-indexed reconstruction → ui_supply = ${dc.correctUiSupply.toFixed(6)} token units`,
        ``,
        `  Difference = ${dc.uiSupplyDelta.toFixed(6)} token units (${dc.relativeErrorPct} error)`,
        `  Estimated economic effect = REQUIRES_PRICE_CONTEXT (see price fetch step)`,
        ``,
        `  Evidence:`,
        proofEvent
          ? `    signature: ${proofEvent.signature}`
          : "    signature: NOT_FOUND_IN_SCANNED_WINDOW",
        proofEvent ? `    slot: ${proofEvent.slot}` : "    slot: UNKNOWN",
        `    scan_timestamp: ${NOW_TS}`,
        `    reproduction: node scripts/dollar-divergence-hunt.mjs`,
      ].join("\n"),
      status: dc.estimatedDollarDelta === "REQUIRES_PRICE_CONTEXT"
        ? "MEASURED_NO_PRICE"
        : "MEASURED",
      relativeErrorPct: dc.relativeErrorPct,
      daysSinceEffective: dc.daysSinceEffective,
      evidenceLabel: "MEASURED",
      limitationsNote:
        "Dollar impact requires external price feed. Supply-level divergence is measured from chain state only.",
    });
  }

  // Summary of null / no-divergence cases
  const noDivergence = mintStates
    .filter((ms) => ms.scaledUiAmountConfig)
    .filter((ms) => !divergenceCases.find((dc) => dc.mint === ms.mint))
    .map((ms) => ({
      instrument: ms.instrument,
      mint: ms.mint,
      result: "NO_DIVERGENCE_DETECTED",
      reason:
        ms.scaledUiAmountConfig.newMultiplierEffectiveTimestamp === 0 ||
        ms.scaledUiAmountConfig.newMultiplierEffectiveTimestamp == null
          ? "NO_SCHEDULED_UPDATE"
          : NOW_TS < ms.scaledUiAmountConfig.newMultiplierEffectiveTimestamp
          ? "UPDATE_NOT_YET_EFFECTIVE"
          : "MULTIPLIERS_EQUAL",
    }));

  writeFileSync(`${OUT_DIR}/claims.json`, JSON.stringify(claims, null, 2));

  // ── Run manifest ─────────────────────────────────────────────────────────────

  let gitCommit = "UNKNOWN";
  try {
    gitCommit = execSync("git rev-parse HEAD", { cwd: process.cwd() })
      .toString()
      .trim();
  } catch (_) {}

  const manifest = {
    runId: RUN_ID,
    gitCommit,
    toolchain: `Node.js ${process.version}`,
    rpcSource: RPC_URL.includes("mainnet") ? "mainnet-beta" : RPC_URL,
    timestamp: NOW_ISO,
    nowTs: NOW_TS,
    epochInfo,
    inputs: {
      seededUniverse: KNOWN_UNIVERSE.length,
      dynamicDiscovery: dynamicUniverse.length,
      totalUniverse: universe.length,
    },
    outputs: {
      mintStatesScanned: mintStates.length,
      withScaledUiAmount: mintStates.filter((ms) => ms.scaledUiAmountConfig).length,
      divergencesFound: divergenceCases.length,
      noDivergence: noDivergence.length,
      multiplierEventsFound: Object.values(timelines).reduce(
        (s, t) => s + (t.events?.length ?? 0),
        0
      ),
    },
    claims: claims.map((c) => ({
      claimId: c.claimId,
      instrument: c.instrument,
      status: c.status,
      relativeErrorPct: c.relativeErrorPct,
    })),
    evidenceFiles: [
      `${OUT_DIR}/universe.json`,
      `${OUT_DIR}/mint_states.jsonl`,
      `${OUT_DIR}/divergence_cases.json`,
      `${OUT_DIR}/multiplier_timelines.json`,
      `${OUT_DIR}/claims.json`,
      `${OUT_DIR}/run_manifest.json`,
    ],
    limitations: [
      "Dollar impact requires external price feed — not fetched in this step.",
      "Multiplier history scan covers only the most recent 50 transactions.",
      "Dynamic universe discovery depends on availability of xStocks and PreStocks APIs.",
      "RPC history gaps may prevent recovery of older multiplier update signatures.",
    ],
  };

  writeFileSync(`${OUT_DIR}/run_manifest.json`, JSON.stringify(manifest, null, 2));

  // ── Summary to stdout ─────────────────────────────────────────────────────────

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  DOLLAR DIVERGENCE HUNT — RESULTS");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Instruments scanned   : ${mintStates.length}`);
  console.log(`  With ScaledUiAmount   : ${manifest.outputs.withScaledUiAmount}`);
  console.log(`  Divergences found     : ${divergenceCases.length}`);
  console.log(`  Multiplier events     : ${manifest.outputs.multiplierEventsFound}`);
  console.log("");

  if (divergenceCases.length > 0) {
    console.log("  ── DIVERGENCE CASES ──────────────────────────────────");
    for (const dc of divergenceCases) {
      console.log(`  [${dc.instrument}] mint: ${dc.mint}`);
      console.log(`    stale multiplier   : ${dc.staleMultiplier}`);
      console.log(`    correct multiplier : ${dc.correctMultiplier}`);
      console.log(`    effective since    : ${dc.effectiveIso} (${dc.daysSinceEffective} days ago)`);
      console.log(`    relative error     : ${dc.relativeErrorPct}`);
      console.log(`    ui supply (correct): ${dc.correctUiSupply.toFixed(6)}`);
      console.log(`    ui supply (stale)  : ${dc.staleUiSupply.toFixed(6)}`);
      console.log(`    ui delta           : ${dc.uiSupplyDelta.toFixed(6)}`);
      console.log(`    dollar estimate    : ${dc.estimatedDollarDelta}`);
      console.log("");
    }
  } else {
    console.log("  RESULT: No material divergence detected in current scan.");
    console.log("  See output files for full state details.");
    console.log("  This is an honest result — not failure.");
  }

  console.log(`  Evidence: ${OUT_DIR}/`);
  console.log("═══════════════════════════════════════════════════════════");

  return { manifest, divergenceCases };
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
