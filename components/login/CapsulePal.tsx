"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CapsulePal.module.css";

export type PalMood = "idle" | "happy" | "oops";

type CapsulePalProps = {
  /** Drives the expression from outside (e.g. form success / error). */
  mood?: PalMood;
};

/**
 * Capsule Pal — a small glowing character sealed in a glass capsule.
 * Pure CSS + a tiny pointer-tracking loop: no images, no WebGL, no dependencies.
 * - follows the cursor, leans toward it
 * - blinks on its own, looks around when idle
 * - smiles on hover, gasps on press
 * - respects prefers-reduced-motion
 */
export default function CapsulePal({ mood = "idle" }: CapsulePalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [blink, setBlink] = useState(false);

  // Gaze tracking (smoothed, writes CSS variables directly — no re-renders)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let lastMove = Date.now();
    let frame = 0;
    let running = false;

    const tick = () => {
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;

      root.style.setProperty("--lx", currentX.toFixed(4));
      root.style.setProperty("--ly", currentY.toFixed(4));

      const settled =
        Math.abs(targetX - currentX) < 0.002 &&
        Math.abs(targetY - currentY) < 0.002;

      if (settled) {
        running = false;
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const clamp = (value: number) => Math.max(-1, Math.min(1, value));

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      targetX = clamp((event.clientX - centerX) / (window.innerWidth / 2));
      targetY = clamp((event.clientY - centerY) / (window.innerHeight / 2));
      lastMove = Date.now();
      kick();
    };

    // When the cursor has been still for a while, glance around gently.
    const idleTimer = window.setInterval(() => {
      if (document.hidden || Date.now() - lastMove < 3500) return;
      targetX = (Math.random() - 0.5) * 1.1;
      targetY = (Math.random() - 0.5) * 0.7;
      kick();
    }, 2600);

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.clearInterval(idleTimer);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Random blinking
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let openTimer = 0;
    let closeTimer = 0;

    const scheduleBlink = () => {
      openTimer = window.setTimeout(
        () => {
          setBlink(true);
          closeTimer = window.setTimeout(() => {
            setBlink(false);
            scheduleBlink();
          }, 140);
        },
        2400 + Math.random() * 3200,
      );
    };

    scheduleBlink();

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
    };
  }, []);

  const expression =
    pressed || mood === "oops"
      ? "gasp"
      : hovered || mood === "happy"
        ? "happy"
        : "idle";

  return (
    <div
      ref={rootRef}
      className={styles.capsule}
      data-expression={expression}
      data-blink={blink ? "true" : "false"}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      role="img"
      aria-label="Capsule Pal, a friendly character in a glass capsule"
    >
      <div className={styles.float}>
        <div className={styles.glow} aria-hidden="true" />

        <div className={styles.lean}>
          <div className={styles.pal} aria-hidden="true">
            <div className={styles.face}>
              <i className={`${styles.eye} ${styles.eyeLeft}`} />
              <i className={`${styles.eye} ${styles.eyeRight}`} />
              <i className={styles.mouth} />
            </div>
          </div>

          <div className={styles.shell} aria-hidden="true" />
          <div className={styles.frost} aria-hidden="true" />
          <div className={styles.seam} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.shadow} aria-hidden="true" />
    </div>
  );
}
