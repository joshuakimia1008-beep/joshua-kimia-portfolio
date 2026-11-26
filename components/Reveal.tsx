"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type MotionDirection = "from-bottom" | "from-top";

export default function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const previousTop = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState<MotionDirection>("from-bottom");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const top = entry.boundingClientRect.top;
        const movingDown = previousTop.current === null
          ? top > 0
          : top < previousTop.current;

        if (entry.isIntersecting) {
          setDirection(movingDown ? "from-bottom" : "from-top");
          setVisible(true);
        } else {
          setVisible(false);
        }
        previousTop.current = top;
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-motion={direction}
      className={`reveal ${visible ? "in" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
