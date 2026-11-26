"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProjectThumb from "./ProjectThumb";

type Project = {
  id: string | number;
  title: string;
  description: string;
  imageUrl: string | null;
  tags: string;
  liveUrl: string | null;
  repoUrl: string | null;
};

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const projectCount = projects.length;

  const go = useCallback(
    (next: number) => {
      if (projectCount < 2) return;
      setIndex((next + projectCount) % projectCount);
    },
    [projectCount],
  );

  useEffect(() => {
    if (
      paused ||
      projectCount < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % projectCount),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [paused, projectCount]);

  useEffect(() => {
    setIndex((current) => (projectCount ? current % projectCount : 0));
  }, [projectCount]);

  if (!projectCount) {
    return (
      <p className="project-empty-state">
        No projects added yet. Add one from the admin dashboard.
      </p>
    );
  }

  return (
    <div
      className="project-showcase"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div
        className="p-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Project showcase"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(index + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(index - 1);
          }
        }}
        onPointerDown={(event) => {
          if (
            event.button !== 0 ||
            !event.isPrimary ||
            (event.target as HTMLElement).closest("a,button")
          ) {
            return;
          }
          startX.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          if (startX.current === null) return;
          const delta = event.clientX - startX.current;
          if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1));
          startX.current = null;
        }}
        onPointerCancel={() => {
          startX.current = null;
        }}
      >
        {projects.map((project, projectIndex) => {
          const forwardDistance = (projectIndex - index + projectCount) % projectCount;
          const distance = Math.min(forwardDistance, projectCount - forwardDistance);
          const direction =
            forwardDistance === 0
              ? 0
              : forwardDistance <= projectCount / 2
                ? 1
                : -1;
          const isActive = projectIndex === index;
          const projectUrl = project.liveUrl || project.repoUrl;

          return (
            <article
              key={project.id}
              className={`p-card p-carousel-card${isActive ? " is-active" : ""}`}
              aria-hidden={!isActive}
              style={
                {
                  "--offset": `${direction * distance * 92}%`,
                  "--scale": Math.max(0.91, 1 - distance * 0.045),
                  "--rotate": `${direction * -5}deg`,
                  "--opacity": distance > 1 ? 0 : Math.max(0.28, 1 - distance * 0.46),
                  "--z": 10 - distance,
                } as React.CSSProperties
              }
            >
              <ProjectThumb src={project.imageUrl ?? ""} title={project.title} />
              <div className="p-body">
                <span className="p-card-kicker">Featured project</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="p-tags" aria-label="Technologies">
                  {project.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                </div>
                {projectUrl ? (
                  <a
                    className="p-link"
                    tabIndex={isActive ? 0 : -1}
                    href={projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View project <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span className="p-link p-link-disabled">Project preview</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="p-carousel-controls" aria-label="Project navigation">
        <button
          className="p-carousel-arrow"
          type="button"
          onClick={() => go(index - 1)}
          disabled={projectCount < 2}
          aria-label="Previous project"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className="p-carousel-pagination" role="group" aria-label="Choose a project">
          {projects.map((project, projectIndex) => (
            <button
              key={project.id}
              type="button"
              className="p-carousel-bar"
              aria-label={`Show project ${projectIndex + 1}: ${project.title}`}
              aria-current={projectIndex === index ? "true" : undefined}
              onClick={() => go(projectIndex)}
            />
          ))}
        </div>
        <button
          className="p-carousel-arrow"
          type="button"
          onClick={() => go(index + 1)}
          disabled={projectCount < 2}
          aria-label="Next project"
        >
          <span aria-hidden="true">→</span>
        </button>
        <span className="p-carousel-count" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
          <span>/</span>
          {String(projectCount).padStart(2, "0")}
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        Project {index + 1} of {projectCount}: {projects[index]?.title}
      </p>
    </div>
  );
}
