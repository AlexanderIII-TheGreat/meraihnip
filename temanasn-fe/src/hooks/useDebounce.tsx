import { useEffect, useRef, useState } from "react";

export default function useDebounce(value: any, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState("");
  const timer = useRef<any>();
  useEffect(() => {
    timer.current = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer.current);
  }, [value, delay]);
  return debouncedValue;
}
