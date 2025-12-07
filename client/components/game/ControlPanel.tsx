"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Shield, Trophy } from "lucide-react";

type ControlPanelProps = {
  isContestLocked: boolean;
  isCurrentKing: boolean;
  nextBid: string;
  truncatedKing: string;
  loading: boolean;
  claimJackpot: () => void;
  usurpThrone: () => void;
  currentPrice: number;
};

export function ControlPanel({
  isContestLocked,
  isCurrentKing,
  nextBid,
  truncatedKing,
  loading,
  claimJackpot,
  usurpThrone,
  currentPrice,
}: ControlPanelProps) {
  return (
    <div className="absolute bottom-12 w-full flex justify-center z-50">
      {isContestLocked ? (
        isCurrentKing ? (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={claimJackpot}
            disabled={loading}
            className="group relative px-16 py-6 bg-yellow-600 text-black font-black text-2xl tracking-widest rounded-2xl shadow-[0_0_60px_rgba(251,191,36,0.6)] border-2 border-white/20"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <Trophy size={32} strokeWidth={2.5} />
              {loading ? "WITHDRAWING..." : "CLAIM JACKPOT"}
            </div>
            <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
          </motion.button>
        ) : (
          <div className="px-10 py-5 bg-black/80 backdrop-blur-xl border border-red-500/30 rounded-2xl text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-red-500 font-bold tracking-[0.2em] mb-1">
              <AlertTriangle size={18} />
              <span>CONTEST SEALED</span>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Waiting for the Victor ({truncatedKing}) to claim the bounty.
            </span>
          </div>
        )
      ) : isCurrentKing ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative px-12 py-6 bg-amber-950/40 backdrop-blur-xl border border-amber-500/30 rounded-2xl flex flex-col items-center gap-2 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
        >
          <div className="flex items-center gap-3 text-amber-400">
            <Shield className="animate-pulse" size={24} />
            <span className="font-bold tracking-widest uppercase">Throne Secured</span>
          </div>
          <div className="text-xs text-amber-200/60 font-mono text-center">
            Rivals must pay {nextBid} SOL to challenge you.
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs text-gray-500 font-mono uppercase tracking-widest bg-black/50 px-4 py-1 rounded-full border border-white/5">
            Current Valuation: {currentPrice.toFixed(3)} SOL
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={usurpThrone}
            disabled={loading}
            className={`
              group relative min-w-[300px] px-8 py-5 
              bg-white text-black 
              font-black text-xl tracking-tighter 
              rounded-xl shadow-[0_0_40px_rgba(255,255,255,0.3)]
              hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]
              transition-all duration-300
              ${loading ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <span className="animate-pulse">CONFIRMING...</span>
              ) : (
                <>
                  <span>SEIZE THRONE</span>
                  <span className="bg-black text-white text-xs px-2 py-1 rounded font-mono">
                    {nextBid} SOL
                  </span>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-linear-to-r from-purple-200 to-amber-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          </motion.button>
        </div>
      )}
    </div>
  );
}
