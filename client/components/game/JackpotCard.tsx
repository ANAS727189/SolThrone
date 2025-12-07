import { Trophy } from "lucide-react";

type JackpotCardProps = {
  jackpot: number;
};

export function JackpotCard({ jackpot }: JackpotCardProps) {
  return (
    <div className="group bg-linear-to-b from-gray-900 to-black border border-white/10 p-1 rounded-3xl shadow-2xl">
      <div className="bg-[#0a0a0a] rounded-[20px] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Trophy size={100} />
        </div>
        <div className="flex items-center gap-3 text-amber-500 mb-3">
          <Trophy size={18} />
          <span className="uppercase tracking-[0.2em] text-[10px] font-bold">
            Protocol Bounty
          </span>
        </div>
        <div className="text-5xl font-black text-white tracking-tighter">
          {jackpot.toFixed(3)}
        </div>
        <div className="text-sm text-gray-500 font-mono mt-1">SOLANA (SOL)</div>
      </div>
    </div>
  );
}
