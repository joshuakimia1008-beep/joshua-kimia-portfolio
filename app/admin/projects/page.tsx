import { prisma } from "@/lib/prisma";
import { createProject, deleteProject } from "./actions";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1>Projects</h1>

      <form
        action={createProject}
        encType="multipart/form-data"
        style={{ display: "grid", gap: 8, maxWidth: 400, marginBottom: 32 }}
      >
        <input name="title" placeholder="Title" required />
        <textarea name="description" placeholder="Description" required />
        <label>
          Project image (optional)
          <input name="image" type="file" accept="image/*" />
        </label>
        <input name="liveUrl" placeholder="Live URL" />
        <input name="repoUrl" placeholder="Repo URL" />
        <input name="tags" placeholder="Tags (comma-separated)" required />
        <button type="submit">Add Project</button>
      </form>

      <ul>
        {projects.map((p) => (
          <li key={p.id} style={{ marginBottom: 12 }}>
            <strong>{p.title}</strong> — {p.tags}
            <form
              action={deleteProject.bind(null, p.id)}
              style={{ display: "inline", marginLeft: 8 }}
            >
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
