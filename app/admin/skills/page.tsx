import { tablesDB } from "@/lib/appwrite-server";
import { createSkill, deleteSkill } from "./actions";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  PROGRAMMING_AND_WEB: "Programming & Web",
  TOOLS_AND_TECHNOLOGIES: "Tools & Technologies",
  CURRENTLY_EXPLORING: "Currently Exploring",
};

export default async function SkillsPage() {
  const result = await tablesDB.listRows({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_SKILLS_TABLE_ID!,
  });

  const skills = result.rows.sort(
    (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0),
  );

  return (
    <div>
      <h1>Skills</h1>

      <form action={createSkill} className="admin-form">
        <input name="name" placeholder="Skill name (e.g. Python)" required />

        <select name="category" required>
          <option value="">Select category</option>
          <option value="PROGRAMMING_AND_WEB">Programming & Web</option>
          <option value="TOOLS_AND_TECHNOLOGIES">Tools & Technologies</option>
          <option value="CURRENTLY_EXPLORING">Currently Exploring</option>
        </select>

        <select name="level">
          <option value="">Experience level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <input
          name="proficiency"
          type="number"
          min="0"
          max="100"
          placeholder="Proficiency % (e.g. 65)"
        />

        <input
          name="relatedTechnologies"
          placeholder="Related tech (comma-separated)"
        />

        <input
          name="learnedFrom"
          placeholder="Learned from (comma-separated)"
        />

        <button type="submit">Add Skill</button>
      </form>

      {Object.entries(categoryLabels).map(([key, label]) => (
        <div key={key}>
          <h3>{label}</h3>

          <ul className="admin-list">
            {skills
              .filter((s) => s.category === key)
              .map((s) => (
                <li key={s.$id} className="admin-list-item">
                  <div>
                    <strong>{String(s.name)}</strong>
                    <div className="admin-item-meta">
                      {s.proficiency !== null &&
                        s.proficiency !== undefined &&
                        `${s.proficiency}%`}
                      {s.level && ` · ${String(s.level)}`}
                    </div>
                  </div>

                  <form action={deleteSkill.bind(null, s.$id)}>
                    <button type="submit" className="admin-delete-btn">
                      Delete
                    </button>
                  </form>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
