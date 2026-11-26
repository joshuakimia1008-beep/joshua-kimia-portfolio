"use client";
import { useEffect, useRef } from "react";
export default function TimelineProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current; if (!element) return;
    let frame = 0;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const rect = element.parentElement?.getBoundingClientRect(); if (!rect) return; const progress = Math.max(0, Math.min(1, (window.innerHeight * .78 - rect.top) / (rect.height + window.innerHeight * .25))); element.style.setProperty("--timeline-progress", String(progress)); }); };
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <div className="timeline-track" ref={ref}><span className="timeline-progress" aria-hidden="true" /></div>;
}
