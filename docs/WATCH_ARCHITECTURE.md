# COLOPHON STATEMENT WATCH ARCHITECTURE

## 1. Executive Summary

Static statements capture historical truth at a single discrete point in time. However, financial positions on Solana are continuous and dynamic:
1. New token transfers occur asynchronously.
2. Token-2022 `ScaledUiAmountConfig` updates or issuer stock splits modify asset multipliers.
3. Market valuations fluctuate, expanding absolute dollar divergence between naive readers and protocol-correct accounting.

**Statement Watch** is an autonomous Keeper monitoring layer integrated directly into Colophon. It continuously observes a wallet's on-chain state, tracks multiplier transitions, and guides the user through automated reconciliation and re-anchoring when state changes occur.

---

## 2. Watch Lifecycle State Machine

The watch session executes a deterministic finite state machine:

```
  +------------------+
  |     WATCHING     | <------------------------------------+
  +------------------+                                      |
           |                                                |
     (Event Detected: Transfer / Multiplier Split)          |
           v                                                |
  +------------------+                                      |
  |     CHANGED      |                                      |
  +------------------+                                      |
           |                                                |
     (Policy Threshold Met: > 0.001 units or Strict Mode)   |
           v                                                |
  +--------------------------+                              |
  | RECONCILIATION_REQUIRED  |                              |
  +--------------------------+                              |
           |                                                |
     (User / Keeper triggers Audit Review)                  |
           v                                                |
  +------------------+                                      |
  |      REVIEW      |                                      |
  +------------------+                                      |
           |                                                |
     (Devnet On-Chain Cryptographic Proof Anchored)         |
           v                                                |
  +------------------+                                      |
  |      ANCHOR      | -------------------------------------+
  +------------------+
```

### State Definitions

1. **`WATCHING`**: The Keeper is actively polling Solana RPC for account changes, new transaction signatures, or mint multiplier slot updates. The current statement matches on-chain truth.
2. **`CHANGED`**: An on-chain state change has been detected (e.g., multiplier incremented from 1.0 to 2.0). Raw balances or historical effective timelines have shifted.
3. **`RECONCILIATION_REQUIRED`**: The divergence or event triggers the active `WatchPolicy`. A new temporal statement must be computed and verified before the position can be considered audit-ready.
4. **`REVIEW`**: An interactive or headless diff view presenting the baseline divergence, new reconstructed units, economic impact, and updated Merkle evidence tree.
5. **`ANCHOR`**: The new statement commitment and evidence root are signed and submitted to Solana Devnet, establishing an immutable cryptographic anchor.

---

## 3. Watch Policies

Users and automated systems configure watch behavior using policies:

- **`STRICT` (Default)**: Any on-chain mutation—whether a tiny 0.000001 transfer or a scheduled multiplier update—immediately triggers `RECONCILIATION_REQUIRED`. Recommended for institutional audits, tax compliance, and court-admissible evidence.
- **`THRESHOLD`**: Reconciles only when cumulative balance divergence exceeds a configurable delta (e.g., > 1.0 unit or > \$10.00 USD value). Ideal for active trading portfolios.
- **`SCHEDULED`**: Accumulates events in a changelog and prompts reconciliation at scheduled intervals (e.g., daily close or monthly reporting boundaries).

---

## 4. Keeper Architecture & Implementation

The Statement Watch system is implemented in `@colophon/watch` and exposed to users via `apps/web/src/components/StatementWatch.tsx`.

### Core Components:

1. **Account Poller**: Monitors Solana RPC `getAccountInfo` and `getSignaturesForAddress` to identify new transactions since the statement's effective slot.
2. **Multiplier Observer**: Inspects the mint's Token-2022 extension accounts for newly queued or activated `ScaledUiAmountConfig` transitions.
3. **Reconciler (`evaluateWatchSession`)**:
   ```typescript
   export function evaluateWatchSession(
     session: WatchSession,
     currentState: {
       rawBalance: number;
       activeMultiplier: number;
       pricePerUnit?: number;
     }
   ): WatchEvaluation;
   ```
   Computes current divergence, calculates absolute/relative delta against the baseline, and returns the next state machine transition.

4. **Simulation Engine**:
   To enable instant demonstration and testing without waiting for mainnet corporate actions, users can trigger:
   - **Simulate Stock Split (2-for-1)**: Multiplies active multiplier by 2, causing immediate naive reader divergence and triggering `RECONCILIATION_REQUIRED`.
   - **Simulate Transfer (+50.0 Units)**: Simulates an incoming token transfer event and tests evidence tree regeneration.

---

## 5. UI Integration

On `/statement`, the Statement Watch panel appears directly above the on-chain anchor section:
- **Live Status Badge**: Visual indicator with pulsating radar (`WATCHING`), amber alert (`RECONCILIATION REQUIRED`), or green seal (`ANCHORED`).
- **Policy Selector**: Switch between `STRICT`, `THRESHOLD`, and `SCHEDULED`.
- **Divergence Metrics**: Live tracking of raw balance, active multiplier, baseline divergence, and economic impact.
- **Interactive Action**: One-click "Review & Reconcile" button that opens the reconciliation drawer and allows instantaneous re-anchoring to Solana Devnet.
