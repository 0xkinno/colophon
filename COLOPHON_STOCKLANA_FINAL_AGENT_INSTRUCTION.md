# COLOPHON — STOCKLANA FINAL AGENT BUILD INSTRUCTION

## 0. Mission

You are the primary implementation agent for **COLOPHON**.

Read these files before changing architecture or writing substantial code:

1. `NEW_INSTRUCTION.MD` — PRIMARY BUILD METHODOLOGY.
2. `Enhanced_buildrules.md` — SECONDARY PRODUCT / FOUNDER / JUDGE / UX METHODOLOGY.
3. `stocklana_instruction.md` — current Colophon execution specification.

Do not simplify the thesis because implementation is difficult or because a feature is unfamiliar.

The objective is not "more features".

The objective is:

> Find a non-obvious Solana/tokenized-stock infrastructure contradiction, measure it on real chain data, build the smallest complete human product that solves it, make the mechanism deterministic, attack it deliberately, and produce reproducible proof that a judge can understand in 20 seconds.

Primary build pattern:

```text
HACKATHON THEME
→ TARGET HUMAN
→ REPETITIVE / PAINFUL TASK
→ AUTONOMOUS BACKGROUND LOOP
→ HUMAN DECISION POINT
→ REAL PRODUCT OUTCOME
→ SPONSOR PRIMITIVE
→ FOUNDING TECHNICAL CONSTRAINT
→ DEEP MECHANISM
→ PROOF / BREAK CAMPAIGN
```

The final product must be both:

- **deep infrastructure**
- **complete human product**

Never choose one at the expense of the other.

---

# 1. DECISION

## Proceed with Colophon, but do NOT ship the current thesis unchanged.

The existing Colophon idea is strong enough to become a serious StockLana contender, but its current form has one competitive weakness:

It explains a subtle Token-2022 temporal/accounting problem very well, yet it must produce a **measured, dollarized, reproducible failure** as concrete as the strongest competing research builds.

The required upgrade is:

### COLOPHON 2.0

> **A temporal ownership record for tokenized stocks that reconstructs what a holder actually owned at any moment, explains why the displayed amount changed, detects economically material multiplier divergence, and exports a portable proof receipt that anyone can independently verify.**

The hard primitive remains:

**Token-2022 `ScaledUiAmountConfig` and its time-dependent multiplier semantics.**

Do not replace the core with an unrelated trading app.

Do not turn Colophon into a generic portfolio tracker.

Do not turn it into a charting terminal.

Do not add features simply to look large.

---

# 2. THE FOUNDER INSIGHT

The hard contradiction is:

```text
Raw token amount
does not change

while

the human-facing token quantity
can change over time
because the multiplier changes.
```

A normal wallet can show a correct current display while providing a poor historical record.

The important question is not:

> "What is my balance now?"

It is:

> "What did I own at timestamp T, under the exact multiplier that applied at that time, and can I prove how we reconstructed it?"

That distinction is the foundation.

The product therefore treats ownership as a **time-indexed state reconstruction problem**.

---

# 3. COMPETITIVE UPGRADE REQUIRED

Rung's strongest pattern is not merely that it has a polished app.

Its important advantage is that it discovered a concrete real-world failure and quantified the impact.

Colophon must match that proof style.

## Required new experiment: DOLLAR DIVERGENCE HUNT

Build a scanner over real tokenized-stock / eligible PreStocks mints that:

1. Enumerates real instruments.
2. Reads current Token-2022 mint state.
3. Finds real multiplier update instructions from chain history.
4. Reconstructs the exact timeline.
5. Finds records where:
   - `current multiplier != effective scheduled multiplier`
   - the effective timestamp has passed
   - the stale/current display would create a materially different unit/share interpretation.
6. Cross-checks against relevant price / supply context where available.
7. Produces a concrete impact number.
8. Saves:
   - mint
   - symbol
   - raw amount
   - old multiplier
   - new multiplier
   - effective timestamp
   - relevant transaction signature
   - slot
   - estimated economic delta
   - source category
   - exact reproduction command

Do not invent a headline.

The experiment either finds a real divergence or it does not.

### Desired proof statement shape

```text
On <date/time>, instrument <SYMBOL> had:
raw units = X
multiplier = A
scheduled multiplier = B
effective at = T

A naive current-state interpretation would produce Y units.
Time-indexed reconstruction produces Z units.

Difference = D units
Estimated economic effect = $E

Evidence:
signature ...
slot ...
verifier ...
```

If a real economically large example appears, elevate it to the README and video.

If the largest measured divergence is small, report it honestly.

A small true result is stronger than a fabricated dramatic result.

---

# 4. DO NOT OVERCLAIM

Never say:

- "wallets are wrong"
- "everyone gets this wrong"
- "no other tool can do this"
- "this is impossible"
- "this is the first"
- "this is the only solution"

unless an experiment proves the exact statement.

Use precise language:

