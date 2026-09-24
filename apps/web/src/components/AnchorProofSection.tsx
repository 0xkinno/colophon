"use client";

import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import {
  ShieldCheck,
  ExternalLink,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";

export type AnchorState =
  | "IDLE"
  | "NOT_CONNECTED"
  | "AWAITING_SIGNATURE"
  | "USER_REJECTED"
  | "SUBMITTING"
  | "CONFIRMING"
  | "ANCHORED"
  | "VERIFIED"
  | "ANCHOR_FAILED";

export interface AnchorProofSectionProps {
  statementHash: string;
  mintAddress: string;
  effectiveTimestamp: number;
  evidenceRoot: string;
  symbol: string;
  reconstructedUnits: number;
  unitLabel: string;
}

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_COLOPHON_PROGRAM_ID ||
    "7pPKsqAg9AFZzSEJbygpbqAVKGFgXpaN5AcqNKrwhCe2"
);

export function AnchorProofSection({
  statementHash,
  mintAddress,
  effectiveTimestamp,
  evidenceRoot,
  symbol,
  reconstructedUnits,
  unitLabel,
}: AnchorProofSectionProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  const [anchorState, setAnchorState] = useState<AnchorState>("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState<number | null>(null);
  const [statementPdaStr, setStatementPdaStr] = useState<string>("");
  const [isVerifyingOnChain, setIsVerifyingOnChain] = useState<boolean>(false);
  const [verifiedDetails, setVerifiedDetails] = useState<{
    wallet: string;
    mint: string;
    effectiveTs: number;
    statementHash: string;
    evidenceRoot: string;
    slot: number;
  } | null>(null);

  // Derive statement PDA
  useEffect(() => {
    try {
      const hashBytes = Buffer.from(statementHash, "hex");
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("colophon_statement"), hashBytes],
        PROGRAM_ID
      );
      setStatementPdaStr(pda.toBase58());

      // Check if this statement is already anchored on Devnet
      checkExistingAnchor(pda);
    } catch (e) {
      console.error("PDA derivation error:", e);
    }
  }, [statementHash, connection]);

  const checkExistingAnchor = async (pda: PublicKey) => {
    try {
      const acc = await connection.getAccountInfo(pda, "confirmed");
      if (acc && acc.data.length >= 154) {
        decodeAndVerifyPDA(acc.data, "Existing on-chain record discovered");
        setAnchorState("VERIFIED");
      }
    } catch {
      // Not anchored yet or transient network
    }
  };

  const decodeAndVerifyPDA = (data: Buffer | Uint8Array, contextMsg?: string) => {
    const buf = Buffer.from(data);
    const disc = buf.subarray(0, 8).toString("utf-8");
    if (disc !== "COLOPHON") return false;

    const wallet = new PublicKey(buf.subarray(8, 40)).toBase58();
    const mint = new PublicKey(buf.subarray(40, 72)).toBase58();
    const onChainHash = buf.subarray(72, 104).toString("hex");
    const onChainRoot = buf.subarray(104, 136).toString("hex");
    const effTs = Number(buf.readBigInt64LE(136));
    const slot = Number(buf.readBigUInt64LE(144));

    if (onChainHash.toLowerCase() === statementHash.toLowerCase()) {
      setVerifiedDetails({
        wallet,
        mint,
        effectiveTs: effTs,
        statementHash: onChainHash,
        evidenceRoot: onChainRoot,
        slot,
      });
      setConfirmedSlot(slot);
      return true;
    }
    return false;
  };

  const handleAnchorProof = async () => {
    if (!connected || !publicKey) {
      setAnchorState("NOT_CONNECTED");
      setVisible(true);
      return;
    }

    setErrorMessage(null);
    setAnchorState("AWAITING_SIGNATURE");

    try {
      const hashBytes = Buffer.from(statementHash, "hex");
      const mintPk = new PublicKey(mintAddress);
      const rootBytes = Buffer.from(evidenceRoot, "hex");

      const [pda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("colophon_statement"), hashBytes],
        PROGRAM_ID
      );
      setStatementPdaStr(pda.toBase58());

      // Check if already anchored
      const existing = await connection.getAccountInfo(pda, "confirmed");
      if (existing && existing.data.length >= 154) {
        decodeAndVerifyPDA(existing.data);
        setAnchorState("VERIFIED");
        return;
      }

      // Build instruction: 106 bytes
      const instructionData = Buffer.alloc(106);
      let offset = 0;
      instructionData.writeUInt8(0, offset); // Tag 0: AnchorStatement
      offset += 1;

      hashBytes.copy(instructionData, offset);
      offset += 32;

      mintPk.toBuffer().copy(instructionData, offset);
      offset += 32;

      rootBytes.copy(instructionData, offset);
      offset += 32;

      instructionData.writeBigInt64LE(BigInt(effectiveTimestamp), offset);
      offset += 8;

      instructionData.writeUInt8(1, offset); // schema version 1

      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: pda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: instructionData,
      });

      const tx = new Transaction().add(ix);
      setAnchorState("SUBMITTING");

      const sig = await sendTransaction(tx, connection, {
        preflightCommitment: "confirmed",
      });
      setTxSignature(sig);

      setAnchorState("CONFIRMING");
      const confirmation = await connection.confirmTransaction(sig, "confirmed");

      if (confirmation.value.err) {
        throw new Error(`Transaction error: ${JSON.stringify(confirmation.value.err)}`);
      }

      setAnchorState("ANCHORED");
      setIsVerifyingOnChain(true);

      // Verify on-chain state readback
      const pdaAccount = await connection.getAccountInfo(pda, "confirmed");
      if (pdaAccount && decodeAndVerifyPDA(pdaAccount.data)) {
        setAnchorState("VERIFIED");
      } else {
        throw new Error("Commitment readback from PDA did not match expected statement hash.");
      }
    } catch (err: any) {
      console.error("Anchor failed:", err);
      const msg = err.message || String(err);
      if (
        msg.includes("User rejected") ||
        msg.includes("rejected the request") ||
        msg.includes("Transaction cancelled")
      ) {
        setAnchorState("USER_REJECTED");
        setErrorMessage("Wallet signature was rejected by user.");
      } else if (msg.includes("0x0") || msg.includes("custom program error: 0x0")) {
        setAnchorState("ANCHOR_FAILED");
        setErrorMessage("Account already initialized or unauthorized signer.");
      } else {
        setAnchorState("ANCHOR_FAILED");
        setErrorMessage(msg.slice(0, 160));
      }
    } finally {
      setIsVerifyingOnChain(false);
    }
  };

  return (
    <div className="bg-sheet border border-rule rounded-xl p-5 sm:p-6 shadow-sm mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-rule">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-prussian" />
            <h3 className="font-serif font-bold text-lg text-ink">
              On-Chain Cryptographic Anchor (Solana Devnet)
            </h3>
          </div>
          <p className="text-xs text-soft font-sans">
            Anchor the deterministic SHA-256 statement hash as an immutable PDA commitment on Solana Devnet.
          </p>
        </div>

        {/* Verification Status Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="bg-sheet border border-rule px-2.5 py-1 rounded text-soft">
            RECONSTRUCTED
          </span>
          <ArrowRight className="w-3 h-3 text-soft" />
          <span
            className={`px-2.5 py-1 rounded font-semibold border ${
              anchorState === "ANCHORED" || anchorState === "VERIFIED"
                ? "bg-prussian/10 text-prussian border-prussian/30"
                : "bg-paper text-soft border-rule"
            }`}
          >
            ANCHORED ON SOLANA
          </span>
          <ArrowRight className="w-3 h-3 text-soft" />
          <span
            className={`px-2.5 py-1 rounded font-semibold border ${
              anchorState === "VERIFIED"
                ? "bg-emerald-50 text-verified border-emerald-200"
                : "bg-paper text-soft border-rule"
            }`}
          >
            VERIFIED AGAINST DEVNET
          </span>
        </div>
      </div>

      {/* Commitment Specification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4 text-xs font-mono">
        <div className="bg-paper p-3 rounded border border-rule">
          <span className="text-soft block text-[11px] uppercase tracking-wider mb-1">
            Statement Hash (SHA-256)
          </span>
          <span className="font-bold text-ink break-all select-all">
            {statementHash}
          </span>
        </div>

        <div className="bg-paper p-3 rounded border border-rule">
          <span className="text-soft block text-[11px] uppercase tracking-wider mb-1">
            Statement PDA (Devnet)
          </span>
          <span className="font-bold text-prussian break-all select-all">
            {statementPdaStr || "Deriving PDA..."}
          </span>
        </div>

        <div className="bg-paper p-3 rounded border border-rule">
          <span className="text-soft block text-[11px] uppercase tracking-wider mb-1">
            Colophon Program ID
          </span>
          <span className="font-bold text-ink break-all">
            {PROGRAM_ID.toBase58()}
          </span>
        </div>

        <div className="bg-paper p-3 rounded border border-rule">
          <span className="text-soft block text-[11px] uppercase tracking-wider mb-1">
            Reconstructed Claim
          </span>
          <span className="font-bold text-ink">
            {reconstructedUnits.toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}{" "}
            {unitLabel} ({symbol})
          </span>
        </div>
      </div>

      {/* Failure State Notice (§10) */}
      {anchorState === "ANCHOR_FAILED" && (
        <div className="bg-red-50 border border-red-200 text-breach p-3 rounded-lg mb-4 text-xs font-mono flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">ANCHOR FAILED: </span>
            <span>{errorMessage || "Failed to confirm transaction on Solana Devnet."}</span>
          </div>
        </div>
      )}

      {anchorState === "USER_REJECTED" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg mb-4 text-xs font-mono flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">SIGNATURE REJECTED: </span>
            <span>You cancelled the transaction in your Solana wallet.</span>
          </div>
        </div>
      )}

      {/* Verified State View (§5) */}
      {anchorState === "VERIFIED" && verifiedDetails && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-lg mb-4 text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 text-verified font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>IMMUTABLE COMMITMENT VERIFIED ON SOLANA DEVNET</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60">
            <div>
              <span className="text-emerald-700 block">Anchoring Wallet:</span>
              <span className="font-bold break-all">{verifiedDetails.wallet}</span>
            </div>
            <div>
              <span className="text-emerald-700 block">Anchor Slot:</span>
              <span className="font-bold">{verifiedDetails.slot}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-emerald-700 block">Program Address:</span>
              <span className="font-bold break-all">{PROGRAM_ID.toBase58()}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {txSignature ? (
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-verified underline hover:text-emerald-800"
              >
                <span>View Transaction on Solana Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <a
                href={`https://explorer.solana.com/address/${statementPdaStr}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-verified underline hover:text-emerald-800"
              >
                <span>View Statement PDA Account on Solana Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-soft font-mono">
          {!publicKey ? (
            <span>Connect a Solana Devnet wallet (Phantom, Solflare) to anchor this proof.</span>
          ) : (
            <span>
              Connected as <strong className="text-ink">{publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {anchorState !== "VERIFIED" ? (
            <button
              onClick={handleAnchorProof}
              disabled={
                anchorState === "AWAITING_SIGNATURE" ||
                anchorState === "SUBMITTING" ||
                anchorState === "CONFIRMING"
              }
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-prussian text-paper px-5 py-2.5 rounded-lg font-mono text-xs font-bold hover:bg-prussian/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {anchorState === "AWAITING_SIGNATURE" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AWAITING WALLET SIGNATURE...</span>
                </>
              ) : anchorState === "SUBMITTING" || anchorState === "CONFIRMING" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>CONFIRMING ON DEVNET...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>ANCHOR PROOF ON SOLANA</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-mono text-verified font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>ANCHORED & VERIFIED</span>
              </span>
              <button
                onClick={handleAnchorProof}
                className="text-xs font-mono text-soft hover:text-ink border border-rule px-3 py-1.5 rounded hover:bg-paper transition-colors"
              >
                Re-Verify PDA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
