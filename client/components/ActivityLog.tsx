import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, ExternalLink, History } from "lucide-react";

interface ActivityLogProps {
  history: Array<{
    signature: string;
    newKing: string;
    price: number;
    timestamp: number;
  }>;
}

export const ActivityLog = ({ history }: ActivityLogProps) => {
  const [currentTime, setCurrentTime] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    const diff = Math.max(0, currentTime - timestamp);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    
    return `${Math.floor(diff / 3600)}h ago`;
  };
  return (
    <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 overflow-hidden flex flex-col h-[280px]">
      <div className="flex items-center gap-2 text-gray-500 mb-2 text-[10px] font-mono uppercase tracking-[0.2em] border-b border-white/5 pb-2">
        <History size={14} />
        <span>Recent Usurpations</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <div className="text-gray-600 text-xs text-center mt-10 font-mono opacity-50">
                NO HISTORY RECORDED
            </div>
          ) : (
            history.map((log) => (
              <motion.div
                key={log.signature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between text-xs group p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Sword size={10} className="text-red-500" />
                    <span className="text-amber-200 font-mono font-bold">
                        {log.newKing.slice(0, 4)}...{log.newKing.slice(-4)}
                    </span>
                  </div>
                  <span className="text-gray-500 text-[10px]">{formatTime(log.timestamp)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-white font-mono">{log.price.toFixed(3)} SOL</div>
                    <div className="text-[9px] text-green-500/80 uppercase tracking-wider">Seized</div>
                  </div>
                  <a 
                    href={`https://explorer.solana.com/tx/${log.signature}?cluster=custom&customUrl=http://127.0.0.1:8899`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-white/5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};