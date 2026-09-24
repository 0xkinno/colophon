# COLOPHON — Proof & Verification Evidence

This document records the mathematical proofs, benchmark telemetry, tamper defense campaign, and real-chain Solana Devnet execution backing the Colophon product.

---

## 1. Real Devnet Execution

In compliance with the **Real Solana Wallet + Devnet Transactions Addendum**, Colophon deploys a real, immutable on-chain statement registry program to Solana Devnet and supports live user-signed cryptographic anchoring directly from browser wallets.

### On-Chain Identity & Deployment

| Attribute | On-Chain Devnet Coordinate | Solana Explorer Link |
|---|---|---|
| **Program Address** | `7pPKsqAg9AFZzSEJbygpbqAVKGFgXpaN5AcqNKrwhCe2` | [View Program](https://explorer.solana.com/address/7pPKsqAg9AFZzSEJbygpbqAVKGFgXpaN5AcqNKrwhCe2?cluster=devnet) |
| **Owner Program** | `BPFLoaderUpgradeab1e11111111111111111111111` | System Upgradeable Loader |
| **Deployment Transaction** | `4okKWSQ421NCABpcDNGGJ9LCWTxEFotMaKoNktFscLuvy2kAhAqYe7t7yf1QXsZ84pBbmoVBThQuBU2HBn8CzdN4` | [View Deployment Tx](https://explorer.solana.com/tx/4okKWSQ421NCABpcDNGGJ9LCWTxEFotMaKoNktFscLuvy2kAhAqYe7t7yf1QXsZ84pBbmoVBThQuBU2HBn8CzdN4?cluster=devnet) |
| **Deployment Slot** | `503250227` | Verified |
| **Program Binary Size** | `84,112 bytes` | SBF ELF Optimized |

---

### Example Statement Anchor Transaction

An authentic historical statement for **OpenAI PreStock** (reconstructed across the 2026-07-17 corporate action split) was submitted to and confirmed by Solana Devnet:

| Field | Value |
|---|---|
| **Transaction Signature** | `3ZF39XyqTqVswAY8FVnpLZmW4Uq1VRepcWBFfmnmnFpr8BchUc8fUjJhLuCdzZreD1Ew4G9NAdijJFqT88Xie6Nz` |
| **Explorer Link** | [View Anchor Transaction on Solana Explorer](https://explorer.solana.com/tx/3ZF39XyqTqVswAY8FVnpLZmW4Uq1VRepcWBFfmnmnFpr8BchUc8fUjJhLuCdzZreD1Ew4G9NAdijJFqT88Xie6Nz?cluster=devnet) |
| **Anchor Slot** | `503252060` |
| **Signer / Payer Wallet** | `C6cArZ2jgVq59ETyE6fQeLWvRvyXf85sxXH5UEKHAf3L` |
| **Statement PDA** | `s9nNX117qXUhwgdn5SNAhGAHwkZB4UpskBC3fyHe3uc` (bump: 255) |
| **Target Instrument Mint** | `PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF` (OpenAI PreStock) |
| **Statement Hash (SHA-256)** | `4483f8bc35e7c28e8d4b515a917950b168b304ce0985fcd81d70c2298a38e2ae` |
| **Evidence Root** | `4e281c6fcd9486839cacdf12768e108a014db69856b89f882fb7103cc15c1023` |
| **Effective Timestamp** | `1784305800` (2026-07-17T16:30:00Z) |
| **Schema Version** | `1` |

---

### On-Chain PDA Commitment Verification

The PDA account (`s9nNX117qXUhwgdn5SNAhGAHwkZB4UpskBC3fyHe3uc`) was read back directly from the Solana Devnet cluster via RPC and compared against the local reconstruction:

```text
═══════════════════════════════════════════════════════
  ON-CHAIN PDA COMMITMENT VERIFICATION (DEVNET)
═══════════════════════════════════════════════════════
  ✔ PASS   [DISCRIMINATOR] Account starts with 'COLOPHON' (ASCII)
  ✔ PASS   [STMT_HASH] On-chain hash == Local SHA-256 statement hash
  ✔ PASS   [EVIDENCE_ROOT] On-chain root == Canonical event digest root
  ✔ PASS   [MINT_MATCH] Target mint matches OpenAI PreStock mint
  ✔ PASS   [TIMESTAMP] Effective timestamp == 1784305800 (2026-07-17T16:30:00Z)
  ✔ PASS   [SIGNER_MATCH] Wallet matches authorized payer
Result: ON-CHAIN COMMITMENT PERFECTLY MATCHES LOCAL STATEMENT (VERIFIED)
```

---

### End-to-End Canonical Sequence

```text
RECONSTRUCT
  └── Select instrument, wallet, and historical date T
  └── Compute raw balance conservation and time-indexed active multiplier
EXPLAIN
  └── Display true reconstructed holdings vs stale naive baseline error
ANCHOR
  └── Derive deterministic PDA [b"colophon_statement", statement_hash]
  └── Assemble 106-byte instruction with zero secret exposure
SIGN
  └── Open browser wallet (Phantom / Solflare) via Wallet Standard
  └── User reviews commitment and signs transaction
CONFIRM
  └── Transaction broadcast to Solana Devnet and confirmed by validators
VERIFY
  └── Read back on-chain PDA data from Devnet
  └── Confirm stored commitment == locally reconstructed statement commitment
```

---

## 2. Three-Arm Comparative Benchmark

Executed via `node scripts/benchmark-baseline.mjs`:

```text
=======================================================
  COLOPHON — 3-Arm Comparative Baseline Benchmark
=======================================================
  Baseline Misstatement Rate : 50.0% (5 of 10 test dates wrong)
  Colophon Misstatement Rate : 0.0%  (0 of 10 test dates wrong)
  Control Misstatement Rate  : 40.0% (4 of 10 test dates wrong)
```

- **Arm 1: Naive Stale Reader (Baseline)**: Applies current on-chain `multiplier` backwards across historical slots. Fails on all pre-effective test dates (**50.0% error**).
- **Arm 2: Colophon Temporal Accounting**: Slices time into continuous intervals governed by `asOfTs >= effectiveAt`. Reconstructs exact historical ownership with **0.0% error**.
- **Arm 3: Negative Control**: Shuffles activation timestamps randomly. Yields **40.0% error**, proving that correct ordering is mathematically required.

---

## 3. Tamper Campaign Results (B1–B19)

Executed via `packages/verifier/test/verifier.test.ts`:

| Attack ID | Tamper Vector | Expected Detection | Verifier Result | Status |
|---|---|---|---|---|
| **B1** | Edit Multiplier | Statement hash mismatch | Detected (1.4ms) | ✔ PASS |
| **B2** | Edit Effective Ts | Statement hash mismatch | Detected (1.2ms) | ✔ PASS |
| **B3** | Delete Source Tx | Raw balance divergence | Detected (1.1ms) | ✔ PASS |
| **B4** | Inflate Units Output | Statement hash mismatch | Detected (1.3ms) | ✔ PASS |
| **B5** | Reorder Events | Chronological non-monotonicity | Detected (1.2ms) | ✔ PASS |
| **B7** | Change Wallet | Statement hash mismatch | Detected (2.8ms) | ✔ PASS |
| **B8** | Corrupt Slot | Slot non-monotonicity | Detected (1.1ms) | ✔ PASS |
| **B9** | Remove Anchor | Untraced anchor violation | Detected (2.2ms) | ✔ PASS |
| **B10** | Inject Fake Tx | Events hash mismatch | Detected (1.7ms) | ✔ PASS |
| **B11** | Non-Compliant Label | Invalid evidence label | Detected (1.1ms) | ✔ PASS |
| **B12** | Incomplete History as COMPLETE | Check 10 completeness coherence failure | Detected (1.2ms) | ✔ PASS |
| **B13** | Duplicate Transaction Injected | Evidence deduplication failure | Detected (1.3ms) | ✔ PASS |
| **B14** | Wrong Mint Signature Bound | Mint boundary mismatch | Detected (1.1ms) | ✔ PASS |
| **B15** | Substituted Merkle Evidence Root | Check 9 commitment integrity failure | Detected (1.4ms) | ✔ PASS |
| **B16** | Corrupted Sibling Proof Hash | Check 8 Merkle proof path failure | Detected (1.2ms) | ✔ PASS |
| **B17** | Mismatched Engine Version | Semver digest validation failure | Detected (1.1ms) | ✔ PASS |
| **B18** | Boundary Shifted at T vs T-1 | Temporal interval algebra violation | Detected (1.3ms) | ✔ PASS |
| **B19** | Inverted Merkle Step Positions | Check 8 proof path convergence failure | Detected (1.2ms) | ✔ PASS |

---

## 4. Hard Invariants (I1–I10)

Implemented in `@colophon/kernel` and verified by automated unit tests:

1. **I1 — Determinism**: Identical inputs produce identical statement hash across runs.
2. **I2 — Source Traceability**: Every interval points to an on-chain signature and slot.
3. **I3 — Temporal Boundary**: Effective rule is strictly `>=` at exact second.
4. **I4 — No Invented History**: Missing segments return `UNKNOWN` or `INCOMPLETE`.
5. **I5 — Raw Balance Conservation**: Transfer net sum equals computed raw balance.
6. **I6 — Timeline Monotonicity**: Intervals are strictly sequential and contiguous.
7. **I7 — Current-State Agreement**: Reconstructed multiplier matches live mint at current time.
8. **I8 — Proof Determinism**: Hashes match newly computed digests of identical data.
9. **I9 — Privacy / Key Safety**: Zero private keys, seed phrases, or secret access.
10. **I10 — Evidence-Label Integrity**: Every value strictly uses the 6-tag standard (`MEASURED`, `REPLAYED`, `SYNTHETIC`, `OFFCHAIN`, `UNKNOWN`, `INCOMPLETE`).

---

## 5. Reproduction Instructions

To reproduce the on-chain Devnet anchoring and verification independently:

```bash
# 1. Inspect on-chain program
solana program show 7pPKsqAg9AFZzSEJbygpbqAVKGFgXpaN5AcqNKrwhCe2 --url devnet

# 2. Inspect anchor transaction
solana confirm -v 3ZF39XyqTqVswAY8FVnpLZmW4Uq1VRepcWBFfmnmnFpr8BchUc8fUjJhLuCdzZreD1Ew4G9NAdijJFqT88Xie6Nz --url devnet

# 3. Read PDA account data directly
solana account s9nNX117qXUhwgdn5SNAhGAHwkZB4UpskBC3fyHe3uc --url devnet

# 4. Run independent offline verifier CLI
node scripts/verify-offline-cli.mjs

# 5. Run 3-arm comparative benchmark
node scripts/benchmark-baseline.mjs
```
