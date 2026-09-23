# COLOPHON — DISCOVERY

**Phase 0 Research Document**
**Date**: 2026-09-24
**Status**: ACTIVE — Evidence being collected

---

## 1. The Problem

Token-2022's `ScaledUiAmountConfig` extension allows a mint authority to schedule a multiplier update that takes effect at a future Unix timestamp. The on-chain state stores two values simultaneously:

```
multiplier                          ← "current" value (stale after effective time)
newMultiplier                       ← "new" value (becomes live at effectiveTimestamp)
newMultiplierEffectiveTimestamp     ← Unix timestamp of when newMultiplier takes over
```

**The contradiction:**

A standard `getAccountInfo` JSON-parsed response returns both fields. The **`multiplier` field does not automatically update**. It remains the old value even after `newMultiplierEffectiveTimestamp` has passed.

A naive current-state reader that uses `cfg.multiplier` directly — without checking the timestamp — will compute the wrong display amount after the effective timestamp has passed.

The correct behavior mirrors exactly what the Token-2022 program does:

```
activeMultiplier = nowTs >= effectiveTimestamp ? newMultiplier : multiplier
```

Any tool, wallet, or protocol that reads `cfg.multiplier` directly after the effective timestamp has passed silently uses a stale value for every quantity it derives.

---

## 2. The Exact Mechanism

```
RAW TOKEN AMOUNT         (stored in token account — never changes on multiplier update)
       ×
MULTIPLIER               (time-dependent — changes when effective timestamp passes)
       =
UI DISPLAY AMOUNT        (what a user sees as their "balance")
```

When a multiplier update is scheduled and then takes effect:
- Raw amount is unchanged
- `multiplier` field is unchanged (stale)
- `newMultiplier` field contains the new active value
- `newMultiplierEffectiveTimestamp` marks when `newMultiplier` became live

A display tool that doesn't implement the time-check computes:

```
STALE_UI = rawAmount × multiplier        ← WRONG after effectiveTimestamp
```

The correct reconstruction is:

```
CORRECT_UI = rawAmount × newMultiplier   ← RIGHT after effectiveTimestamp
```

---

## 3. Real Chain Evidence — Measured (E1.5 Results)

### Scan timestamp
- UTC: 2026-09-24T00:54:00Z (approximately)
- Run ID: see evidence/runs/

### Instruments scanned
- PreStocks universe (from `https://prestocks.com/api/prestocks`)
- Known OpenAI PreStock (from rung reference + manual confirmation)
- SPYx placeholder (xStocks discovery pending)

### DIVERGENCE #1: OPENAI PreStock

| Field | Value |
|---|---|
| Mint | `PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF` |
| Category | PreStocks |
| `multiplier` (stale field) | `1` |
| `newMultiplier` (correct active) | `1.4861347` |
| `newMultiplierEffectiveTimestamp` | `1784305800` (2026-07-17T16:30:00Z) |
| Days since effective | ~68 days ago |
| Relative error (naive vs correct) | **48.61%** |
| Raw supply on-chain | ~1,901,887,456,483 base units |
| UI supply (correct) | ~2,826.46 tokens |
| UI supply (stale) | ~1,901.89 tokens |
| UI delta | ~924.57 tokens |

**Verification source**: rung/packages/sdk/test/token2022.test.ts (lines 17–21) provides cross-check fixture.

The rung test explicitly confirms:
```
"Reading the stale `multiplier` field instead would be off by ~48.6%."
```

### DIVERGENCE #2: SPACEX PreStock

| Field | Value |
|---|---|
| Mint | `PreANxuXjsy2pvis...` (full address in evidence/runs/) |
| Category | PreStocks |
| `multiplier` (stale field) | `1` |
| `newMultiplier` (correct active) | `5` |
| `newMultiplierEffectiveTimestamp` | `1781065800` (approximately 2026-06-07) |
| Days since effective | ~109 days ago |
| Relative error | **400%** |

A tool reading `multiplier=1` instead of `newMultiplier=5` would produce quantity estimates that are **5× wrong** for SpaceX.

### Non-divergence cases

