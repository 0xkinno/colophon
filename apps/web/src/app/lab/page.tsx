"use client";

import { useState, useMemo } from "react";
import { Play, Pause, RotateCcw, AlertTriangle, ArrowRight, Check } from "lucide-react";

// OpenAI Activation Epoch: 2026-07-17T16:30:00Z (Unix timestamp: 1784305800)
const ACTIVATION_TS = 1784305800;
const WINDOW_SECONDS = 86400 * 14; // 14-day window around activation

export default function LabPage() {
  const [sliderOffset, setSliderOffset] = useState(0); // -7 days to +7 days in seconds
  const [rawAmountInput, setRawAmountInput] = useState(1000);

  const minOffset = -86400 * 7;
  const maxOffset = 86400 * 7;

  const currentTs = ACTIVATION_TS + sliderOffset;
  const currentDate = new Date(currentTs * 1000);

  // Exact boundary condition: asOfTs >= effectiveAt ? 1.4861347 : 1.0
  const isPostEffective = currentTs >= ACTIVATION_TS;
  const activeMultiplier = isPostEffective ? 1.4861347 : 1.0;
  const trueUnits = rawAmountInput * activeMultiplier;

  // What a naive tool without timestamp logic shows (stale 1.0 field)
  const naiveMultiplier = 1.0;
  const naiveUnits = rawAmountInput * naiveMultiplier;
  const unitsDelta = trueUnits - naiveUnits;
  const errorPct = naiveUnits > 0 ? (Math.abs(unitsDelta) / naiveUnits) * 100 : 0;

  const jumpSecondsRemaining = ACTIVATION_TS - currentTs;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-rule pb-6">
        <div className="text-xs font-mono uppercase tracking-wider text-soft mb-1">
          The Founder Primitive
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
          Temporal Boundary Lab
        </h1>
        <p className="text-sm text-soft mt-1">
          Interactive scrubber demonstrating the exact second of multiplier activation on Solana.
        </p>
      </div>

      {/* The 3-Way Synchronized Hero Card */}
      <div className="bg-sheet rounded-xl border border-rule p-6 lg:p-8 shadow-elevated space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rule gap-2">
          <div>
            <span className="text-xs font-mono text-soft uppercase tracking-wider">
              Target Boundary: OpenAI PreStock
            </span>
            <div className="font-serif text-xl font-bold text-ink">
              Activation Moment: 2026-07-17 16:30:00 UTC
            </div>
          </div>
          <div className="font-mono text-xs text-right">
            <span className="text-soft">Scrubber Time: </span>
            <span className="text-ink font-bold">{currentDate.toISOString().replace(".000Z", " UTC")}</span>
          </div>
        </div>

        {/* 3 Synchronized Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Raw Ledger Units */}
          <div className="bg-paper p-5 rounded-lg border border-rule space-y-2">
            <span className="text-xs font-mono uppercase text-soft tracking-wider">
              1. Raw Ledger Balance
            </span>
            <div className="font-mono text-3xl font-bold text-ink">
              {rawAmountInput.toLocaleString()}
            </div>
            <p className="text-[11px] font-mono text-soft">
              Constant raw SPL token units. Does not change during multiplier update.
            </p>
          </div>

          {/* Card 2: Active Multiplier (Step Function) */}
          <div
            className={`p-5 rounded-lg border transition-all space-y-2 ${
              isPostEffective
                ? "bg-verified/10 border-verified text-verified"
                : "bg-paper border-rule text-soft"
            }`}
          >
            <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider">
              <span>2. Active Multiplier</span>
              <span className="font-bold">{isPostEffective ? "UPDATED" : "GENESIS"}</span>
            </div>
            <div className="font-mono text-3xl font-bold">
              {activeMultiplier.toFixed(7)}
            </div>
            <p className="text-[11px] font-mono">
              {isPostEffective
                ? "Step function jumped to 1.4861347 (+48.61%)"
                : "Base multiplier in effect (1.0000000)"}
            </p>
          </div>

          {/* Card 3: True Reconstructed Units */}
          <div className="bg-paper p-5 rounded-lg border border-rule space-y-2">
            <span className="text-xs font-mono uppercase text-soft tracking-wider">
              3. True Display Units
            </span>
            <div className="font-mono text-3xl font-bold text-prussian">
              {trueUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] font-mono text-soft">
              True Exposure = Raw Tokens × Active Multiplier
            </p>
          </div>
        </div>

        {/* The Interactive Scrubber Bar */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-soft">July 10 (-7d)</span>
            <span className={`font-bold ${isPostEffective ? "text-verified" : "text-breach"}`}>
              {jumpSecondsRemaining === 0
                ? "EXACT ACTIVATION SECOND"
                : jumpSecondsRemaining > 0
                ? `${Math.floor(jumpSecondsRemaining / 3600)}h ${Math.floor((jumpSecondsRemaining % 3600) / 60)}m Before Activation`
                : `${Math.floor(Math.abs(jumpSecondsRemaining) / 3600)}h ${Math.floor((Math.abs(jumpSecondsRemaining) % 3600) / 60)}m After Activation`}
            </span>
            <span className="text-soft">July 24 (+7d)</span>
          </div>

          <input
            type="range"
            min={minOffset}
            max={maxOffset}
            step={60} // 1-minute steps
            value={sliderOffset}
            onChange={(e) => setSliderOffset(Number(e.target.value))}
            className="w-full h-2.5 bg-paper rounded-lg appearance-none cursor-pointer accent-prussian border border-rule"
          />

          {/* Jump Quick Targets */}
          <div className="flex flex-wrap gap-2 text-xs font-mono justify-center pt-2">
            <button
              onClick={() => setSliderOffset(-1)}
              className="bg-paper px-3 py-1 rounded border border-rule hover:border-prussian"
            >
              T - 1 Second (1.0000000)
            </button>
            <button
              onClick={() => setSliderOffset(0)}
              className="bg-paper px-3 py-1 rounded border border-rule font-bold text-verified hover:border-verified"
            >
              T = 0 Exact Second (1.4861347)
            </button>
            <button
              onClick={() => setSliderOffset(1)}
              className="bg-paper px-3 py-1 rounded border border-rule hover:border-prussian"
            >
              T + 1 Second (1.4861347)
            </button>
          </div>
        </div>

        {/* Step-by-Step Mathematical Explanation */}
        <div className="bg-paper p-5 rounded-lg border border-rule space-y-3 font-mono text-xs">
          <div className="font-bold text-ink flex items-center gap-2">
            <span>Mathematical Boundary Verification</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-soft text-[11px] leading-relaxed">
            <div>
              <strong className="text-ink">1 Second Before Activation (1784305799):</strong>
              <p>
                <code>nowTs &lt; effectiveTimestamp</code> evaluates to <strong>TRUE</strong>.
                Kernel resolves active multiplier to <code>1.0000000</code>.
                Holdings: <code>{rawAmountInput} × 1.0 = {rawAmountInput.toFixed(2)} units</code>.
              </p>
            </div>
            <div>
              <strong className="text-ink">At Exact Activation Second (1784305800):</strong>
              <p>
                <code>nowTs &gt;= effectiveTimestamp</code> evaluates to <strong>TRUE</strong>.
                Kernel resolves active multiplier to <code>1.4861347</code>.
                Holdings: <code>{rawAmountInput} × 1.4861347 = {(rawAmountInput * 1.4861347).toFixed(2)} units</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
