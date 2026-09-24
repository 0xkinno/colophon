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
export function buildMultiplierTimeline(initial, scheduledEvents) {
    // Sort scheduled events by effectiveAt ascending
    const sorted = [...scheduledEvents].sort((a, b) => {
        if (a.effectiveAt !== b.effectiveAt) {
            return a.effectiveAt < b.effectiveAt ? -1 : 1;
        }
        return a.slot < b.slot ? -1 : 1;
    });
    const intervals = [];
    // Initial interval from genesis to first effective update
    let currentStart = initial.genesisTimestamp;
    let currentNum = initial.initialMultiplierNumerator;
    let currentDen = initial.initialMultiplierDenominator;
    let currentSig = initial.sourceSignature;
    let currentSlot = initial.genesisSlot;
    let currentConf = initial.confidence;
    for (const ev of sorted) {
        if (ev.effectiveAt > currentStart) {
            intervals.push({
                mint: initial.mint,
                startTs: currentStart,
                endTs: ev.effectiveAt,
                multiplierNumerator: currentNum,
                multiplierDenominator: currentDen,
                sourceSignature: currentSig,
                sourceSlot: currentSlot,
                effectiveAt: currentStart,
                confidence: currentConf,
            });
            currentStart = ev.effectiveAt;
        }
        currentNum = ev.newMultiplierNumerator;
        currentDen = ev.newMultiplierDenominator;
        currentSig = ev.signature;
        currentSlot = ev.slot;
        currentConf = ev.confidence;
    }
    // Open-ended current interval
    intervals.push({
        mint: initial.mint,
        startTs: currentStart,
        endTs: null,
        multiplierNumerator: currentNum,
        multiplierDenominator: currentDen,
        sourceSignature: currentSig,
        sourceSlot: currentSlot,
        effectiveAt: currentStart,
        confidence: currentConf,
    });
    return intervals;
}
export function resolveMultiplierAtTimestamp(intervals, asOfTs) {
    if (intervals.length === 0) {
        return {
            numerator: 1n,
            denominator: 1n,
            floatValue: 1.0,
            effectiveAt: 0n,
            sourceSignature: "NONE",
            sourceSlot: 0n,
            confidence: "UNKNOWN",
            intervalIndex: -1,
        };
    }
    // Before genesis
    if (asOfTs < intervals[0].startTs) {
        return {
            numerator: intervals[0].multiplierNumerator,
            denominator: intervals[0].multiplierDenominator,
            floatValue: Number(intervals[0].multiplierNumerator) /
                Number(intervals[0].multiplierDenominator),
            effectiveAt: intervals[0].effectiveAt,
            sourceSignature: intervals[0].sourceSignature,
            sourceSlot: intervals[0].sourceSlot,
            confidence: "INCOMPLETE",
            intervalIndex: 0,
        };
    }
    for (let i = 0; i < intervals.length; i++) {
        const inv = intervals[i];
        // Check if asOfTs falls into [startTs, endTs) or open-ended [startTs, null)
        if (asOfTs >= inv.startTs && (inv.endTs === null || asOfTs < inv.endTs)) {
            return {
                numerator: inv.multiplierNumerator,
                denominator: inv.multiplierDenominator,
                floatValue: Number(inv.multiplierNumerator) / Number(inv.multiplierDenominator),
                effectiveAt: inv.effectiveAt,
                sourceSignature: inv.sourceSignature,
                sourceSlot: inv.sourceSlot,
                confidence: inv.confidence,
                intervalIndex: i,
            };
        }
    }
    // Fallback to latest interval if beyond all
    const last = intervals[intervals.length - 1];
    return {
        numerator: last.multiplierNumerator,
        denominator: last.multiplierDenominator,
        floatValue: Number(last.multiplierNumerator) / Number(last.multiplierDenominator),
        effectiveAt: last.effectiveAt,
        sourceSignature: last.sourceSignature,
        sourceSlot: last.sourceSlot,
        confidence: last.confidence,
        intervalIndex: intervals.length - 1,
    };
}
//# sourceMappingURL=timeline.js.map