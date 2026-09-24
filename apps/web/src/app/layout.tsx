import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "COLOPHON — Verifiable Historical Ownership for Token-2022 Securities",
  description:
    "Deterministic temporal accounting engine and cryptographic proof receipts for Solana Token-2022 scaled-supply assets (xStocks, PreStocks).",
};

import { SolanaWalletProvider } from "@/components/SolanaWalletProvider";
import { WalletNavButton } from "@/components/WalletNavButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-paper text-ink">
      <body className="min-h-screen flex flex-col font-sans selection:bg-prussian/10 selection:text-prussian">
        <SolanaWalletProvider>
          {/* Archival Ledger Top Header */}
          <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-rule px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <span className="w-4 h-4 rounded-full bg-prussian group-hover:scale-110 transition-transform"></span>
                <span className="font-serif text-xl tracking-tight font-bold text-ink">
                  COLOPHON
                </span>
                <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest font-mono text-soft bg-sheet px-2 py-0.5 rounded border border-rule">
                  v0.1.0
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                <Link
                  href="/statement"
                  className="px-3 py-1.5 rounded hover:bg-sheet text-ink hover:text-prussian transition-colors"
                >
                  Statement
                </Link>
                <Link
                  href="/board"
                  className="px-3 py-1.5 rounded hover:bg-sheet text-ink hover:text-prussian transition-colors"
                >
                  Board
                </Link>
                <Link
                  href="/lab"
                  className="px-3 py-1.5 rounded hover:bg-sheet text-ink hover:text-prussian transition-colors"
                >
                  Lab
                </Link>
                <Link
                  href="/proof"
                  className="px-3 py-1.5 rounded hover:bg-sheet text-ink hover:text-prussian transition-colors"
                >
                  Proof & Tamper
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <WalletNavButton />
            </div>
          </header>

          {/* Main Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SolanaWalletProvider>

        {/* Archival Ledger Footer */}
        <footer className="border-t border-rule bg-sheet/60 py-6 px-6 text-xs text-soft font-mono">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-ink">COLOPHON</span>
              <span>— Statement Infrastructure for Token-2022 Securities</span>
            </div>
            <div className="flex items-center gap-4 text-center sm:text-right">
              <span>Token-2022 ScaledUiAmount</span>
              <span className="text-rule">•</span>
              <span>10/10 Invariants Verified</span>
              <span className="text-rule">•</span>
              <span>Zero-Secret Client</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
