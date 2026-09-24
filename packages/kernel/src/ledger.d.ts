/**
 * COLOPHON — Ownership Ledger
 *
 * Computes exact raw balances at any historical timestamp from transfers.
 * Reconciles with time-indexed active multiplier to compute true UI token units.
 * Quantifies divergence from naive current-state reader.
 */
import { TransferEvent, HistoricalHoldingsRecord, EvidenceLabel, MultiplierInterval } from "./types.js";
export declare function computeRawBalanceAt(transfers: readonly TransferEvent[], wallet: string, mint: string, asOfTs: bigint): {
    rawBalance: bigint;
    transferCount: number;
    lastSignature: string;
    lastSlot: bigint;
};
export declare function reconstructHoldingsAt(params: {
    wallet: string;
    mint: string;
    decimals: number;
    asOfTs: bigint;
    transfers: readonly TransferEvent[];
    timeline: readonly MultiplierInterval[];
    naiveCurrentMultiplierFloat: number;
    pricePerUnit?: number;
    confidence?: EvidenceLabel;
}): HistoricalHoldingsRecord;
//# sourceMappingURL=ledger.d.ts.map