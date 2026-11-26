import { tablesDB } from "@/lib/appwrite-server";
import { deleteProject, createProject, updateProject } from "./actions";
import ImageCropInput from "@/components/admin/ImageCropInput";

export default async function ProjectsPage() {
  const result = await tablesDB.listRows({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_PROJECTS_TABLE_ID!,
  });

  const projects = result.rows.sort(
    (a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0),
  );

  return (
    <div>
      <h1>Projects</h1>

      {/* Add Project */}
      <form
        action={createProject}
        encType="multipart/form-data"
        className="admin-form"
      >
        <input name="title" placeholder="Title" required />

        <textarea name="description" placeholder="Description" required />

        <ImageCropInput
          name="image"
          label="Project image (optional)"
          aspectRatio={16 / 10}
          helpText="Crop the project preview before uploading."
        />

        <input name="liveUrl" placeholder="Live URL" />
        <input name="repoUrl" placeholder="Repo URL" />

        <input name="tags" placeholder="Tags (comma-separated)" required />

        <button type="submit">Add Project</button>
      </form>

      {/* Project List */}
      <ul className="admin-list">
        {projects.map((p) => (
          <li key={p.$id} className="admin-list-item">
            <div>
              <strong>{p.title}</strong>

              <div className="admin-item-meta">
                {Array.isArray(p.technologies) ? p.technologies.join(", ") : ""}
              </div>

              {/* Edit Project */}
              <details>
                <summary>Edit Project</summary>

                <form
                  action={updateProject.bind(null, p.$id)}
                  className="admin-form"
                >
                  <input
                    name="title"
                    placeholder="Title"
                    defaultValue={p.title ?? ""}
                    required
                  />

                  <textarea
                    name="description"
                    placeholder="Description"
                    defaultValue={p.description ?? ""}
                    required
                  />

                  <input
                    name="liveUrl"
                    placeholder="Live URL"
                    defaultValue={p.liveUrl ?? ""}
                  />

                  <input
                    name="repoUrl"
                    placeholder="Repo URL"
                    defaultValue={p.githubUrl ?? ""}
                  />

                  <input
                    name="tags"
                    placeholder="Tags (comma-separated)"
                    defaultValue={
                      Array.isArray(p.technologies)
                        ? p.technologies.join(", ")
                        : ""
                    }
                    required
                  />

                  <button type="submit">Save Changes</button>
                </form>
              </details>
            </div>

            {/* Delete Project */}
            <form action={deleteProject.bind(null, p.$id)}>
              <button type="submit" className="admin-delete-btn">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
