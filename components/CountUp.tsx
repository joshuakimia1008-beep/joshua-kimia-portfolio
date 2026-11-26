"use client";
import { useEffect, useRef, useState } from "react";
export default function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null); const [count, setCount] = useState(0);
  useEffect(() => {
    const node = ref.current; if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setCount(value); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const started = performance.now(); let frame = 0;
      const tick = (now: number) => { const t = Math.min((now - started) / 1200, 1); setCount(Math.round(value * (1 - Math.pow(1 - t, 3)))); if (t < 1) frame = requestAnimationFrame(tick); };
      frame = requestAnimationFrame(tick); observer.disconnect();
      return () => cancelAnimationFrame(frame);
    }, { threshold: .45 });
    observer.observe(node); return () => observer.disconnect();
  }, [value]);
  return <span ref={ref} className="count-up">{count}{suffix}</span>;
}