- "current-state displays can erase historical multiplier context"
- "Colophon reconstructs the historical state from on-chain events"
- "the benchmark found..."
- "the following divergence was measured..."
- "the control failed because..."

All claims in README and UI must originate in `evidence/` artifacts.

---

# 5. PRODUCT THESIS

## Target human

Primary:

**A tokenized-stock holder who needs to understand or prove their historical ownership.**

Secondary:

- accountant
- tax preparer
- lender / collateral reviewer
- portfolio operator
- power user
- protocol researcher
- data / compliance analyst

Do not build for "everyone".

## Pain

A wallet can tell someone how many token units they appear to own now.

It does not automatically give them:

- historical state
- multiplier history
- issuer-action context
- reconstructed ownership at a prior timestamp
- portable evidence of how that number was obtained

## Product outcome

Colophon produces:

> **A time-indexed statement of record for tokenized-stock ownership, backed by raw chain evidence and a portable verification bundle.**

---

# 6. 20-SECOND JUDGE EXPERIENCE

The landing page and demo must make this obvious:

### 0–5 seconds

**"Your token balance can change without your raw token balance changing."**

### 5–10 seconds

**"Colophon reconstructs what you actually owned at any past moment."**

### 10–15 seconds

Show a real instrument:

```text
SPYx
RAW TOKENS          100.0000
MULTIPLIER @ DATE     1.0372
OWNED SHARES         103.7200
```

Move the date.

The answer changes.

### 15–20 seconds

Show:

```text
CHAIN EVIDENCE
✓ multiplier update
✓ effective timestamp
✓ transaction signature
✓ deterministic reconstruction

VERIFY OFFLINE
```

Then say:

> "It is a brokerage-style statement for tokenized stocks, reconstructed from Solana."

---

# 7. THE CORE MACHINE

Architecture must become:

```text
SOLANA
  │
  ├── raw token transactions
  ├── mint state
  ├── multiplier updates
  ├── issuer actions
  └── source timestamps
        │
        ▼
EVENT INGESTION
        │
        ▼
NORMALIZED EVENT ALGEBRA
        │
        ▼
TIME-INDEXED LEDGER
        │
        ├── raw units
        ├── multiplier state
        ├── effective timestamp
        ├── ownership transitions
        └── issuer actions
        │
        ▼
INSTRUMENT ADAPTER
        │
        ├── xStocks
        └── PreStocks (only if eligibility + fit checks pass)
        │
        ▼
STATEMENT KERNEL
        │
        ├── as-of holdings
        ├── change explanation
        ├── event attribution
        └── economic context
        │
        ▼
PROOF BUNDLE
        │
        ├── manifest
        ├── source anchors
        ├── hashes
        ├── reconstruction output
        └── verifier metadata
        │
        ├───────────────┐
        ▼               ▼
HUMAN PRODUCT       VERIFICATION
Statement           Offline CLI
Board               Online chain anchor check
Lab                 Tamper detection
Watch               Benchmark reproduction
```

---

# 8. DEEPEST TECHNICAL MECHANISM

Do not implement this as a loose collection of helpers.

Create a real temporal accounting kernel.

Recommended pipeline:

```text
Raw Chain Event
→ Typed Event
→ Ordered Event Stream
→ Clock Interpretation
→ Multiplier Timeline
→ Ownership Ledger
→ Instrument Semantics
→ Statement
→ Proof Receipt
```

The kernel must be deterministic.

Same inputs must always produce exactly the same normalized output.

---

# 9. DATA MODEL

Use strongly typed schemas.

Suggested event family:

```ts
type ChainEvent =
  | TransferEvent
  | MultiplierScheduledEvent
  | MultiplierActivatedEvent
  | IssuerActionEvent
  | MetadataEvent
  | UnknownEvent;
```

Suggested multiplier object:

```ts
type MultiplierInterval = {
  effectiveAt: bigint;
  multiplierNumerator: bigint;
  multiplierDenominator: bigint;
  sourceSignature: string;
  sourceSlot: bigint;
  confidence: "MEASURED" | "UNKNOWN";
};
```

Retain:

- raw integers
- exact timestamps
- signatures
- slots
- instruction indexes where useful
- original source bytes / decoded values
- canonical JSON

Do NOT immediately convert all arithmetic to floating point.

You must preserve exact raw state.

When reproducing Solana program UI conversion behavior, explicitly isolate the floating-point / display conversion boundary and test its rounding behavior.

---

# 10. HARD INVARIANTS

At minimum implement and test:

### I1 — Determinism

Same evidence bundle => same normalized timeline.

### I2 — Source traceability

Every multiplier state must point to a chain source.

### I3 — Temporal boundary

The exact effective timestamp rule must be explicit and tested.

### I4 — No invented history

If a history segment is not recoverable, return `UNKNOWN` or `INCOMPLETE`.

Never interpolate silently.

### I5 — Raw balance conservation

Raw token movements must reconcile with source transactions.

### I6 — Timeline monotonicity

Reconstructed multiplier transitions must be ordered by chain evidence and effective time.

