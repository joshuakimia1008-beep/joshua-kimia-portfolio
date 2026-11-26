"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type CSSProperties,
} from "react";

type TransitionName =
  | "fade"
  | "liquid"
  | "burn"
  | "ripple"
  | "glitch"
  | "lightning";

const transitions: TransitionName[] = [
  "liquid",
  "burn",
  "ripple",
  "glitch",
  "lightning",
  "fade",
];

const nameWords = ["Joshua", "Kimia"];

export default function HeroInteractive({
  bio,
  profileImageUrls,
  resumeUrl,
  location,
  availability,
}: {
  bio: string | null;
  profileImageUrls: string[];
  resumeUrl: string;
  location: string | null;
  availability: string;
}) {
  const hero = useRef<HTMLElement>(null);
  const photoDragStart = useRef<number | null>(null);

  const [photoIndex, setPhotoIndex] = useState(0);
  const [transitionIndex, setTransitionIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const transition = transitions[transitionIndex];
  const imageCount = profileImageUrls.length;

  const currentImage = imageCount
    ? profileImageUrls[photoIndex % imageCount]
    : null;

  const movePhoto = useCallback(
    (direction: -1 | 1) => {
      if (imageCount < 2) return;

      setPhotoIndex(
        (current) => (current + direction + imageCount) % imageCount,
      );

      setTransitionIndex((current) => (current + 1) % transitions.length);
    },
    [imageCount],
  );

  const goToPhoto = useCallback(
    (index: number) => {
      if (imageCount < 2 || index === photoIndex) return;

      setPhotoIndex(index);

      setTransitionIndex((current) => (current + 1) % transitions.length);
    },
    [imageCount, photoIndex],
  );

  useEffect(() => {
    setPhotoIndex((current) => (imageCount ? current % imageCount : 0));
  }, [imageCount]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreference = () => {
      setReducedMotion(preference.matches);
    };

    syncPreference();

    preference.addEventListener("change", syncPreference);

    return () => {
      preference.removeEventListener("change", syncPreference);
    };
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || imageCount < 2) return;

    const timer = window.setInterval(() => {
      movePhoto(1);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [imageCount, movePhoto, paused, reducedMotion]);

  function pointerMove(event: PointerEvent<HTMLElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    event.currentTarget.style.setProperty(
      "--mx",
      `${event.clientX - rect.left}px`,
    );

    event.currentTarget.style.setProperty(
      "--my",
      `${event.clientY - rect.top}px`,
    );

    const target = (event.target as HTMLElement).closest<HTMLElement>(
      ".magnetic",
    );

    if (target) {
      const box = target.getBoundingClientRect();

      target.style.transform = `translate(${
        (event.clientX - box.left - box.width / 2) * 0.12
      }px, ${(event.clientY - box.top - box.height / 2) * 0.18}px)`;
    } else {
      hero.current
        ?.querySelectorAll<HTMLElement>(".magnetic")
        .forEach((element) => {
          element.style.transform = "";
        });
    }
  }

  function resetMagneticElements() {
    hero.current
      ?.querySelectorAll<HTMLElement>(".magnetic")
      .forEach((element) => {
        element.style.transform = "";
      });
  }

  return (
    <section
      ref={hero}
      className="hero motion-hero"
      id="home"
      onPointerMove={pointerMove}
      onPointerLeave={resetMagneticElements}
    >
      <div className="hero-lights" aria-hidden="true" />

      <div className="wrap hero-grid">
        <div>
          <div className="eyebrow">Hello, I&apos;m</div>

          <h1 aria-label="Joshua Kimia">
            {nameWords.map((word, wordIndex) => (
              <span
                key={word}
                className="word-reveal hero-name-word"
                style={
                  {
                    "--word-index": wordIndex,
                  } as CSSProperties
                }
                aria-hidden="true"
              >
                {Array.from(word).map((letter, letterIndex) => (
                  <span
                    key={`${word}-${letterIndex}`}
                    className="hero-name-letter"
                    style={
                      {
                        "--letter-index": letterIndex,
                      } as CSSProperties
                    }
                  >
                    {letter}
                  </span>
                ))}
                {wordIndex === 0 ? " " : null}
              </span>
            ))}

            <span className="accent" aria-hidden="true">
              .
            </span>
          </h1>

          <div className="role">
            Software Engineering Student &amp;{" "}
            <span className="hl">Developer</span>
          </div>

          <p className="lede">
            {bio ||
              "I build clean, scalable and user-focused web applications that solve real problems."}
          </p>

          <div className="hero-ctas">
            <a className="btn btn-solid magnetic" href="#work">
              View Projects →
            </a>

            <a className="btn btn-line magnetic" href={resumeUrl} download>
              Download CV ↓
            </a>
          </div>

          <div className="hero-tag">
            <span className="pip" />

            <span>
              {location
                ? `${location} · ${
                    availability === "AVAILABLE"
                      ? "Available for hire"
                      : availability === "BUSY"
                        ? "Currently busy"
                        : "Not accepting work"
                  }`
                : "Software Engineering Student, African University of Science and Technology"}
            </span>
          </div>
        </div>

        <div
          className="hero-photo-wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setPaused(false);
            }
          }}
        >
          <div className="deco deco-code" aria-hidden="true">
            &lt;/&gt;
          </div>

          <div className="deco deco-dots" aria-hidden="true" />

          <div
            className={`hero-photo${currentImage ? " has-profile-image" : ""}`}
          >
            {currentImage ? (
              <div
                className="hero-photo-slider"
                role="region"
                aria-roledescription="carousel"
                aria-label="Joshua Kimia photo slideshow"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;

                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    movePhoto(1);
                  }

                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    movePhoto(-1);
                  }
                }}
                onPointerDown={(event) => {
                  if (
                    event.button !== 0 ||
                    !event.isPrimary ||
                    (event.target as HTMLElement).closest("button")
                  ) {
                    return;
                  }

                  photoDragStart.current = event.clientX;

                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerUp={(event) => {
                  if (photoDragStart.current === null) return;

                  const delta = event.clientX - photoDragStart.current;

                  if (Math.abs(delta) > 42) {
                    movePhoto(delta < 0 ? 1 : -1);
                  }

                  photoDragStart.current = null;
                }}
                onPointerCancel={() => {
                  photoDragStart.current = null;
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={`${photoIndex}-${currentImage}`}
                  className={`hero-profile-image hero-photo-enter transition-${transition}`}
                  src={currentImage}
                  alt={`Joshua Kimia, photo ${photoIndex + 1} of ${imageCount}`}
                  draggable={false}
                  loading={photoIndex === 0 ? "eager" : "lazy"}
                />

                {imageCount > 1 && (
                  <>
                    <div className="hero-photo-controls">
                      <button
                        type="button"
                        onClick={() => movePhoto(-1)}
                        aria-label="Previous photo"
                      >
                        ‹
                      </button>

                      <div
                        className="hero-photo-dots"
                        role="group"
                        aria-label="Choose a photo"
                      >
                        {profileImageUrls.map((url, index) => (
                          <button
                            key={`${url}-${index}`}
                            type="button"
                            className={index === photoIndex ? "active" : ""}
                            onClick={() => goToPhoto(index)}
                            aria-label={`Show photo ${index + 1} of ${imageCount}`}
                            aria-current={
                              index === photoIndex ? "true" : undefined
                            }
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => movePhoto(1)}
                        aria-label="Next photo"
                      >
                        ›
                      </button>
                    </div>

                    <span className="hero-photo-count" aria-hidden="true">
                      {String(photoIndex + 1).padStart(2, "0")} /{" "}
                      {String(imageCount).padStart(2, "0")}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <>
                <svg
                  className="ph-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5B6180"
                  strokeWidth={1.3}
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                </svg>

                <span className="ph-label">
                  Portrait photos can be added in dashboard settings
                </span>
              </>
            )}
          </div>

          <div className="deco deco-arrow" aria-hidden="true">
            &gt;
          </div>

          {imageCount > 1 && (
            <p className="hero-photo-sr-only" aria-live="polite">
              Photo {photoIndex + 1} of {imageCount}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
