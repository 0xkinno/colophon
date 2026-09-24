/**
 * COLOPHON — Event Stream Normalization & Ordering
 *
 * Implements deterministic event ingestion, deduplication, and ordering.
 * Enforces Invariants I1 (Determinism), I5 (Conservation), I6 (Monotonicity).
 */
import { ChainEvent, TransferEvent, MultiplierScheduledEvent } from "./types.js";
export declare function sortEvents(events: readonly ChainEvent[]): ChainEvent[];
export declare function deduplicateEvents(events: readonly ChainEvent[]): ChainEvent[];
export declare function normalizeEventStream(events: readonly ChainEvent[]): ChainEvent[];
export declare function filterTransfersForWallet(events: readonly ChainEvent[], wallet: string, mint: string): TransferEvent[];
export declare function filterMultiplierEvents(events: readonly ChainEvent[], mint: string): MultiplierScheduledEvent[];
//# sourceMappingURL=events.d.ts.map