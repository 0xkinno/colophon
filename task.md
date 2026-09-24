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
- [x] Write docs/DISCOVERY.md
- [x] Write docs/COMPETITOR_DELTA.md
- [x] Write docs/GATE_0_REPORT.md
- [x] Initialize git repository
- [x] Commit Phase 0 evidence

## GATE 0 — STOP ✓

**Gate 0 passed. Two material divergences measured. Thesis validated.**

---

## PHASE 1 — FOUNDATION

- [ ] Initialize monorepo (pnpm workspaces)
- [ ] packages/kernel — temporal accounting kernel (TypeScript, no Next.js dependency)
  - [ ] ChainEvent types (TypeScript discriminated union)
  - [ ] MultiplierInterval type
  - [ ] EventStream (ordered, deduplication)
  - [ ] MultiplierTimeline (reconstructs from events)
  - [ ] OwnershipLedger (time-indexed raw balance)
  - [ ] StatementKernel (as-of holdings, change explanation)
  - [ ] ProofBundle (manifest, hashes, source anchors)
  - [ ] Invariants: I1–I10 (determinism, traceability, etc.)
- [ ] packages/chain — Solana read-only chain adapter
  - [ ] getAccountInfo with retries + pagination
  - [ ] getSignaturesForAddress with before: pagination
  - [ ] getTransaction (parsed)
  - [ ] Partial-history detection
  - [ ] RPC failure handling (PARTIAL / UNKNOWN)
- [ ] packages/instruments — instrument universe adapter
  - [ ] xStocks adapter (api.xstocks.fi)
  - [ ] PreStocks adapter (prestocks.com/api/prestocks)
  - [ ] Mint state reader
- [ ] packages/verifier — offline + online verification
  - [ ] Schema validation
  - [ ] Hash verification
  - [ ] Deterministic reconstruction check
  - [ ] Chain anchor re-fetch
- [ ] packages/proof — proof bundle builder
  - [ ] Manifest generation
  - [ ] Source anchors
  - [ ] Statement hash (deterministic)
  - [ ] Bundle hash

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