### I7 — Current-state agreement

At current time, reconstructed multiplier must agree with live mint state where data is complete.

### I8 — Proof determinism

Statement hash and proof bundle hash must be deterministic.

### I9 — Privacy / key safety

No seed phrase, private key, wallet signing, or secret import.

### I10 — Evidence-label integrity

Every value in the product is classified:

```text
MEASURED
REPLAYED
SYNTHETIC
OFFCHAIN
UNKNOWN
INCOMPLETE
```

No other status labels.

---

# 11. EXACT BOUNDARY TESTS

Build a deterministic lab for:

1. Before effective timestamp.
2. Exactly at effective timestamp.
3. One second after effective timestamp.
4. Schedule A then schedule B before A activates.
5. Schedule B after A activates.
6. Large raw amounts.
7. Fractional / difficult multiplier representation.
8. Rounding.
9. Overflow boundaries.
10. Missing transaction history.
11. Deleted / corrupted evidence.
12. Unknown instruction.
13. Reordered timestamps.
14. Duplicate events.
15. duplicate transaction replay.

Record the results in:

```text
evidence/semantic_lab/
```

Do not merely unit-test helpers.

The lab should demonstrate the actual semantic edge cases that shape the product.

---

# 12. HISTORICAL RECONSTRUCTION EXPERIMENT

Build a reproducible scanner.

Suggested script family:

```text
scripts/
  discover-universe.ts
  fetch-history.ts
  classify-scaled-updates.ts
  build-timelines.ts
  scan-divergence.ts
  reconcile-dividends.ts
  benchmark-baseline.ts
  verify-bundle.ts
```

Each script must output machine-readable artifacts.

Example:

```text
evidence/runs/<run-id>/
  run_manifest.json
  universe.json
  transactions.jsonl
  multiplier_timelines.json
  divergence_cases.json
  benchmark.json
  claims.json
```

Every result must include:

```json
{
  "runId": "...",
  "gitCommit": "...",
  "toolchain": "...",
  "rpcSource": "...",
  "timestamp": "...",
  "inputs": [],
  "outputs": [],
  "claims": []
}
```

---

# 13. COMPETITOR / BASELINE BENCHMARK

Do not only compare screenshots.

Compare mechanisms.

Create a baseline that intentionally ignores historical multiplier context.

Example:

```text
BASELINE
current multiplier applied to all historical records
```

Then:

```text
COLOPHON
timestamp-aware multiplier timeline
```

Also create a negative control:

```text
CONTROL
shuffle / corrupt effective timestamps
```

The expected behavior is:

```text
Baseline:
can produce historical misstatement.

Colophon:
reduces / removes the misstatement when complete evidence exists.

Corrupted control:
must worsen or fail reconstruction.
```

Pre-register the metric before reading the final result.

Do not select whichever metric makes the graph look best.

---

# 14. DIVIDEND / ECONOMIC RECONCILIATION

Investigate whether observed multiplier changes correlate with issuer distribution / dividend events.

Do NOT force the interpretation.

Calculate:

```text
implied_change =
(newMultiplier / oldMultiplier) - 1
```

Then compare with relevant issuer action / dividend evidence.

Possible outcomes:

### A. Strong agreement

Treat as one evidence layer.

### B. Weak / mixed agreement

Call it:

> "net multiplier / issuer-state change"

not "dividend reconstruction".

### C. No meaningful relationship

Remove dividend claims from the headline.

The product can still be valuable.

---

# 15. ISSUER-ACTION ATTRIBUTION

Where issuer controls are available, capture:

- multiplier changes
- pause state
- permanent delegate / issuer authority context
- relevant token configuration state

Do not infer intent.

The statement should say:

```text
Issuer action detected
Source: ...
Time: ...
Observed state change: ...
Economic interpretation: ...
```

Never:

```text
Issuer intentionally ...
```

unless there is a direct source that says so.

---

# 16. PRESTOCKS TRACK DECISION

### We should NOT discard PreStocks automatically.

The official StockLana bounty requires use of PreStocks for that bounty and says non-PreStocks pre-IPO tokens make a project ineligible for the PreStocks track.

A major strategic opportunity is that the **same temporal multiplier primitive appears relevant to both public tokenized stocks and PreStocks.**

Therefore perform this exact gate:

## E-PRESTOCKS FIT TEST

1. Confirm official current PreStocks eligibility requirements.
2. Identify at least one real PreStock instrument using `ScaledUiAmount`.
3. Run the same timeline reconstruction.
4. Demonstrate the same kernel works without cloning a separate application architecture.
5. Add a small instrument adapter rather than a new product.
6. Clearly distinguish:
   - public-stock shares
   - private-company economic exposure / token units
7. Confirm the project does NOT integrate a non-PreStocks pre-IPO token that would violate the bounty rule.
8. Record eligibility evidence.

### If all pass:

Enter:

- Main Track
- PreStocks Track

### If any fail:

Do not claim PreStocks eligibility.

