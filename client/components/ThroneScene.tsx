import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ThroneSceneProps {
  currentKing: string;
  price: number;
  isCurrentUser: boolean;
  latestMessage?: string;
}

export const ThroneScene = ({ currentKing, price, isCurrentUser, latestMessage }: ThroneSceneProps) => {
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentKing}&scale=120&radius=10`;
  const prevKingRef = useRef<string>(currentKing);

  const getThroneStyle = (price: number) => {
    if (price >= 10) {
      return {
        frame: "shadow-[0_0_110px_rgba(168,85,247,0.85)] border-purple-500 bg-gradient-to-b from-purple-900/60 to-black",
        arm: "border-purple-500",
        glow: "from-purple-400 to-pink-400",
      };
    }
    if (price >= 3) {
      return {
        frame: "shadow-[0_0_80px_rgba(234,179,8,0.55)] border-amber-400 bg-gradient-to-b from-amber-900/50 to-black",
        arm: "border-amber-400",
        glow: "from-amber-300 to-yellow-400",
      };
    }
    if (price >= 1) {
      return {
        frame: "shadow-[0_0_60px_rgba(148,163,184,0.5)] border-slate-200 bg-gradient-to-b from-slate-700 to-black",
        arm: "border-slate-300",
        glow: "from-slate-200 to-cyan-200",
      };
    }
    if (price >= 0.5) {
      return {
        frame: "shadow-[0_0_40px_rgba(205,127,50,0.45)] border-amber-700 bg-gradient-to-b from-amber-800/60 to-black",
        arm: "border-amber-700",
        glow: "from-amber-400 to-orange-300",
      };
    }
    if (price >= 0.2) {
      return {
        frame: "shadow-[0_0_30px_rgba(59,130,246,0.35)] border-blue-500 bg-gradient-to-b from-blue-800/60 to-black",
        arm: "border-blue-500",
        glow: "from-blue-300 to-teal-300",
      };
    }
    return {
      frame: "shadow-[0_0_18px_rgba(75,85,99,0.3)] border-gray-600 bg-gradient-to-b from-gray-800/70 to-black",
      arm: "border-gray-600",
      glow: "from-gray-300 to-slate-200",
    };
  };

  const triggerCelebration = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#FFD700", "#FFA500", "#8A2BE2"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#FFD700", "#FFA500", "#8A2BE2"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  useEffect(() => {
    if (prevKingRef.current !== currentKing && isCurrentUser) {
      triggerCelebration();
    }
    prevKingRef.current = currentKing;
  }, [currentKing, isCurrentUser, triggerCelebration]);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center perspective-1000">

      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent blur-3xl" />

      <div className="relative z-10 transform-style-3d scale-125 mt-20">

        {/* Base Platform */}
        <div className={`absolute top-32 left-1/2 -translate-x-1/2 w-80 h-12 rounded-lg border-t-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] ${isCurrentUser ? 'bg-yellow-900 border-yellow-500 shadow-yellow-500/20' : 'bg-gray-900 border-gray-700'}`}></div>
        
        {/* Throne Structure */}
        {isCurrentUser ? (
            // --- KING'S THRONE (GOLD VAULT) ---
            <>
              {/* Backrest */}
              <div className="absolute -top-52 left-1/2 -translate-x-1/2 w-60 h-80 bg-gradient-to-b from-yellow-500 via-yellow-700 to-yellow-900 rounded-t-full border-4 border-yellow-300 shadow-[0_0_80px_rgba(234,179,8,0.4)] flex flex-col items-center justify-start pt-6 overflow-hidden">
                 {/* Inner Vault Pattern */}
                 <div className="w-44 h-64 bg-yellow-950/50 rounded-t-full border border-yellow-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]"></div>
                    {/* Gold Bars Pattern */}
                    <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(135deg, #ffd700 25%, transparent 25%), linear-gradient(225deg, #ffd700 25%, transparent 25%), linear-gradient(45deg, #ffd700 25%, transparent 25%), linear-gradient(315deg, #ffd700 25%, transparent 25%)', backgroundSize: '20px 20px' }}></div>
                 </div>
              </div>

              {/* Arm Rests - Solid Gold Blocks */}
              <div className="absolute top-12 -left-36 w-28 h-32 bg-gradient-to-br from-yellow-400 to-yellow-700 rounded-lg transform -skew-y-6 border-t-2 border-yellow-200 shadow-2xl"></div>
              <div className="absolute top-12 left-8 w-28 h-32 bg-gradient-to-bl from-yellow-400 to-yellow-700 rounded-lg transform skew-y-6 border-t-2 border-yellow-200 shadow-2xl"></div>
              
              {/* Treasure Glow */}
              <div className="absolute -inset-10 bg-yellow-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
            </>
        ) : (
            // --- CHALLENGER'S THRONE (IRON/STONE) ---
            (() => {
              const tier = getThroneStyle(price);
              return (
                <>
                  {/* Backrest */}
                  <div className={`absolute -top-48 left-1/2 -translate-x-1/2 w-48 h-80 border-2 rounded-t-sm flex flex-col items-center pt-4 transition-all duration-500 ${tier.frame}`}>
                    <div className="w-32 h-64 bg-black/50 border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                    </div>
                  </div>

                  {/* Arm Rests */}
                  <div className={`absolute top-10 -left-32 w-24 h-40 bg-gray-900 border-r-2 border-gray-700 skew-y-12 shadow-2xl transition-all duration-500 ${tier.arm}`}></div>
                  <div className={`absolute top-10 left-8 w-24 h-40 bg-gray-900 border-l-2 border-gray-700 -skew-y-12 shadow-2xl transition-all duration-500 ${tier.arm}`}></div>

                  {/* Glow Ring */}
                  <div className={`absolute -inset-4 bg-gradient-to-r ${tier.glow} rounded-full blur-xl opacity-30 transition-opacity duration-500`}></div>
                </>
              );
            })()
        )}
      </div>

      <div className="absolute z-20 top-[15%] left-1/2 -translate-x-1/2 w-64 h-64">
        <AnimatePresence mode="popLayout">
          {latestMessage && (
                <div className="bg-white text-black px-4 py-3 rounded-2xl rounded-bl-none border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                    <p className="font-bold font-mono text-xs leading-tight uppercase">
                        "{latestMessage}"
                    </p>
                </div>
         )}
          <motion.div
            key={currentKing}
            className="flex flex-col items-center relative"
            initial={{ y: -600, opacity: 0, scale: 1.5, rotate: -10 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
              transition: { 
                type: "spring", 
                stiffness: 200, 
                damping: 15, 
                mass: 1.2 
              } 
            }}

            exit={{ 
              x: 1000, 
              y: -300, 
              rotate: 180, 
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.6, ease: "backIn" } 
            }}
          >
            {/* Floating Crown with King indicator */}
            <motion.div 
              animate={{ 
                y: isCurrentUser ? [-8, 8, -8] : [-5, 5, -5],
                rotate: isCurrentUser ? [-3, 3, -3] : [0, 0, 0]
              }}
              transition={{ repeat: Infinity, duration: isCurrentUser ? 2 : 3, ease: "easeInOut" }}
              className="absolute -top-24 z-50"
            >
              <div className="relative">
                <Crown 
                  size={isCurrentUser ? 90 : 80} 
                  fill={isCurrentUser ? "#FFD700" : "#B8860B"} 
                  stroke={isCurrentUser ? "#FF6B00" : "#8B6914"} 
                  strokeWidth={isCurrentUser ? 2 : 1.5}
                  className={isCurrentUser ? "drop-shadow-[0_0_40px_rgba(255,215,0,1)]" : "drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"}
                />
                {isCurrentUser && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-2xl opacity-60"
                  />
                )}
              </div>
            </motion.div>

            <div className="relative group w-56 h-56">
              
                {/* Enhanced Glow Ring for Current King */}
                {isCurrentUser && (
                  <>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.15, 1],
                        opacity: [0.4, 0.7, 0.4]
                      }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute -inset-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-3xl"
                    />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      className="absolute -inset-6 border-4 border-dashed border-yellow-400/60 rounded-full"
                    />
                  </>
                )}
                
                {/* Image Container */}
                <div className={`relative w-full h-full rounded-2xl overflow-hidden border-4 ${isCurrentUser ? 'border-yellow-400 shadow-[0_0_60px_rgba(251,191,36,0.9)]' : 'border-yellow-500/80'} bg-black shadow-2xl transform transition-transform ${isCurrentUser ? 'group-hover:scale-110' : 'group-hover:scale-105'}`}>
                    <img 
                        src={avatarUrl} 
                        alt="King" 
                        className="w-full h-full object-cover rendering-pixelated"
                        style={{ imageRendering: 'pixelated' }}
                    />
                    {/* Gloss Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>
                    
                    {/* Sparkle particles for current king */}
                    {isCurrentUser && (
                      <>
                        <motion.div
                          animate={{ y: [0, -200], opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 3, delay: 0 }}
                          className="absolute bottom-0 left-4 w-2 h-2 bg-yellow-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -200], opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                          className="absolute bottom-0 right-8 w-2 h-2 bg-orange-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -200], opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                          className="absolute bottom-0 left-1/2 w-2 h-2 bg-red-400 rounded-full"
                        />
                      </>
                    )}
                </div>

                {/* Enhanced Status Badge for King */}
                <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 backdrop-blur-xl border px-6 py-2 rounded-full flex flex-col items-center min-w-[200px] shadow-xl transition-all duration-300 ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-yellow-600/90 to-orange-600/90 border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.6)]' 
                    : 'bg-black/80 border-yellow-500/50'
                }`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold font-mono tracking-widest text-lg drop-shadow-md ${isCurrentUser ? 'text-white' : 'text-yellow-100'}`}>
                          {currentKing.slice(0, 4)}...{currentKing.slice(-4)}
                      </span>
                      {isCurrentUser && (
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-xs font-black text-black bg-yellow-300 px-2 py-0.5 rounded-full"
                        >
                          YOU
                        </motion.span>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-semibold tracking-wide uppercase mt-1 ${isCurrentUser ? 'text-yellow-100' : 'text-green-400'}`}>
                        <Sparkles size={10} className={isCurrentUser ? 'animate-spin' : ''} />
                        Reign Value: {price.toFixed(2)} SOL
                    </div>
                </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};