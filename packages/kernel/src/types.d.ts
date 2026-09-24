/**
 * COLOPHON — Temporal Accounting Kernel Data Types
 *
 * Strictly follows §9 and §10 of COLOPHON_STOCKLANA_FINAL_AGENT_INSTRUCTION.md.
 * Retains exact raw integers, timestamps, slots, signatures.
 * Zero dependency on UI frameworks or external RPC clients.
 */
export type EvidenceLabel = "MEASURED" | "REPLAYED" | "SYNTHETIC" | "OFFCHAIN" | "UNKNOWN" | "INCOMPLETE";
export type BaseChainEvent = {
    signature: string;
    slot: bigint;
    blockTime: bigint;
    instructionIndex?: number;
    confidence: EvidenceLabel;
};
export type TransferEvent = BaseChainEvent & {
    type: "TransferEvent";
    from: string;
    to: string;
    mint: string;
    rawAmount: bigint;
};
export type MultiplierScheduledEvent = BaseChainEvent & {
    type: "MultiplierScheduledEvent";
    mint: string;
    oldMultiplierNumerator: bigint;
    oldMultiplierDenominator: bigint;
    newMultiplierNumerator: bigint;
    newMultiplierDenominator: bigint;
    effectiveAt: bigint;
    authority: string;
};
export type MultiplierActivatedEvent = BaseChainEvent & {
    type: "MultiplierActivatedEvent";
    mint: string;
    activeMultiplierNumerator: bigint;
    activeMultiplierDenominator: bigint;
    activatedAt: bigint;
};
export type IssuerActionEvent = BaseChainEvent & {
    type: "IssuerActionEvent";
    mint: string;
    action: "permanentDelegate" | "freeze" | "pause" | "unpause" | "transferHook" | "updateFee";
    authority: string;
    targetAccount?: string;
    details?: Record<string, unknown>;
};
export type MetadataEvent = BaseChainEvent & {
    type: "MetadataEvent";
    mint: string;
    symbol: string;
    name: string;
    decimals: number;
};
export type UnknownEvent = BaseChainEvent & {
    type: "UnknownEvent";
    programId: string;
    rawInstructionDataHex: string;
};
export type ChainEvent = TransferEvent | MultiplierScheduledEvent | MultiplierActivatedEvent | IssuerActionEvent | MetadataEvent | UnknownEvent;
export type MultiplierInterval = {
    mint: string;
    startTs: bigint;
    endTs: bigint | null;
    multiplierNumerator: bigint;
    multiplierDenominator: bigint;
    sourceSignature: string;
    sourceSlot: bigint;
    effectiveAt: bigint;
    confidence: EvidenceLabel;
};
export type RawBalancePoint = {
    slot: bigint;
    blockTime: bigint;
    rawBalance: bigint;
    sourceSignature: string;
};
export type HistoricalHoldingsRecord = {
    wallet: string;
    mint: string;
    asOfTs: bigint;
    asOfIso: string;
    rawBalance: bigint;
    decimals: number;
    activeMultiplierNumerator: bigint;
    activeMultiplierDenominator: bigint;
    effectiveMultiplierFloat: number;
    multiplierEffectiveAt: bigint;
    multiplierSourceSignature: string;
    multiplierConfidence: EvidenceLabel;
    reconstructedUiUnits: number;
    reconstructedRawScaled: bigint;
    naiveStaleMultiplierFloat: number;
    naiveUiUnits: number;
    divergenceUnitsDelta: number;
    divergenceRelativeErrorPct: number;
    divergenceDollarDelta?: number;
    sourceAnchors: {
        balanceSignature: string;
        balanceSlot: bigint;
        multiplierSignature: string;
        multiplierSlot: bigint;
    };
    confidence: EvidenceLabel;
};
export type Statement = {
    statementId: string;
    wallet: string;
    mint: string;
    symbol: string;
    instrumentCategory: "xStocks" | "PreStocks";
    terminologyUnit: "SHARES" | "TOKEN UNITS";
    asOfTs: bigint;
    asOfIso: string;
    rawBalance: bigint;
    decimals: number;
    activeMultiplier: {
        numerator: bigint;
        denominator: bigint;
        floatValue: number;
        effectiveAt: bigint;
        effectiveIso: string;
        sourceSignature: string;
        sourceSlot: bigint;
        confidence: EvidenceLabel;
    };
    reconstructedUnits: number;
    naiveBaseline: {
        staleMultiplier: number;
        naiveUnits: number;
        unitsDelta: number;
        relativeErrorPct: number;
    };
    issuerActionsInScope: IssuerActionEvent[];
    economicContext?: {
        pricePerUnit?: number;
        estimatedPositionValue?: number;
        estimatedMisstatementDollars?: number;
        priceSource: string;
        priceConfidence: EvidenceLabel;
    };
    statementHash: string;
    generatedAt: string;
    kernelVersion: string;
    confidence: EvidenceLabel;
};
export type ProofReceipt = {
    receiptId: string;
    statementId: string;
    statementHash: string;
    bundleHash: string;
    wallet: string;
    mint: string;
    asOfTs: bigint;
    asOfIso: string;
    reconstructedUnits: number;
    sourceSignatures: string[];
    sourceSlots: bigint[];
    offlineVerified: boolean;
    onlineVerified?: boolean;
    generatedAt: string;
    kernelVersion: string;
    evidenceLabel: EvidenceLabel;
};
//# sourceMappingURL=types.d.ts.map