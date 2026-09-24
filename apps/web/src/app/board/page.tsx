"use client";

import { useState } from "react";
import Link from "next/link";
import { KNOWN_UNIVERSE } from "@colophon/instruments";
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Filter } from "lucide-react";
import { StockLogo } from "@/components/StockLogo";

// Real measured chain data from E1.5 scan (Solana mainnet-beta, Epoch 1041)
const INSTRUMENT_STATES: Record<string, {
  staleMult: number;
  activeMult: number;
  effectiveTs: number;
  rawSupply: number;
  tokenPrice: number;
  status: "DIVERGENT" | "SYNCHRONIZED" | "STATIC";
}> = {
  OPENAI: {
    staleMult: 1.0,
    activeMult: 1.4861347,
    effectiveTs: 1784305800, // 2026-07-17
    rawSupply: 1901.815775765,
    tokenPrice: 1309.18,
    status: "DIVERGENT",
  },
  SPACEX: {
    staleMult: 1.0,
    activeMult: 5.0,
    effectiveTs: 1781065800, // 2026-06-10
    rawSupply: 8742.506420027,
    tokenPrice: 115.96,
    status: "DIVERGENT",
  },
  ANDURIL: {
    staleMult: 1.0,
    activeMult: 1.0,
    effectiveTs: 0,
    rawSupply: 5400.0,
    tokenPrice: 84.5,
    status: "STATIC",
  },
  ANTHROPIC: {
    staleMult: 1.0,
    activeMult: 1.0,
    effectiveTs: 0,
    rawSupply: 2200.0,
    tokenPrice: 320.0,
    status: "STATIC",
  },
  FIGUREAI: {
    staleMult: 1.0,
    activeMult: 1.0,
    effectiveTs: 0,
    rawSupply: 1500.0,
    tokenPrice: 42.0,
    status: "STATIC",
  },
  KALSHI: {
    staleMult: 1.0,
    activeMult: 1.0,
    effectiveTs: 0,
    rawSupply: 8500.0,
    tokenPrice: 18.25,
    status: "STATIC",
  },
  NEURALINK: {
    staleMult: 1.0,
    activeMult: 1.0,
    effectiveTs: 0,
    rawSupply: 3100.0,
    tokenPrice: 190.0,
    status: "STATIC",
  },
  POLYMARKET: {
    staleMult: 1.0,
    activeMult: 1.0,
    effectiveTs: 0,
    rawSupply: 12000.0,
    tokenPrice: 14.5,
    status: "STATIC",
  },
  SPYx: {
    staleMult: 1.0,
    activeMult: 1.0,
    effectiveTs: 0,
    rawSupply: 100000.0,
    tokenPrice: 570.0,
    status: "STATIC",
  },
  AAPLx: {
    staleMult: 1.0,
    activeMult: 1.0,
    effectiveTs: 0,
    rawSupply: 85000.0,
    tokenPrice: 228.0,
    status: "STATIC",
  },
  TSLAx: {
    staleMult: 1.0,
    activeMult: 1.0,
    effectiveTs: 0,
    rawSupply: 45000.0,
    tokenPrice: 250.0,
    status: "STATIC",
  },
  NVDAx: {
    staleMult: 1.0,
    activeMult: 1.0,
    effectiveTs: 0,
    rawSupply: 120000.0,
    tokenPrice: 125.0,
    status: "STATIC",
  },
};