Do not weaken the primary product merely to chase the bounty.

---

# 17. PRESTOCKS PRODUCT SURFACE

Do not call a PreStock token a legal share.

For PreStocks, use terminology like:

```text
TOKEN UNITS
ECONOMIC EXPOSURE
REFERENCE VALUATION
```

For xStocks:

```text
SHARES / TOKENIZED STOCK UNITS
```

The same temporal kernel can power both.

This makes the architecture stronger:

```text
ONE TEMPORAL ENGINE
        │
        ├── PUBLIC EQUITY ADAPTER
        └── PRE-IPO EXPOSURE ADAPTER
```

This is far better than making two unrelated products.

---

# 18. PYTH TRACK

Do not build around Pyth unless the experiment proves meaningful centrality.

Current Pyth historical-data APIs require authenticated access.

Therefore:

```text
E6 = historical / point-in-time Pyth feasibility test
```

Test:

1. exact required feed
2. point-in-time query
3. historical data access
4. latency
5. attribution
6. server-side security
7. whether Pyth genuinely changes the product outcome

### If E6 passes:

Pyth can provide:

- historical economic context
- point-in-time valuation
- current xStock vs underlying context
- benchmark evidence

### If E6 fails:

Do not force the track.

Do not make Pyth a decorative API call.

---

# 19. OTHER TRACKS

Do NOT chase:

### Tessera

Unless a genuinely central Kalshi / OpenAI T-Token problem emerges from the research.

### Clawpump

No generic launch just to qualify.

### Meteora

No DBC / pool engineering unless the core thesis genuinely becomes a market mechanism.

The deepest alignment is:

```text
MAIN TRACK
+
PRESTOCKS (if E-PRESTOCKS passes)
+
PYTH (if E6 passes)
```

One core mechanism should support all claimed tracks.

---

# 20. PORTABLE PROOF RECEIPT

Build a proof artifact.

Example:

```text
Colophon Proof Receipt
----------------------
instrument: SPYx
wallet: ...
asOf: ...
rawAmount: ...
multiplier: ...
displayedUnits: ...

sourceEvents:
  - signature ...
  - signature ...

statementHash: ...
bundleHash: ...

verification:
  offline: PASS
  chainAnchor: PENDING / PASS
```

The verifier must support:

### Mode A — Offline

Verify:

- schema
- event ordering
- hashes
- deterministic reconstruction
- statement hash
- bundle hash

### Mode B — Online anchor verification

Re-fetch the cited Solana transaction/account evidence and confirm the bundle's source anchors.

Do not call offline verification proof of external truth.

State precisely:

> Offline verification proves bundle integrity and deterministic reconstruction. Online anchor verification independently checks the cited chain sources.

That distinction matters.

---

# 21. TAMPER CAMPAIGN

Build an explicit break lab.

The product should deliberately attack its own receipts.

Required attacks:

```text
B1  edit multiplier
B2  edit effective timestamp
B3  delete source transaction
B4  change statement output
B5  reorder events
B6  duplicate an event
B7  change wallet
B8  corrupt slot
B9  remove source anchor
B10 fabricate an unknown event
B11 RPC history gap
B12 issuer-state mismatch
B13 precision / rounding edge
B14 stale-current-multiplier baseline
B15 timestamp permutation control
```

For each:

```text
ATTACK
EXPECTED DETECTION
ACTUAL RESULT
EVIDENCE
```

---

# 22. OPTIONAL BUT HIGH-VALUE PRODUCT LOOP: STATEMENT WATCH

Add a recurring background reconciliation loop ONLY if it uses the same kernel.

Concept:

```text
User selects / provides a public wallet
        ↓
Watch job
        ↓
Detect relevant chain change
        ↓
Re-run temporal reconstruction
        ↓
Generate Ownership Delta
        ↓
Human sees:
"Your record changed"
        ↓
"What changed?"
        ↓
"Why?"
        ↓
"Verify"
```

This satisfies the background-loop pattern without becoming an unrelated alert product.

The watch engine must reuse the statement kernel.

No second accounting logic.

No secret keys.

No transaction signing.

Use the cheapest reliable scheduler available and document its actual cadence.

A demo watchlist is acceptable for the public demo, but do not misrepresent it as production-scale monitoring.

---

# 23. PRODUCT ROUTES

Minimum:

```text
/
 /statement
 /board
 /lab
 /proof
```

Optional:

```text
 /watch
 /verify
```

## `/`

Landing page.

Must explain the contradiction visually.

## `/statement`

The core human product.

User chooses:

- instrument
- wallet
- date

Then sees:

```text
AS OF
RAW TOKENS
MULTIPLIER
RECONSTRUCTED UNITS
CHANGES
ISSUER ACTIONS
SOURCE EVIDENCE
```

Export:

- JSON
- CSV
- HTML
- proof bundle

## `/board`

Live instrument discovery.

Real discovered tokens only.

Examples may include:

```text
AAPLx
NVDAx
TSLAx
SPYx
```

