"use client";

import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Wallet, LogOut, RefreshCw, ExternalLink, ChevronDown } from "lucide-react";

export function WalletNavButton() {
  const { publicKey, wallet, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropMsg, setAirdropMsg] = useState<string | null>(null);

  // Fetch balance when connected
  useEffect(() => {
    let isMounted = true;
    if (!publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey, "confirmed");
        if (isMounted) setBalance(bal / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };

    fetchBalance();
    const id = connection.onAccountChange(publicKey, (acc) => {
      if (isMounted) setBalance(acc.lamports / LAMPORTS_PER_SOL);
    });

    return () => {
      isMounted = false;
      connection.removeAccountChangeListener(id);
    };
  }, [publicKey, connection]);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleRequestAirdrop = async () => {
    if (!publicKey) return;
    setIsAirdropping(true);
    setAirdropMsg(null);
    try {
      const sig = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, "confirmed");
      const updated = await connection.getBalance(publicKey, "confirmed");
      setBalance(updated / LAMPORTS_PER_SOL);
      setAirdropMsg("✔ +1 SOL received!");
      setTimeout(() => setAirdropMsg(null), 4000);
    } catch (e: any) {
      setAirdropMsg(e.message?.includes("429") ? "Faucet limit reached. Visit faucet.solana.com" : "Airdrop failed");
      setTimeout(() => setAirdropMsg(null), 5000);
    } finally {
      setIsAirdropping(false);
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Devnet Active Cluster Badge (§1) */}
      <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded shadow-sm">
        <span className="w-2 h-2 rounded-full bg-verified animate-pulse"></span>
        <span className="font-semibold tracking-wide">SOLANA DEVNET</span>
      </div>

      {!publicKey ? (
        <button
          onClick={() => setVisible(true)}
          disabled={connecting}
          className="flex items-center gap-1.5 text-xs font-mono font-semibold bg-prussian text-paper px-3 py-1.5 rounded hover:bg-prussian/90 transition-all shadow-sm active:scale-95"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>{connecting ? "Connecting..." : "Connect Wallet"}</span>
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-xs font-mono bg-sheet border border-rule px-3 py-1.5 rounded hover:border-prussian/50 transition-colors shadow-sm"
          >
            <span className="font-bold text-ink">
              {shortenAddress(publicKey.toBase58())}
            </span>
            {balance !== null && (
              <span className="text-soft border-l border-rule pl-2">
                {balance.toFixed(3)} SOL
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-soft" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-sheet border border-rule rounded-lg shadow-xl p-3 z-50 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-rule mb-2">
                <span className="text-soft">Connected Wallet</span>
                <span className="text-ink font-semibold">{wallet?.adapter.name}</span>
              </div>

              <div className="text-[11px] text-soft break-all bg-paper p-1.5 rounded border border-rule/50 mb-3">
                {publicKey.toBase58()}
              </div>

              <div className="flex items-center justify-between mb-3 text-soft">
                <span>Devnet Balance:</span>
                <span className="font-bold text-ink">
                  {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
                </span>
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={handleRequestAirdrop}
                  disabled={isAirdropping}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-paper border border-rule hover:border-prussian text-ink transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isAirdropping ? "animate-spin" : ""}`} />
                  <span>{isAirdropping ? "Requesting..." : "Request 1 Devnet SOL"}</span>
                </button>

                {airdropMsg && (
                  <p className="text-[10px] text-center text-verified font-medium">
                    {airdropMsg}
                  </p>
                )}

                <a
                  href={`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded hover:bg-paper text-soft hover:text-ink transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View on Solana Explorer</span>
                </a>

                <button
                  onClick={() => {
                    disconnect();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded hover:bg-red-50 text-breach border border-transparent hover:border-red-200 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
