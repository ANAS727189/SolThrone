"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const ChallengerAtmosphere = () => {
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track mouse for "Burning Ambition" trail
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.6) { // Density
        setTrail((prev) => [
          ...prev.slice(-30),
          { x: e.clientX, y: e.clientY, id: Date.now() + Math.random() },
        ]);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Clean up old trail points
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail((prev) => prev.filter((p) => p.id > Date.now() - 600));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 1. Dark Gritty Overlay - "The Battlefield" */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-red-900/5 mix-blend-overlay" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />

      {/* 2. Rising Embers / Ash - Bottom up animation */}
      {[...Array(35)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${Math.random() > 0.6 ? 'bg-orange-500' : 'bg-red-600'}`}
          style={{
            width: Math.random() * 2 + 1 + "px",
            height: Math.random() * 2 + 1 + "px",
            filter: "blur(0.5px)",
            boxShadow: "0 0 4px rgba(255, 69, 0, 0.4)"
          }}
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: typeof window !== "undefined" ? window.innerHeight + 20 : 1000,
            opacity: 0,
          }}
          animate={{
            y: -100, // Float up off screen
            x: (Math.random() - 0.5) * 150, // Drift
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* 3. Burning Cursor Trail */}
      <AnimatePresence>
        {trail.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0.8, scale: 1, x: point.x, y: point.y }}
            animate={{ 
                opacity: 0, 
                scale: 0, 
                y: point.y - 30 - Math.random() * 20, // Rise up like smoke
                x: point.x + (Math.random() - 0.5) * 15 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute w-2 h-2 bg-orange-400 rounded-full blur-[2px] mix-blend-screen"
          />
        ))}
      </AnimatePresence>

      {/* 4. Subtle Red Pulse at the bottom (Heartbeat of the challenger) */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent blur-xl"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* 5. Corner Accents - Sharp, Aggressive (vs King's ornate ones) */}
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-red-500/20" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-red-500/20" />
      <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-red-500/20" />
      <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-red-500/20" />

      {/* 6. Watermark */}
      <div className="absolute bottom-8 right-8 opacity-10 pointer-events-none">
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-900 to-red-600 rotate-[-10deg] tracking-tighter select-none drop-shadow-lg">
          CHALLENGE
        </div>
      </div>

    </div>
  );
};
