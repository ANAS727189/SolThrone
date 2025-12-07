import { useCallback } from "react";

export const useGameSounds = () => {
  const playUsurp = useCallback(() => {
    const audio = new Audio("/sounds/slam.mp3"); // You need to put mp3s in public/sounds/
    audio.volume = 0.5;
    audio.play().catch(() => {}); // Ignore auto-play errors
  }, []);

  const playSuccess = useCallback(() => {
    const audio = new Audio("/sounds/coins.mp3");
    audio.play().catch(() => {});
  }, []);

  return { playUsurp, playSuccess };
};