/**
 * COLOPHON — Watch & Reconciliation Loop
 *
 * Scans live on-chain mint states to detect:
 *   1. Multipliers that have become newly effective
 *   2. Divergence between naive on-chain multiplier and active multiplier
 *   3. Corporate actions or pause transitions
 */

import { SolanaReadOnlyClient, parseMintAccountInfo } from "@colophon/chain";
import { InstrumentDefinition } from "@colophon/instruments";

export type DivergenceAlert = {
  mint: string;
  symbol: string;
  category: string;
  staleMultiplier: number;
  activeMultiplier: number;
  effectiveAt: number;
  effectiveIso: string;
  relativeErrorPct: number;
  supplyTokenDelta: number;
  detectedAt: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
};

export class ReconciliationWatcher {
  constructor(
    private readonly client: SolanaReadOnlyClient,
    private readonly instruments: readonly InstrumentDefinition[]
  ) {}

  async checkMint(instrument: InstrumentDefinition, nowTs?: number): Promise<DivergenceAlert | null> {
    const currentTs = nowTs ?? Math.floor(Date.now() / 1000);
    const rawAcct = await this.client.getAccountInfoParsed(instrument.mint);
    if (!rawAcct) return null;

    const parsed = parseMintAccountInfo(instrument.mint, rawAcct);
    if (!parsed || !parsed.scaledUiAmountConfig) return null;

    const { multiplier, newMultiplier, newMultiplierEffectiveTimestamp } =
      parsed.scaledUiAmountConfig;

    if (
      newMultiplierEffectiveTimestamp > 0 &&
      currentTs >= newMultiplierEffectiveTimestamp &&
      Math.abs(newMultiplier - multiplier) > 1e-10
    ) {
      const relDiff = Math.abs(newMultiplier - multiplier) / (multiplier || 1);
      const rawSupply = Number(parsed.supply) / 10 ** parsed.decimals;
      const supplyTokenDelta = rawSupply * newMultiplier - rawSupply * multiplier;

      return {
        mint: instrument.mint,
        symbol: instrument.symbol,
        category: instrument.category,
        staleMultiplier: multiplier,
        activeMultiplier: newMultiplier,
        effectiveAt: newMultiplierEffectiveTimestamp,
        effectiveIso: new Date(newMultiplierEffectiveTimestamp * 1000).toISOString(),
        relativeErrorPct: relDiff * 100,
        supplyTokenDelta,
        detectedAt: new Date().toISOString(),
        severity: relDiff > 0.1 ? "CRITICAL" : "WARNING",
      };
    }

    return null;
  }

  async scanAll(nowTs?: number): Promise<DivergenceAlert[]> {
    const alerts: DivergenceAlert[] = [];
    for (const inst of this.instruments) {
      try {
        const alert = await this.checkMint(inst, nowTs);
        if (alert) {
          alerts.push(alert);
        }
      } catch (_) {
        // Continue scanning remaining mints on RPC error
      }
    }
    return alerts;
  }
}
