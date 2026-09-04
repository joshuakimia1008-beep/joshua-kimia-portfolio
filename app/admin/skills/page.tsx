import { prisma } from "@/lib/prisma";
import { createSkill, deleteSkill } from "./actions";

const categoryLabels: Record<string, string> = {
  PROGRAMMING_AND_WEB: "Programming & Web",
  TOOLS_AND_TECHNOLOGIES: "Tools & Technologies",
  CURRENTLY_EXPLORING: "Currently Exploring",
};

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1>Skills</h1>

      <form
        action={createSkill}
        style={{ display: "grid", gap: 8, maxWidth: 400, marginBottom: 32 }}
      >
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
          placeholder="Related tech (comma-separated, e.g. FastAPI,AI/ML,APIs)"
        />
        <input
          name="learnedFrom"
          placeholder="Learned from (comma-separated, e.g. Personal projects,Online learning)"
        />
        <button type="submit">Add Skill</button>
      </form>

      {Object.entries(categoryLabels).map(([key, label]) => (
        <div key={key} style={{ marginBottom: 24 }}>
          <h3>{label}</h3>
          <ul>
            {skills
              .filter((s) => s.category === key)
              .map((s) => (
                <li key={s.id} style={{ marginBottom: 8 }}>
                  <strong>{s.name}</strong>
                  {s.proficiency !== null && ` — ${s.proficiency}%`}
                  {s.level && ` (${s.level})`}
                  <form
                    action={deleteSkill.bind(null, s.id)}
                    style={{ display: "inline", marginLeft: 8 }}
                  >
                    <button type="submit">Delete</button>
                  </form>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
