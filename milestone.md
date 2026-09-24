# COLOPHON — Milestones

## Milestone 0 — Gate 0 ✓
**Target**: Measure the divergence. Validate or disprove the thesis.
**Status**: COMPLETE
**Date**: 2026-09-24

Key deliverables:
- [x] Dollar Divergence Hunt run on mainnet
- [x] 2 measured divergences (OPENAI 48.6%, SPACEX 400%)
- [x] Dollar impact quantified ($1.2M + $4.1M supply-level)
- [x] GATE_0_REPORT.md written
- [x] All reference repos analyzed

## Milestone 1 — Foundation Kernel & Verification ✓
**Target**: Working temporal accounting kernel with invariant tests and verifier.
**Status**: COMPLETE
**Date**: 2026-09-24

Key deliverables:
- [x] packages/kernel with typed event algebra
- [x] MultiplierTimeline reconstruction & boundary resolution
- [x] OwnershipLedger at-timestamp query
- [x] Invariants I1–I10 tested (10/10 PASS)
- [x] Boundary lab (15/15 PASS in E2)
- [x] packages/chain read-only adapter
- [x] packages/instruments adapters (xStocks & PreStocks)
- [x] packages/proof bundle builder
- [x] packages/verifier with B1–B15 tamper campaign (11/11 PASS)
- [x] packages/watch reconciliation loop

## Milestone 2 — Chain + Scripts
**Target**: Real on-chain data flowing through the kernel.
**Status**: NOT STARTED

Key deliverables:
- Deep RPC pagination finding original multiplier update signatures
- Full xStocks universe scan
- Baseline benchmark (naive vs. correct)
- Evidence/runs/ populated with full scan

## Milestone 3 — Statement Product
**Target**: End-to-end human flow working.
**Status**: NOT STARTED

Key deliverables:
- /statement page serving real reconstruction
- /board showing live discovered instruments
- /lab with date scrubber
- Export (JSON, CSV, proof bundle)

## Milestone 4 — Proof System
**Target**: Tamper campaign passing, verifier working.
**Status**: NOT STARTED

Key deliverables:
- B1–B15 tamper attacks all detected
- Offline verifier CLI
- Online anchor verifier
- /proof page populated from evidence/

## Milestone 5 — Submission
**Target**: Judge-ready product.
**Status**: NOT STARTED

Key deliverables:
- README (judge-first)
- Demo video (~3 min)
- All QA passing
- Lighthouse scores within target
- Deployed to Vercel
