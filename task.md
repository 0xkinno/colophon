# COLOPHON — Task List

## PHASE 0 — RESEARCH

- [x] Read COLOPHON_STOCKLANA_FINAL_AGENT_INSTRUCTION.md completely
- [x] Create directory structure (docs/, evidence/, scripts/, packages/, apps/, reference/)
- [x] Clone all 10 reference repositories
- [x] Run rg pattern search across all repos (ScaledUiAmount, UpdateMultiplier, Pyth, PreStocks, proof, benchmark, invariant)
- [x] Read rung/packages/sdk/src/token2022.ts — confirmed exact mechanism
- [x] Read rung/packages/sdk/src/prestocks.ts — confirmed PreStocks integration
- [x] Read rung/packages/sdk/test/token2022.test.ts — confirmed OPENAI fixture
- [x] Read rung/docs/limitations.md — confirmed issuer powers + stale multiplier reference
- [x] Read rambu/keeper/fairprice.ts — confirmed multiplierAt logic + xStocks universe
- [x] Read canon/README.md — absorbed proof methodology pattern
- [x] Write scripts/dollar-divergence-hunt.mjs (E1.5 experiment)
- [x] Write scripts/fetch-price-context.mjs (price enrichment)
- [x] Run E1.5 Dollar Divergence Hunt on Solana mainnet
  - [x] OPENAI: 48.6% divergence MEASURED
  - [x] SPACEX: 400% divergence MEASURED
  - [x] 6 no-divergence cases recorded
- [x] Run price context fetch
  - [x] OPENAI dollar delta: $1,210,389.59 MEASURED
  - [x] SPACEX dollar delta: $4,055,186.90 MEASURED
- [x] Run E1: Historical multiplier recovery (scripts/e1-historical-recovery.mjs)
- [x] Run E2: Semantic boundary lab — 15/15 PASS (scripts/e2-semantic-lab.mjs)
- [x] Run E3: Dividend reconciliation (scripts/e3-e4-e5-chain.mjs)
- [x] Run E4: Current-tool baseline (scripts/e3-e4-e5-chain.mjs)
- [x] Run E5: Issuer-action attribution (scripts/e3-e4-e5-chain.mjs)
- [x] Run E6: Pyth feasibility test (scripts/e6-pyth-feasibility.mjs)
- [x] Run E7: PreStocks feasibility test — 8/8 gates PASS (scripts/e7-prestocks-feasibility.mjs)
- [x] Write docs/DISCOVERY.md
- [x] Write docs/COMPETITOR_DELTA.md
- [x] Write docs/GATE_0_REPORT.md
- [x] Initialize git repository
- [x] Commit Phase 0 evidence

## GATE 0 — STOP ✓

**Gate 0 passed. Two material divergences measured. Thesis validated.**

---

## PHASE 1 — FOUNDATION ✓

- [x] Initialize monorepo (pnpm workspaces)
- [x] packages/kernel — temporal accounting kernel (TypeScript, no Next.js dependency)
  - [x] ChainEvent types (TypeScript discriminated union)
  - [x] MultiplierInterval type
  - [x] EventStream (ordered, deduplication)
  - [x] MultiplierTimeline (reconstructs from events)
  - [x] OwnershipLedger (time-indexed raw balance)
  - [x] StatementKernel (as-of holdings, change explanation)
  - [x] ProofBundle (manifest, hashes, source anchors)
  - [x] Invariants: I1–I10 (determinism, traceability, etc. — 10/10 PASS)
- [x] packages/chain — Solana read-only chain adapter
  - [x] getAccountInfo with retries + pagination
  - [x] getSignaturesForAddress with before: pagination
  - [x] getTransaction (parsed)
  - [x] Partial-history detection
  - [x] RPC failure handling (PARTIAL / UNKNOWN / RATE_LIMIT)
- [x] packages/instruments — instrument universe adapter
  - [x] xStocks adapter (api.xstocks.fi)
  - [x] PreStocks adapter (prestocks.com/api/prestocks)
  - [x] Mint state reader
- [x] packages/verifier — offline + online verification
  - [x] Schema validation
  - [x] Hash verification
  - [x] Deterministic reconstruction check
  - [x] Chain anchor re-fetch
  - [x] Tamper detection suite (B1–B15 attacks — 11/11 PASS)
- [x] packages/proof — proof bundle builder
  - [x] Manifest generation
  - [x] Source anchors
  - [x] Statement hash (deterministic)
  - [x] Bundle hash
- [x] packages/watch — background reconciliation loop

## PHASE 2 — CHAIN INGESTION

- [ ] scripts/discover-universe.ts
- [ ] scripts/fetch-history.ts (deep RPC pagination)
- [ ] scripts/classify-scaled-updates.ts
- [ ] scripts/build-timelines.ts
- [ ] scripts/scan-divergence.ts
- [ ] scripts/reconcile-dividends.ts
- [ ] scripts/benchmark-baseline.ts
- [ ] scripts/verify-bundle.ts

## PHASE 3 — STATEMENT PRODUCT (apps/web)

- [ ] Next.js app setup
- [ ] / — Landing page
- [ ] /statement — Historical ownership statement
- [ ] /board — Instrument discovery
- [ ] /lab — Interactive primitive explorer
- [ ] /proof — Evidence, tamper campaign, claims

## PHASE 4 — PROOF SYSTEM

- [ ] Baseline benchmark (naive current-multiplier)
- [ ] Negative control (shuffled timestamps)
- [ ] Tamper campaign (B1–B15)
- [ ] Claim ledger from evidence/
- [ ] Offline verifier CLI
- [ ] Online chain anchor verifier

## PHASE 5 — UI POLISH

- [ ] Typography (Boska + General Sans + JetBrains Mono)
- [ ] Color system (Paper #F1F0EB etc.)
- [ ] Hero composition (two-halves line)
- [ ] Timeline scrubber
- [ ] Framer Motion animations
- [ ] Hero image generation

## PHASE 6 — QA

- [ ] npm run typecheck
- [ ] npm run build
- [ ] npm test
- [ ] npm run verify
- [ ] npm run benchmark
- [ ] Playwright responsive QA
- [ ] Lighthouse performance check
- [ ] Tamper test
- [ ] README (judge-first format)

---

## Status: Gate 0 PASSED → Ready for Phase 1
