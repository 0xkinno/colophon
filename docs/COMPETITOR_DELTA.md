# COLOPHON — Competitor Delta

**Phase 0 Research Document**
**Date**: 2026-09-24

---

## Purpose

Analyze what the strongest competitors do, what they don't do, and where Colophon's unique contribution lies. This is not a criticism document — it's a gap map.

---

## 1. Rung (0xileri/rung)

### What Rung does
- **Best-in-class discovery**: Found that the OpenAI PreStock mint carries active authorities (permanentDelegate, freezeAuthority, pausableConfig) that make any "fully collateralized" claim misleading.
- **Exact protocol semantics**: `token2022.ts` implements `activeMultiplier`, `activeTransferFee` exactly as the on-chain program does, with explicit commentary on the 48.6% error.
- **Proof artifacts**: `limitations.md` is honest, structured, and verifiable.
- **Mainnet fork testing**: Uses a local mainnet fork for settlement integration tests.
- **PreStocks integration**: Full SDK for PreStocks — mint reading, position quoting, escrow.
- **Architecture**: Anchor program (Rust) + TypeScript SDK + Next.js UI.

### What Rung does NOT do
- Does not produce a **historical reconstruction** of multiplier state at a prior timestamp.
- Does not answer "what did I own on 2026-06-01?" with the correct 2026-06-01 multiplier.
- Does not build a **time-indexed ledger** of ownership.
- Does not produce a **portable proof receipt** that a third party can independently verify.
- Does not implement a **tamper campaign** against its own outputs.
- The commitment curve product is orthogonal to ownership history.

### Rung's gap
Rung understands the multiplier timing semantics and avoids the stale-multiplier bug. But it uses this knowledge *only* to correctly price positions at the current time. It does not build the temporal accounting layer that answers historical ownership questions.

---

## 2. Rambu (PugarHuda/rambu)

### What Rambu does
- **FairPrice engine**: Integrates Pyth oracle + xStocks multiplier + dividend reconciliation.
- **Multiplier-at-timestamp**: `multiplierAt(mint, t)` — same time-check logic as rung.
- **Corporate action pipeline**: Parses dividend and split events, detects pending cases.
- **Split-pending detection**: Flags when underlying has gone ex-split but mint hasn't stepped yet.
- **Keeper**: Background loop that pushes state on-chain for circuit-breaker style market halts.
- **Pyth Pro integration**: Uses Pyth Lazer (Pro) for real-time pricing with fallback to push price.

### What Rambu does NOT do
- Does not reconstruct historical ownership from chain history.
- Does not produce a verifiable ownership statement for a prior date.
- Does not expose the full multiplier timeline — only uses current state correctly.
- Does not build a portable proof bundle.

### Rambu's gap
Rambu excels at real-time fair valuation. It correctly handles the timing problem. But "what was fair price on July 1st?" using a historical multiplier — and "what did a wallet own on July 1st?" — are not its products.

---

## 3. OpenStock (Datwebguy/openstock)

### What OpenStock does
- Clean xStocks universe discovery and display.
- Market data dashboard (price, chart, liquidity pool metrics).
- Pyth oracle quotes for both underlying and xStock feeds.

### What OpenStock does NOT do
- No multiplier timeline awareness.
- No historical reconstruction.
- Generic market dashboard — strong UX, shallow infrastructure.

---

## 4. Hanko (cryptoduke01/hanko)

### What Hanko does (based on instruction reference)
- Explicit invariant patterns — conservation of token amounts.
- Financial framing with proof anchors.
- Clear claim about "this is what the program guarantees."

### Hanko's gap
- Focused on current-state invariants, not temporal history.

---

## 5. Night Shift (winsznx/night-shift)

### What Night Shift does (based on instruction reference)
- Deterministic safety kernel.
- Exactly-once / idempotency mentality.
- State and evidence separation.
- Break campaign against its own system.

### Night Shift's gap
- Not specifically about tokenized stock ownership history.

---

## 6. Canon (Enoch208/canon)

