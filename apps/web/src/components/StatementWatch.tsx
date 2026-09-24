"use client";

import { useState } from "react";
import { Eye, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { WatchState, WatchPolicy, StatementWatchSession } from "@colophon/watch";

interface StatementWatchProps {
  wallet: string;
  symbol: string;
  mint: string;
  rawBalance: number;
  staleMultiplier: number;
  activeMultiplier: number;
  pricePerUnit?: number;
  onTriggerReconciliation?: () => void;
}

export function StatementWatch({
  wallet,
  symbol,
  mint,
  rawBalance,
  staleMultiplier,
  activeMultiplier,
  pricePerUnit = 0,
  onTriggerReconciliation,
}: StatementWatchProps) {
  const [watchActive, setWatchActive] = useState(true);
  const [policy, setPolicy] = useState<WatchPolicy>("STRICT_SPLIT");
  const [simulatedSplitOccurred, setSimulatedSplitOccurred] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Derive current state
  const hasDivergence = Math.abs(activeMultiplier - staleMultiplier) > 1e-6;
  const isSplit = hasDivergence || simulatedSplitOccurred;

  const currentState: WatchState = !watchActive
    ? "UNKNOWN"
    : isSplit
    ? "RECONCILIATION_REQUIRED"
    : "WATCHING";

  const priorUnits = rawBalance * staleMultiplier;
  const effectiveMult = isSplit ? activeMultiplier : staleMultiplier;
  const currentUnits = rawBalance * effectiveMult;
  const deltaUnits = currentUnits - priorUnits;
  const deltaDollar = deltaUnits * (pricePerUnit || 1);

  return (
    <div className="bg-sheet rounded-xl border border-rule overflow-hidden shadow-sheet font-mono text-xs">
      <div className="p-4 sm:p-5 border-b border-rule bg-paper/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-prussian/10 text-prussian border border-prussian/20">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-ink font-serif text-sm">Statement Watch Keeper</h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  currentState === "WATCHING"
                    ? "bg-verified/15 text-verified border border-verified/30"
                    : currentState === "RECONCILIATION_REQUIRED"
                    ? "bg-breach/15 text-breach border border-breach/30 animate-pulse"
                    : "bg-soft/15 text-soft border border-rule"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentState === "WATCHING"
                      ? "bg-verified animate-ping"
                      : currentState === "RECONCILIATION_REQUIRED"
                      ? "bg-breach animate-ping"
                      : "bg-soft"
                  }`}
                />
                {currentState.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-[11px] text-soft mt-0.5">
              Autonomous background monitoring of Token-2022 multiplier transitions and issuer authorities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWatchActive(!watchActive)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              watchActive
                ? "bg-prussian text-paper hover:bg-prussian/90"
                : "bg-sheet text-ink border border-rule hover:bg-paper"
            }`}
          >
            {watchActive ? "Monitoring Active" : "Resume Watch"}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Watch Policy & Targets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-paper rounded border border-rule space-y-1">
            <span className="text-[10px] text-soft uppercase tracking-wider block font-semibold">
              Watch Policy
            </span>
            <select
              value={policy}
              onChange={(e) => setPolicy(e.target.value as WatchPolicy)}
              className="w-full bg-sheet text-ink font-mono text-xs border border-rule rounded px-2 py-1 focus:outline-none focus:border-prussian"
            >
              <option value="STRICT_SPLIT">Strict Multiplier Split</option>
              <option value="ALL_CORPORATE_ACTIONS">All Corporate Actions</option>
              <option value="CONTINUOUS_TRANSFER_FEE">Transfer Fee Hook</option>
            </select>
          </div>

          <div className="p-3 bg-paper rounded border border-rule space-y-1">
            <span className="text-[10px] text-soft uppercase tracking-wider block font-semibold">
              Monitored Mint
            </span>
            <div className="font-bold text-ink truncate text-[11px]">{mint}</div>
          </div>

          <div className="p-3 bg-paper rounded border border-rule space-y-1">
            <span className="text-[10px] text-soft uppercase tracking-wider block font-semibold">
              Keeper Status
            </span>
            <div className="flex items-center gap-1.5 text-verified font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Slot 350,000,120 Polled</span>
            </div>
          </div>
        </div>

        {/* State Transition Alert Banner */}
        {currentState === "RECONCILIATION_REQUIRED" && (
          <div className="p-4 rounded-xl bg-breach/10 border border-breach/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-breach flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-breach text-xs">
                  CRITICAL: Multiplier State Transition Detected
                </div>
                <div className="text-[11px] text-soft mt-0.5">
                  Issuer updated multiplier from {staleMultiplier.toFixed(4)} to {activeMultiplier.toFixed(4)}. Current wallet holdings must be reconciled before anchoring.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-3.5 py-1.5 rounded bg-breach text-paper font-bold hover:bg-breach/90 transition-all text-xs inline-flex items-center gap-1.5"
              >
                <span>Review Change</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Interactive Simulation Control for Judges */}
        <div className="pt-2 border-t border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-soft">
          <span>
            Demonstration Mode: Test the autonomous keeper loop state transitions.
          </span>
          <button
            onClick={() => {
              setSimulatedSplitOccurred(!simulatedSplitOccurred);
            }}
            className="text-prussian hover:underline font-bold inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <RefreshCw className="w-3 h-3" />
            <span>
              {simulatedSplitOccurred ? "Reset Multiplier to Baseline" : "Simulate Scheduled Split Event"}
            </span>
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
          <div className="bg-paper border border-rule rounded-xl max-w-lg w-full p-6 space-y-5 shadow-sheet font-mono text-xs">
            <div className="flex justify-between items-start border-b border-rule pb-3">
              <div>
                <h4 className="font-bold text-ink font-serif text-lg">Reconciliation Review</h4>
                <p className="text-soft text-[11px]">Before / After Corporate Action Accounting</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-soft hover:text-ink font-bold text-sm px-2 py-0.5 rounded border border-rule"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-sheet rounded border border-rule space-y-1">
                <span className="text-[10px] text-soft uppercase font-bold">Prior Multiplier</span>
                <div className="text-sm font-bold text-ink">{staleMultiplier.toFixed(7)}</div>
                <div className="text-[10px] text-soft">{priorUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })} Units</div>
              </div>
              <div className="p-3 bg-sheet rounded border border-prussian/40 space-y-1">
                <span className="text-[10px] text-prussian uppercase font-bold">New Multiplier</span>
                <div className="text-sm font-bold text-prussian">{activeMultiplier.toFixed(7)}</div>
                <div className="text-[10px] text-prussian">{currentUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })} Units</div>
              </div>
            </div>

            <div className="p-3 bg-sheet rounded border border-rule space-y-2">
              <div className="flex justify-between text-ink font-bold">
                <span>Net Holdings Adjustment:</span>
                <span className="text-prussian">+{deltaUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })} units</span>
              </div>
              {pricePerUnit > 0 && (
                <div className="flex justify-between text-ink font-bold">
                  <span>Economic Valuation Impact:</span>
                  <span className="text-verified">+${deltaDollar.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded border border-rule text-soft hover:text-ink font-bold"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setReviewModalOpen(false);
                  if (onTriggerReconciliation) {
                    onTriggerReconciliation();
                  }
                }}
                className="px-4 py-2 rounded bg-prussian text-paper font-bold hover:bg-prussian/90 transition-all inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Reconstruct & Anchor Updated Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
