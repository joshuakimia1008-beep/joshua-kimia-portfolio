import { tablesDB } from "@/lib/appwrite-server";
import Reveal from "./Reveal";
import ProjectShowcase from "./ProjectShowcase";

export default async function Projects() {
  const result = await tablesDB.listRows({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_PROJECTS_TABLE_ID!,
    queries: [],
  });

  const projects = result.rows
    .sort((a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0))
    .map((project) => ({
      id: project.$id,
      title: project.title,
      description: project.description,
      imageUrl: project.image || null,
      liveUrl: project.liveUrl || null,
      repoUrl: project.githubUrl || null,
      tags: Array.isArray(project.technologies)
        ? project.technologies.join(", ")
        : "",
    }));

  return (
    <section className="work" id="work">
      <div className="wrap">
        <Reveal className="section-intro project-intro">
          <div className="eyebrow">Projects</div>
          <h2>Things I&apos;ve built</h2>
          <p>
            Selected work. Pause the carousel by hovering, or explore with the
            arrows, swipe, keyboard, or project markers.
          </p>
        </Reveal>

        <Reveal className="project-grid">
          <ProjectShowcase projects={projects} />
        </Reveal>

        <Reveal className="project-outro">
          <a className="center-link" href="#contact">
            Have a project in mind? Let&apos;s connect{" "}
            <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