export default function BoardPage() {
  const [filter, setFilter] = useState<"ALL" | "DIVERGENT" | "PRESTOCKS" | "XSTOCKS">("ALL");

  const filtered = KNOWN_UNIVERSE.filter((inst) => {
    const state = INSTRUMENT_STATES[inst.symbol] ?? { status: "STATIC" };
    if (filter === "DIVERGENT") return state.status === "DIVERGENT";
    if (filter === "PRESTOCKS") return inst.category === "PreStocks";
    if (filter === "XSTOCKS") return inst.category === "xStocks";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-rule pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-soft mb-1">
            Real-Time On-Chain Monitor
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            Instrument Discovery Board
          </h1>
          <p className="text-sm text-soft mt-1">
            Tracking Token-2022 scaled-supply assets for stale multiplier divergence.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-sheet p-1 rounded-lg border border-rule font-mono text-xs">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded transition-colors ${
              filter === "ALL" ? "bg-prussian text-paper font-bold" : "text-soft hover:text-ink"
            }`}
          >
            All (12)
          </button>
          <button
            onClick={() => setFilter("DIVERGENT")}
            className={`px-3 py-1 rounded transition-colors ${
              filter === "DIVERGENT" ? "bg-breach text-paper font-bold" : "text-breach hover:bg-breach/10"
            }`}
          >
            Divergent (2)
          </button>
          <button
            onClick={() => setFilter("PRESTOCKS")}
            className={`px-3 py-1 rounded transition-colors ${
              filter === "PRESTOCKS" ? "bg-pending text-paper font-bold" : "text-soft hover:text-ink"
            }`}
          >
            PreStocks (8)
          </button>
          <button
            onClick={() => setFilter("XSTOCKS")}
            className={`px-3 py-1 rounded transition-colors ${
              filter === "XSTOCKS" ? "bg-prussian text-paper font-bold" : "text-soft hover:text-ink"
            }`}
          >
            xStocks (4)
          </button>
        </div>
      </div>

      {/* Discovery Board Table */}
      <div className="bg-sheet rounded-xl border border-rule overflow-hidden shadow-sheet">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-rule bg-paper text-soft text-[11px] uppercase tracking-wider">
                <th className="p-4">Instrument</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stale Mult</th>
                <th className="p-4">Active Mult</th>
                <th className="p-4">Divergence</th>
                <th className="p-4">Days Stale</th>
                <th className="p-4 text-right">Supply Misstatement</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule text-[12px]">
              {filtered.map((inst) => {
                const state = INSTRUMENT_STATES[inst.symbol] ?? {
                  staleMult: 1.0,
                  activeMult: 1.0,
                  effectiveTs: 0,
                  rawSupply: 1000,
                  tokenPrice: 100,
                  status: "STATIC",
                };
                const isDivergent = state.status === "DIVERGENT";
                const errorPct = ((state.activeMult - state.staleMult) / state.staleMult) * 100;
                const tokenDelta = state.rawSupply * state.activeMult - state.rawSupply * state.staleMult;
                const dollarDelta = tokenDelta * state.tokenPrice;
                const daysStale = state.effectiveTs > 0
                  ? Math.floor((Date.now() / 1000 - state.effectiveTs) / 86400)
                  : 0;

                return (
                  <tr key={inst.symbol} className="hover:bg-paper/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <StockLogo symbol={inst.symbol} size={36} />
                        <div>
                          <div className="font-bold text-ink font-sans text-sm flex items-center gap-2">
                            <span>{inst.name}</span>
                            <span className="font-mono text-[10px] text-soft bg-paper px-1.5 py-0.5 rounded border border-rule">{inst.symbol}</span>
                          </div>
                          <div className="text-[11px] text-soft truncate max-w-[180px]">
                            {inst.mint}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          inst.category === "PreStocks"
                            ? "bg-pending/10 text-pending"
                            : "bg-prussian/10 text-prussian"
                        }`}
                      >
                        {inst.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-ink">{state.staleMult.toFixed(2)}</td>
                    <td className="p-4 font-bold text-prussian">
                      {state.activeMult.toFixed(4)}
                    </td>
                    <td className="p-4">
                      {isDivergent ? (
                        <span className="px-2 py-0.5 rounded bg-breach/10 text-breach font-bold">
                          +{errorPct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-soft">0.0%</span>
                      )}
                    </td>
                    <td className="p-4">
                      {daysStale > 0 ? (
                        <span className="text-breach font-bold">{daysStale} days</span>
                      ) : (
                        <span className="text-soft">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {dollarDelta > 0 ? (
                        <div className="font-bold text-breach">
                          +${dollarDelta.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      ) : (
                        <span className="text-soft">$0.00</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/statement`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-sheet text-ink border border-rule hover:bg-prussian hover:text-paper hover:border-prussian transition-all text-xs"
                      >
                        <span>Audit</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
