import type { CSSProperties } from "react";
import { TECH_ICONS, type TechIcon } from "./techIcons";

/**
 * Looks a skill name up in TECH_ICONS and draws its brand icon.
 * "JavaScript", "js", "Next.js", "nextjs", "Tailwind", "Postgres" ... all resolve.
 */

const norm = (s: string) => s.toLowerCase().replace(/["'\s._\-]/g, "");

const INDEX = new Map<string, TechIcon>(
  TECH_ICONS.map((icon) => [norm(icon.name), icon]),
);

// short names people actually type -> normalised icon name
const ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  reactjs: "react",
  next: "nextjs",
  node: "nodejs",
  tailwind: "tailwindcss",
  vue: "vuejs",
  html: "html5",
  css: "css3",
  postgres: "postgresql",
  mongo: "mongodb",
  expressjs: "express",
  cplusplus: "c++",
  golang: "go",
  scss: "sass",
};

export function getTechIcon(label: string): TechIcon | null {
  const key = norm(label);
  const direct = INDEX.get(key) ?? INDEX.get(ALIASES[key] ?? "");
  if (direct) return direct;

  // "Git & GitHub", "React (hooks)" -> try each word
  for (const token of label.split(/[^A-Za-z0-9+#.]+/)) {
    if (!token) continue;
    const k = norm(token);
    const hit = INDEX.get(k) ?? INDEX.get(ALIASES[k] ?? "");
    if (hit) return hit;
  }
  return null;
}

function luminance(hex: string) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Colour used for glows / bars / tag accents. Near-black brands fall back to blue. */
export function techAccent(label: string): string {
  const icon = getTechIcon(label);
  if (!icon || luminance(icon.hex) < 0.2) return "#60a5fa";
  return `#${icon.hex}`;
}

type Props = {
  label: string;
  size?: number;
  /** tile = brand-coloured rounded square, glyph = bare icon */
  variant?: "tile" | "glyph";
  /** draw a monogram when no icon matches (default true) */
  fallback?: boolean;
  className?: string;
};

export default function SkillIcon({
  label,
  size = 24,
  variant = "tile",
  fallback = true,
  className = "",
}: Props) {
  const icon = getTechIcon(label);

  if (!icon) {
    if (!fallback) return null;
    const style: CSSProperties = {
      width: size,
      height: size,
      fontSize: Math.max(9, size * 0.38),
    };
    return (
      <span
        className={`skill-icon skill-icon-mono ${className}`}
        style={style}
        aria-hidden="true"
      >
        {label
          .replace(/[^A-Za-z0-9]/g, "")
          .slice(0, 2)
          .toUpperCase()}
      </span>
    );
  }

  const dark = luminance(icon.hex) < 0.16;
  const light = luminance(icon.hex) > 0.68;

  if (variant === "glyph") {
    return (
      <svg
        className={`skill-icon skill-icon-glyph ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        style={{ color: dark ? "currentColor" : `#${icon.hex}` }}
      >
        <path d={icon.path} fill="currentColor" />
      </svg>
    );
  }

  const bg = dark ? "#1a1d26" : `#${icon.hex}`;
  const fg = dark ? "#ffffff" : light ? "#12151c" : "#ffffff";
  return (
    <span
      className={`skill-icon skill-icon-tile ${className}`}
      style={{ width: size, height: size, background: bg, color: fg }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        focusable="false"
      >
        <path d={icon.path} fill="currentColor" />
      </svg>
    </span>
  );
}
