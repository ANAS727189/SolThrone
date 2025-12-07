"use client";

import { motion } from "framer-motion";
import { Coins, Zap } from "lucide-react";
import { ActivityLog } from "../ActivityLog";

type HistoryEntry = {
  signature: string;
  newKing: string;
  price: number;
  timestamp: number;
};

export function GameMechanicsPanel({  history}: { history: HistoryEntry[];}) {
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="hidden pointer-events-none md:flex mt-16 md:w-1/4 md:h-full md:flex-col md:justify-center md:gap-6 md:text-right"
    >
      <div className="bg-black/40 backdrop-blur-lg border border-white/10 p-6 rounded-3xl ml-auto max-w-xs">
        <div className="flex items-center justify-end gap-3 text-red-400 mb-3">
          <span className="uppercase tracking-[0.2em] text-[10px] font-bold">
            Victory Condition
          </span>
          <Zap size={18} />
        </div>
        <p className="text-gray-400 text-xs leading-relaxed font-mono">
          When the timer hits <span className="text-white">00:00:00</span>, the last Monarch holding the throne executes the claim function to drain the <span className="text-amber-400">Grand Jackpot</span>.
        </p>
      </div>
         <div className="pointer-events-auto">
        <ActivityLog history={history} />
      </div>
    </motion.div>
  );
}
