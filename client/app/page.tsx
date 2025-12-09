"use client";

import { useEffect, useState } from "react";
import { Power } from "lucide-react";

import { ControlPanel } from "@/components/game/ControlPanel";
import { DataFeedPanel } from "@/components/game/DataFeedPanel";
import { GameMechanicsPanel } from "@/components/game/GameMechanicsPanel";
import { Navbar } from "@/components/layout/Navbar";
import { ThroneScene } from "../components/ThroneScene";
import { WalletContextProvider } from "../context/WalletContextProvider";
import { useKingContract } from "../hooks/useKingContract";
import { RulesModal } from "@/components/RulesModal";
import { RoyalAtmosphere } from "@/components/game/RoyalAtmosphere";
import { ChallengerAtmosphere } from "@/components/game/ChallengerAtmosphere";

const GameContent = () => {
  const {
    gameState,
    gameHistory,
    latestTaunt,
    usurpThrone,
    claimJackpot,
    sendTaunt,
    initializeGame,
    isInitialized,
    loading,
    rpcError,
    walletAddress,
  } = useKingContract();
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const [fallbackEndTimestamp] = useState(() => Math.floor(Date.now() / 1000) + 86400);

  const displayState =
    gameState || {
      king: "11111111111111111111111111111111",
      price: 0.1,
      endTimestamp: fallbackEndTimestamp,
      jackpot: 0,
    };

  const [timeLeft, setTimeLeft] = useState(0);
  const isCurrentKing = gameState?.king === walletAddress;

  useEffect(() => {
    const calculateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, displayState.endTimestamp - now);
      setTimeLeft(remaining);
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [displayState.endTimestamp]);

  if (!isInitialized && walletAddress) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600 tracking-tighter drop-shadow-sm">SYSTEM DORMANT</h1>
            <p className="text-gray-400 font-mono tracking-wide">The Golden Throne awaits initialization.</p>
            <button 
                onClick={initializeGame}
                disabled={loading}
                className="group relative px-10 py-4 bg-red-600/10 border border-red-500/50 hover:bg-red-600 hover:border-red-500 text-red-100 rounded-none font-bold font-mono tracking-widest transition-all duration-300 overflow-hidden"
            >
                <div className="absolute inset-0 bg-red-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center gap-3">
                    <Power size={20} className={loading ? "animate-spin" : ""} />
                    {loading ? "BOOTING SEQUENCE..." : "INITIALIZE PROTOCOL"}
                </div>
            </button>
        </div>
      </div>
    );
  }

  const nextBid = (displayState.price * 1.3).toFixed(3);
  const hours = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const seconds = Math.floor(timeLeft % 60);
  const isContestLocked = timeLeft <= 0;
  const truncatedKing = `${displayState.king.slice(0, 4)}…${displayState.king.slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#030304] text-white overflow-x-hidden font-sans selection:bg-amber-500/30">
      {/* --- CINEMATIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050505] to-[#000000]"></div>
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
        {/* Grid Noise */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* --- ATMOSPHERE --- */}
      {isCurrentKing ? <RoyalAtmosphere /> : <ChallengerAtmosphere />}

      {rpcError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-600/20 border border-red-500/50 text-red-200 font-mono text-sm rounded-xl shadow-lg backdrop-blur-xl max-w-xl text-center">
          {rpcError}
        </div>
      )}

      {!isCurrentKing && latestTaunt && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-amber-600/20 border border-amber-500/50 text-amber-100 font-mono text-base rounded-xl shadow-lg backdrop-blur-xl max-w-2xl text-center">
          <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">The King Decrees:</div>
          <div className="font-bold text-lg">"{latestTaunt}"</div>
        </div>
      )}

      <Navbar 
      walletAddress={walletAddress} 
      isCurrentKing={isCurrentKing} 
      onOpenRules={() => setIsRulesOpen(true)}
      />

      {isRulesOpen && <RulesModal onClose={() => setIsRulesOpen(false)} />}

      <main className="relative z-10 flex flex-col md:flex-row min-h-screen items-center justify-center p-4 pt-28 md:p-12 gap-8">
        <DataFeedPanel
          jackpot={displayState.jackpot}
          isCurrentKing={isCurrentKing}
          truncatedKing={truncatedKing}
          hours={hours}
          mins={mins}
          seconds={seconds}
          isContestLocked={isContestLocked}
        />

        <div className="w-full md:w-2/4 flex flex-col items-center justify-center relative">
          <ThroneScene
            currentKing={displayState.king}
            price={displayState.price}
            isCurrentUser={isCurrentKing}
          />

          <ControlPanel
            isContestLocked={isContestLocked}
            isCurrentKing={isCurrentKing}
            nextBid={nextBid}
            truncatedKing={truncatedKing}
            loading={loading}
            claimJackpot={claimJackpot}
            usurpThrone={usurpThrone}
            sendTaunt={sendTaunt}
            currentPrice={displayState.price}
          />
        </div>

        <GameMechanicsPanel 
          history={gameHistory}
        />
      </main>
    </div>
  );
};

export default function Home() {
  return (
    <WalletContextProvider>
      <GameContent />
    </WalletContextProvider>
  );
}