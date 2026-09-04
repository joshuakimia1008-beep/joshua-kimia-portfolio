"use client";

import { useState } from "react";
import Reveal from "./Reveal";

type Project = {
  id: number;
  image: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
};

// Drop real screenshots into /public/projects and this component will
// automatically switch from the placeholder to the actual image — no
// other code needs to change.
const projects: Project[] = [
  {
    id: 1,
    image: "/projects/citizens-college.png",
    title: "Citizen's College",
    description:
      "An educational platform focused on making knowledge about journalism, public finance, Nigerian political history, and more accessible.",
    tags: ["HTML", "CSS", "JavaScript"],
    link: "#",
  },
  {
    id: 2,
    image: "/projects/nigeria-celebrates.png",
    title: "Nigeria Celebrates",
    description:
      "A digital platform celebrating Nigeria, its people, culture, achievements, and stories.",
    tags: ["HTML", "CSS", "JavaScript"],
    link: "#",
  },
  {
    id: 3,
    image: "/projects/portfolio.png",
    title: "My Portfolio",
    description:
      "My personal portfolio website showcasing my projects, skills, experience, and everything I'm learning.",
    tags: ["Next.js", "TypeScript", "CSS"],
    link: "#",
  },
];

function ProjectThumb({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="p-shot p-shot-placeholder">
        <span>{title.slice(0, 2).toUpperCase()}</span>
        <p>Preview coming soon</p>
      </div>
    );
  }

  return (
    <div className="p-shot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${title} project preview`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function Projects() {
  return (
    <section className="work" id="work">
      <div className="wrap">
        <Reveal>
          <div className="eyebrow">Projects</div>
          <h2>Things I&apos;ve built</h2>
        </Reveal>

        <Reveal className="project-grid">
          {projects.map((project) => (
            <article className="p-card" key={project.id}>
              <ProjectThumb src={project.image} title={project.title} />

              <div className="p-body">
                <h3>{project.title}</h3>

                <p>{project.description}</p>

                <div className="p-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <a
                  className="p-link"
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Project →
                </a>
              </div>
            </article>
          ))}
        </Reveal>

        <Reveal>
          <a className="center-link" href="#work">
            View All Projects →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
