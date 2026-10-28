import { useEffect, useState } from "react";

/** Steps 0..length-1 every `intervalMs`, paused while `isPaused`. */
export function useRotatingIndex(length: number, intervalMs: number, isPaused: boolean) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (isPaused || length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => window.clearInterval(id);
  }, [length, intervalMs, isPaused]);
  return { index, setIndex };
}
