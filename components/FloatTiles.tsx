"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { TECH_ICONS, type TechIcon } from "./techIcons";

/**
 * Floating tech tiles that drift around a centre element (the skill modal).
 * - Rounded-square tiles with brand icons, random size / tilt, soft shadow
 * - Gentle floating (CSS), respects prefers-reduced-motion
 * - Click a tile -> a chip pops out beside it. Click elsewhere or Esc closes it.
 * - Tiles are placed so they never sit under the `avoidRef` element.
 */

type Props = {
  /** element the tiles must stay clear of (the modal card) */
  avoidRef: RefObject<HTMLElement | null>;
  /** tech names to show first (selected skill + related), case-insensitive */
  priority?: string[];
  /** optional extra text for a chip, keyed by lowercase tech name */
  notes?: Record<string, string>;
};

type Placed = {
  tech: TechIcon;
  x: number; // px, tile top-left
  y: number;
  size: number;
  rot: number; // resting tilt (deg)
  dx: number; // float travel (px)
  dy: number;
  dur: number; // seconds
  delay: number; // seconds
  side: "left" | "right";
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lum(hex: string) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function tileColors(hex: string) {
  const l = lum(hex);
  if (l < 0.16) return { bg: "#1a1d26", fg: "#ffffff" }; // near-black brands
  if (l > 0.68) return { bg: `#${hex}`, fg: "#12151c" }; // light brands
  return { bg: `#${hex}`, fg: "#ffffff" };
}

export default function FloatTiles({
  avoidRef,
  priority = [],
  notes = {},
}: Props) {
  const [view, setView] = useState<{
    w: number;
    h: number;
    avoid: { l: number; t: number; r: number; b: number };
  } | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const seed = useMemo(() => Math.floor(Math.random() * 1e9), []);

  // measure viewport + modal
  useEffect(() => {
    const measure = () => {
      const el = avoidRef.current;
      const rect = el?.getBoundingClientRect();
      const w = window.innerWidth;
      const h = window.innerHeight;
      setView({
        w,
        h,
        avoid: rect
          ? { l: rect.left, t: rect.top, r: rect.right, b: rect.bottom }
          : { l: w / 2 - 280, t: h / 2 - 260, r: w / 2 + 280, b: h / 2 + 260 },
      });
    };
    measure();
    window.addEventListener("resize", measure);
    const t = window.setTimeout(measure, 320); // after the modal's open animation
    // modal height can change (content, rotation, address bar) -> re-place tiles
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    if (avoidRef.current) ro?.observe(avoidRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
      ro?.disconnect();
    };
  }, [avoidRef]);

  const tiles = useMemo<Placed[]>(() => {
    if (!view) return [];
    const rand = mulberry32(seed);
    const { w, h, avoid } = view;
    const small = w < 700;
    const pad = small ? 10 : 18; // clearance around the modal
    const edge = 12;

    // priority techs first, then everyone else shuffled
    const want = priority.map((p) => p.toLowerCase());
    const first = TECH_ICONS.filter((t) => want.includes(t.name.toLowerCase()));
    const rest = TECH_ICONS.filter((t) => !first.includes(t));
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    const pool = [...first, ...rest];

    const maxTiles = small ? 12 : 26;
    const placed: Placed[] = [];
    const medium = !small && w < 1000; // tablets: little room beside the modal
    const sizes = small
      ? [40, 46, 52]
      : medium
        ? [38, 44, 52]
        : [44, 52, 60, 70, 80];

    // free areas around the modal (left / right / above / below)
    const gap = pad + 14; // clearance incl. float travel
    const strips = [
      { x0: edge, y0: edge, x1: avoid.l - gap, y1: h - edge }, // left
      { x0: avoid.r + gap, y0: edge, x1: w - edge, y1: h - edge }, // right
      { x0: edge, y0: edge, x1: w - edge, y1: avoid.t - gap }, // above
      { x0: edge, y0: avoid.b + gap, x1: w - edge, y1: h - edge }, // below
    ];

    for (const tech of pool) {
      if (placed.length >= maxTiles) break;
      for (let attempt = 0; attempt < 40; attempt++) {
        const size = sizes[Math.floor(rand() * sizes.length)];
        // strips big enough for this tile, weighted by area
        const fit = strips.filter(
          (r) => r.x1 - r.x0 >= size && r.y1 - r.y0 >= size,
        );
        if (!fit.length) continue;
        const areas = fit.map((r) => (r.x1 - r.x0) * (r.y1 - r.y0));
        let pick = rand() * areas.reduce((a, b) => a + b, 0);
        let region = fit[fit.length - 1];
        for (let i = 0; i < fit.length; i++) {
          pick -= areas[i];
          if (pick <= 0) {
            region = fit[i];
            break;
          }
        }
        const x = region.x0 + rand() * (region.x1 - region.x0 - size);
        const y = region.y0 + rand() * (region.y1 - region.y0 - size);
        const travel = 14;
        const crowded = placed.some((p) => {
          const g = (p.size + size) / 2 + 14;
          return (
            Math.abs(p.x + p.size / 2 - (x + size / 2)) < g &&
            Math.abs(p.y + p.size / 2 - (y + size / 2)) < g
          );
        });
        if (crowded) continue;
        placed.push({
          tech,
          x,
          y,
          size,
          rot: (rand() - 0.5) * 24,
          dx: (rand() - 0.5) * 2 * travel,
          dy: (rand() - 0.5) * 2 * travel,
          dur: 5 + rand() * 5,
          delay: -rand() * 6,
          side: x + size / 2 > w / 2 ? "left" : "right",
        });
        break;
      }
    }
    return placed;
  }, [view, seed, priority]);

  // click elsewhere / Escape closes the chip (and stops the modal from closing)
  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-float-tile]")) return; // tiles handle themselves
      setActive(null);
      e.stopPropagation();
      e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setActive(null);
      e.stopPropagation();
    };
    window.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [active]);

  return (
    <div className="float-tiles" aria-label="Technologies I work with">
      {tiles.map((t) => {
        const { bg, fg } = tileColors(t.tech.hex);
        const isOpen = active === t.tech.name;
        const note = notes[t.tech.name.toLowerCase()];
        return (
          <div
            key={t.tech.name}
            className={`float-tile-wrap${isOpen ? " is-open" : ""}`}
            style={
              {
                left: t.x,
                top: t.y,
                width: t.size,
                height: t.size,
                "--dx": `${t.dx}px`,
                "--dy": `${t.dy}px`,
                "--rot": `${t.rot}deg`,
                "--dur": `${t.dur}s`,
                "--delay": `${t.delay}s`,
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              data-float-tile={t.tech.name}
              className="float-tile"
              aria-label={t.tech.name}
              aria-expanded={isOpen}
              onClick={(e) => {
                e.stopPropagation(); // don't let the overlay close the modal
                setActive(isOpen ? null : t.tech.name);
              }}
              style={{ background: bg, color: fg }}
            >
              <svg
                viewBox="0 0 24 24"
                width="52%"
                height="52%"
                aria-hidden="true"
              >
                <path d={t.tech.path} fill="currentColor" />
              </svg>
            </button>

            {isOpen && (
              <span
                className={`float-chip float-chip-${t.side}`}
                role="status"
                style={{ background: bg, color: fg }}
              >
                {t.tech.name}
                {note ? <em>{note}</em> : null}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
