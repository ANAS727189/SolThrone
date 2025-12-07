"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { HelpCircle, Crown } from "lucide-react";

type NavbarProps = {
  walletAddress: string | null | undefined;
  isCurrentKing: boolean;
  onOpenRules: () => void;
};

export function Navbar({ walletAddress, isCurrentKing, onOpenRules }: NavbarProps) {
  const truncated = walletAddress
    ? `${walletAddress.slice(0, 4)}..${walletAddress.slice(-4)}`
    : "DISCONNECTED";

  return (
    <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <Crown size={24} className="text-amber-500" />
        <span className="font-black tracking-tighter text-white text-xl hidden md:block">
            SOLTHRONE
        </span>
      </div>

      {/* RIGHT: Controls */}
      <div className="flex items-center gap-4 pointer-events-auto">
        
        {/* 1. Identity Display */}
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-1">
            Operator Identity
          </span>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
              isCurrentKing
                ? "bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-white/5 border-white/10 text-gray-300"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                walletAddress
                  ? "bg-green-400 shadow-[0_0_8px_#4ade80]"
                  : "bg-gray-500"
              }`}
            ></div>
            <span className="font-mono text-sm">{truncated}</span>
          </div>
        </div>

        {/* 2. Wallet Button (Isolated Container) */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all shadow-2xl h-[48px] flex items-center">
          <WalletMultiButton
            style={{
              backgroundColor: "transparent",
              height: "100%",
              fontWeight: "700",
              fontSize: "14px",
              letterSpacing: "0.05em",
              padding: "0 24px",
            }}
          />
        </div>
        <button 
            onClick={onOpenRules}
            className="group relative w-12 h-12 flex items-center justify-center bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all shadow-xl"
        >
            <HelpCircle size={22} className="text-gray-400 group-hover:text-white transition-colors" />
            <span className="absolute -bottom-8 scale-0 group-hover:scale-100 transition-transform bg-black border border-white/20 text-[10px] text-white px-2 py-1 rounded uppercase tracking-widest pointer-events-none">
                Rules
            </span>
        </button>

      </div>
    </nav>
  );
}