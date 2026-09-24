"use client";

import { ExternalLink, ShieldCheck, CheckCircle2, GitCommit, Database, Clock } from "lucide-react";
import { Statement, LineItemProvenance } from "@colophon/kernel";
import { MerkleProof } from "@colophon/proof";

interface LineItemProvenanceModalProps {
  statement: Statement;
  provenance: LineItemProvenance;
  merkleProof?: MerkleProof;
  onClose: () => void;
}

export function LineItemProvenanceModal({
  statement,
  provenance,
  merkleProof,
  onClose,
}: LineItemProvenanceModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm animate-fade-in font-mono text-xs">
      <div className="bg-paper border border-rule rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-sheet max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-rule pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-prussian bg-prussian/10 px-2 py-0.5 rounded border border-prussian/20">
                LINE-ITEM PROVENANCE
              </span>
              <span className="text-[10px] text-verified font-bold bg-verified/10 px-2 py-0.5 rounded border border-verified/20">
                COMPLETENESS: {provenance.completeness}
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-ink mt-1">
              Why is this number {provenance.valueString}?
            </h3>
            <p className="text-soft text-[11px] mt-0.5">
              Deterministic evidence chain resolving every contributing Solana event and multiplier boundary.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-soft hover:text-ink font-bold text-sm px-2.5 py-1 rounded border border-rule hover:bg-sheet transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 1. Computational Decomposition */}
        <div className="p-4 rounded-xl bg-sheet border border-rule space-y-3">
          <div className="text-ink font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-prussian" />
            <span>Mathematical Derivation</span>
          </div>
          <div className="p-3 bg-paper rounded border border-rule font-mono text-xs space-y-1.5">
            <div className="flex justify-between text-soft">
              <span>Raw Token Balance:</span>
              <span className="font-bold text-ink">
                {(Number(provenance.rawBalanceBeforeMultiplier) / 10 ** statement.decimals).toLocaleString(undefined, { maximumFractionDigits: 6 })} base tokens
              </span>
            </div>
            <div className="flex justify-between text-soft">
              <span>Active Multiplier at T:</span>
              <span className="font-bold text-prussian">
                {provenance.multiplierUsed.floatValue.toFixed(7)} ({provenance.multiplierUsed.numerator.toString()} / {provenance.multiplierUsed.denominator.toString()})
              </span>
            </div>
            <div className="flex justify-between text-soft">
              <span>Multiplier Interval:</span>
              <span className="font-bold text-ink">
                [{new Date(Number(provenance.multiplierUsed.intervalStartTs) * 1000).toISOString().slice(0, 10)}, {provenance.multiplierUsed.intervalEndTs ? new Date(Number(provenance.multiplierUsed.intervalEndTs) * 1000).toISOString().slice(0, 10) : "PRESENT"})
              </span>
            </div>
            <div className="pt-2 border-t border-rule flex justify-between text-ink font-bold text-sm">
              <span>True Reconstructed Exposure:</span>
              <span className="text-prussian">{provenance.valueString}</span>
            </div>
          </div>
        </div>

        {/* 2. Contributing On-Chain Transfer Events */}
        <div className="space-y-2">
          <div className="text-ink font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-prussian" />
            <span>Contributing Transfer Events ({provenance.contributingEvents.length})</span>
          </div>
          <div className="space-y-2">
            {provenance.contributingEvents.map((ev, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-sheet border border-rule space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-ink">
                    Delta: {Number(ev.delta) >= 0 ? "+" : ""}{(Number(ev.delta) / 10 ** statement.decimals).toFixed(4)} tokens
                  </span>
                  <span className="text-soft">Slot {ev.slot.toString()}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-soft">
                  <span className="truncate max-w-[280px]">Signature: {ev.signature}</span>
                  <a
                    href={`https://explorer.solana.com/tx/${ev.signature}?cluster=mainnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-prussian hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    <span>View Tx</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Merkle Proof Path & Root Binding */}
        {merkleProof && (
          <div className="p-4 rounded-xl bg-sheet border border-rule space-y-3">
            <div className="text-ink font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-verified" />
              <span>Evidence Merkle Proof Path</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-soft">
                <span>Leaf Hash:</span>
                <span className="font-bold text-ink truncate max-w-[240px]">{merkleProof.leafHash}</span>
              </div>
              <div className="flex justify-between text-soft">
                <span>Evidence Root:</span>
                <span className="font-bold text-prussian truncate max-w-[240px]">{merkleProof.root}</span>
              </div>
              <div className="flex justify-between text-soft">
                <span>Proof Sibling Count:</span>
                <span className="font-bold text-ink">{merkleProof.siblings.length} internal nodes</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Engine Metadata */}
        <div className="flex flex-wrap items-center justify-between text-[10px] text-soft border-t border-rule pt-3">
          <span>Kernel: v{provenance.engineVersion}</span>
          <span>Parser: v{provenance.parserVersion}</span>
          <span className="text-verified font-bold">100% Deterministic Zero-Float Ledger</span>
        </div>
      </div>
    </div>
  );
}
