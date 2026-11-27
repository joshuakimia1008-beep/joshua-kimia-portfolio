"use client";

import { useEffect, useRef } from "react";

/**
 * Animates the vertical line beside each column (Experience / Education).
 * The old centre divider is gone: this component renders nothing itself and
 * instead adds a progress line inside every .tl-col, running from the first
 * dot to the last dot. It fills as you scroll through the section.
 *
 * The static grey line between dots (.tl-entry::after) stays as the track.
 */
export default function TimelineProgress() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const table = anchor.current?.parentElement;
    if (!table) return;

    const columns = Array.from(table.querySelectorAll<HTMLElement>(".tl-col"));
    const lines = columns.map((col) => {
      let fill = col.querySelector<HTMLElement>(":scope > .tl-line-fill");
      if (!fill) {
        fill = document.createElement("span");
        fill.className = "tl-line-fill";
        fill.setAttribute("aria-hidden", "true");
        col.prepend(fill); // prepend so .tl-entry:last-child still matches
      }
      return fill;
    });

    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        columns.forEach((col, i) => {
          const entries = col.querySelectorAll<HTMLElement>(".tl-entry");
          const fill = lines[i];
          if (entries.length < 2) {
            fill.style.display = "none";
            entries.forEach((entry) =>
              entry.classList.toggle(
                "is-reached",
                entry.getBoundingClientRect().top < window.innerHeight * 0.8,
              ),
            );
            return;
          }
          fill.style.display = "";

          // dot centre = entry top + 6px offset + half of the 9px dot
          const DOT_CENTER = 10.5;
          const first = entries[0].offsetTop + DOT_CENTER;
          const last = entries[entries.length - 1].offsetTop + DOT_CENTER;
          const height = Math.max(0, last - first);

          fill.style.top = `${first}px`;
          fill.style.height = `${height}px`;

          const colTop = col.getBoundingClientRect().top;
          const reachY = window.innerHeight * 0.7;
          const progress = Math.max(
            0,
            Math.min(1, (reachY - (colTop + first)) / (height || 1)),
          );
          fill.style.setProperty("--col-progress", String(progress));

          // milestones: an entry is "reached" once the line tip passes its dot
          const tip = first + progress * height;
          entries.forEach((entry) => {
            const dotY = entry.offsetTop + DOT_CENTER;
            entry.classList.toggle("is-reached", dotY <= tip + 1);
          });
        });
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(table);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
      lines.forEach((fill) => fill.remove());
      columns.forEach((col) =>
        col
          .querySelectorAll(".tl-entry")
          .forEach((entry) => entry.classList.remove("is-reached")),
      );
    };
  }, []);

  // Invisible anchor so we can find the table; takes no space in the grid.
  return <span ref={anchor} aria-hidden="true" style={{ display: "none" }} />;
}
