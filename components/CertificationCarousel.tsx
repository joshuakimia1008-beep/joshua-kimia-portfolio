"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type Credential = {
  id: string;
  title: string;
  issuer: string;
  imageUrl: string | null;
  issueDate: string;
  expiryDate: string | null;
  credentialUrl: string | null;
};

export default function CertificationCarousel({
  certifications,
}: {
  certifications: Credential[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dragStart = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const count = certifications.length;

  const goTo = useCallback(
    (nextIndex: number) => {
      if (count < 2) return;
      setActiveIndex((nextIndex + count) % count);
    },
    [count],
  );

  useEffect(() => {
    setActiveIndex((current) => (count ? current % count : 0));
  }, [count]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(preference.matches);
    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (
      paused ||
      count < 2 ||
      reducedMotion
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [count, paused, reducedMotion]);

  const positions = useMemo(
    () => certifications.map((_, index) => {
      let offset = index - activeIndex;
      if (offset > count / 2) offset -= count;
      if (offset < -count / 2) offset += count;
      return offset;
    }),
    [activeIndex, certifications, count],
  );

  if (!count) return null;
  const active = certifications[activeIndex];

  return (
    <div
      className="credential-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="credential-stage-wrap">
        <div
          className="credential-stage"
          role="region"
          aria-roledescription="carousel"
          aria-label="Certifications and credentials"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowRight") {
              event.preventDefault();
              goTo(activeIndex + 1);
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              goTo(activeIndex - 1);
            }
          }}
          onPointerDown={(event) => {
            if (
              event.button !== 0 ||
              !event.isPrimary ||
              (event.target as HTMLElement).closest("a, button")
            ) {
              return;
            }
            dragStart.current = event.clientX;
            suppressClick.current = false;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            if (dragStart.current === null) return;
            const delta = event.clientX - dragStart.current;
            if (Math.abs(delta) > 42) {
              suppressClick.current = true;
              goTo(activeIndex + (delta < 0 ? 1 : -1));
              window.setTimeout(() => {
                suppressClick.current = false;
              }, 0);
            }
            dragStart.current = null;
          }}
          onPointerCancel={() => {
            dragStart.current = null;
          }}
        >
          <div className="credential-stage-glow" aria-hidden="true" />
          {certifications.map((credential, index) => {
            const offset = positions[index];
            const isActive = index === activeIndex;
            const distance = Math.abs(offset);
            const visible = distance <= 2;
            const x = offset * 42;
            const y = distance * 16;
            const rotation = offset * 5.5;
            const scale = Math.max(0.82, 1 - distance * 0.075);

            return (
              <article
                key={credential.id}
                className={`credential-card${isActive ? " is-active" : ""}`}
                style={{
                  "--card-x": `${x}%`,
                  "--card-y": `${y}px`,
                  "--card-rotation": `${rotation}deg`,
                  "--card-scale": scale,
                  "--card-depth": count - distance,
                } as CSSProperties}
                aria-hidden={!visible}
                aria-label={`${credential.title}, ${index + 1} of ${count}`}
                role={isActive ? "group" : "button"}
                aria-roledescription="slide"
                tabIndex={!visible || isActive ? -1 : 0}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  if (!isActive) goTo(index);
                }}
                onKeyDown={(event) => {
                  if (!isActive && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    goTo(index);
                  }
                }}
              >
                <div className="credential-card-art">
                  {credential.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={credential.imageUrl}
                      alt={`${credential.title} certificate`}
                      draggable={false}
                    />
                  ) : (
                    <div className="credential-art-fallback" aria-hidden="true">
                      <span className="credential-art-orbit credential-art-orbit-one" />
                      <span className="credential-art-orbit credential-art-orbit-two" />
                      <span className="credential-art-monogram">✳</span>
                      <span className="credential-art-caption">CREDENTIAL · {String(index + 1).padStart(2, "0")}</span>
                    </div>
                  )}
                  <span className="credential-art-index">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="credential-card-copy">
                  <div className="credential-card-topline">
                    <span className="credential-kind">Professional certification</span>
                    <span className="credential-issuer">{credential.issuer}</span>
                  </div>
                  <h3>{credential.title}</h3>
                  <p className="credential-issued">
                    Issued {credential.issueDate}
                    {credential.expiryDate ? ` · Expires ${credential.expiryDate}` : " · No expiry"}
                  </p>
                  {isActive && credential.credentialUrl ? (
                    <a
                      className="credential-verify"
                      href={credential.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View credential for ${credential.title} (opens in a new tab)`}
                    >
                      View credential <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className="credential-verify credential-verify-muted">
                      {credential.credentialUrl ? "Select to view credential" : "Credential earned"}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
          <span className="credential-swipe-hint" aria-hidden="true">Drag to explore <span>↔</span></span>
        </div>
      </div>

      <div className="credential-controls" aria-label="Slideshow controls">
        <div className="credential-control-group">
          <button
            className="credential-arrow"
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous certification"
            disabled={count < 2}
          >
            <span aria-hidden="true">←</span>
          </button>
          <span className="credential-count" aria-live="polite" aria-atomic="true">
            <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
            <span className="credential-count-divider">/</span>
            {String(count).padStart(2, "0")}
          </span>
          <button
            className="credential-arrow"
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next certification"
            disabled={count < 2}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="credential-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${(activeIndex + 1) / count})` }} />
        </div>
        {count > 1 && !reducedMotion && (
          <button
            className="credential-autoplay"
            type="button"
            onClick={() => setPaused((current) => !current)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            title={paused ? "Play slideshow" : "Pause slideshow"}
          >
            <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="credential-thumbnails" aria-label="Choose a certification">
          {certifications.map((credential, index) => (
            <button
              key={credential.id}
              className={`credential-thumb${index === activeIndex ? " is-active" : ""}`}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show certification ${index + 1}: ${credential.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <span className="credential-thumb-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="credential-thumb-title">{credential.title}</span>
              <span className="credential-thumb-issuer">{credential.issuer}</span>
            </button>
          ))}
        </div>
      )}
      <p className="credential-sr-only" aria-live="polite">
        Showing certification {activeIndex + 1} of {count}: {active.title}
      </p>
    </div>
  );
}
