import { useCallback, useEffect, useRef, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import kingOfTheHillIdl from "../idl/king_of_the_hill.json";
const PROGRAM_ID = new PublicKey(kingOfTheHillIdl.address);

const normalisePubkey = (value: unknown): string => {
  if (!value) return "";

  if (value instanceof PublicKey) return value.toBase58();

  if (typeof value === "object" && value !== null && "toBase58" in value) {
    try {
      return (value as { toBase58: () => string }).toBase58();
    } catch {
      return "";
    }
  }

  if (typeof value === "string") {
    try {
      return new PublicKey(value).toBase58();
    } catch {
      return value;
    }
  }

  return "";
};

const normaliseNumber = (value: unknown): number => {
  const anyVal = value as any;

  if (anyVal instanceof anchor.BN) return anyVal.toNumber();

  if (typeof value === "object" && value !== null && "toNumber" in value) {
    try {
      return (value as { toNumber: () => number }).toNumber();
    } catch {
      return 0;
    }
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
};

export const useKingContract = () => {
  const wallet = useAnchorWallet();

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

  const upsertHistory = useCallback(
    (updater: (current: GameEvent[]) => GameEvent[]) => {
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

        const ordered = deduped.sort((a, b) => b.timestamp - a.timestamp);

        gameHistoryRef.current = ordered;

        return ordered;
      });
    },
    []
  );

  // 1. Setup Anchor Provider

  useEffect(() => {
    if (wallet) {
      const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "processed",
      });

      const prog = new anchor.Program(kingOfTheHillIdl as anchor.Idl, provider);

      setProgram(prog);
    }
  }, [wallet, connection]);

  // 2. Fetch Game State

 const fetchState = useCallback(async () => {
    if (!program) return;
    const now = Date.now();
    if (now < nextRpcAttemptRef.current) return;

    try {
      const [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game_v1")],
        PROGRAM_ID
      );

      // A. Fetch State
      const state = (await (program.account as any).gameState.fetch(
        gamePda
      )) as GameStateAccount;

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

        const signatures = await connection.getSignaturesForAddress(gamePda, {
          limit: 5, 
        });

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
              } catch (e) {
                console.warn("Failed to fetch tx:", sig.signature);
                return null;
              }
            })
          );

          const history: GameEvent[] = [];
          const eventParser = new anchor.EventParser(PROGRAM_ID, program.coder);

          parsedTxs.forEach((tx, i) => {
            if (!tx || !tx.meta || !tx.meta.logMessages) return;

            for (const event of eventParser.parseLogs(tx.meta.logMessages)) {
              if (event.name === "NewKingEvent" || event.name === "newKingEvent") {
                const data = event.data as Record<string, unknown>;
                const newKingRaw = data["newKing"] ?? data["new_king"];
                const priceRaw = data["price"];
                const timestampRaw = data["timestamp"];

                history.push({
                  signature: signatures[i].signature,
                  newKing: normalisePubkey(newKingRaw),
                  price: normaliseNumber(priceRaw) / LAMPORTS_PER_SOL,
                  timestamp: normaliseNumber(timestampRaw),
                });
              }
            }
          });

          if (history.length) {
            upsertHistory(() => history);
          }
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);

      if (message.includes("Account does not exist")) {
        setIsInitialized(false);

        setGameState(null);
      } else if (message.includes("Failed to fetch")) {
        setRpcError(
          "Unable to reach Solana RPC. Ensure your validator or endpoint at " +
            connection.rpcEndpoint +
            " is running."
        );
      } else if (message.includes("429")) {
        nextRpcAttemptRef.current = Date.now() + 15000;

        setRpcError(
          "RPC rate limit hit. Cooling down before retrying. Consider using a private devnet RPC URL."
        );
      } else {
        setRpcError(message);

        console.error("Error fetching state:", e);
      }
    }
  }, [connection, program, upsertHistory]);

  useEffect(() => {
    if (!program) return;

    let listenerId: number | null = null;

    (async () => {
      try {
        listenerId = await program.addEventListener(
          "NewKingEvent",

          (
            event: Record<string, unknown>,
            _slot: number,
            signature: string
          ) => {
            const newEvent: GameEvent = {
              signature,

              newKing: normalisePubkey(event["newKing"] ?? event["new_king"]),

              price: normaliseNumber(event["price"]) / LAMPORTS_PER_SOL,

              timestamp: normaliseNumber(event["timestamp"]),
            };

            upsertHistory((prev) => [newEvent, ...prev]);

            fetchState();
          }
        );
      } catch (error) {
        console.error("Failed to register NewKingEvent listener", error);
      }
    })();

    return () => {
      if (listenerId !== null) {
        program
          .removeEventListener(listenerId)
          .catch((error) =>
            console.warn("Failed to remove NewKingEvent listener", error)
          );
      }
    };
  }, [program, fetchState, upsertHistory]);


  useEffect(() => {
    if (program) {
      fetchState();

      const interval = setInterval(fetchState, 600000);

      return () => clearInterval(interval);
    }
  }, [program, fetchState]);

  const initializeGame = async () => {
    if (!program || !wallet) return;

    setLoading(true);

    try {
      const [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game_v1")],
        PROGRAM_ID
      );

      const startPrice = new anchor.BN(0.1 * LAMPORTS_PER_SOL);

      await program.methods

        .initialize(startPrice)

        .accounts({
          game: gamePda,

          creator: wallet.publicKey,

          systemProgram: SystemProgram.programId,
        })

        .rpc();

      console.log("Game Initialized!");

      await fetchState();

      setRpcError(null);
    } catch (err) {
      console.error("Init failed:", err);

      const message = err instanceof Error ? err.message : String(err);

      if (message.includes("Failed to fetch")) {
        setRpcError(
          "Cannot reach Solana RPC. Start your local validator or update NEXT_PUBLIC_SOLANA_RPC_URL."
        );
      } else {
        setRpcError(message);
      }

      alert("Initialization failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // 3. The "Usurp" Action

  const usurpThrone = async () => {
    if (!program || !wallet || !gameState) return;

    setLoading(true);

    try {
      const [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game_v1")],
        PROGRAM_ID
      );

      const creatorKey = new PublicKey(gameState.feeOwner);

      await (program.methods as any)

        .usurpThrone()

        .accounts({
          game: gamePda,

          newKing: wallet.publicKey,

          previousKing: new PublicKey(gameState.king),

          creator: creatorKey,

          systemProgram: SystemProgram.programId,
        })

        .rpc();

      await fetchState(); 
      setRpcError(null);
    } catch (err) {
      console.error("Transaction failed:", err);

      const message = err instanceof Error ? err.message : String(err);

      if (message.includes("Failed to fetch")) {
        setRpcError(
          "Cannot reach Solana RPC. Start your local validator or update NEXT_PUBLIC_SOLANA_RPC_URL."
        );
      } else {
        setRpcError(message);
      }

      alert("Transaction failed! See console.");
    } finally {
      setLoading(false);
    }
  };

  const claimJackpot = async () => {
    if (!program || !wallet || !gameState) return;

    setLoading(true);

    try {
      const [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game_v1")],
        PROGRAM_ID
      );

      await (program.methods as any)

        .claimJackpot()

        .accounts({
          game: gamePda,

          king: wallet.publicKey, // Must be the winner

          systemProgram: SystemProgram.programId,
        })

        .rpc();

      alert("JACKPOT CLAIMED! 💰 Check your wallet.");

      await fetchState();
      setRpcError(null);
    } catch (err) {
      console.error("Claim failed:", err);

      const message = err instanceof Error ? err.message : String(err);

      if (message.includes("Failed to fetch")) {
        setRpcError(
          "Cannot reach Solana RPC. Start your local validator or update NEXT_PUBLIC_SOLANA_RPC_URL."
        );
      } else {
        setRpcError(message);
      }

      alert("Claim failed! Are you the King? Is the time up?");
    } finally {
      setLoading(false);
    }
  };

  return {
    gameState,
    gameHistory,
    initializeGame,
    isInitialized,
    usurpThrone,
    claimJackpot,
    loading,
    rpcError,
    walletAddress: wallet?.publicKey?.toBase58(),
  };
};
