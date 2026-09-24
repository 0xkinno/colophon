"use client";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

// Default styles for wallet modal
import "@solana/wallet-adapter-react-ui/styles.css";

const DEVNET_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const endpoint = useMemo(() => DEVNET_ENDPOINT, []);

  // Standard wallets (Phantom, Solflare, Backpack, etc.) are discovered automatically via Wallet Standard
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
