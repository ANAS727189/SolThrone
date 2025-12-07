import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ThroneSceneProps {
  currentKing: string;
  price: number;
  isCurrentUser: boolean;
}

export const ThroneScene = ({ currentKing, price, isCurrentUser }: ThroneSceneProps) => {
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentKing}&scale=120&radius=10`;
  const prevKingRef = useRef<string>(currentKing);

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

        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-80 h-12 bg-gray-900 rounded-lg border-t-4 border-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.2)]"></div>
        
        {/* Throne Back*/}
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-48 h-80 bg-gradient-to-b from-gray-800 to-black border-2 border-yellow-500/50 rounded-t-2xl shadow-[0_0_30px_rgba(168,85,247,0.5)] flex flex-col items-center pt-4">
           <div className="w-32 h-64 bg-black/50 rounded-t-xl border border-purple-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent animate-pulse"></div>
           </div>
        </div>

        {/* Arm Rests */}
        <div className="absolute top-10 -left-32 w-24 h-40 bg-gray-800 border-r-4 border-yellow-600 skew-y-12 shadow-2xl"></div>
        <div className="absolute top-10 left-8 w-24 h-40 bg-gray-800 border-l-4 border-yellow-600 -skew-y-12 shadow-2xl"></div>
      </div>

      <div className="absolute z-20 top-[15%] left-1/2 -translate-x-1/2 w-64 h-64">
        <AnimatePresence mode="popLayout">
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
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-24 z-50 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"
            >
              <Crown size={80} fill="#FFD700" stroke="#B8860B" strokeWidth={1.5} />
            </motion.div>


            <div className="relative group w-56 h-56">
                {/* Glow Ring */}
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500 to-purple-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                
                {/* Image Container */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-yellow-500/80 bg-black shadow-2xl transform transition-transform group-hover:scale-105">
                    <img 
                        src={avatarUrl} 
                        alt="King" 
                        className="w-full h-full object-cover rendering-pixelated"
                        style={{ imageRendering: 'pixelated' }}
                    />
                    {/* Gloss Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>
                </div>

                {/* Status Badge */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-yellow-500/50 px-6 py-2 rounded-full flex flex-col items-center min-w-[200px] shadow-xl">
                    <span className="text-yellow-100 font-bold font-mono tracking-widest text-lg drop-shadow-md">
                        {currentKing.slice(0, 4)}...{currentKing.slice(-4)}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-green-400 font-semibold tracking-wide uppercase mt-1">
                        <Sparkles size={10} />
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