but never hardcode them as fake data.

Populate from the discovery universe.

## `/lab`

The founder primitive.

Show:

```text
Raw Amount
Timeline
Multiplier
Clock
Result
```

Include a date scrubber.

## `/proof`

Show:

- benchmark
- tamper campaign
- claim ledger
- run manifests
- reproducibility
- limitations

---

# 24. UI DIRECTION

The product must feel like:

**premium financial journal + technical instrument + archival record**

Not:

- crypto dashboard
- generic SaaS
- default Tailwind template
- neon Web3
- cluttered terminal
- dashboard-card grid everywhere

Use the best design principles from the Residual and Honio references, but do not clone them.

The visual system should combine:

### Residual-inspired

- editorial spacing
- large typography
- paper-like surface
- information hierarchy
- visual restraint

### Honio-inspired

- premium art direction
- strong cinematic object imagery
- large visual moments
- luxury composition
- confident branding

### Colophon-specific

- archival paper
- financial record
- letterpress / ledger character
- measured technical details
- time-axis visual language

---

# 25. COLOR SYSTEM

Light-first.

Use approximately:

```text
Paper:          #F1F0EB
Sheet:          #F8F7F3
Ink:            #16181D
Soft:           #565B63
Rule:           #CFCCC2
Prussian:       #24466B
Verified:       #2F7A5B
Pending:        #B9822B
Breach:         #A3332B
```

Avoid a generic purple SaaS aesthetic.

Do not default to gradients.

Use subtle depth through:

- paper texture
- rules
- shadow
- typography
- motion
- photographic depth

---

# 26. TYPOGRAPHY

Use premium fonts.

Preferred:

```text
Boska
General Sans
JetBrains Mono
```

Use local font files supplied by the human.

Suggested hierarchy:

```text
Display:
Boska

Interface:
General Sans

Numerical / evidence:
JetBrains Mono
```

Never use the technical monospace font for long prose.

Never use a generic system font as the primary brand typeface unless font loading fails safely.

---

# 27. HERO COMPOSITION

Main visual idea:

## "THE TWO-HALVES LINE"

Left:

```text
RAW BALANCE
──────────────
──────────────
──────────────
```

Right:

```text
MULTIPLIER
───────┐
       │
       └───────
```

Then:

```text
SHARES = RAW BALANCE × MULTIPLIER
```

A date scrubber moves through the timeline.

As the date changes:

- multiplier updates
- reconstructed units update
- source event changes
- proof state updates

This is the single best visual explanation of the product.

Do not bury the mechanism under marketing copy.

---

# 28. LANDING PAGE STRUCTURE

1. Hero
2. "A balance is not a timeline"
3. Live example
4. How reconstruction works
5. Real chain evidence
6. Proof / tamper section
7. Supported instruments
8. Product CTA

Then the dashboard.

---

# 29. IMAGE GENERATION SUB-PROMPT

Use generated imagery only as atmospheric product art.

Prompt direction:

```text
Create a cinematic editorial still-life for a premium financial infrastructure product called Colophon.

Scene:
a beautifully arranged archival ledger, accounting paper, brass measuring instrument,
mechanical tally counter, subtle token-like metallic discs, and a precise horizontal
timeline mark.

Aesthetic:
high-end financial magazine photography,
Japanese / Swiss editorial restraint,
luxury paper texture,
warm ivory paper,
soft directional studio light,
deep controlled shadows,
subtle brass and dark blue accents,
extremely clean composition,
photorealistic materials,
cinematic depth,
premium art direction.

Composition:
place the main physical objects toward the far right / lower-right,
leaving large quiet negative space on the left and upper-left for typography.

No text.
No logos.
No fake UI.
No crypto symbols.
No coins with dollar signs.
No neon.
No purple SaaS glow.
No people or faces unless specifically required.
No visual element may collide with headline space.

Aspect ratio:
wide cinematic landing-page hero.

The image must feel like the cover image of an elite financial research journal,
not a generic startup landing page.
```

For secondary scenes:

```text
letterpress printing press
brass verification seal
archival ledger close-up
technical measurement instrument
```

All must maintain the same visual world.

---

# 30. MOTION

Use Framer Motion / `motion`.

Do NOT animate everything.

Required motion:

1. First-load tally / accounting seam.
2. Timeline scrubber interaction.
3. Chart draw when evidence enters viewport.
4. Proof bundle assembly.
5. Small hover depth on instrument cards.

Do NOT use endless:

```text
fade-up
fade-up
fade-up
fade-up
```

Motion must explain state.

Use reduced-motion fallback.

---

# 31. RESPONSIVE QA

Use Playwright Chromium.

Required viewports:

```text
iPhone SE
iPhone 14 Pro
Pixel 7
Galaxy S9+
iPad Mini
iPad Pro 11
1280x720
1440x900
1920x1080
2560x1440
```

Check:

