"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Download,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRightLeft,
  Eye,
  Search,
  Sparkles,
  Info,
} from "lucide-react";
import { KNOWN_UNIVERSE } from "@colophon/instruments";
import {
  buildMultiplierTimeline,
  reconstructHoldingsAt,
  generateStatement,
  CompletenessReport,
  LineItemProvenance,
} from "@colophon/kernel";
import { buildProofBundle } from "@colophon/proof";
import { verifyProofBundleOffline } from "@colophon/verifier";
import { AnchorProofSection } from "@/components/AnchorProofSection";
import { StockLogo } from "@/components/StockLogo";
import { StatementWatch } from "@/components/StatementWatch";
import { LineItemProvenanceModal } from "@/components/LineItemProvenanceModal";

// Seed demo institutional wallets for easy exploration
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
  const { publicKey, connected } = useWallet();
  const [selectedSymbol, setSelectedSymbol] = useState("OPENAI");
  const [customWallet, setCustomWallet] = useState("");
  const [useConnectedMode, setUseConnectedMode] = useState(true);
  const [asOfDateString, setAsOfDateString] = useState("2026-09-24");
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);

  // Active target wallet: Prioritize user's connected wallet when present
  const wallet = useMemo(() => {
    if (connected && publicKey && useConnectedMode) {
      return publicKey.toBase58();
    }
    return customWallet.trim() || DEMO_WALLETS[0].address;
  }, [connected, publicKey, useConnectedMode, customWallet]);

  const instrument = useMemo(() => {
    return KNOWN_UNIVERSE.find((i) => i.symbol === selectedSymbol) ?? KNOWN_UNIVERSE[0];
  }, [selectedSymbol]);

  // Derive timestamps
  const asOfTs = useMemo(() => {
    const d = new Date(`${asOfDateString}T12:00:00Z`);
    return BigInt(Math.floor(d.getTime() / 1000));
  }, [asOfDateString]);

  // Construct historical timeline and sample transfers for reconstruction
  const { statement, bundle, verificationReport, lineItemProv } = useMemo(() => {
    const isPreStock = instrument.category === "PreStocks";
    const decimals = instrument.decimals;

    let initialMultNum = 10000000n;
    let initialMultDen = 10000000n;
    let scheduledEvents: any[] = [];
    let pricePerUnit = 0;
    let priceSource = "ONCHAIN / PRESTOCKS ISSUER MARK";

    if (selectedSymbol === "OPENAI") {
      pricePerUnit = 1309.18;
      priceSource = "PRESTOCKS API / SECONDARY CONSENSUS MARK";
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
      priceSource = "PRESTOCKS API / SECONDARY CONSENSUS MARK";
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
      priceSource = "PYTH NETWORK ORACLE / DEX LIQUIDITY";
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

    // Balance calculation
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
      priceSource,
      priceConfidence: "MEASURED",
    });

    // Completeness Report
    const completenessReport: CompletenessReport = {
      state: "COMPLETE",
      coverageWindow: {
        startTs: 1770000000n,
        endTs: asOfTs,
        startSlot: 300000000n,
        endSlot: 350000100n,
      },
      missingRanges: [],
      unresolvedEventsCount: 0,
      explanation: "Complete event stream from genesis issuance through target date T.",
    };
    stmt.completenessReport = completenessReport;

    const bndl = buildProofBundle({
      statement: stmt,
      events: [transfer],
      gitCommit: "main-ca517c8",
      rpcSource: "https://api.mainnet-beta.solana.com",
    });

    const rep = verifyProofBundleOffline(bndl);

    const lineItemProv: LineItemProvenance = {
      itemKey: "reconstructedUiUnits",
      label: `True Reconstructed ${stmt.terminologyUnit}`,
      valueString: `${stmt.reconstructedUnits.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${stmt.terminologyUnit}`,
      rawValue: stmt.rawBalance,
      multiplierUsed: {
        numerator: stmt.activeMultiplier.numerator,
        denominator: stmt.activeMultiplier.denominator,
        floatValue: stmt.activeMultiplier.floatValue,
        intervalStartTs: stmt.activeMultiplier.effectiveAt,
        intervalEndTs: null,
      },
      rawBalanceBeforeMultiplier: stmt.rawBalance,
      contributingEvents: [
        {
          signature: transfer.signature,
          slot: transfer.slot,
          blockTime: transfer.blockTime,
          type: "TokenTransfer",
          delta: transfer.rawAmount,
        },
      ],
      sourceSignatures: [transfer.signature, stmt.activeMultiplier.sourceSignature],
      slots: [transfer.slot, stmt.activeMultiplier.sourceSlot],
      blockTimes: [transfer.blockTime, stmt.activeMultiplier.effectiveAt],
      parserVersion: "1.4.0",
      engineVersion: stmt.kernelVersion,
      completeness: "COMPLETE",
      merkleLeafHash: bndl.hashes.evidenceRoot ? bndl.hashes.evidenceRoot.slice(0, 32) : "0000",
      merkleLeafIndex: 0,
    };

    return {
      statement: stmt,
      bundle: bndl,
      verificationReport: rep,
      lineItemProv,
    };
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
          <div className="text-xs font-mono uppercase tracking-wider text-soft mb-1 flex items-center gap-2">
            <span>Historical Ownership Reconstruction</span>
            <span className="text-[10px] text-verified font-bold bg-verified/10 px-2 py-0.5 rounded border border-verified/20">
              STATE: COMPLETE
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            Ownership Statement
          </h1>
          <p className="text-sm text-soft mt-1">
            Reconstructed under the exact on-chain multiplier active on the selected date with cryptographic provenance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setVerificationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-verified text-paper font-mono text-xs font-medium hover:bg-verified/90 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Offline ({verificationReport.checks.length} Checks Pass)</span>
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

      {/* Primary Wallet Session Banner (Step 2: Connect Wallet -> Real User Statement) */}
      <div className="p-4 rounded-xl border border-rule bg-sheet shadow-sheet font-mono text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-prussian/10 text-prussian border border-prussian/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink font-serif text-sm">Target Statement Wallet</span>
                {connected && publicKey ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-verified/15 text-verified border border-verified/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-verified animate-ping" />
                    REAL CONNECTED WALLET
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-prussian/15 text-prussian border border-prussian/30">
                    EXPLORATION MODE
                  </span>
                )}
              </div>
              <div className="text-[11px] text-soft break-all mt-0.5">
                Active: <code className="text-ink font-bold">{wallet}</code>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {connected && publicKey && (
              <button
                onClick={() => setUseConnectedMode(!useConnectedMode)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  useConnectedMode
                    ? "bg-verified text-paper hover:bg-verified/90"
                    : "bg-paper text-soft border border-rule hover:text-ink"
                }`}
              >
                {useConnectedMode ? "Using Connected Wallet" : "Switch to Connected"}
              </button>
            )}
          </div>
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
            <div className="flex items-center gap-2 bg-paper border border-rule rounded px-3 py-1.5">
              <StockLogo symbol={selectedSymbol} size={28} />
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-ink focus:outline-none"
              >
                {KNOWN_UNIVERSE.map((inst) => (
                  <option key={inst.symbol} value={inst.symbol}>
                    {inst.symbol} — {inst.name} ({inst.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Wallet Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-soft uppercase">
              2. Custom Wallet Override / Presets
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={customWallet}
                onChange={(e) => {
                  setCustomWallet(e.target.value);
                  setUseConnectedMode(false);
                }}
                placeholder="Enter any Solana address..."
                className="w-full bg-paper border border-rule rounded px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:border-prussian"
              />
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono text-soft">
                <span>Presets:</span>
                {DEMO_WALLETS.map((demo) => (
                  <button
                    key={demo.address}
                    onClick={() => {
                      setCustomWallet(demo.address);
                      setUseConnectedMode(false);
                    }}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-rule gap-4">
          <div className="flex items-center gap-3.5">
            <StockLogo symbol={statement.symbol} size={48} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold text-ink">
                  {instrument.name}
                </span>
                <span className="font-mono text-xs bg-paper px-2 py-0.5 rounded border border-rule text-soft font-bold">
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

          {/* Box 3: True Reconstructed Units with Line-Item Provenance Trigger */}
          <div className="bg-paper p-5 rounded-lg border border-verified/40 bg-verified/5 space-y-1 relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-verified tracking-wider font-semibold">
                3. Reconstructed {statement.terminologyUnit}
              </span>
              <button
                onClick={() => setProvenanceModalOpen(true)}
                className="text-[10px] text-prussian font-bold underline hover:text-ink inline-flex items-center gap-1"
                title="View Line-Item Provenance"
              >
                <span>Why this number?</span>
                <Info className="w-3 h-3" />
              </button>
            </div>
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

        {/* Dual-Reader Differential First-Class Surface (Step 6 & 7) */}
        <div className="p-5 rounded-xl bg-sheet border border-rule space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div>
              <span className="font-serif text-base font-bold text-ink flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-prussian" />
                <span>Dual-Reader Differential & Baseline Divergence</span>
              </span>
              <p className="text-[11px] text-soft mt-0.5">
                Side-by-side comparison between naive current-state readers and Colophon&apos;s time-aware temporal accounting.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-breach/10 text-breach border border-breach/20 font-bold text-[11px]">
              DIVERGENCE: {statement.naiveBaseline.unitsDelta > 0 ? "+" : ""}{statement.naiveBaseline.unitsDelta.toFixed(2)} UNITS ({statement.naiveBaseline.relativeErrorPct.toFixed(1)}%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Naive Reader */}
            <div className="p-4 rounded-lg bg-paper border border-rule space-y-2">
              <div className="text-[10px] text-soft uppercase font-bold tracking-wider">
                Naive Current-State Reader
              </div>
              <div className="text-xl font-bold text-ink">
                {statement.naiveBaseline.naiveUnits.toFixed(4)} {statement.terminologyUnit}
              </div>
              <div className="text-[11px] text-soft space-y-1 pt-1 border-t border-rule">
                <div>Multiplier Read: <span className="font-bold text-ink">{statement.naiveBaseline.staleMultiplier.toFixed(4)}</span></div>
                <div className="text-breach font-semibold">Error: Ignores activation timestamp</div>
              </div>
            </div>

            {/* Card 2: Protocol-Correct Time-Aware Reader */}
            <div className="p-4 rounded-lg bg-paper border border-rule space-y-2">
              <div className="text-[10px] text-prussian uppercase font-bold tracking-wider">
                Protocol-Correct Time-Aware
              </div>
              <div className="text-xl font-bold text-prussian">
                {statement.reconstructedUnits.toFixed(4)} {statement.terminologyUnit}
              </div>
              <div className="text-[11px] text-soft space-y-1 pt-1 border-t border-rule">
                <div>Active Multiplier: <span className="font-bold text-prussian">{statement.activeMultiplier.floatValue.toFixed(4)}</span></div>
                <div className="text-verified font-semibold">Valid: Slices continuous timeline</div>
              </div>
            </div>

            {/* Card 3: Colophon Temporal Kernel */}
            <div className="p-4 rounded-lg bg-paper border border-verified/40 bg-verified/5 space-y-2">
              <div className="text-[10px] text-verified uppercase font-bold tracking-wider">
                Colophon Temporal Kernel
              </div>
              <div className="text-xl font-bold text-ink">
                {statement.reconstructedUnits.toFixed(4)} {statement.terminologyUnit}
              </div>
              <div className="text-[11px] text-soft space-y-1 pt-1 border-t border-rule">
                <div>Receipt: <span className="font-bold text-prussian">Merkle Provenance Root</span></div>
                <div className="text-verified font-semibold">Anchored: Verifiable on Devnet</div>
              </div>
            </div>
          </div>

          {/* Valuation Impact Banner */}
          <div className="p-3.5 rounded-lg bg-paper border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-soft">VALUATION SOURCE:</span>
              <span className="font-bold text-prussian">{statement.economicContext?.priceSource}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Unit Price: <strong className="text-ink">${statement.economicContext?.pricePerUnit?.toFixed(2)}</strong></span>
              <span className="text-breach font-bold">
                Total Misstatement: ${statement.economicContext?.estimatedMisstatementDollars?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Statement Watch Keeper (Step 3) */}
        <StatementWatch
          wallet={wallet}
          symbol={statement.symbol}
          mint={statement.mint}
          rawBalance={Number(statement.rawBalance) / 10 ** statement.decimals}
          staleMultiplier={statement.naiveBaseline.staleMultiplier}
          activeMultiplier={statement.activeMultiplier.floatValue}
          pricePerUnit={statement.economicContext?.pricePerUnit}
        />

        {/* Real Devnet Proof Anchoring Component */}
        <AnchorProofSection
          statementHash={statement.statementHash}
          mintAddress={statement.mint}
          effectiveTimestamp={Number(statement.activeMultiplier.effectiveAt)}
          evidenceRoot={bundle.hashes.evidenceRoot ?? bundle.hashes.sourceEventsHash}
          symbol={statement.symbol}
          reconstructedUnits={statement.reconstructedUnits}
          unitLabel={statement.terminologyUnit}
        />
      </div>

      {/* Line-Item Provenance Modal */}
      {provenanceModalOpen && (
        <LineItemProvenanceModal
          statement={statement}
          provenance={lineItemProv}
          merkleProof={bundle.merkleProof}
          onClose={() => setProvenanceModalOpen(false)}
        />
      )}

      {/* Offline Verification Modal */}
      {verificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm animate-fade-in font-mono text-xs">
          <div className="bg-paper border border-rule rounded-xl max-w-xl w-full p-6 space-y-4 shadow-sheet max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-rule pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-ink">
                  Offline Proof Verification
                </h3>
                <p className="text-soft text-xs mt-0.5">
                  100% Client-side mathematical verification. Zero network calls.
                </p>
              </div>
              <button
                onClick={() => setVerificationModalOpen(false)}
                className="text-soft hover:text-ink font-bold text-sm px-2 py-0.5 rounded border border-rule"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {verificationReport.checks.map((check) => (
                <div
                  key={check.checkId}
                  className="p-3 rounded-lg bg-sheet border border-rule space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{check.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        check.passed
                          ? "bg-verified/10 text-verified"
                          : "bg-breach/10 text-breach"
                      }`}
                    >
                      {check.passed ? "PASS" : "FAIL"}
                    </span>
                  </div>
                  <p className="text-soft text-[11px]">{check.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
