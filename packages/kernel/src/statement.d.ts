/**
 * COLOPHON — Statement Generator
 *
 * Generates human-readable, auditable, and cryptographically hashed ownership statements.
 * Enforces Invariant I8 (Proof determinism) and terminology rules from §16.
 */
import { Statement, HistoricalHoldingsRecord, IssuerActionEvent, EvidenceLabel } from "./types.js";
export declare function computeStatementHash(stmt: Omit<Statement, "statementHash">): string;
export declare function generateStatement(params: {
    holdings: HistoricalHoldingsRecord;
    symbol: string;
    category: "xStocks" | "PreStocks";
    issuerActions?: IssuerActionEvent[];
    pricePerUnit?: number;
    priceSource?: string;
    priceConfidence?: EvidenceLabel;
}): Statement;
//# sourceMappingURL=statement.d.ts.map