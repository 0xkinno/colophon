# Security Policy — COLOPHON

COLOPHON provides institutional-grade temporal ownership reconstruction, evidence completeness verification, and cryptographic statement anchoring for Solana Token-2022 scaled-supply assets (xStocks, PreStocks).

Because Colophon generates legally binding, audit-ready statements and on-chain cryptographic receipts, security, determinism, and tamper resistance are primary system invariants.

---

## 1. Supported Versions

| Version | Status | Security Patches |
|---|---|---|
| `v1.0.x` | Active Production | Supported |
| `< v1.0` | Deprecated | Unsupported |

---

## 2. Threat Model & Invariants

Colophon enforces ten hard mathematical invariants across all kernel computations:

| Invariant | Name | Security Guarantee |
|---|---|---|
| **I1** | Deterministic Reconstruction | Given the same event sequence, output is identical across all architectures. |
| **I2** | Source Traceability | Every balance movement and multiplier change cites an immutable transaction signature. |
| **I3** | Zero Secret Access | No private keys, seed phrases, or custody permissions are ever required or stored. |
| **I4** | Pure Local Verification | Proof verification executes 100% offline without external RPC queries. |
| **I5** | Raw Conservation | Cumulative base tokens are conserved at integer precision before scalar multiplication. |
| **I6** | Timeline Monotonicity | Multiplier activation intervals are strictly ordered by slot and Unix timestamp. |
| **I7** | Bounded Memory | Kernel memory consumption scales linearly with event count ($O(N)$). |
| **I8** | Proof Determinism | Canonical SHA-256 hashes bind statement, events, Merkle root, and anchors. |
| **I9** | Cluster Domain Separation | Read operations target Mainnet-Beta; anchoring targets Devnet PDAs. |
| **I10** | Evidence Label Integrity | Labels (`MEASURED`, `REPLAYED`, `SYNTHETIC`) are strictly enforced. |

---

## 3. Adversarial Test Suite (Tamper Campaign B1–B20)

Colophon's verifier subjects every generated statement and proof bundle to 20 automated adversarial attack vectors:

- **B1**: Multiplier modification inside statement.
- **B2**: Timestamp alteration / backdating.
- **B3**: Omission of contributing transfer transactions.
- **B4**: Inflation of reconstructed unit balances.
- **B5**: Event reordering (slot descending attack).
- **B6**: Event duplication in stream.
- **B7**: Wallet address substitution.
- **B8**: Slot number corruption.
- **B9**: Source anchor deletion.
- **B10**: Synthetic injection of unverified transfer.
- **B11**: Unauthorized evidence label modification.
- **B12**: Partial history falsely presented as complete.
- **B13**: Duplicated transaction signature replay.
- **B14**: Wrong mint address with identical symbol.
- **B15**: Wrong wallet address with identical balance.
- **B16**: Evidence Merkle root substitution.
- **B17**: Merkle proof sibling branch tamper.
- **B18**: Engine version / schema mismatch in commitment digest.
- **B19**: Boundary ambiguity at exact activation second $T$ vs $T+1$.
- **B20**: Expired or manipulated oracle price mark rejection.

Every attack vector terminates in a deterministic rejection state (`passed: false`, `tamperDetected: true`).

---

## 4. Reporting a Vulnerability

If you discover a security vulnerability or temporal accounting flaw in Colophon:

1. **Do not create a public GitHub issue.**
2. Send a detailed report via encrypted email to: `security@0xkinno.dev` (or open a private security advisory on GitHub).
3. Include:
   - Description of the vulnerability and attack vector.
   - Exact transaction signatures, slots, or test case bundle reproducing the flaw.
   - Potential impact on historical statement integrity or Devnet proof commitments.

We acknowledge receipt of valid reports within 24 hours and provide transparent timeline updates through resolution.
