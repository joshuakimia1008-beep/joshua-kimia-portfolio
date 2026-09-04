import { prisma } from "@/lib/prisma";
import { createExperience, deleteExperience } from "./actions";

export default async function ExperiencePage() {
  const entries = await prisma.experienceEntry.findMany({
    orderBy: { startDate: "desc" },
  });
  const experience = entries.filter((e) => e.type === "EXPERIENCE");
  const education = entries.filter((e) => e.type === "EDUCATION");

  return (
    <div>
      <h1>Experience & Education</h1>

      <form
        action={createExperience}
        style={{ display: "grid", gap: 8, maxWidth: 400, marginBottom: 32 }}
      >
        <select name="type" required>
          <option value="">Type</option>
          <option value="EXPERIENCE">Experience</option>
          <option value="EDUCATION">Education</option>
        </select>
        <input
          name="title"
          placeholder="Title (e.g. Software Engineering Intern)"
          required
        />
        <input
          name="organization"
          placeholder="Organization (e.g. Revlinks Integrated Services)"
          required
        />
        <label>
          Start date
          <input name="startDate" type="date" required />
        </label>
        <label>
          End date (leave blank for "Present")
          <input name="endDate" type="date" />
        </label>
        <textarea name="description" placeholder="Description (optional)" />
        <button type="submit">Add Entry</button>
      </form>

      <h3>Experience</h3>
      <ul>
        {experience.map((e) => (
          <li key={e.id} style={{ marginBottom: 8 }}>
            <strong>{e.title}</strong> — {e.organization}
            <form
              action={deleteExperience.bind(null, e.id)}
              style={{ display: "inline", marginLeft: 8 }}
            >
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>

      <h3>Education</h3>
      <ul>
        {education.map((e) => (
          <li key={e.id} style={{ marginBottom: 8 }}>
            <strong>{e.title}</strong> — {e.organization}
            <form
              action={deleteExperience.bind(null, e.id)}
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
