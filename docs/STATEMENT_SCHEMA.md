# COLOPHON — Statement Schema Specification (v1.0.0)

This document specifies the exact JSON and binary data structures defining an auditable Colophon Ownership Statement.

---

## 1. Top-Level Statement Object

```typescript
export type Statement = {
  statementId: string;                  // SHA-256(wallet:mint:asOfTs)[0..16]
  wallet: string;                       // Solana Base58 public key
  mint: string;                         // Token-2022 mint address
  symbol: string;                       // Ticker symbol (e.g. "OPENAI", "AAPLx")
  instrumentCategory: "xStocks" | "PreStocks";
  terminologyUnit: "SHARES" | "TOKEN UNITS"; // Legal domain separation
  asOfTs: bigint;                       // Unix timestamp (seconds) of statement
  asOfIso: string;                      // ISO-8601 representation (e.g. "2026-07-16T12:00:00.000Z")
  rawBalance: bigint;                   // Integer raw balance at second T
  decimals: number;                     // Mint decimals (typically 6 or 9)
  
  activeMultiplier: {
    numerator: bigint;                  // Multiplier fraction numerator
    denominator: bigint;                // Multiplier fraction denominator
    floatValue: number;                 // Precomputed floating-point representation
    effectiveAt: bigint;                // Timestamp when active multiplier activated
    effectiveIso: string;
    sourceSignature: string;            // On-chain Solana tx that scheduled multiplier
    sourceSlot: bigint;                 // Slot of schedule instruction
    confidence: "MEASURED" | "REPLAYED" | "SYNTHETIC";
  };

  reconstructedUnits: number;           // (rawBalance / 10^decimals) * floatValue

  naiveBaseline: {
    staleMultiplier: number;            // Value of account.multiplier (ignores activation)
    naiveUnits: number;                 // Value displayed by standard wallet/explorer
    unitsDelta: number;                 // reconstructedUnits - naiveUnits
    relativeErrorPct: number;           // Omission error percentage
  };

  issuerActionsInScope: IssuerActionEvent[]; // Permanent delegates, freeze hooks

  economicContext?: {
    pricePerUnit?: number;
    estimatedPositionValue?: number;
    estimatedMisstatementDollars?: number;
    priceSource: string;                // e.g. "ONCHAIN / PRESTOCKS ISSUER MARK"
    priceConfidence: EvidenceLabel;
  };

  completenessReport?: CompletenessReport;
  provenanceRecord?: Record<string, LineItemProvenance>;
  evidenceRoot?: string;                // Root hash of Evidence Merkle Tree
  statementHash: string;                // Canonical SHA-256 digest
  generatedAt: string;
  kernelVersion: string;
  confidence: EvidenceLabel;
};
```

---

## 2. Completeness States

Colophon enforces four deterministic completeness states:

- `COMPLETE`: Full event stream verified from genesis through $T$. Zero missing slot ranges.
- `PARTIAL`: Ingestion gap identified; explicit missing slot/timestamp range provided.
- `UNKNOWN`: Insufficient RPC or blockTime data to establish continuity.
- `UNVERIFIABLE`: Discrepancy between mint authority and event logs.

```typescript
export type CompletenessReport = {
  state: "COMPLETE" | "PARTIAL" | "UNKNOWN" | "UNVERIFIABLE";
  coverageWindow: {
    startTs: bigint;
    endTs: bigint;
    startSlot: bigint;
    endSlot: bigint;
  };
  missingRanges?: Array<{ startTs: bigint; endTs: bigint; reason: string }>;
  unresolvedEventsCount: number;
  explanation: string;
};
```

---

## 3. Line-Item Provenance Record

Every material number in a statement resolves to its contributing on-chain transactions:

```typescript
export type LineItemProvenance = {
  itemKey: string;                      // e.g. "reconstructedUiUnits"
  label: string;                        // Human-readable title
  valueString: string;                  // Formatted output
  rawValue: bigint | number;
  multiplierUsed: {
    numerator: bigint;
    denominator: bigint;
    floatValue: number;
    intervalStartTs: bigint;
    intervalEndTs: bigint | null;
  };
  rawBalanceBeforeMultiplier: bigint;
  contributingEvents: Array<{
    signature: string;
    slot: bigint;
    blockTime: bigint;
    type: string;
    delta: bigint;
  }>;
  sourceSignatures: string[];
  slots: bigint[];
  blockTimes: bigint[];
  parserVersion: string;
  engineVersion: string;
  completeness: "COMPLETE" | "PARTIAL" | "UNKNOWN" | "UNVERIFIABLE";
  merkleLeafHash: string;
  merkleLeafIndex: number;
};
```
