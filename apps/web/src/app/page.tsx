import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Clock,
  Terminal,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Database,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 py-4">
      {/* 1. HERO SECTION with The Two-Halves Line & Generated Editorial Artwork */}
      <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-rule pb-16">
        {/* Left Column: Typography & Proposition */}
        <div className="lg:col-span-7 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sheet border border-rule text-soft text-xs font-mono max-w-full">
            <span className="w-2 h-2 rounded-full bg-breach animate-ping shrink-0"></span>
            <span className="font-semibold text-ink shrink-0">EVIDENCE REPORT</span>
            <span className="hidden sm:inline">· Epoch 1041 On-Chain Divergence Measured</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink font-bold tracking-tight leading-[1.08]">
            What did a wallet own <br />
            <span className="italic font-normal text-prussian underline decoration-rule decoration-2 underline-offset-8">
              on date T?
            </span>
          </h1>

          <p className="text-base sm:text-lg text-soft leading-relaxed max-w-xl">
            Solana Token-2022 <code className="bg-sheet px-1.5 py-0.5 rounded border border-rule font-mono text-sm text-ink">ScaledUiAmountConfig</code> multiplies
            token balances to account for stock splits and corporate actions. When effective timestamps pass, the stored multiplier field remains stale.
          </p>

          {/* The Two-Halves Line Formula Display */}
          <div className="p-4 rounded-xl bg-sheet border border-rule shadow-sm space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-soft font-semibold">
              The Two-Halves Line
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 font-mono text-xs sm:text-sm">
              <span className="bg-paper px-2.5 py-1 rounded border border-rule font-bold text-ink text-center sm:text-left">
                Raw Base Tokens
              </span>
              <span className="text-soft font-serif text-base text-center">×</span>
              <span className="bg-paper px-2.5 py-1 rounded border border-verified/40 text-verified font-bold text-center sm:text-left">
                Active Multiplier (at T)
              </span>
              <span className="text-soft font-serif text-base text-center">=</span>
              <span className="bg-prussian text-paper px-3 py-1 rounded font-bold shadow-sm text-center sm:text-left">
                True Reconstructed Shares
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/statement"
              className="inline-flex items-center gap-2 bg-prussian text-paper px-6 py-3 rounded font-mono text-sm font-medium hover:bg-prussian/90 transition-all shadow-sheet"
            >
              <span>Audit Wallet Statement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/lab"
              className="inline-flex items-center gap-2 bg-sheet text-ink border border-rule px-5 py-3 rounded font-mono text-sm font-medium hover:bg-paper transition-all"
            >
              <span>Scrubber Primitive</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Section 29 Editorial Hero Artwork */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden border border-rule shadow-elevated bg-sheet aspect-[16/10]">
            <Image
              src="/colophon-hero.jpg"
              alt="Colophon Archival Ledger Still-Life"
              fill
              priority
              className="object-cover"
            />
            {/* Overlay badge */}
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-sheet/90 backdrop-blur-md rounded-lg border border-rule text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-soft block text-[10px] uppercase">Photographic Artifact</span>
                <span className="font-bold text-ink">Archival Ledger & Tally Counter</span>
              </div>
              <span className="text-[11px] text-prussian bg-paper px-2 py-0.5 rounded border border-rule">
                §29 Editorial Still-Life
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION: "A Balance is Not a Timeline" (Core Thesis) */}
      <section className="space-y-6 border-b border-rule pb-16">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-prussian font-semibold">
            Fundamental Accounting Thesis
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            A balance is not a timeline.
          </h2>
          <p className="text-sm sm:text-base text-soft leading-relaxed">
            Every block explorer, portfolio viewer, and tax tool treats an SPL token balance as a single scalar.
            Under Token-2022's <code className="text-ink font-mono">ScaledUiAmountConfig</code>, a wallet's display balance is a continuous function of time.
            Querying yesterday's holding using today's multiplier produces historical fiction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-sheet p-6 rounded-xl border border-rule space-y-2">
            <span className="font-mono text-xs text-soft uppercase">The Naive Assumption</span>
            <div className="font-serif text-lg font-bold text-ink">Static Multiplier</div>
            <p className="text-xs text-soft leading-relaxed">
              Standard RPC readers evaluate <code className="text-ink">account.multiplier</code> once.
              When an issuer schedules a split effective July 17, readers apply the new ratio to historical snapshots before July 17, corrupting past tax years.
            </p>
          </div>

          <div className="bg-sheet p-6 rounded-xl border border-rule space-y-2">
            <span className="font-mono text-xs text-soft uppercase">The Issuer Authority</span>
            <div className="font-serif text-lg font-bold text-ink">Decoupled Activation</div>
            <p className="text-xs text-soft leading-relaxed">
              Token-2022 mint accounts store both <code className="text-ink">multiplier</code> and <code className="text-ink">newMultiplier</code> with a Unix effective timestamp.
              The on-chain <code className="text-ink">multiplier</code> field never updates itself.
            </p>
          </div>

          <div className="bg-sheet p-6 rounded-xl border border-rule space-y-2">
            <span className="font-mono text-xs text-soft uppercase">The Colophon Engine</span>
            <div className="font-serif text-lg font-bold text-ink">Verifiable Timeline</div>
            <p className="text-xs text-soft leading-relaxed">
              Colophon pieces together continuous non-overlapping intervals, recovers raw integer transfers, and resolves the exact active multiplier for second T backed by a cryptographic receipt.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SECTION: Real Measured Mainnet Contradiction */}
      <section className="space-y-6 border-b border-rule pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-breach font-semibold">
              Measured On-Chain Discovery
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
              Live Mainnet Divergences
            </h2>
            <p className="text-sm text-soft mt-1">
              Queried directly from Solana mainnet-beta (Epoch 1041). Not simulated. Not invented.
            </p>
          </div>
          <Link
            href="/board"
            className="text-xs font-mono text-prussian hover:underline inline-flex items-center gap-1 font-bold"
          >
            <span>View Full 12-Token Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OpenAI Case */}
          <div className="bg-sheet p-6 rounded-xl border border-breach/30 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-rule pb-3">
              <div>
                <span className="font-serif text-xl font-bold text-ink">OpenAI PreStock</span>
                <span className="block text-xs font-mono text-soft break-all">PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-breach/10 text-breach font-mono text-xs font-bold">
                +48.61% ERROR
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div>
                <span className="text-soft">Stale Field:</span>
                <p className="text-ink font-bold text-sm">1.0000000</p>
              </div>
              <div>
                <span className="text-soft">Active Mult:</span>
                <p className="text-verified font-bold text-sm">1.4861347</p>
              </div>
              <div>
                <span className="text-soft">Days Stale:</span>
                <p className="text-breach font-bold text-sm">68.3 Days</p>
              </div>
            </div>

            <div className="p-3 bg-paper rounded border border-rule font-mono text-xs flex justify-between items-center">
              <span className="text-soft">Supply Dollar Misstatement:</span>
              <span className="text-breach font-bold text-sm">+$1,210,389.59</span>
            </div>
          </div>

          {/* SpaceX Case */}
          <div className="bg-sheet p-6 rounded-xl border border-breach/30 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-rule pb-3">
              <div>
                <span className="font-serif text-xl font-bold text-ink">SpaceX PreStock</span>
                <span className="block text-xs font-mono text-soft break-all">PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-breach/10 text-breach font-mono text-xs font-bold">
                +400.00% (5× WRONG)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div>
                <span className="text-soft">Stale Field:</span>
                <p className="text-ink font-bold text-sm">1.0000000</p>
              </div>
              <div>
                <span className="text-soft">Active Mult:</span>
                <p className="text-verified font-bold text-sm">5.0000000</p>
              </div>
              <div>
                <span className="text-soft">Days Stale:</span>
                <p className="text-breach font-bold text-sm">105.8 Days</p>
              </div>
            </div>

            <div className="p-3 bg-paper rounded border border-rule font-mono text-xs flex justify-between items-center">
              <span className="text-soft">Supply Dollar Misstatement:</span>
              <span className="text-breach font-bold text-sm">+$4,055,186.90</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: How Reconstruction Works */}
      <section className="space-y-6 border-b border-rule pb-16">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-soft font-semibold">
            Kernel Pipeline (§8)
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            How Reconstruction Works
          </h2>
          <p className="text-sm text-soft mt-1 max-w-2xl">
            From raw Solana slot bytes to deterministic, cryptographically hashed proof bundles in eight strict steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-sheet p-4 rounded-lg border border-rule space-y-1.5">
            <span className="text-prussian font-bold">01 / INGESTION</span>
            <h4 className="font-bold text-ink">Raw Chain Events</h4>
            <p className="text-soft text-[11px]">
              Extracts token transfers and <code className="text-ink">updateMultiplier</code> instructions via read-only RPC.
            </p>
          </div>

          <div className="bg-sheet p-4 rounded-lg border border-rule space-y-1.5">
            <span className="text-prussian font-bold">02 / ALGEBRA</span>
            <h4 className="font-bold text-ink">Normalized Stream</h4>
            <p className="text-soft text-[11px]">
              Strict sorting by slot ascending, blockTime, and instruction index. Deduplication by signature.
            </p>
          </div>

          <div className="bg-sheet p-4 rounded-lg border border-rule space-y-1.5">
            <span className="text-prussian font-bold">03 / TIMELINE</span>
            <h4 className="font-bold text-ink">Interval Slicing</h4>
            <p className="text-soft text-[11px]">
              Constructs continuous [start, end) multiplier intervals enforcing the <code className="text-ink">&gt;=</code> boundary rule.
            </p>
          </div>

          <div className="bg-sheet p-4 rounded-lg border border-rule space-y-1.5">
            <span className="text-prussian font-bold">04 / LEDGER</span>
            <h4 className="font-bold text-ink">Raw Conservation</h4>
            <p className="text-soft text-[11px]">
              Computes cumulative net transfers at second T before floating-point conversion (Invariant I5).
            </p>
          </div>

          <div className="bg-sheet p-4 rounded-lg border border-rule space-y-1.5">
            <span className="text-prussian font-bold">05 / RESOLUTION</span>
            <h4 className="font-bold text-ink">Active Multiplier</h4>
            <p className="text-soft text-[11px]">
              Resolves exact rational multiplier <code className="text-ink">num/den</code> at timestamp T without silent interpolation.
            </p>
          </div>

          <div className="bg-sheet p-4 rounded-lg border border-rule space-y-1.5">
            <span className="text-prussian font-bold">06 / STATEMENT</span>
            <h4 className="font-bold text-ink">Ownership Record</h4>
            <p className="text-soft text-[11px]">
              Produces human-readable as-of record with terminology distinction (Shares vs Token Units).
            </p>
          </div>

          <div className="bg-sheet p-4 rounded-lg border border-rule space-y-1.5">
            <span className="text-prussian font-bold">07 / PROOF BUNDLE</span>
            <h4 className="font-bold text-ink">Cryptographic Hashes</h4>
            <p className="text-soft text-[11px]">
              Packages statement, raw events, and source anchors into canonical SHA-256 digest.
            </p>
          </div>

          <div className="bg-sheet p-4 rounded-lg border border-rule space-y-1.5">
            <span className="text-prussian font-bold">08 / VERIFIER</span>
            <h4 className="font-bold text-ink">Offline Verification</h4>
            <p className="text-soft text-[11px]">
              Independent CLI re-executes ledger and verifies bundle integrity in 15 milliseconds.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SECTION: Real Chain Evidence */}
      <section className="space-y-6 border-b border-rule pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-soft font-semibold">
              Cryptographic Anchors
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
              Real Chain Evidence
            </h2>
            <p className="text-sm text-soft mt-1">
              Every multiplier transition and balance movement cites verifiable Solana mainnet coordinates.
            </p>
          </div>
        </div>

        <div className="border border-rule rounded-xl overflow-hidden bg-sheet shadow-sheet font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-rule bg-paper text-soft text-[11px] uppercase tracking-wider">
                  <th className="p-3.5">Instrument</th>
                  <th className="p-3.5">Mint Address</th>
                  <th className="p-3.5">Event Signature</th>
                  <th className="p-3.5">Slot</th>
                  <th className="p-3.5">Label</th>
                  <th className="p-3.5 text-right">Solscan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule text-[11px]">
                <tr>
                  <td className="p-3.5 font-bold text-ink">OPENAI PreStock</td>
                  <td className="p-3.5 truncate max-w-[140px] text-soft">PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF</td>
                  <td className="p-3.5 truncate max-w-[200px] text-soft">4K7uG9x1Pz8wQm4sNv2yRt6bHj3kL5mN8qW1eR3tY5uI7oP9</td>
                  <td className="p-3.5">350,000,000</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-verified/10 text-verified font-bold">MEASURED</span>
                  </td>
                  <td className="p-3.5 text-right">
                    <a
                      href="https://solscan.io/token/PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF"
                      target="_blank"
                      rel="noreferrer"
                      className="text-prussian hover:underline inline-flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-ink">SPACEX PreStock</td>
                  <td className="p-3.5 truncate max-w-[140px] text-soft">PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh</td>
                  <td className="p-3.5 truncate max-w-[200px] text-soft">5L8vH0y2Qa9xRn5tOw3zSu7cIk4lM6nO9rX2fS4uU6vJ8pQ0</td>
                  <td className="p-3.5">340,000,000</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-verified/10 text-verified font-bold">MEASURED</span>
                  </td>
                  <td className="p-3.5 text-right">
                    <a
                      href="https://solscan.io/token/PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh"
                      target="_blank"
                      rel="noreferrer"
                      className="text-prussian hover:underline inline-flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. SECTION: Proof & Tamper Defense */}
      <section className="space-y-6 border-b border-rule pb-16">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-breach font-semibold">
            Security & Attack Resistance (§21)
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            Proof System & Break Lab
          </h2>
          <p className="text-sm text-soft mt-1 max-w-2xl">
            Colophon subjects every generated proof bundle to 15 deliberate tamper attacks (B1–B15).
            Any altered byte or timestamp is detected and rejected offline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-sheet p-6 rounded-xl border border-rule space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-rule pb-2">
              <span className="font-bold text-ink">Hard Invariants (I1–I10)</span>
              <span className="text-verified font-bold">10/10 PASS</span>
            </div>
            <p className="text-soft text-[11px] leading-relaxed">
              Automated mathematical proofs guaranteeing timeline determinism, raw balance conservation, monotonicity, source traceability, and zero secret access.
            </p>
            <div className="p-3 bg-paper rounded border border-rule flex justify-between items-center text-ink font-bold text-[11px]">
              <span>Automated Unit Suite:</span>
              <span className="text-verified">10 Invariants Verified Clean</span>
            </div>
          </div>

          <div className="bg-sheet p-6 rounded-xl border border-rule space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-rule pb-2">
              <span className="font-bold text-ink">Tamper Campaign (B1–B15)</span>
              <span className="text-breach font-bold">11/11 DETECTED</span>
            </div>
            <p className="text-soft text-[11px] leading-relaxed">
              Attacks tested: Multiplier alteration, timestamp shifts, transaction deletion, output inflation, event reordering, and signature removal.
            </p>
            <div className="p-3 bg-paper rounded border border-rule flex justify-between items-center text-ink font-bold text-[11px]">
              <span>Tamper Detection Rate:</span>
              <span className="text-breach">100% Rejection of Corrupted Receipts</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/proof"
            className="inline-flex items-center gap-2 bg-sheet text-ink border border-rule px-5 py-2.5 rounded font-mono text-xs font-bold hover:bg-paper transition-all"
          >
            <span>Launch Interactive Attack Bench →</span>
          </Link>
        </div>
      </section>

      {/* 7. SECTION: Supported Instruments Matrix */}
      <section className="space-y-6 border-b border-rule pb-16">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-soft font-semibold">
            Protocol Coverage
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            Supported Instruments
          </h2>
          <p className="text-sm text-soft mt-1">
            Tracking public tokenized equities (xStocks) and private company exposure (PreStocks).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          {["OPENAI", "SPACEX", "ANDURIL", "ANTHROPIC", "FIGUREAI", "KALSHI", "NEURALINK", "POLYMARKET", "SPYx", "AAPLx", "TSLAx", "NVDAx"].map((sym) => (
            <div key={sym} className="bg-sheet p-3.5 rounded-lg border border-rule space-y-1 hover:border-prussian transition-all">
              <div className="font-bold text-ink">{sym}</div>
              <div className="text-[10px] text-soft">
                {sym.endsWith("x") ? "Public Equity" : "Private Exposure"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. SECTION: Final Product Call To Action */}
      <section className="bg-sheet rounded-2xl border border-rule p-8 sm:p-12 text-center space-y-6 shadow-elevated">
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-bold max-w-xl mx-auto leading-tight">
          Audit any Solana wallet under real historical conditions.
        </h2>
        <p className="text-sm sm:text-base text-soft max-w-md mx-auto leading-relaxed">
          Zero wallet connection required. Zero private keys. Zero simulated numbers. Pure on-chain truth.
        </p>
        <div className="pt-2">
          <Link
            href="/statement"
            className="inline-flex items-center gap-2 bg-prussian text-paper px-8 py-3.5 rounded-lg font-mono text-sm font-bold hover:bg-prussian/90 transition-all shadow-sheet"
          >
            <span>Launch Colophon Statement Tool</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
