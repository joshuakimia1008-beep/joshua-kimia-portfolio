"use client";

import { useEffect, useState } from "react";
import MotionLayer from "./MotionLayer";
import ThemeToggle from "./ThemeToggle";

const links = [
  ["Home", "home"],
  ["About", "about"],
  ["Skills", "skills"],
  ["Certifications", "certifications"],
  ["Projects", "work"],
  ["Experience", "experience"],
  ["Contact", "contact"],
] as const;

export default function HeaderNav({ resumeUrl }: { resumeUrl: string }) {
  const [active, setActive] = useState("home");
  const [focused, setFocused] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigateToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    event.preventDefault();

    const section = document.getElementById(id);

    if (!section) {
      console.warn(`Navigation section not found: #${id}`);
      return;
    }

    setActive(id);
    setFocused(id);
    setMenuOpen(false);

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", `#${id}`);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActive(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    links.forEach(([, id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <MotionLayer />

      <header className="focus-nav-header">
        <nav
          className={`focus-nav ${focused ? "has-focus" : ""} ${
            menuOpen ? "menu-is-open" : ""
          }`}
          aria-label="Main navigation"
        >
          <a
            href="#home"
            className="focus-nav-brand"
            onClick={(event) => {
              navigateToSection(event, "home");
            }}
          >
            Joshua Kimia<span>.</span>
          </a>

          <div className="focus-nav-desktop">
            {links.map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className={`focus-nav-link ${
                  focused === id ? "lens-focused" : ""
                }`}
                aria-current={active === id ? "location" : undefined}
                onClick={(event) => navigateToSection(event, id)}
                onFocus={() => setFocused(id)}
              >
                <span>{label}</span>

                <span className="focus-brackets" aria-hidden="true">
                  <i className="corner top-left" />
                  <i className="corner top-right" />
                  <i className="corner bottom-left" />
                  <i className="corner bottom-right" />
                </span>
              </a>
            ))}
          </div>

          <div className="focus-nav-actions">
            <ThemeToggle />

            <a
              className="focus-nav-cv"
              href={resumeUrl}
              target={resumeUrl.startsWith("http") ? "_blank" : undefined}
              rel={
                resumeUrl.startsWith("http") ? "noopener noreferrer" : undefined
              }
              download
            >
              Download CV <span aria-hidden="true">↓</span>
            </a>
          </div>

          <button
            className="focus-mobile-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="focus-mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span>{menuOpen ? "CLOSE" : "MENU"}</span>
            <span className="focus-menu-icon" aria-hidden="true">
              {menuOpen ? "−" : "+"}
            </span>
          </button>

          <div
            id="focus-mobile-navigation"
            className={`focus-mobile-menu ${
              menuOpen ? "mobile-menu-open" : ""
            }`}
            aria-hidden={!menuOpen}
          >
            {links.map(([label, id], index) => (
              <a
                key={id}
                href={`#${id}`}
                tabIndex={menuOpen ? 0 : -1}
                className={active === id ? "mobile-link-active" : ""}
                onClick={(event) => navigateToSection(event, id)}
              >
                <span className="mobile-link-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span>{label}</span>
                <span className="mobile-link-arrow">↗</span>
              </a>
            ))}

            <a
              className="focus-mobile-cv"
              href={resumeUrl}
              target={resumeUrl.startsWith("http") ? "_blank" : undefined}
              rel={
                resumeUrl.startsWith("http") ? "noopener noreferrer" : undefined
              }
              download
            >
              Download CV ↓
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}