- no horizontal overflow
- no text collisions
- no image collisions
- no clipped timeline
- no table overflow outside container
- no button overlap
- 44px minimum touch targets
- keyboard focus visible
- correct safe-area behavior
- readable evidence hashes
- mobile statement tables scroll correctly
- images do not cover the headline
- font loading does not shift layout
- reduced motion works

Capture screenshots.

---

# 32. PERFORMANCE

Target:

```text
CLS < 0.02
LCP < 3s
```

Use:

- AVIF / WebP
- next/image
- LQIP where appropriate
- local font loading
- lazy secondary imagery

Never sacrifice evidence readability for decorative effects.

---

# 33. REPO HEADSTART

Do not begin from an empty folder if a sample provides useful structure.

Clone the following into `reference/` or a sibling workspace for inspection:

```bash
git clone https://github.com/PugarHuda/rambu.git reference/rambu
git clone https://github.com/Datwebguy/openstock.git reference/openstock
git clone https://github.com/cryptoduke01/hanko.git reference/hanko
git clone https://github.com/ritesh59697/stocklana-fantasy.git reference/stocklana-fantasy
git clone https://github.com/manuelfeb056-max/stocknine-terminal.git reference/stocknine-terminal
git clone https://github.com/mpotter2002/stocklana.git reference/stocklana
git clone https://github.com/Enoch208/canon.git reference/canon
git clone https://github.com/winsznx/night-shift.git reference/night-shift
git clone https://github.com/solana-foundation/mosaic.git reference/mosaic
```

Also inspect:

```text
https://github.com/0xileri/rung
https://github.com/solana-program/token-2022
```

Reference rule:

> Study architecture, proof strategy, testing patterns, UX structures and failure discoveries. Do not blindly copy code, branding, text or claims.

Before reusing source code from any repository, check its license.

---

# 34. WHAT TO TAKE FROM EACH SAMPLE

## Rung

Take:

- concrete real-world failure discovery
- exact economic consequence
- mainnet-fork thinking
- permission / issuer-power analysis
- proof artifacts

Do not turn Colophon into a commitment curve.

## OpenStock

Take:

- live xStock universe
- issuer identity
- market context
- clean market navigation

Do not become another market dashboard.

## Rambu

Take:

- Pyth + xStocks integration
- multiplier analysis
- dividend reconciliation
- risk / fairness framing

Do not duplicate its FairPrice product.

## Hanko

Take:

- explicit invariant
- conservation reasoning
- clear financial framing
- proof anchor pattern

## Night Shift

Take:

- deterministic safety kernel
- specialist components
- state + evidence separation
- break campaign
- exactly-once / idempotency mentality

## Canon

Take:

- discovery before product
- baseline versus intervention
- random / negative control
- claim ledger
- reproducibility
- proof-first README

## Mosaic / Token-2022

Take:

- exact protocol semantics
- source-of-truth program behavior
- extension constraints
- real implementation details

---

# 35. PHASE 0 — RESEARCH

Do not write product UI before Phase 0 is complete.

Create:

```text
docs/DISCOVERY.md
docs/COMPETITOR_DELTA.md
evidence/
task.md
progress.md
milestone.md
```

Record:

- exact problem
- exact mechanism
- exact source
- exact unknowns
- exact experiments
- competitor strengths
- competitor gaps
- claim status

---

# 36. PHASE 0 EXPERIMENTS

Run:

```text
E1  historical multiplier recovery
E1.5 dollar divergence hunt
E2  semantic boundary lab
E3  dividend / issuer-event reconciliation
E4  current-tool baseline
E5  issuer-action attribution
E6  Pyth feasibility
E7  PreStocks feasibility
```

Each gets:

```text
question
hypothesis
method
input
output
result
claim
limitations
reproduction
```

---

# 37. GATE 0

STOP after research.

Generate:

```text
docs/GATE_0_REPORT.md
```

It must state:

### What is proven?

### What is unknown?

### What survived disproof?

### What failed?

### What product must now exist because of the evidence?

Do not change the thesis based on intuition alone.

If the core discovery is falsified, pivot honestly.

---

# 38. PHASE 1 — FOUNDATION

Build:

```text
packages/kernel
packages/verifier
packages/chain
packages/instruments
packages/proof
packages/watch
```

Recommended:

```text
apps/web
scripts
evidence
docs
```

Keep the kernel independent of Next.js.

The web app must consume a real library.

---

# 39. PHASE 2 — CHAIN INGESTION

Build real read-only chain ingestion.

The source adapter must support:

- RPC URL
- retries
- pagination
- transaction parsing
- source preservation
- partial-history detection

Every network call must record enough metadata for reproduction.

Do not hardcode current data into production files.

Never fake chain values.

---

# 40. RPC / NETWORK FAILURE

The system must handle:

```text
RPC timeout
RPC rate limit
partial history
missing block timestamp
unparseable instruction
unknown instruction
```

The correct behavior is:

```text
PARTIAL / UNKNOWN
```

not a fabricated answer.

---

# 41. PHASE 3 — STATEMENT PRODUCT

