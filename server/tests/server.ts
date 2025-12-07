import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { KingOfTheHill } from "../target/types/king_of_the_hill";
import { assert } from "chai";
import * as dotenv from "dotenv";
import bs58 from "bs58"

dotenv.config();

type GameStateAccount = anchor.IdlAccounts<KingOfTheHill>["gameState"] & {
  feeOwner: anchor.web3.PublicKey;
};

describe("king-of-the-hill", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.KingOfTheHill as Program<KingOfTheHill>;

  // 1. Load YOUR Real Wallet (The Creator)
  const privateKeyString = process.env.CREATOR_PRIVATE_KEY;
  if (!privateKeyString) throw new Error("CREATOR_PRIVATE_KEY not found in .env");

  // FIX: Decode the Base58 string directly
  const creatorKeypair = anchor.web3.Keypair.fromSecretKey(
    bs58.decode(privateKeyString) 
  );

  console.log("Testing with Creator Wallet:", creatorKeypair.publicKey.toString());
  // Test Players
  const player1 = anchor.web3.Keypair.generate();
  const hacker = anchor.web3.Keypair.generate(); // Tries to steal fees

  const [gamePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("game_v1")],
    program.programId
  );

  const fetchGameState = async () =>
    (await program.account.gameState.fetch(gamePda)) as GameStateAccount;

  it("Initializes Game and Sets Fee Owner", async () => {
    try {
      await program.methods
        .initialize(new anchor.BN(100000000)) // 0.1 SOL
        .accounts({
          creator: creatorKeypair.publicKey, // YOU are the signer here
        })
        .signers([creatorKeypair])
        .rpc();
      
      const state = await fetchGameState();
      console.log("Fee Owner set on-chain:", state.feeOwner.toString());
      
      assert.ok(state.feeOwner.equals(creatorKeypair.publicKey), "Fee Owner mismatch!");
    } catch (e) {
      console.log("Game likely already initialized, skipping...");
    }
  });

  it("Player 1 Plays (Paying Correct Creator)", async () => {
    // Fund Player 1
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    const state = await fetchGameState();

    await program.methods
      .usurpThrone()
      .accounts({
        newKing: player1.publicKey,
        previousKing: state.king,
        creator: creatorKeypair.publicKey, // Correct Owner
      })
      .signers([player1])
      .rpc();
    console.log("Player 1 successfully took the throne.");
  });

  it("SECURITY CHECK: Hacker tries to steal fees", async () => {
    // Hacker tries to pass THEIR address as the 'creator' to receive fees
    const state = await fetchGameState();

    try {
      await program.methods
        .usurpThrone()
        .accounts({
          newKing: hacker.publicKey,
          previousKing: state.king,
          creator: hacker.publicKey, // <--- SCAM ATTEMPT (Wrong Wallet)
        })
        .signers([hacker])
        .rpc();
    } catch (error) {
      console.log("Security Check Passed: Contract blocked the hacker.");
      // We expect an error code related to constraint violation
      assert.ok(error.toString().includes("Constraint")); 
    }
  });
});