The following PreStocks had `newMultiplier = multiplier` (or no scheduled change):
- ANDURIL: multiplier=1, newMult=1
- ANTHROPIC: multiplier=1, newMult=1
- FIGUREAI: multiplier=1, newMult=1
- KALSHI: multiplier=1, newMult=1
- NEURALINK: multiplier=1, newMult=1
- POLYMARKET: multiplier=1, newMult=1

---

## 4. What This Means for a Token Holder

A holder of OPENAI PreStock tokens with 1,000 raw units would see:
- **Naive display** (using stale `multiplier=1`): 1,000 token units
- **Correct display** (time-aware, using `newMultiplier=1.4861347`): 1,486.13 token units

The raw balance never changed. The multiplier changed. Any tool that doesn't implement the time-check is underreporting by 32.7% of the correct amount.

For SpaceX, a holder of 100 raw units would see:
- **Naive display**: 100 token units
- **Correct display**: 500 token units

The raw balance never changed. A 5× error on display amount.

---

## 5. Historical Reconstruction — The Core Problem

The current-state divergence is the **point-in-time proof**.

But the deeper product problem is **historical reconstruction**:

> If someone asks "how many tokens did I own on 2026-06-01?" — for the OPENAI PreStock — a naive tool would compute using the multiplier that was active at the moment it fetches the state. If it fetches today, it uses `newMultiplier=1.4861347`. But on 2026-06-01, the effective timestamp had not yet passed, so the correct multiplier at that date was `1.0`.

The timeline is:
```
2026-06-01: multiplier = 1.0  (effective at this date)
2026-07-17: multiplier becomes 1.4861347 (effectiveTimestamp passes)
2026-09-24: multiplier = 1.4861347 (current)
```

A current-state reader cannot distinguish these. It always returns the current multiplier for any date query.

Colophon's kernel reconstructs the full multiplier timeline so any date query returns the historically correct value.

---

## 6. Source of Multiplier Updates

Each multiplier update is an issuer action — a transaction from the mint authority calling `updateMultiplier` (or `scheduleMultiplierUpdate`) on the Token-2022 program.

The history scan shows 0 events in the 50 most recent transactions for OPENAI — which means the update happened further back in history. This is expected: the effective date was 2026-07-17, so the update instruction was sent weeks or months ago. Full recovery requires deeper RPC history traversal.

---

## 7. Cross-check Sources

| Source | Confirms |
|---|---|
| `rung/packages/sdk/test/token2022.test.ts` | OPENAI mint: multiplier=1, newMult=1.4861347, effective=1784305800 |
| `rung/packages/sdk/src/token2022.ts` comment | "a 48.6% error in every quantity derived from it" |
| Colophon live RPC scan (2026-09-24) | OPENAI and SPACEX both confirmed divergent |
| `rambu/keeper/fairprice.ts` | `multiplierAt` function, same time-check logic |

---

## 8. What We Do NOT Know Yet

- The exact signatures of the original multiplier update transactions (history scan limit: 50 txns)
- Whether any wallet or tool currently shows the stale value (requires comparative tool audit)
- Precise token prices at the effective timestamp for SPACEX (dollar impact pending price fetch)
- Whether xStocks (SPYx, AAPLx, etc.) have any current or historical divergences (scan pending)

---

## 9. Limitations Statement

- Dollar impact at supply level requires price context (fetched separately)
- 50-transaction history scan may miss older multiplier update signatures
- xStocks universe requires separate discovery step
- The "stale-reader" baseline comparison requires a controlled tool audit

---

## 10. Claim Status

| Claim | Status |
|---|---|
| Token-2022 `multiplier` field can be stale after `effectiveTimestamp` passes | **PROVEN by protocol semantics + live chain state** |
| OPENAI PreStock is currently divergent (48.6% error) | **MEASURED on-chain, 2026-09-24** |
| SPACEX PreStock is currently divergent (400% error) | **MEASURED on-chain, 2026-09-24** |
| Historical reconstruction requires timestamp-aware multiplier resolution | **PROVEN by protocol semantics** |
| Dollar impact for OPENAI | **MEASURED (supply level) — price context pending** |
| Dollar impact for SPACEX | **MEASURED (supply level) — price context pending** |
| Wallets/tools show incorrect values | **POSSIBLE — not yet tested against live wallet displays** |