Implement the complete human flow:

```text
select instrument
→ select wallet
→ select date
→ reconstruct
→ explain
→ inspect evidence
→ export
→ verify
```

The user must never have to understand Token-2022 before using the product.

Advanced users can open the mechanism.

---

# 42. PHASE 4 — PROOF

Build:

```text
proof bundle
offline verifier
online chain verifier
baseline benchmark
negative control
tamper campaign
claim ledger
```

No proof page populated from hand-written numbers.

Every chart number must come from the evidence directory.

---

# 43. PHASE 5 — UI

Only now apply the full premium visual system.

Do not polish a false product.

The screen hierarchy must always be:

```text
problem
→ answer
→ evidence
→ mechanism
→ details
```

not:

```text
charts
→ cards
→ buttons
→ charts
→ charts
```

---

# 44. PHASE 6 — FINAL QA

Run:

```bash
npm run typecheck
npm run build
npm test
npm run verify
npm run benchmark
npm run verify:offline
```

Then:

```text
Playwright
Lighthouse
link checks
console error scan
mobile screenshots
desktop screenshots
```

Also perform:

```text
RPC-down test
large-history test
partial-history test
corrupt-proof test
tamper test
wrong-wallet test
boundary-time test
```

No unresolved:

```text
TODO
FIXME
stub
coming soon
fake data
console.log
dead button
broken link
```

---

# 45. BUILD START COMMANDS

Use Ubuntu.

Recommended initial setup:

```bash
node --version
npm --version
git --version
docker --version
```

Use the Node / package-manager version compatible with the current repo and record it.

Create:

```bash
mkdir -p reference docs evidence scripts packages apps
```

Clone references.

Then inspect each:

```bash
find reference -maxdepth 2 -type f | sort
```

Use `rg` to search for:

```bash
rg -n "ScaledUiAmount|UpdateMultiplier|Pyth|mainnet|devnet|proof|benchmark|invariant" reference
```

Do not blindly port a sample app.

Extract only patterns that strengthen Colophon.

---

# 46. RUST / DOCKER RULE

Do not add Rust because it looks impressive.

Use Rust / Anchor when an actual on-chain or protocol-level fixture materially improves the proof.

If required:

- run it under Ubuntu
- use Docker for reproducibility
- pin toolchain versions
- record versions in `docs/TOOLCHAIN.md`
- keep the protocol fixture minimal
- never build an unnecessary custom token protocol

Preferred rule:

> Rust is allowed when it makes the invariant harder, more reproducible, or more truthful. It is forbidden when it is merely decorative.

---

# 47. FREE / HUMAN-PROVIDED DEPENDENCIES

The build should be free or near-zero cost.

Human may provide:

```text
HELius / free Solana RPC key if needed
Vercel account
GitHub repo
fresh devnet wallet
optional Supabase free project
optional Pyth API key if eligible
premium font files
video recording setup
```

Do NOT require:

- mainnet wallet funds
- private keys
- purchased tokens
- paid API plan
- paid database
- paid infrastructure

Mainnet should be read-only.

Devnet writes only when needed for reproducible fixtures.

---

# 48. ENVIRONMENT RULE

Create:

```text
.env.example
```

Never commit secrets.

Separate:

```text
NEXT_PUBLIC_*
server-only secrets
```

Pyth keys, RPC secrets and database service keys must stay server-side.

No secret may ever enter browser bundles.

---

# 49. NO MOCK PRODUCTION PATH

Allowed:

```text
SYNTHETIC fixture
```

only if explicitly labeled in:

- UI
- evidence
- README
- code comments / metadata

Forbidden:

```text
fake mainnet data presented as real
```

---

# 50. README

README must be judge-first.

Exact order:

1. Title
2. Shields
3. One-line pitch
4. Landing screenshot
5. Brief description
6. Product links table
7. Four product screenshots in 2x2
8. Real user and problem
9. Solution
10. Explore in 2 minutes
11. Mermaid architecture
12. ASCII architecture where useful
13. Mermaid product flow
14. Working end-to-end demo
15. Why Solana
16. The discovered primitive
17. Experimental proof
18. Benchmark
19. Break campaign
20. PreStocks / Pyth eligibility if actually claimed
21. Limitations
22. What's new
23. Target user / business model
24. Roadmap
25. Local setup
26. Docs index

Do not make the README enormous merely to appear technical.

Every section should answer a judge question.

---

# 51. README PITCH

Primary working line:

> **Colophon gives holders of tokenized stocks the brokerage statement they never got: shares and ownership history reconstructed for any past date, with every change tied to verifiable Solana evidence.**

Alternative technical line:

> **A time-indexed ownership ledger for Token-2022 assets that reconstructs historical balances from multiplier state instead of trusting today's display.**

Choose whichever fits the final evidence.

---

# 52. DEMO VIDEO

Maximum ~3 minutes.

Structure:

