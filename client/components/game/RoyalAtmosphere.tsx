"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const RoyalAtmosphere = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track mouse for Midas Touch trail
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (Math.random() > 0.7) { // Increased density slightly
        setTrail((prev) => [
          ...prev.slice(-25),
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
      setTrail((prev) => prev.filter((p) => p.id > Date.now() - 800));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* 1. God Rays / Holy Light - Rotating Conic Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,215,0,0.15),transparent_70%)] mix-blend-screen pointer-events-none" />
      <motion.div 
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,215,0,0.03)_20deg,transparent_40deg,rgba(255,215,0,0.03)_60deg,transparent_80deg,rgba(255,215,0,0.03)_100deg,transparent_120deg,rgba(255,215,0,0.03)_140deg,transparent_160deg,rgba(255,215,0,0.03)_180deg,transparent_200deg,rgba(255,215,0,0.03)_220deg,transparent_240deg,rgba(255,215,0,0.03)_260deg,transparent_280deg,rgba(255,215,0,0.03)_300deg,transparent_320deg,rgba(255,215,0,0.03)_340deg,transparent_360deg)] mix-blend-plus-lighter"
      />

      {/* 2. Rich Golden Border / Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(255,165,0,0.2)] border-[1px] border-yellow-500/10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-yellow-500/5 mix-blend-overlay pointer-events-none" />

      {/* 3. Floating Gold Dust & Sparkles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-200 rounded-full blur-[0.5px]"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: [null, Math.random() * -150], // Float up
            opacity: [0, 0.8, 0],
            scale: [0, Math.random() * 2 + 0.5, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 4 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        >
           {/* Make some particles look like tiny stars */}
           {i % 3 === 0 && (
             <div className="absolute inset-0 bg-white blur-[1px] animate-pulse" />
           )}
        </motion.div>
      ))}

      {/* 4. Midas Touch Cursor Trail - Enhanced with Star Shapes */}
      <AnimatePresence>
        {trail.map((point, i) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 1, scale: 1, x: point.x, y: point.y }}
            animate={{ opacity: 0, scale: 0, y: point.y + 30, rotate: Math.random() * 90 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute pointer-events-none"
          >
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-300 drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor" />
             </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 5. Corner Ornaments */}
      <div className="absolute top-4 left-4 w-32 h-32 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-3xl" />
      <div className="absolute top-4 right-4 w-32 h-32 border-t-2 border-r-2 border-yellow-500/30 rounded-tr-3xl" />
      <div className="absolute bottom-4 left-4 w-32 h-32 border-b-2 border-l-2 border-yellow-500/30 rounded-bl-3xl" />
      <div className="absolute bottom-4 right-4 w-32 h-32 border-b-2 border-r-2 border-yellow-500/30 rounded-br-3xl" />

      {/* 6. Watermark */}
      <div className="absolute bottom-8 right-8 opacity-10 pointer-events-none">
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-700 rotate-[-10deg] tracking-tighter select-none drop-shadow-lg">
          KING
        </div>
      </div>
    </div>
  );
};
