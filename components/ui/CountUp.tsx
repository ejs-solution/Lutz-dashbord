"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const timer = setTimeout(() => {
      const step = (ts: number) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        setValue(Math.round(eased * target));
        if (progress < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);

  return value;
}

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  className = "",
  duration = 1200,
  delay = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const count = useCountUp(value, duration, delay);
  return (
    <span className={className}>
      {prefix}{count.toLocaleString("de-DE")}{suffix}
    </span>
  );
}
