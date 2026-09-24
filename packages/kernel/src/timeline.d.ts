/**
 * COLOPHON — Multiplier Timeline Engine
 *
 * Reconstructs continuous, non-overlapping multiplier intervals from on-chain events.
 * Enforces Invariants:
 *   I2 (Source traceability)
 *   I3 (Temporal boundary: asOfTs >= effectiveAt)
 *   I4 (No invented history)
 *   I6 (Timeline monotonicity)
 *   I7 (Current-state agreement)
 */
import { MultiplierInterval, MultiplierScheduledEvent, EvidenceLabel } from "./types.js";
export type InitialMultiplierConfig = {
    mint: string;
    initialMultiplierNumerator: bigint;
    initialMultiplierDenominator: bigint;
    genesisSlot: bigint;
    genesisTimestamp: bigint;
    sourceSignature: string;
    confidence: EvidenceLabel;
};
export declare function buildMultiplierTimeline(initial: InitialMultiplierConfig, scheduledEvents: readonly MultiplierScheduledEvent[]): MultiplierInterval[];
export type MultiplierResolutionResult = {
    numerator: bigint;
    denominator: bigint;
    floatValue: number;
    effectiveAt: bigint;
    sourceSignature: string;
    sourceSlot: bigint;
    confidence: EvidenceLabel;
    intervalIndex: number;
};
export declare function resolveMultiplierAtTimestamp(intervals: readonly MultiplierInterval[], asOfTs: bigint): MultiplierResolutionResult;
//# sourceMappingURL=timeline.d.ts.map