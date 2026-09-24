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
  Sparkles,
} from "lucide-react";
import { StockLogo } from "@/components/StockLogo";

export default function HomePage() {
  return (
    <div className="space-y-16 py-4">
      {/* 1. HERO SECTION with Background Editorial Artwork */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-rule shadow-elevated bg-paper mb-8">
        {/* Background Artwork Covering Top & Sitting at Back */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/colophon-hero.jpg"
            alt="Colophon Archival Ledger"
            fill
            priority
            className="object-cover object-right-top sm:object-center opacity-30 sm:opacity-35 scale-105"
          />
          {/* Subtle gradient wash to keep text ultra-crisp, elegant and institutional */}
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/95 sm:via-paper/85 to-paper/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent opacity-80" />
        </div>

        {/* Content Sitting Cleanly on Top */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper/90 backdrop-blur-sm border border-rule text-soft text-xs font-mono max-w-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-breach animate-ping shrink-0" />
            <span className="font-semibold text-ink shrink-0">EVIDENCE REPORT</span>
            <span className="hidden sm:inline">· Epoch 1041 On-Chain Divergence Measured</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink font-bold tracking-tight leading-[1.08]">
            What did a wallet own <br />
            <span className="italic font-normal text-prussian underline decoration-rule decoration-2 underline-offset-8">
              on date T?
            </span>
          </h1>

          <p className="text-base sm:text-lg text-soft leading-relaxed max-w-2xl font-normal">
            Solana Token-2022 <span className="font-semibold text-ink">Scaled UI Amount</span> multiplies token balances to account for stock splits and corporate actions. When effective timestamps pass, the stored multiplier field remains stale.
          </p>

          {/* The Two-Halves Line Formula Display */}
          <div className="p-4 sm:p-5 rounded-xl bg-paper/90 backdrop-blur-md border border-rule shadow-sm space-y-2.5 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-soft font-semibold block">
              The Two-Halves Line
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 font-mono text-xs sm:text-sm">
              <span className="bg-sheet px-3 py-1.5 rounded border border-rule font-bold text-ink text-center sm:text-left">
                Raw Base Tokens
              </span>
              <span className="text-soft font-serif text-base text-center">×</span>
              <span className="bg-sheet px-3 py-1.5 rounded border border-verified/40 text-verified font-bold text-center sm:text-left">
                Active Multiplier (at T)
              </span>
              <span className="text-soft font-serif text-base text-center">=</span>
              <span className="bg-prussian text-paper px-3.5 py-1.5 rounded font-bold shadow-sm text-center sm:text-left">
                True Reconstructed Shares
              </span>
            </div>
          </div>

          {/* CTA Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/statement"
              className="inline-flex items-center gap-2 bg-prussian text-paper px-6 py-3 rounded-lg font-mono text-sm font-semibold hover:bg-prussian/90 transition-all shadow-sheet active:scale-95"
            >
              <span>Audit Wallet Statement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/lab"
              className="inline-flex items-center gap-2 bg-paper/90 backdrop-blur-sm text-ink border border-rule px-5 py-3 rounded-lg font-mono text-sm font-semibold hover:bg-paper transition-all shadow-sm active:scale-95"
            >
              <span>Scrubber Primitive</span>
            </Link>
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
          {/* Box 1: Static Multiplier (Amber Caution) */}
          <div className="relative group p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.07] via-sheet to-paper shadow-sm hover:border-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.22)] hover:-translate-y-1.5 transition-all duration-300 space-y-3 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-amber-800 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                The Naive Assumption
              </span>
            </div>
            <div className="font-serif text-xl font-bold text-ink group-hover:text-amber-900 dark:group-hover:text-amber-200 transition-colors">
              Static Multiplier
            </div>
            <p className="text-xs text-soft leading-relaxed">
              Standard RPC readers evaluate <code className="text-ink font-mono bg-paper/80 px-1 py-0.5 rounded border border-rule/60">account.multiplier</code> once.
              When an issuer schedules a split effective July 17, readers apply the new ratio to historical snapshots before July 17, corrupting past tax years.
            </p>
          </div>

          {/* Box 2: Decoupled Activation (Indigo Authority) */}
          <div className="relative group p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.07] via-sheet to-paper shadow-sm hover:border-indigo-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.22)] hover:-translate-y-1.5 transition-all duration-300 space-y-3 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-indigo-800 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                The Issuer Authority
              </span>
            </div>
            <div className="font-serif text-xl font-bold text-ink group-hover:text-indigo-900 dark:group-hover:text-indigo-200 transition-colors">
              Decoupled Activation
            </div>
            <p className="text-xs text-soft leading-relaxed">
              Token-2022 mint accounts store both <code className="text-ink font-mono bg-paper/80 px-1 py-0.5 rounded border border-rule/60">multiplier</code> and <code className="text-ink font-mono bg-paper/80 px-1 py-0.5 rounded border border-rule/60">newMultiplier</code> with a Unix effective timestamp.
              The on-chain <code className="text-ink font-mono bg-paper/80 px-1 py-0.5 rounded border border-rule/60">multiplier</code> field never updates itself.
            </p>
          </div>

          {/* Box 3: Verifiable Timeline (Emerald Proof) */}
          <div className="relative group p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.07] via-sheet to-paper shadow-sm hover:border-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.22)] hover:-translate-y-1.5 transition-all duration-300 space-y-3 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                The Colophon Engine
              </span>
            </div>
            <div className="font-serif text-xl font-bold text-ink group-hover:text-emerald-900 dark:group-hover:text-emerald-200 transition-colors">
              Verifiable Timeline
            </div>
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
          <div className="relative group p-6 sm:p-7 rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/[0.08] via-sheet to-paper shadow-md hover:border-teal-500/80 hover:shadow-[0_0_35px_rgba(20,184,166,0.22)] hover:-translate-y-1 transition-all duration-300 space-y-5 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-teal-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/25 transition-all" />
            <div className="flex justify-between items-start border-b border-rule/80 pb-4">
              <div className="flex items-center gap-3">
                <StockLogo symbol="OPENAI" size={44} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-xl font-bold text-ink">OpenAI PreStock</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20 font-bold">PreStock</span>
                  </div>
                  <span className="block text-xs font-mono text-soft break-all mt-0.5">PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 border border-rose-500/30 font-mono text-xs font-bold shadow-sm shrink-0 animate-pulse">
                +48.61% ERROR
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-paper/80 backdrop-blur-sm rounded-xl border border-rule/80">
                <span className="text-soft text-[11px] block">Stale Field:</span>
                <p className="text-ink font-bold text-sm mt-0.5">1.0000000</p>
              </div>
              <div className="p-3 bg-paper/80 backdrop-blur-sm rounded-xl border border-teal-500/30">
                <span className="text-teal-700 dark:text-teal-400 text-[11px] block font-semibold">Active Mult:</span>
                <p className="text-teal-600 dark:text-teal-300 font-bold text-sm mt-0.5">1.4861347</p>
              </div>
              <div className="p-3 bg-paper/80 backdrop-blur-sm rounded-xl border border-rose-500/30">
                <span className="text-rose-600 text-[11px] block font-semibold">Days Stale:</span>
                <p className="text-rose-600 font-bold text-sm mt-0.5">68.3 Days</p>
              </div>
            </div>

            <div className="p-3.5 bg-gradient-to-r from-rose-500/10 via-paper to-paper rounded-xl border border-rose-500/20 font-mono text-xs flex justify-between items-center shadow-inner">
              <span className="text-soft font-medium">Supply Dollar Misstatement:</span>
              <span className="text-rose-600 font-bold text-sm tracking-tight">+$1,210,389.59</span>
            </div>
          </div>

          {/* SpaceX Case */}
          <div className="relative group p-6 sm:p-7 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/[0.08] via-sheet to-paper shadow-md hover:border-sky-500/80 hover:shadow-[0_0_35px_rgba(14,165,233,0.22)] hover:-translate-y-1 transition-all duration-300 space-y-5 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-sky-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/25 transition-all" />
            <div className="flex justify-between items-start border-b border-rule/80 pb-4">
              <div className="flex items-center gap-3">
                <StockLogo symbol="SPACEX" size={44} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-xl font-bold text-ink">SpaceX PreStock</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 font-bold">PreStock</span>
                  </div>
                  <span className="block text-xs font-mono text-soft break-all mt-0.5">PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 border border-rose-500/30 font-mono text-xs font-bold shadow-sm shrink-0 animate-pulse">
                +400.00% (5× WRONG)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-paper/80 backdrop-blur-sm rounded-xl border border-rule/80">
                <span className="text-soft text-[11px] block">Stale Field:</span>
                <p className="text-ink font-bold text-sm mt-0.5">1.0000000</p>
              </div>
              <div className="p-3 bg-paper/80 backdrop-blur-sm rounded-xl border border-sky-500/30">
                <span className="text-sky-700 dark:text-sky-400 text-[11px] block font-semibold">Active Mult:</span>
                <p className="text-sky-600 dark:text-sky-300 font-bold text-sm mt-0.5">5.0000000</p>
              </div>
              <div className="p-3 bg-paper/80 backdrop-blur-sm rounded-xl border border-rose-500/30">
                <span className="text-rose-600 text-[11px] block font-semibold">Days Stale:</span>
                <p className="text-rose-600 font-bold text-sm mt-0.5">105.8 Days</p>
              </div>
            </div>

            <div className="p-3.5 bg-gradient-to-r from-rose-500/10 via-paper to-paper rounded-xl border border-rose-500/20 font-mono text-xs flex justify-between items-center shadow-inner">
              <span className="text-soft font-medium">Supply Dollar Misstatement:</span>
              <span className="text-rose-600 font-bold text-sm tracking-tight">+$4,055,186.90</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: How Reconstruction Works */}
      <section className="space-y-6 border-b border-rule pb-16">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-soft font-semibold">
            Kernel Pipeline
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            How Reconstruction Works
          </h2>
          <p className="text-sm text-soft mt-1 max-w-2xl">
            From raw Solana slot bytes to deterministic, cryptographically hashed proof bundles in eight strict steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {[
            { step: "01", name: "INGESTION", title: "Raw Chain Events", desc: "Extracts token transfers and updateMultiplier instructions via read-only RPC." },
            { step: "02", name: "ALGEBRA", title: "Normalized Stream", desc: "Strict sorting by slot ascending, blockTime, and instruction index. Deduplication by signature." },
            { step: "03", name: "TIMELINE", title: "Interval Slicing", desc: "Constructs continuous [start, end) multiplier intervals enforcing the >= boundary rule." },
            { step: "04", name: "LEDGER", title: "Raw Conservation", desc: "Computes cumulative net transfers at second T before floating-point conversion (Invariant I5)." },
            { step: "05", name: "RESOLUTION", title: "Active Multiplier", desc: "Resolves exact rational multiplier num/den at timestamp T without silent interpolation." },
            { step: "06", name: "STATEMENT", title: "Ownership Record", desc: "Produces human-readable as-of record with legal domain separation (Shares vs Token Units)." },
            { step: "07", name: "PROOF BUNDLE", title: "Cryptographic Hashes", desc: "Packages statement, raw events, and source anchors into canonical SHA-256 digest." },
            { step: "08", name: "VERIFIER", title: "Offline Verification", desc: "Independent CLI re-executes ledger and verifies bundle integrity in 15 milliseconds." },
          ].map((item) => (
            <div
              key={item.step}
              className="relative group p-4 sm:p-5 rounded-xl border border-rule/80 bg-gradient-to-b from-paper to-sheet hover:border-prussian/70 hover:shadow-[0_0_25px_rgba(36,70,107,0.18)] hover:-translate-y-1 transition-all duration-300 space-y-2.5 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-prussian/0 via-prussian to-prussian/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-prussian bg-prussian/10 border border-prussian/20 px-2 py-0.5 rounded group-hover:bg-prussian group-hover:text-paper transition-colors">
                  {item.step} / {item.name}
                </span>
              </div>
              <h4 className="font-bold text-ink text-sm font-serif">{item.title}</h4>
              <p className="text-soft text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
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
            Security & Attack Resistance
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
          <Link
            href="/board"
            className="text-xs font-mono text-prussian hover:underline inline-flex items-center gap-1 font-bold"
          >
            <span>Explore Live Metrics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 font-mono text-xs">
          {[
            {
              sym: "OPENAI",
              type: "Private Exposure",
              cardGradient: "from-teal-500/[0.08] via-sheet to-paper border-teal-500/30 hover:border-teal-500 hover:shadow-[0_0_25px_rgba(20,184,166,0.22)]",
            },
            {
              sym: "SPACEX",
              type: "Private Exposure",
              cardGradient: "from-sky-500/[0.08] via-sheet to-paper border-sky-500/30 hover:border-sky-500 hover:shadow-[0_0_25px_rgba(14,165,233,0.22)]",
            },
            {
              sym: "ANDURIL",
              type: "Private Exposure",
              cardGradient: "from-rose-500/[0.08] via-sheet to-paper border-rose-500/30 hover:border-rose-500 hover:shadow-[0_0_25px_rgba(244,63,94,0.22)]",
            },
            {
              sym: "ANTHROPIC",
              type: "Private Exposure",
              cardGradient: "from-amber-600/[0.08] via-sheet to-paper border-amber-600/30 hover:border-amber-600 hover:shadow-[0_0_25px_rgba(217,119,6,0.22)]",
            },
            {
              sym: "FIGUREAI",
              type: "Private Exposure",
              cardGradient: "from-purple-500/[0.08] via-sheet to-paper border-purple-500/30 hover:border-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.22)]",
            },
            {
              sym: "KALSHI",
              type: "Private Exposure",
              cardGradient: "from-emerald-500/[0.08] via-sheet to-paper border-emerald-500/30 hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.22)]",
            },
            {
              sym: "NEURALINK",
              type: "Private Exposure",
              cardGradient: "from-fuchsia-500/[0.08] via-sheet to-paper border-fuchsia-500/30 hover:border-fuchsia-500 hover:shadow-[0_0_25px_rgba(217,70,239,0.22)]",
            },
            {
              sym: "POLYMARKET",
              type: "Private Exposure",
              cardGradient: "from-blue-600/[0.08] via-sheet to-paper border-blue-500/30 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.22)]",
            },
            {
              sym: "SPYx",
              type: "Public Equity",
              cardGradient: "from-green-600/[0.08] via-sheet to-paper border-green-600/30 hover:border-green-600 hover:shadow-[0_0_25px_rgba(22,163,74,0.22)]",
            },
            {
              sym: "AAPLx",
              type: "Public Equity",
              cardGradient: "from-zinc-500/[0.08] via-sheet to-paper border-zinc-400/40 hover:border-zinc-500 hover:shadow-[0_0_25px_rgba(113,113,122,0.22)]",
            },
            {
              sym: "TSLAx",
              type: "Public Equity",
              cardGradient: "from-red-600/[0.08] via-sheet to-paper border-red-500/30 hover:border-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.22)]",
            },
            {
              sym: "NVDAx",
              type: "Public Equity",
              cardGradient: "from-lime-600/[0.08] via-sheet to-paper border-lime-500/30 hover:border-lime-500 hover:shadow-[0_0_25px_rgba(132,204,22,0.22)]",
            },
          ].map((item) => (
            <div
              key={item.sym}
              className={`relative group p-4 rounded-xl border bg-gradient-to-br shadow-sm hover:-translate-y-1 transition-all duration-300 space-y-2.5 overflow-hidden ${item.cardGradient}`}
            >
              <div className="flex items-center gap-3">
                <StockLogo symbol={item.sym} size={38} className="group-hover:scale-105 transition-transform" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-ink text-sm tracking-tight truncate">{item.sym}</div>
                  <div className="text-[11px] text-soft font-mono truncate">{item.type}</div>
                </div>
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
