import { useCallback, useEffect, useRef, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import kingOfTheHillIdl from "../idl/king_of_the_hill.json";
import { createMemoInstruction } from "@solana/spl-memo";

const PROGRAM_ID = new PublicKey(kingOfTheHillIdl.address);

// --- HELPERS (Keep existing) ---
const normalisePubkey = (value: unknown): string => {
  if (!value) return "";
  if (value instanceof PublicKey) return value.toBase58();
  if (typeof value === "object" && value !== null && "toBase58" in value) {
    try { return (value as { toBase58: () => string }).toBase58(); } catch { return ""; }
  }
  if (typeof value === "string") {
    try { return new PublicKey(value).toBase58(); } catch { return value; }
  }
  return "";
};

const normaliseNumber = (value: unknown): number => {
  const anyVal = value as any;
  if (anyVal instanceof anchor.BN) return anyVal.toNumber();
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    try { return (value as { toNumber: () => number }).toNumber(); } catch { return 0; }
  }
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

type GameStateAccount = {
  king: anchor.web3.PublicKey;
  price: anchor.BN;
  endTimestamp: anchor.BN;
  jackpot: anchor.BN;
  feeOwner: anchor.web3.PublicKey;
};

export type GameEvent = {
  signature: string;
  newKing: string;
  price: number;
  timestamp: number;
  message: string;
};

export const useKingContract = () => {
  const anchorWallet = useAnchorWallet(); 
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet; 
  const { connection } = useConnection();
  
  const [program, setProgram] = useState<anchor.Program | null>(null);
  const [gameState, setGameState] = useState<{
    king: string;
    price: number;
    endTimestamp: number;
    jackpot: number;
    feeOwner: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [rpcError, setRpcError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameEvent[]>([]);
  
  const gameHistoryRef = useRef<GameEvent[]>([]);
  const lastHistoryFetchRef = useRef<number>(0);
  const nextRpcAttemptRef = useRef<number>(0);
  const [latestTaunt, setLatestTaunt] = useState<string>("");

  const upsertHistory = useCallback((updater: (current: GameEvent[]) => GameEvent[]) => {
    setGameHistory((current) => {
      const updated = updater(current);
      const seen = new Set<string>();
      const deduped: GameEvent[] = [];
      for (const entry of updated) {
        if (entry.signature && !seen.has(entry.signature)) {
          seen.add(entry.signature);
          deduped.push(entry);
        }
      }
      return deduped.sort((a, b) => b.timestamp - a.timestamp);
    });
  }, []);

  // 1. Setup Anchor Provider
  useEffect(() => {
    if (anchorWallet) {
      const provider = new anchor.AnchorProvider(connection, anchorWallet, {
        commitment: "confirmed",
      });
      const prog = new anchor.Program(kingOfTheHillIdl as anchor.Idl, provider);
      setProgram(prog);
    }
  }, [anchorWallet, connection]);

  // 2. Fetch Game State
  const fetchState = useCallback(async () => {
    if (!program) return;
    const now = Date.now();
    if (now < nextRpcAttemptRef.current) return;

    try {
      const [gamePda] = PublicKey.findProgramAddressSync([Buffer.from("game_v1")], PROGRAM_ID);

      const state = (await (program.account as any).gameState.fetch(gamePda)) as GameStateAccount;

      setGameState({
        king: state.king.toBase58(),
        price: state.price.toNumber() / LAMPORTS_PER_SOL,
        endTimestamp: state.endTimestamp.toNumber(),
        jackpot: state.jackpot.toNumber() / LAMPORTS_PER_SOL,
        feeOwner: state.feeOwner.toBase58(),
      });
      setIsInitialized(true);
      setRpcError(null);

      const shouldRefreshHistory = now - lastHistoryFetchRef.current > 10000 || gameHistoryRef.current.length === 0;

      if (shouldRefreshHistory) {
        lastHistoryFetchRef.current = now;
        const signatures = await connection.getSignaturesForAddress(gamePda, { limit: 5 });

        if (signatures.length === 0) {
          setGameHistory([]);
          gameHistoryRef.current = [];
        } else {
          const parsedTxs = await Promise.all(
            signatures.map(async (sig) => {
              try {
                return await connection.getParsedTransaction(sig.signature, {
                  maxSupportedTransactionVersion: 0,
                  commitment: "confirmed"
                });
              } catch (e) { return null; }
            })
          );

          const history: GameEvent[] = [];
          const eventParser = new anchor.EventParser(PROGRAM_ID, program.coder);

          parsedTxs.forEach((tx, i) => {
            if (!tx || !tx.meta || !tx.meta.logMessages) return;

            let memoMessage = "";
            const memoLog = tx.meta.logMessages.find(log => log.includes("Memo (len"));
            if (memoLog) {
                const match = memoLog.match(/"([^"]+)"/);
                if (match) memoMessage = match[1];
            }

            for (const event of eventParser.parseLogs(tx.meta.logMessages)) {
              if (event.name === "NewKingEvent" || event.name === "newKingEvent") {
                const data = event.data as Record<string, unknown>;
                history.push({
                  signature: signatures[i].signature,
                  newKing: normalisePubkey(data["newKing"] ?? data["new_king"]),
                  price: normaliseNumber(data["price"]) / LAMPORTS_PER_SOL,
                  timestamp: normaliseNumber(data["timestamp"]),
                  message: memoMessage
                });
              }
            }
          });

          if (history.length) {
            upsertHistory(() => history);
            if (history[0]?.message) setLatestTaunt(history[0].message);
          }
        }
        
        // Fetch specific king taunts if needed
        if (state.king) {
          try {
            const kingPubkey = new PublicKey(state.king);
            const recentSigs = await connection.getSignaturesForAddress(kingPubkey, { limit: 3 });
            for (const sig of recentSigs) {
              const tx = await connection.getParsedTransaction(sig.signature, { commitment: "confirmed" });
              if (tx && tx.meta && tx.meta.logMessages) {
                const memoLog = tx.meta.logMessages.find(log => log.includes("Memo (len"));
                if (memoLog) {
                  const match = memoLog.match(/"([^"]+)"/);
                  if (match) { setLatestTaunt(match[1]); break; }
                }
              }
            }
          } catch (e) {}
        }
      }
    } catch (e: any) {
      const message = e.message || String(e);
      if (message.includes("Account does not exist")) {
        setIsInitialized(false);
        setGameState(null);
      } else if (message.includes("429")) {
        nextRpcAttemptRef.current = Date.now() + 15000;
        setRpcError("High traffic. Retrying...");
      } else {
        console.error("Fetch error:", e);
      }
    }
  }, [connection, program, upsertHistory]);

  // Listener Setup
  useEffect(() => {
    if (!program) return;
    let listenerId: number | null = null;
    (async () => {
      try {
        listenerId = await program.addEventListener(
          "NewKingEvent",
          (event: Record<string, unknown>, _slot: number, signature: string) => {
            const newEvent: GameEvent = {
              signature,
              newKing: normalisePubkey(event["newKing"] ?? event["new_king"]),
              price: normaliseNumber(event["price"]) / LAMPORTS_PER_SOL,
              timestamp: normaliseNumber(event["timestamp"]),
              message: "",
            };
            upsertHistory((prev) => [newEvent, ...prev]);
            if (newEvent.message) setLatestTaunt(newEvent.message);
            fetchState();
          }
        );
      } catch (error) { console.error("Listener error", error); }
    })();
    return () => {
      if (listenerId !== null) {
        program.removeEventListener(listenerId).catch(() => {});
      }
    };
  }, [program, fetchState, upsertHistory]);

  // Poll
  useEffect(() => {
    if (program) {
      fetchState();
      const interval = setInterval(fetchState, 15000); 
      return () => clearInterval(interval);
    }
  }, [program, fetchState]);

  // --- ACTIONS (Wrapped in useCallback to stabilize references) ---

  // 1. Initialize
  const initializeGame = useCallback(async () => {
    if (!program || !publicKey) return;
    setLoading(true);
    try {
      const [gamePda] = PublicKey.findProgramAddressSync([Buffer.from("game_v1")], PROGRAM_ID);
      const startPrice = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
      
      const ix = await program.methods.initialize(startPrice).accounts({
          game: gamePda,
          creator: publicKey,
          systemProgram: SystemProgram.programId,
      }).instruction();

      const tx = new Transaction().add(ix);
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      await fetchState();
      setRpcError(null);
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes("User rejected")) alert("Init Failed");
    } finally { setLoading(false); }
  }, [program, publicKey, connection, sendTransaction, fetchState]);

  // 2. Usurp
  const usurpThrone = useCallback(async (tauntMessage: string = "") => {
    if (!program || !publicKey || !gameState || !wallet.signTransaction) return;
    setLoading(true);

    try {
      const [gamePda] = PublicKey.findProgramAddressSync([Buffer.from("game_v1")], PROGRAM_ID);
      const creatorKey = new PublicKey(gameState.feeOwner);
      
      const ix = await (program.methods as any)
        .usurpThrone()
        .accounts({
          game: gamePda,
          newKing: publicKey,
          previousKing: new PublicKey(gameState.king),
          creator: creatorKey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
      
      const tx = new Transaction().add(ix);
      
      // Optional taunt memo
      if (tauntMessage && tauntMessage.trim()) {
        try {
          const memoIx = createMemoInstruction(tauntMessage, [publicKey]);
          tx.add(memoIx);
        } catch (e) {
          console.warn("Failed to add memo instruction:", e);
        }
      }
      
      if (tauntMessage) setLatestTaunt(tauntMessage);

      // Use manual sign + send to avoid wallet adapter edge crashes
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      // Non-blocking IIFE to keep UI responsive while showing loading state
      (async () => {
        try {
          const signed = await wallet.signTransaction!(tx);
          const signature = await connection.sendRawTransaction(signed.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          });

          console.log("Usurp tx sent:", signature);

          connection
            .confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed")
            .then(() => {
              console.log("Usurp confirmed");
              fetchState();
              setRpcError(null);
            })
            .catch((err) => {
              console.error("Confirmation error:", err);
              setRpcError(null);
            })
            .finally(() => setLoading(false));
        } catch (signErr) {
          console.error("Signing/sending error:", signErr);
          const message = signErr instanceof Error ? signErr.message : String(signErr);
          if (!message.includes("User rejected")) {
            setRpcError(message);
          }
          setLoading(false);
        }
      })();
    } catch (err: any) {
      console.error("Usurp setup failed:", err);
      if (!err.message?.includes("User rejected")) {
        setRpcError(err.message || "Transaction failed");
      }
      setLoading(false);
    }
  }, [program, publicKey, gameState, connection, fetchState, wallet]);

  // 3. Claim
  const claimJackpot = useCallback(async () => {
    if (!program || !publicKey || !gameState) return;
    setLoading(true);
    try {
      const [gamePda] = PublicKey.findProgramAddressSync([Buffer.from("game_v1")], PROGRAM_ID);
      const ix = await (program.methods as any).claimJackpot().accounts({
          game: gamePda,
          king: publicKey,
          systemProgram: SystemProgram.programId,
      }).instruction();

      const tx = new Transaction().add(ix);
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      alert("Jackpot Claimed!");
      await fetchState();
      setRpcError(null);
    } catch (err: any) {
      console.error(err);
      if (!err.message?.includes("User rejected")) alert("Claim Failed");
    } finally { setLoading(false); }
  }, [program, publicKey, gameState, connection, sendTransaction, fetchState]);

  // 4. Send Taunt
  const sendTaunt = useCallback(async (message: string) => {
    if (!program || !publicKey || !wallet.signTransaction) return;
    setLatestTaunt(message);
    setLoading(true);
    
    try {
      let memoIx;
      try {
        memoIx = createMemoInstruction(message, [publicKey]);
      } catch (e) {
        console.error("Failed to build memo instruction:", e);
        setLoading(false);
        return;
      }

      const tx = new Transaction().add(memoIx);

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      // Non-blocking signing/sending to avoid wallet UI freeze
      (async () => {
        try {
          const signed = await wallet.signTransaction!(tx);
          const signature = await connection.sendRawTransaction(signed.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          });

          connection
            .confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed")
            .catch((err) => console.error("Taunt confirm error:", err))
            .finally(() => setLoading(false));
        } catch (err) {
          console.error("Taunt signing/sending failed:", err);
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.includes("User rejected")) setRpcError(msg);
          setLoading(false);
        }
      })();
    } catch (err) {
      console.error("Taunt setup failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("User rejected")) setRpcError(msg);
      setLoading(false);
    }
  }, [program, publicKey, connection, wallet]);

  return {
    gameState,
    gameHistory,
    latestTaunt,
    initializeGame,
    isInitialized,
    usurpThrone,
    claimJackpot,
    sendTaunt,
    loading,
    rpcError,
    walletAddress: publicKey?.toBase58(),
  };
};