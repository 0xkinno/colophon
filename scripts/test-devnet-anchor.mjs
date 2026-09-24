import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import fs from "node:fs";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_COLOPHON_PROGRAM_ID || "7pPKsqAg9AFZzSEJbygpbqAVKGFgXpaN5AcqNKrwhCe2"
);
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

// Read deployer keypair from path or argument
const keypairPath = process.argv[2] || "/root/.config/solana/id.json";

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  COLOPHON — Devnet Real On-Chain Statement Anchor");
  console.log("═══════════════════════════════════════════════════════");
  console.log("Program ID :", PROGRAM_ID.toBase58());
  console.log("RPC URL    :", RPC_URL);

  let keypair;
  try {
    const raw = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    keypair = Keypair.fromSecretKey(Uint8Array.from(raw));
  } catch (e) {
    console.error("Could not load keypair from:", keypairPath, e.message);
    process.exit(1);
  }

  console.log("Payer      :", keypair.publicKey.toBase58());

  const connection = new Connection(RPC_URL, "confirmed");
  const balance = await connection.getBalance(keypair.publicKey);
  console.log("Balance    :", (balance / 1e9).toFixed(4), "SOL");

  if (balance < 0.005 * 1e9) {
    console.error("Insufficient balance to pay for transaction and PDA rent.");
    process.exit(1);
  }

  // Load target statement data from verification report
  const reportPath = "evidence/runs/run-2026-09-23T23-54-19/verification_report.json";
  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  const statementHashHex = report.bundle.hashes.statementHash;
  const statementHashBytes = Buffer.from(statementHashHex, "hex");

  // OpenAI PreStock mint pubkey
  const mintPk = new PublicKey(report.bundle.statement.mint);
  // Evidence root: source events hash
  const evidenceRootHex = report.bundle.hashes.sourceEventsHash;
  const evidenceRootBytes = Buffer.from(evidenceRootHex, "hex");
  // Effective timestamp: 2026-07-17T16:30:00Z -> 1784305800
  const effectiveTs = BigInt(1784305800);
  const schemaVersion = 1;

  // Derive PDA
  const [statementPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("colophon_statement"), statementHashBytes],
    PROGRAM_ID
  );

  console.log("\nStatement Identity:");
  console.log("  Statement Hash :", statementHashHex);
  console.log("  Mint           :", mintPk.toBase58());
  console.log("  Evidence Root  :", evidenceRootHex);
  console.log("  Effective Ts   :", effectiveTs.toString(), "(2026-07-17T16:30:00Z)");
  console.log("  Statement PDA  :", statementPda.toBase58(), "(bump:", bump + ")");

  // Check if already anchored
  const existing = await connection.getAccountInfo(statementPda);
  if (existing) {
    console.log("\nStatement PDA already exists on Devnet!");
    console.log("Data length:", existing.data.length, "bytes");
    console.log("Owner:", existing.owner.toBase58());
  } else {
    console.log("\nAccount not yet created on Devnet. Building anchor transaction...");

    // Build instruction data: 1 (tag) + 32 + 32 + 32 + 8 + 1 = 106 bytes
    const instructionData = Buffer.alloc(106);
    let offset = 0;
    instructionData.writeUInt8(0, offset); // tag 0: AnchorStatement
    offset += 1;

    statementHashBytes.copy(instructionData, offset);
    offset += 32;

    mintPk.toBuffer().copy(instructionData, offset);
    offset += 32;

    evidenceRootBytes.copy(instructionData, offset);
    offset += 32;

    instructionData.writeBigInt64LE(effectiveTs, offset);
    offset += 8;

    instructionData.writeUInt8(schemaVersion, offset);

    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: statementPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: instructionData,
    });

    const tx = new Transaction().add(ix);
    console.log("Submitting transaction to Solana Devnet...");
    const signature = await sendAndConfirmTransaction(connection, tx, [keypair], {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    console.log("✔ TRANSACTION CONFIRMED ON DEVNET!");
    console.log("Signature:", signature);
    console.log("Solana Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  }

  // Verification step: Read back PDA data and verify
  console.log("\n───────────────────────────────────────────────────────");
  console.log("VERIFYING ON-CHAIN ANCHOR COMMITMENT AGAINST LOCAL PROOF");
  console.log("───────────────────────────────────────────────────────");
  const onChainAccount = await connection.getAccountInfo(statementPda);
  if (!onChainAccount) {
    throw new Error("Failed to find statement PDA after anchoring!");
  }

  const data = onChainAccount.data;
  console.log("Raw PDA bytes retrieved:", data.length);

  // Parse fields
  const disc = data.subarray(0, 8).toString("utf-8");
  const walletOnChain = new PublicKey(data.subarray(8, 40));
  const mintOnChain = new PublicKey(data.subarray(40, 72));
  const stmtHashOnChain = Buffer.from(data.subarray(72, 104)).toString("hex");
  const evidenceRootOnChain = Buffer.from(data.subarray(104, 136)).toString("hex");
  const effectiveTsOnChain = data.readBigInt64LE(136);
  const slotOnChain = data.readBigUInt64LE(144);
  const versionOnChain = data.readUInt8(152);
  const bumpOnChain = data.readUInt8(153);

  console.log("On-Chain Discriminator   :", disc);
  console.log("On-Chain Anchored Wallet :", walletOnChain.toBase58());
  console.log("On-Chain Mint            :", mintOnChain.toBase58());
  console.log("On-Chain Statement Hash  :", stmtHashOnChain);
  console.log("On-Chain Evidence Root   :", evidenceRootOnChain);
  console.log("On-Chain Effective Ts    :", effectiveTsOnChain.toString());
  console.log("On-Chain Anchor Slot     :", slotOnChain.toString());
  console.log("On-Chain Schema Version  :", versionOnChain);

  // Cryptographic checks
  const checks = [
    { label: "Discriminator ('COLOPHON')", pass: disc === "COLOPHON" },
    { label: "Statement Hash Match", pass: stmtHashOnChain === statementHashHex },
    { label: "Evidence Root Match", pass: evidenceRootOnChain === evidenceRootHex },
    { label: "Mint Match", pass: mintOnChain.equals(mintPk) },
    { label: "Effective Timestamp Match", pass: effectiveTsOnChain === effectiveTs },
    { label: "Wallet Match", pass: walletOnChain.equals(keypair.publicKey) },
  ];

  let allPass = true;
  for (const c of checks) {
    console.log(`  ${c.pass ? "✔ PASS" : "✖ FAIL"}   ${c.label}`);
    if (!c.pass) allPass = false;
  }

  if (allPass) {
    console.log("\nRESULT: ON-CHAIN COMMITMENT PERFECTLY MATCHES LOCAL STATEMENT (VERIFIED)");
    
    // Save metadata
    const metadata = {
      cluster: "devnet",
      rpcEndpoint: RPC_URL,
      programId: PROGRAM_ID.toBase58(),
      statementPda: statementPda.toBase58(),
      wallet: walletOnChain.toBase58(),
      mint: mintOnChain.toBase58(),
      statementHash: stmtHashOnChain,
      evidenceRoot: evidenceRootOnChain,
      effectiveTimestamp: Number(effectiveTsOnChain),
      slot: Number(slotOnChain),
      schemaVersion: versionOnChain,
      verified: true,
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync("evidence/devnet_anchored_statement.json", JSON.stringify(metadata, null, 2));
    console.log("Wrote verification record: evidence/devnet_anchored_statement.json");
  } else {
    console.error("\nRESULT: MISMATCH DETECTED");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Error running test:", e);
  process.exit(1);
});
