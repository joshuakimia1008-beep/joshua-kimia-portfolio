"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Mobile-only floating theme toggle (bottom-right).
 * Uses the same mechanism as ThemeToggle.tsx: html[data-theme] and the
 * "portfolio-theme" localStorage key. It also listens for data-theme
 * changes so it stays in sync with the desktop toggle.
 * Hidden on desktop via CSS (mobile-nav.css).
 */
export default function ThemeToggleMobile() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const read = () =>
      setTheme(
        document.documentElement.dataset.theme === "dark" ? "dark" : "light",
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem("portfolio-theme", next);
    } catch {
      // The in-page theme still works without storage.
    }
    setTheme(next);
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className="theme-fab"
      onClick={toggle}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      {isDark ? (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3.6" />
          <path d="M12 2.5v2M12 19.5v2M4.1 4.1l1.4 1.4m13 13 1.4 1.4M2.5 12h2m15 0h2M4.1 19.9l1.4-1.4m13-13 1.4-1.4" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19.8 15.2A8.4 8.4 0 0 1 8.8 4.2 8.6 8.6 0 1 0 19.8 15.2Z" />
        </svg>
      )}
    </button>
  );
}
