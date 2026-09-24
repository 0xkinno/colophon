# COLOPHON EVIDENCE MODEL & MERKLE COMMITMENT SPECIFICATION

## 1. Overview & Objective

Colophon guarantees that every reconstructed historical statement is backed by an immutable, mathematically verifiable cryptographic audit trail. Rather than asking auditors, tax authorities, or protocols to trust an indexer's API response, Colophon organizes all raw on-chain transaction digests, balance transfers, multiplier activation transitions, and account snapshots into an **Evidence Merkle Tree**.

The root of this tree (`evidenceRoot`), along with the deterministic `statementHash`, is bound into a unique 32-byte `statementCommitment`. This commitment is anchored directly onto the Solana blockchain via our Devnet Anchor program (`7pPKsqAg9AFZzSEJbygpbqAVKGFgXpaN5AcqNKrwhCe2`).

---

## 2. Evidence Leaf Specification

Each item contributing to a statement's historical reconstruction is serialized into a canonical evidence leaf. Supported evidence types include:
1. `TRANSFER_IN` / `TRANSFER_OUT`: Token balance movements affecting the subject wallet.
2. `MULTIPLIER_ACTIVATION`: Token-2022 `ScaledUiAmountConfig` updates or historical stock split transitions.
3. `MINT_STATE`: Token-2022 extension initialization and authority configurations.
4. `ACCOUNT_SNAPSHOT`: Slot-level raw balance verification.
5. `PRICE_SOURCE`: Authoritative valuation benchmark (e.g., Pyth Network or PreStocks issuer mark).

### Canonical Leaf Serialization & Hashing

To eliminate ambiguity across platforms, leaves are sorted deterministically and hashed using SHA-256:

$$\text{leafPayload} = \text{index} \parallel \text{type} \parallel \text{target} \parallel \text{slot} \parallel \text{blockTime} \parallel \text{signature} \parallel \text{detail} \parallel \text{amount} \parallel \text{multiplier}$$

$$\text{leafHash} = \text{SHA256}(\text{leafPayload})$$

Each string field is UTF-8 encoded, and numeric values are represented in standard decimal string notation.

---

## 3. Binary Merkle Tree Construction

Given an ordered set of evidence items $[E_0, E_1, \dots, E_{n-1}]$, the tree is constructed as follows:

1. **Leaf Layer**: Calculate $H_i^0 = \text{SHA256}(\text{serialize}(E_i))$ for each $i \in [0, n-1]$.
2. **Intermediate Layers**: For layer $k$ with $m$ nodes:
   - For adjacent pairs $(H_{2j}^k, H_{2j+1}^k)$:
     $$H_j^{k+1} = \text{SHA256}(H_{2j}^k \parallel H_{2j+1}^k)$$
   - If a layer has an odd number of nodes ($m \pmod 2 \neq 0$), the last node is promoted without pair hashing:
     $$H_{\lfloor m/2 \rfloor}^{k+1} = H_{m-1}^k$$
3. **Evidence Root**: The single hash at layer $h = \lceil \log_2 n \rceil$ is defined as the canonical `evidenceRoot`.

```
                [Evidence Root: 0x9f8c...]
                       /          \
            [Hash 0-1]              [Hash 2-3]
             /      \                /      \
        [Leaf 0]  [Leaf 1]      [Leaf 2]  [Leaf 3]
           |         |             |         |
        Transfer  Multiplier    Transfer   Balance
        Inbound   Activation    Outbound   Snapshot
```

---

## 4. Merkle Proof Path & Verification

Any client, auditor, or smart contract can verify that an individual transaction or multiplier transition was included in the statement's evidence without possessing the full dataset.

### Proof Path Structure
A proof path for leaf index $i$ consists of an ordered sequence of sibling nodes:
```typescript
export interface MerkleProofStep {
  position: "left" | "right";
  hash: string; // 64-character lowercase hex string
}

export type MerkleProof = MerkleProofStep[];
```

### Verification Algorithm
```typescript
export function verifyMerkleProof(
  leafHash: string,
  proof: MerkleProofStep[],
  expectedRoot: string
): boolean {
  let currentHash = leafHash;
  for (const step of proof) {
    if (step.position === "left") {
      currentHash = sha256(step.hash + currentHash);
    } else {
      currentHash = sha256(currentHash + step.hash);
    }
  }
  return currentHash.toLowerCase() === expectedRoot.toLowerCase();
}
```

---

## 5. Dual-Binding Statement Commitment

To guarantee that an evidence tree cannot be decoupled from its resulting statement or re-used for a forged balance, Colophon computes a cryptographic binding:

$$\text{statementCommitment} = \text{SHA256}(\text{statementHash} \parallel \text{evidenceRoot})$$

- `statementHash`: SHA-256 digest of the canonical reconstructed statement (wallet, mint, timestamp, reconstructed units, active multiplier, completeness state).
- `evidenceRoot`: SHA-256 Merkle root of all contributing on-chain events.
- `statementCommitment`: 32-byte public key written to the Solana Devnet Anchor Program state.

This ensures:
1. An attacker cannot change a single transfer amount or multiplier event without altering `evidenceRoot`.
2. An attacker cannot alter the reconstructed balance without altering `statementHash`.
3. If either changes, the on-chain `statementCommitment` mismatches, failing on-chain and offline verifications.

---

## 6. Offline Independent Verifier (Checks 8 & 9)

Colophon's `@colophon/verifier` library enforces Merkle and commitment correctness completely offline:

- **Check 8 (`MERKLE_TREE_VALIDITY`)**: Computes the SHA-256 leaf hash for the target line-item event, walks the sibling proof path, and verifies convergence with `bundle.evidenceRoot`.
- **Check 9 (`STATEMENT_COMMITMENT_INTEGRITY`)**: Recomputes `SHA256(statementHash + evidenceRoot)` and verifies an exact character match against `bundle.statementCommitment`.
- **Check 10 (`COMPLETENESS_STATE_COHERENCE`)**: Validates that if the statement declares `COMPLETE`, the evidence manifest contains zero unverified intervals and all slot boundaries match the target timeline.

---

## 7. Adversarial Resilience Matrix

| Attack ID | Description | Defense Mechanism | Result |
| :--- | :--- | :--- | :--- |
| **B12** | Missing history declared as `COMPLETE` | Check 10 verifies slot boundary coverage and gap count | **REJECTED** |
| **B13** | Duplicate transaction injected into evidence | Evidence list deduplication and sequence monotonicity check | **REJECTED** |
| **B14** | Wrong mint signature bound to statement | Leaf schema validation matches target mint address | **REJECTED** |
| **B15** | Substituted evidence Merkle root | Check 9 binding fails: `SHA256(stmt:root) != commitment` | **REJECTED** |
| **B16** | Corrupted sibling proof hash | Check 8 proof path calculation fails to match `evidenceRoot` | **REJECTED** |
| **B17** | Mismatched engine version hash | Commitment digest binds canonical engine semver | **REJECTED** |
| **B18** | Split event shifted by 1 slot ($T$ vs $T-1$) | Mathematical interval algebra verifies exact slot bounds | **REJECTED** |
