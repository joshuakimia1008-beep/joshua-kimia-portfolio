"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    };
    const followSystem = () => {
      let hasSavedChoice = false;
      try {
        hasSavedChoice = Boolean(window.localStorage.getItem("portfolio-theme"));
      } catch {
        // Ignore storage access restrictions and retain the in-page theme.
      }
      if (!hasSavedChoice) {
        const nextTheme: Theme = preference.matches ? "dark" : "light";
        document.documentElement.dataset.theme = nextTheme;
        setTheme(nextTheme);
      }
    };
    syncTheme();
    preference.addEventListener("change", followSystem);
    return () => preference.removeEventListener("change", followSystem);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem("portfolio-theme", nextTheme);
    } catch {
      // The in-page theme still works when browser storage is unavailable.
    }
    setTheme(nextTheme);
  }

  const isDark = theme === "dark";
  return (
    <button
      className={`theme-toggle${isDark ? " is-dark" : ""}`}
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <svg className="theme-icon theme-icon-sun" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3.6" />
          <path d="M12 2.5v2M12 19.5v2M4.1 4.1l1.4 1.4m13 13 1.4 1.4M2.5 12h2m15 0h2M4.1 19.9l1.4-1.4m13-13 1.4-1.4" />
        </svg>
        <svg className="theme-icon theme-icon-moon" viewBox="0 0 24 24" fill="none">
          <path d="M19.8 15.2A8.4 8.4 0 0 1 8.8 4.2 8.6 8.6 0 1 0 19.8 15.2Z" />
          <path d="m16.5 4 .5 1.5 1.5.5-1.5.5-.5 1.5L16 6.5l-1.5-.5 1.5-.5.5-1.5Z" />
        </svg>
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-label">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