```text
0:00–0:15
Problem

0:15–0:45
Open product and show statement

0:45–1:30
Scrub date → multiplier changes → ownership changes

1:30–2:10
Show real chain evidence + proof receipt

2:10–2:35
Break receipt / corrupt timestamp / fail verifier

2:35–2:55
Why Solana / Token-2022 primitive

2:55–3:00
One-line close
```

Never spend the first minute explaining the architecture.

Show the product working.

---

# 53. SUBMISSION NARRATIVE

The final story is:

```text
People see a balance.

The chain stores more complicated temporal state.

That state can matter economically.

Normal interfaces collapse it into one current number.

Colophon reconstructs the timeline.

It does not ask the user to trust Colophon.

It gives them a deterministic record, source anchors, and a verifier.
```

That is the narrative.

---

# 54. WHY SOLANA

Do not write:

> "Solana is fast and cheap."

Too generic.

Explain:

```text
Token-2022 extensions can encode time-dependent display behavior.

That creates a new accounting surface.

Colophon uses the exact Token-2022 primitive as the foundation of its
historical reconstruction engine.
```

Then show the real instruction/state examples.

---

# 55. PRODUCT / INFRASTRUCTURE BALANCE

The minimum complete product has:

```text
REAL DATA
+
REAL USER FLOW
+
REAL EXPLANATION
+
REAL EXPORT
+
REAL VERIFICATION
+
REAL BREAK TEST
```

The minimum deep infrastructure has:

```text
REAL PROTOCOL SEMANTICS
+
DETERMINISTIC KERNEL
+
TEMPORAL MODEL
+
SOURCE TRACEABILITY
+
BASELINE
+
NEGATIVE CONTROL
+
REPRODUCIBLE EVIDENCE
```

Both are mandatory.

---

# 56. BUSINESS / POST-HACKATHON

Position as:

```text
"statement infrastructure for tokenized securities"
```

Potential users:

- fintech platforms
- tax platforms
- custody / wallet providers
- institutional dashboards
- tokenized securities issuers
- auditors
- portfolio analytics systems

Potential model:

```text
B2B API
verification SDK
compliance / reporting layer
white-label ownership statement
```

Do not pretend the startup is already generating revenue.

---

# 57. FINAL QUALITY BAR

Before submission, ask:

### Product

Can a normal tokenized-stock holder use it without learning protocol internals?

### Technical

Can a technical judge inspect exactly how the result was derived?

### Research

Did we discover a real non-obvious behavior?

### Proof

Can a skeptical judge reproduce the claim?

### Failure

Did we try to break the system?

### Clarity

Can a judge explain Colophon in one sentence after 20 seconds?

### Originality

Is the value created by the reconstruction mechanism rather than by a generic dashboard?

### Theme

Does the product clearly make owning / using tokenized stocks better?

If any answer is "no", fix it before polish.

---

# 58. HARD STOP CONDITIONS

Stop and document rather than silently improvising if:

1. The core discovery is falsified.
2. Historical multiplier evidence cannot be reconstructed.
3. A required field is not observable.
4. A key product claim is unsupported.
5. A claimed bounty is not actually eligible.
6. The product begins requiring a transaction signature.
7. The app starts using mock production data.
8. A new feature cannot be tied to the thesis.
9. The architecture is drifting into a generic portfolio app.
10. A third-party API becomes a single point of truth for the core result.

When blocked:

```text
state UNKNOWN
run minimal experiment
record result
choose from evidence
```

Never guess.

---

# 59. FINAL COMMAND TO THE AGENT

Do not simplify this specification.

Do not replace the temporal ownership problem with a generic portfolio tracker.

Do not remove the proof campaign because it is difficult.

Do not remove the research phase because the UI can be built faster.

Do not add arbitrary features because the dashboard looks empty.

Do not fake numbers to make the screenshots attractive.

Do not make unsupported claims.

Do not use a custom protocol merely for novelty.

Do not use Rust merely for prestige.

Do not create duplicate accounting logic.

Do not create separate logic for each product surface.

Build:

```text
ONE HARD PRIMITIVE
+
ONE DETERMINISTIC TEMPORAL KERNEL
+
ONE COMPLETE HUMAN PRODUCT
+
ONE REPRODUCIBLE PROOF SYSTEM
+
ONE BEAUTIFUL EDITORIAL INTERFACE
```

And then attack it until it breaks.

The final product must feel like a real financial infrastructure product that happens to have been born from a hackathon discovery.

# 60. SUCCESS CONDITION

The project is complete only when a skeptical judge can:

1. Open the landing page.
2. Understand the problem in 20 seconds.
3. Select a real instrument.
4. Select a real wallet.
5. Move the date.
6. See historical ownership change.
7. Open the exact chain evidence.
8. Export the statement.
9. Run the verifier.
10. Break a byte.
11. Watch the verifier reject it.
12. Read the research finding.
13. Understand why Token-2022 made the product necessary.
14. Understand why Solana made the product possible.
15. Understand why this is useful beyond the hackathon.

That is the target.
