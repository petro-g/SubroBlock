import { useCallback, useRef } from "react";

const useDelay = () => {
  // wrap function with HOC and pass desired delay to it
  const timeoutRef = useRef<number | null>(null);
  const delay = useCallback((func: (...args: unknown[]) => void, delay: number) => {
    if (timeoutRef.current)
      clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(func, delay) as unknown as number;
  }, []);

  return { delay };
}

export default useDelay;
