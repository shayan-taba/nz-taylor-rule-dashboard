import { useEffect, useRef } from "react";

export function useDebounce(fn: () => void, delay: number, deps: unknown[]) {
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
