import { useCallback } from "react";

export const useGameSounds = () => {
  const playUsurp = useCallback(() => {
    const audio = new Audio("/sounds/slam.mp3"); 
    audio.volume = 0.5;
    audio.play().catch(() => {}); 
  }, []);

  const playSuccess = useCallback(() => {
    const audio = new Audio("/sounds/coins.mp3");
    audio.play().catch(() => {});
  }, []);

  return { playUsurp, playSuccess };
};