/**
 * COLOPHON — Invariant Verification Engine
 *
 * Implements automated validation for all 10 hard invariants from §10:
 *   I1 — Determinism
 *   I2 — Source traceability
 *   I3 — Temporal boundary
 *   I4 — No invented history
 *   I5 — Raw balance conservation
 *   I6 — Timeline monotonicity
 *   I7 — Current-state agreement
 *   I8 — Proof determinism
 *   I9 — Privacy / key safety
 *   I10 — Evidence-label integrity
 */
import { MultiplierInterval, Statement, EvidenceLabel } from "./types.js";
export type InvariantCheckResult = {
    invariantId: string;
    name: string;
    passed: boolean;
    message: string;
    details?: unknown;
};
export declare function checkI1Determinism(run1: Statement, run2: Statement): InvariantCheckResult;
export declare function checkI2SourceTraceability(intervals: readonly MultiplierInterval[]): InvariantCheckResult;
export declare function checkI3TemporalBoundary(effectiveAt: bigint, beforeActiveMultiplier: number, exactActiveMultiplier: number, afterActiveMultiplier: number, expectedOldMultiplier: number, expectedNewMultiplier: number): InvariantCheckResult;
export declare function checkI4NoInventedHistory(confidence: EvidenceLabel): InvariantCheckResult;
export declare function checkI5RawBalanceConservation(rawBalance: bigint, transfersSum: bigint): InvariantCheckResult;
export declare function checkI6TimelineMonotonicity(intervals: readonly MultiplierInterval[]): InvariantCheckResult;
export declare function checkI7CurrentStateAgreement(reconstructedMultiplier: number, liveActiveMultiplier: number, tolerance?: number): InvariantCheckResult;
export declare function checkI8ProofDeterminism(stmt: Statement): InvariantCheckResult;
export declare function checkI9KeySafety(bundleText: string): InvariantCheckResult;
export declare function checkI10EvidenceLabelIntegrity(labels: readonly string[]): InvariantCheckResult;
//# sourceMappingURL=invariants.d.ts.map