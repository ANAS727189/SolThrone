import { Crown } from "lucide-react";

type CurrentMonarchCardProps = {
  isCurrentKing: boolean;
  truncatedKing: string;
};

export function CurrentMonarchCard({
  isCurrentKing,
  truncatedKing,
}: CurrentMonarchCardProps) {
  return (
    <div
      className={`bg-black/40 backdrop-blur-md border p-6 rounded-3xl transition-colors ${
        isCurrentKing ? "border-amber-500/30 bg-amber-900/10" : "border-white/10"
      }`}
    >
      <div
        className={`flex items-center gap-3 mb-4 ${
          isCurrentKing ? "text-amber-400" : "text-purple-400"
        }`}
      >
        <Crown size={18} />
        <span className="uppercase tracking-[0.2em] text-[10px] font-bold">
          Reigning Monarch
        </span>
      </div>
      <div className="font-mono text-lg text-gray-200">{truncatedKing}</div>
      <div className="mt-3 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full w-full ${
            isCurrentKing ? "bg-amber-500 animate-pulse" : "bg-purple-600"
          }`}
        ></div>
      </div>
      {isCurrentKing && (
        <div className="mt-2 text-[10px] text-amber-500 uppercase tracking-wider font-bold">
          You are defending the throne
        </div>
      )}
    </div>
  );
}
