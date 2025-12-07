"use client";

import { motion } from "framer-motion";

import { ActivityLog } from "@/components/ActivityLog";

import { CurrentMonarchCard } from "./CurrentMonarchCard";
import { JackpotCard } from "./JackpotCard";
import { TimerCard } from "./TimerCard";



type DataFeedPanelProps = {
  jackpot: number;
  isCurrentKing: boolean;
  truncatedKing: string;
  hours: number;
  mins: number;
  seconds: number;
  isContestLocked: boolean;
};

export function DataFeedPanel({
  jackpot,
  isCurrentKing,
  truncatedKing,
  hours,
  mins,
  seconds,
  isContestLocked,
}: DataFeedPanelProps) {
  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="hidden pointer-events-none md:flex md:w-1/4 md:h-full md:flex-col md:justify-center md:gap-6"
    >
      <JackpotCard jackpot={jackpot} />
      <CurrentMonarchCard isCurrentKing={isCurrentKing} truncatedKing={truncatedKing} />
      <TimerCard hours={hours} mins={mins} seconds={seconds} isContestLocked={isContestLocked} />
    </motion.div>
  );
}