### What Canon does
Canon is the most methodologically sophisticated reference for proof strategy. Its contribution:
- **Discovery before product**: Found a real failure mode in EnterpriseRAG-Bench before building.
- **Baseline vs. intervention**: Measured 14/20 failures in baseline → 1/20 with Canon.
- **Random control**: Removed same number of docs randomly → exactly 0 improvement → proves it's the graph, not the removal count.
- **Claim ledger**: Every number fingerprinted in `evidence/run_manifest.json`.
- **Proof-first README**: Reproducible from repository with four commands.
- **Fail-closed design**: If graph is down, system fails with `503`, not silently degrades.
- **Exact limitation disclosure**: Lists every claim boundary precisely.

### What Colophon takes from Canon
- This proof methodology is the standard to match.
- The run_manifest pattern.
- The ablation (baseline vs. intervention vs. random control).
- The honest limitations section.
- The "discovery before product" ordering.

---

## 7. Mosaic / Token-2022 (solana-foundation/mosaic)

### What Mosaic does
- Official Solana Foundation Token-2022 SDK.
- Covers: issuance, management, inspection, confidential transfers, MMF (money market fund) patterns.
- Has `tokenized-security.ts` template.
- Has `parse-transaction.ts` and `inspect-token.ts` — real on-chain parsing.

### What Mosaic does NOT do
- No multiplier history reconstruction.
- No temporal ownership statement.
- SDK primitives, not a product.

### What Colophon takes from Mosaic
- The exact `parse-transaction.ts` patterns for reading on-chain instruction data.
- The `inspect-token.ts` approach to structured extension reading.
- Understanding of the full Token-2022 extension set.

---

## 8. Competitive Gap Summary

| Capability | Rung | Rambu | OpenStock | Canon | **Colophon** |
|---|---|---|---|---|---|
| ScaledUiAmount time-check | ✓ | ✓ | ✗ | N/A | ✓ |
| Current-state correct display | ✓ | ✓ | ✗ | N/A | ✓ |
| **Historical ownership at timestamp T** | ✗ | ✗ | ✗ | N/A | **✓ (CORE)** |
| Multiplier timeline reconstruction | ✗ | ✗ | ✗ | N/A | **✓** |
| Portable proof receipt | ✗ | ✗ | ✗ | Analog | **✓** |
| Tamper / break campaign | ✗ | ✗ | ✗ | ✓ | **✓** |
| Baseline comparison (naive vs. correct) | ✗ | ✗ | ✗ | ✓ | **✓** |
| Export / verifier | ✗ | ✗ | ✗ | ✓ | **✓** |
| Dollar-quantified measured divergence | ✗ | ✗ | ✗ | ✓ | **✓ (MEASURED)** |

---

## 9. The Specific Colophon Advantage

No competitor currently builds:

> **"What did wallet X own of instrument Y at timestamp T, under the multiplier that was actually in force at T, with a proof bundle that shows exactly how the number was derived and allows independent verification?"**

Rung builds the correct *current* escrow product.  
Rambu builds the correct *current* fair price.  
Neither builds the *historical* ownership record.

Colophon's core is:
1. Ingest the multiplier timeline from chain history.
2. Reconstruct ownership at any past timestamp using the correct interval.
3. Produce a deterministic, source-anchored proof receipt.
4. Attack the receipt and prove the verifier catches tampering.

---

## 10. Risk: Rung as Established Competitor

Rung has a sophisticated understanding of the problem space. However:
- It doesn't build the temporal ledger.
- Its product is a commitment curve / options-like instrument, not an ownership history.
- Colophon and Rung are **complementary**, not duplicates.

The judge question that Colophon answers and Rung doesn't:

> "I need to prove what I owned on a specific historical date, with the exact multiplier in effect at that date, backed by chain evidence that anyone can verify."

---

## 11. Risk: Measured vs. Speculated Divergence

The measured divergences (OPENAI 48.6%, SPACEX 400%) are real and substantial. However:

- Supply-level dollar impact (\$1.2M OPENAI, \$4M SPACEX) is a **supply-wide** figure, not a single wallet's loss.
- Individual wallet impact depends on the holder's balance at the effective timestamp.
- The "naive tool shows wrong amount" claim requires a control: we need to test actual tools.

This is an honest limitation. The structural fact is proven. The economic magnitude at supply level is measured. Individual holder impact requires individual wallet data.
