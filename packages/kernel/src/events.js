/**
 * COLOPHON — Event Stream Normalization & Ordering
 *
 * Implements deterministic event ingestion, deduplication, and ordering.
 * Enforces Invariants I1 (Determinism), I5 (Conservation), I6 (Monotonicity).
 */
export function sortEvents(events) {
    return [...events].sort((a, b) => {
        if (a.slot !== b.slot) {
            return a.slot < b.slot ? -1 : 1;
        }
        if (a.blockTime !== b.blockTime) {
            return a.blockTime < b.blockTime ? -1 : 1;
        }
        const idxA = a.instructionIndex ?? 0;
        const idxB = b.instructionIndex ?? 0;
        if (idxA !== idxB) {
            return idxA - idxB;
        }
        return a.signature.localeCompare(b.signature);
    });
}
export function deduplicateEvents(events) {
    const seen = new Set();
    const deduped = [];
    for (const event of events) {
        const key = `${event.signature}:${event.instructionIndex ?? 0}:${event.type}`;
        if (!seen.has(key)) {
            seen.add(key);
            deduped.push(event);
        }
    }
    return deduped;
}
export function normalizeEventStream(events) {
    return sortEvents(deduplicateEvents(events));
}
export function filterTransfersForWallet(events, wallet, mint) {
    return events.filter((e) => e.type === "TransferEvent" &&
        e.mint === mint &&
        (e.from === wallet || e.to === wallet));
}
export function filterMultiplierEvents(events, mint) {
    return events.filter((e) => e.type === "MultiplierScheduledEvent" && e.mint === mint);
}
//# sourceMappingURL=events.js.map