import { Timer } from "lucide-react";

type TimerCardProps = {
  hours: number;
  mins: number;
  seconds: number;
  isContestLocked: boolean;
};

export function TimerCard({ hours, mins, seconds, isContestLocked }: TimerCardProps) {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
      <div className="flex items-center gap-3 text-blue-400 mb-2">
        <Timer size={18} />
        <span className="uppercase tracking-[0.2em] text-[10px] font-bold">
          Session Timer
        </span>
      </div>
      <div className="text-4xl font-mono text-white tracking-tight">
        {hours}
        <span className="text-gray-600">:</span>
        {mins}
        <span className="text-gray-600">:</span>
        {seconds}
      </div>
      <p className="text-[10px] text-gray-500 mt-3 uppercase tracking-wider">
        {isContestLocked ? "Market Closed" : "Resets on Transaction"}
      </p>
    </div>
  );
}
