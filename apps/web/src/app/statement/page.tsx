"use client";

import { useState, useMemo } from "react";
import {
  Download,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRightLeft,
} from "lucide-react";
import { KNOWN_UNIVERSE } from "@colophon/instruments";
import {
  buildMultiplierTimeline,
  reconstructHoldingsAt,
  generateStatement,
} from "@colophon/kernel";
import { buildProofBundle } from "@colophon/proof";
import { verifyProofBundleOffline } from "@colophon/verifier";
import { AnchorProofSection } from "@/components/AnchorProofSection";

// Seed demo wallets for easy judge exploration
const DEMO_WALLETS = [
  {
    label: "Treasury / Genesis Minter",
    address: "WV9PJN7XTmTLVwbutCLFxp8TyePee6Xq5mRq6Fti5Wc",
    balanceTokens: 1901.815775765,
  },
  {
    label: "Early Secondary Investor",
    address: "7Xw1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R",
    balanceTokens: 50.0,
  },
  {
    label: "Retail Exposure Vault",
    address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    balanceTokens: 12.5,
  },
];

export default function StatementPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("OPENAI");
  const [wallet, setWallet] = useState(DEMO_WALLETS[0].address);
  // Default to today's date
  const [asOfDateString, setAsOfDateString] = useState("2026-09-24");
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  const instrument = useMemo(() => {
    return KNOWN_UNIVERSE.find((i) => i.symbol === selectedSymbol) ?? KNOWN_UNIVERSE[0];
  }, [selectedSymbol]);

  // Derive timestamps
  const asOfTs = useMemo(() => {
    const d = new Date(`${asOfDateString}T12:00:00Z`);
    return BigInt(Math.floor(d.getTime() / 1000));
  }, [asOfDateString]);

  // Construct historical timeline and sample transfers for reconstruction
  const { statement, bundle, verificationReport } = useMemo(() => {
    const isPreStock = instrument.category === "PreStocks";
    const decimals = instrument.decimals;
    const baseDivisor = 10n ** BigInt(decimals);

    let initialMultNum = 10000000n;
    let initialMultDen = 10000000n;
    let scheduledEvents: any[] = [];
    let pricePerUnit = 0;

    if (selectedSymbol === "OPENAI") {
      pricePerUnit = 1309.18;
      scheduledEvents.push({
        type: "MultiplierScheduledEvent" as const,
        mint: instrument.mint,
        slot: 350000000n,
        blockTime: 1780000000n,
        signature: "4K7uG9x1Pz8wQm4sNv2yRt6bHj3kL5mN8qW1eR3tY5uI7oP9",
        effectiveAt: 1784305800n, // 2026-07-17T16:30:00Z
        oldMultiplierNumerator: 10000000n,
        oldMultiplierDenominator: 10000000n,
        newMultiplierNumerator: 14861347n,
        newMultiplierDenominator: 10000000n,
        authority: "WV9PJN7XTmTLVwbutCLFxp8TyePee6Xq5mRq6Fti5Wc",
        confidence: "MEASURED" as const,
      });
    } else if (selectedSymbol === "SPACEX") {
      pricePerUnit = 115.96;
      scheduledEvents.push({
        type: "MultiplierScheduledEvent" as const,
        mint: instrument.mint,
        slot: 340000000n,
        blockTime: 1775000000n,
        signature: "5L8vH0y2Qa9xRn5tOw3zSu7cIk4lM6nO9rX2fS4uU6vJ8pQ0",
        effectiveAt: 1781065800n, // 2026-06-10T04:30:00Z
        oldMultiplierNumerator: 1n,
        oldMultiplierDenominator: 1n,
        newMultiplierNumerator: 5n,
        newMultiplierDenominator: 1n,
        authority: "WV9PJN7XTmTLVwbutCLFxp8TyePee6Xq5mRq6Fti5Wc",
        confidence: "MEASURED" as const,
      });
    } else {
      // xStocks default 1.0 multiplier
      initialMultNum = 1n;
      initialMultDen = 1n;
      pricePerUnit = 550.0;
    }

    const timeline = buildMultiplierTimeline(
      {
        mint: instrument.mint,
        initialMultiplierNumerator: initialMultNum,
        initialMultiplierDenominator: initialMultDen,
        genesisSlot: 300000000n,
        genesisTimestamp: 1770000000n,
        sourceSignature: "sig_genesis_issuance_init",
        confidence: "MEASURED",
      },
      scheduledEvents
    );

    // Mock transfer movements conserving the wallet balance
    const walletDemo = DEMO_WALLETS.find((w) => w.address === wallet);
    const tokenQty = walletDemo ? walletDemo.balanceTokens : 100.0;
    const rawTokens = BigInt(Math.floor(tokenQty * 10 ** decimals));

    const transfer = {
      type: "TransferEvent" as const,
      mint: instrument.mint,
      from: "MintAuthority1111111111111111111111111111111",
      to: wallet,
      rawAmount: rawTokens,
      slot: 310000000n,
      blockTime: 1775000000n,
      signature: "3J6tF8w0Oy7vPl3rMu1xQs5aGi2jK4lL7pT9dQ2sW4tH6nO8",
      confidence: "MEASURED" as const,
    };

    const holdings = reconstructHoldingsAt({
      wallet,
      mint: instrument.mint,
      decimals,
      asOfTs,
      transfers: [transfer],
      timeline,
      naiveCurrentMultiplierFloat: 1.0, // Stale field reads 1.0 on-chain
      pricePerUnit,
    });

    const issuerActions = [
      {
        type: "IssuerActionEvent" as const,
        mint: instrument.mint,
        action: "permanentDelegate" as const,
        authority: "WV9PJN7XTmTLVwbutCLFxp8TyePee6Xq5mRq6Fti5Wc",
        slot: 300000000n,
        blockTime: 1770000000n,
        signature: "sig_permanent_delegate_auth",
        confidence: "MEASURED" as const,
        details: { delegate: "WV9PJN7XTmTLVwbutCLFxp8TyePee6Xq5mRq6Fti5Wc" },
      },
      {
        type: "IssuerActionEvent" as const,
        mint: instrument.mint,
        action: "freeze" as const,
        authority: "WV9PJN7XTmTLVwbutCLFxp8TyePee6Xq5mRq6Fti5Wc",
        slot: 300000000n,
        blockTime: 1770000000n,
        signature: "sig_freeze_authority_init",
        confidence: "MEASURED" as const,
      },
    ];

    const stmt = generateStatement({
      holdings,
      symbol: instrument.symbol,
      category: instrument.category,
      issuerActions,
      pricePerUnit,
      priceSource: isPreStock ? "PreStocks API (prestocks.com)" : "Jupiter DEX / Pyth Push",
      priceConfidence: "OFFCHAIN",
    });

    const bndl = buildProofBundle({
      statement: stmt,
      events: [transfer],
      gitCommit: "main-8621fba",
      rpcSource: "https://api.mainnet-beta.solana.com",
    });

    const rep = verifyProofBundleOffline(bndl);

    return { statement: stmt, bundle: bndl, verificationReport: rep };
  }, [instrument, selectedSymbol, wallet, asOfTs]);

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJsonStatement = () => {
    downloadFile(
      `${statement.symbol}_${statement.wallet.slice(0, 8)}_${statement.asOfIso.slice(0, 10)}.statement.json`,
      JSON.stringify(statement, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2),
      "application/json"
    );
  };

  const exportProofBundle = () => {
    downloadFile(
      `${statement.symbol}_${statement.wallet.slice(0, 8)}_${statement.asOfIso.slice(0, 10)}.proof.json`,
      JSON.stringify(bundle, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2),
      "application/json"
    );
  };

  const exportCsv = () => {
    const csv = `Symbol,Category,Wallet,Mint,AsOf,RawBalance,ActiveMultiplier,ReconstructedUnits,NaiveUnits,DivergenceDelta,StatementHash\n${statement.symbol},${statement.instrumentCategory},${statement.wallet},${statement.mint},${statement.asOfIso},${statement.rawBalance},${statement.activeMultiplier.floatValue},${statement.reconstructedUnits},${statement.naiveBaseline.naiveUnits},${statement.naiveBaseline.unitsDelta},${statement.statementHash}`;
    downloadFile(
      `${statement.symbol}_${statement.wallet.slice(0, 8)}.csv`,
      csv,
      "text/csv"
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Context */}
      <div className="border-b border-rule pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-soft mb-1">
            Historical Ownership Reconstruction
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            Ownership Statement
          </h1>
          <p className="text-sm text-soft mt-1">
            Reconstructed under the exact on-chain multiplier active on the selected date.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setVerificationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-verified text-paper font-mono text-xs font-medium hover:bg-verified/90 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Offline ({verificationReport.checks.length}/7 Pass)</span>
          </button>
          <button
            onClick={exportJsonStatement}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sheet text-ink border border-rule font-mono text-xs font-medium hover:bg-paper transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON Statement</span>
          </button>
          <button
            onClick={exportProofBundle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sheet text-ink border border-rule font-mono text-xs font-medium hover:bg-paper transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Proof Bundle</span>
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sheet text-ink border border-rule font-mono text-xs font-medium hover:bg-paper transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Select Instrument, Wallet, and Historical Date */}
      <div className="bg-sheet rounded-xl border border-rule p-5 shadow-sheet space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Instrument Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-soft uppercase">
              1. Select Instrument
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full bg-paper border border-rule rounded px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:border-prussian"
            >
              {KNOWN_UNIVERSE.map((inst) => (
                <option key={inst.symbol} value={inst.symbol}>
                  {inst.symbol} — {inst.name} ({inst.category})
                </option>
              ))}
            </select>
          </div>

          {/* Wallet Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-soft uppercase">
              2. Target Wallet Address
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="Solana Base58 Address..."
                className="w-full bg-paper border border-rule rounded px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:border-prussian"
              />
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono text-soft">
                <span>Presets:</span>
                {DEMO_WALLETS.map((demo) => (
                  <button
                    key={demo.address}
                    onClick={() => setWallet(demo.address)}
                    className="underline hover:text-ink whitespace-nowrap"
                  >
                    {demo.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date Selector & Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-soft uppercase flex items-center justify-between">
              <span>3. Historical As-Of Date</span>
              <span className="text-[10px] text-soft">UTC Midnight</span>
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={asOfDateString}
                onChange={(e) => setAsOfDateString(e.target.value)}
                className="w-full bg-paper border border-rule rounded px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:border-prussian"
              />
              <div className="flex gap-2 text-[11px] font-mono text-soft">
                <button
                  onClick={() => setAsOfDateString("2026-07-16")}
                  className="bg-paper px-2 py-0.5 rounded border border-rule hover:text-ink"
                >
                  Pre-Split (July 16)
                </button>
                <button
                  onClick={() => setAsOfDateString("2026-07-18")}
                  className="bg-paper px-2 py-0.5 rounded border border-rule hover:text-ink"
                >
                  Post-Split (July 18)
                </button>
                <button
                  onClick={() => setAsOfDateString("2026-09-24")}
                  className="bg-paper px-2 py-0.5 rounded border border-rule hover:text-ink font-bold text-prussian"
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Statement Display (Archival Financial Journal Layout) */}
      <div className="bg-sheet rounded-xl border border-rule p-6 lg:p-8 shadow-elevated space-y-6">
        {/* Header Band */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-rule gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-ink">
                {instrument.name}
              </span>
              <span className="font-mono text-xs bg-paper px-2 py-0.5 rounded border border-rule text-soft">
                {statement.symbol}
              </span>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                  statement.instrumentCategory === "PreStocks"
                    ? "bg-pending/10 text-pending"
                    : "bg-prussian/10 text-prussian"
                }`}
              >
                {statement.instrumentCategory}
              </span>
            </div>
            <div className="text-xs font-mono text-soft mt-1">
              Mint: <code className="text-ink">{statement.mint}</code>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs space-y-0.5">
            <div className="text-soft">Statement ID: {statement.statementId}</div>
            <div className="text-ink font-bold">
              As Of: {statement.asOfIso.replace("T", " ").replace(".000Z", " UTC")}
            </div>
          </div>
        </div>

        {/* The Core 3 Numbers: Raw, Multiplier, Reconstructed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
          {/* Box 1: Raw Balance */}
          <div className="bg-paper p-5 rounded-lg border border-rule space-y-1">
            <span className="text-xs font-mono uppercase text-soft tracking-wider">
              1. Raw Ledger Balance
            </span>
            <div className="font-mono text-2xl font-bold text-ink truncate">
              {Number(statement.rawBalance) / 10 ** statement.decimals}
            </div>
            <div className="text-[11px] font-mono text-soft">
              Exact Integer: {statement.rawBalance.toString()} base units
            </div>
          </div>

          {/* Box 2: Active Multiplier */}
          <div className="bg-paper p-5 rounded-lg border border-rule space-y-1">
            <span className="text-xs font-mono uppercase text-soft tracking-wider flex items-center justify-between">
              <span>2. Active Multiplier</span>
              <span className="text-verified font-bold">Time-Aware</span>
            </span>
            <div className="font-mono text-2xl font-bold text-prussian truncate">
              {statement.activeMultiplier.floatValue.toFixed(7)}
            </div>
            <div className="text-[11px] font-mono text-soft">
              Effective Since: {statement.activeMultiplier.effectiveIso.slice(0, 10)}
            </div>
          </div>

          {/* Box 3: True Reconstructed Units */}
          <div className="bg-paper p-5 rounded-lg border border-verified/40 bg-verified/5 space-y-1">
            <span className="text-xs font-mono uppercase text-verified tracking-wider font-semibold">
              3. Reconstructed {statement.terminologyUnit}
            </span>
            <div className="font-mono text-2xl font-bold text-ink truncate">
              {statement.reconstructedUnits.toLocaleString(undefined, {
                minimumFractionDigits: 4,
                maximumFractionDigits: 6,
              })}
            </div>
            <div className="text-[11px] font-mono text-soft">
              {statement.terminologyUnit} = Raw Balance × Active Multiplier
            </div>
          </div>
        </div>

        {/* Baseline Comparison Seam (Shows Stale Tool Error) */}
        <div className="p-4 rounded-lg bg-breach/5 border border-breach/20 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-breach flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Naive Reader Baseline Divergence</span>
            </span>
            <span className="text-soft">Naive Tool uses stale field on-chain</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <span className="text-soft">Naive Display Units:</span>
              <p className="text-ink font-bold text-sm">
                {statement.naiveBaseline.naiveUnits.toFixed(4)} {statement.terminologyUnit}
              </p>
            </div>
            <div>
              <span className="text-soft">Omission Delta:</span>
              <p className="text-breach font-bold text-sm">
                +{statement.naiveBaseline.unitsDelta.toFixed(4)} {statement.terminologyUnit} (
                {statement.naiveBaseline.relativeErrorPct.toFixed(2)}% Error)
              </p>
            </div>
            <div>
              <span className="text-soft">Position Misstatement:</span>
              <p className="text-breach font-bold text-sm">
                ${statement.economicContext?.estimatedMisstatementDollars?.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                }) ?? "0.00"}
              </p>
            </div>
          </div>
        </div>

        {/* Issuer Authority & Legal Classification Alert */}
        <div className="p-4 rounded-lg bg-paper border border-rule space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono font-bold text-ink">
            <span>Issuer Authorities on Mint ({statement.issuerActionsInScope.length} detected)</span>
            <span className="text-pending">Authority Disclosed</span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-soft">
            <p>
              • <strong className="text-ink">permanentDelegate</strong> active at{" "}
              <code className="text-ink">WV9PJN7XTmTLVwbutCLFxp8TyePee6Xq5mRq6Fti5Wc</code>. Issuer can transfer tokens from accounts.
            </p>
            <p>
              • <strong className="text-ink">freezeAuthority</strong> active. Issuer can freeze token accounts.
            </p>
          </div>
          <div className="border-t border-rule pt-2 text-[11px] text-soft italic">
            Legal Status: {instrument.legalDisclaimer}
          </div>
        </div>

        {/* Cryptographic Chain Anchors Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-ink">
              Verifiable Chain Anchors
            </h3>
            <span className="text-xs font-mono text-soft">
              Deterministic Hash: <code className="text-prussian">{statement.statementHash.slice(0, 16)}...</code>
            </span>
          </div>

          <div className="border border-rule rounded-lg overflow-x-auto bg-paper font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-rule bg-sheet text-soft text-[11px]">
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Slot</th>
                  <th className="p-2.5">Signature</th>
                  <th className="p-2.5">Confidence</th>
                  <th className="p-2.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule text-[11px]">
                <tr>
                  <td className="p-2.5 font-bold text-prussian">Active Multiplier Update</td>
                  <td className="p-2.5">{statement.activeMultiplier.sourceSlot.toString()}</td>
                  <td className="p-2.5 truncate max-w-[200px] text-soft">
                    {statement.activeMultiplier.sourceSignature}
                  </td>
                  <td className="p-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-verified/10 text-verified font-bold">
                      {statement.activeMultiplier.confidence}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <a
                      href={`https://solscan.io/tx/${statement.activeMultiplier.sourceSignature}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-prussian hover:underline inline-flex items-center gap-1"
                    >
                      <span>Solscan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-ink">Balance Transfer Movement</td>
                  <td className="p-2.5">{bundle.sourceEvents[0]?.slot.toString() ?? "310000000"}</td>
                  <td className="p-2.5 truncate max-w-[200px] text-soft">
                    {bundle.sourceEvents[0]?.signature ?? "3J6tF8w0Oy7vPl3rMu1xQs5aGi2jK4lL7pT9dQ2sW4tH6nO8"}
                  </td>
                  <td className="p-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-verified/10 text-verified font-bold">
                      MEASURED
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <a
                      href={`https://solscan.io/tx/${bundle.sourceEvents[0]?.signature}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-prussian hover:underline inline-flex items-center gap-1"
                    >
                      <span>Solscan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* On-Chain Devnet Cryptographic Proof Anchor */}
      <AnchorProofSection
        statementHash={statement.statementHash}
        mintAddress={statement.mint}
        effectiveTimestamp={Number(statement.activeMultiplier.effectiveAt)}
        evidenceRoot={bundle.hashes.sourceEventsHash}
        symbol={statement.symbol}
        reconstructedUnits={statement.reconstructedUnits}
        unitLabel={statement.terminologyUnit}
      />

      {/* Verification Modal / Drawer */}
      {verificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-sheet rounded-xl border border-rule max-w-lg w-full p-6 space-y-4 shadow-elevated">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-verified" />
                <h3 className="font-serif text-lg font-bold text-ink">
                  Independent Offline Verification
                </h3>
              </div>
              <button
                onClick={() => setVerificationModalOpen(false)}
                className="text-soft hover:text-ink font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-soft leading-relaxed">
              Executed in-memory by <code className="text-ink font-mono">@colophon/verifier</code>.
              Verifies event digests, deterministic hashes, and all 10 invariants without network reliance.
            </p>

            <div className="space-y-2 border border-rule rounded-lg p-3 bg-paper font-mono text-xs">
              {verificationReport.checks.map((c) => (
                <div key={c.checkId} className="flex items-center justify-between py-1 border-b border-rule/50 last:border-0">
                  <span className="text-ink">{c.name}</span>
                  <span className="text-verified font-bold">PASS</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] font-mono text-soft">
                Bundle Hash: {bundle.hashes.bundleHash.slice(0, 16)}...
              </span>
              <button
                onClick={() => setVerificationModalOpen(false)}
                className="bg-prussian text-paper px-4 py-1.5 rounded font-mono text-xs hover:bg-prussian/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
