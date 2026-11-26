import { tablesDB } from "@/lib/appwrite-server";
import { createExperience, deleteExperience } from "./actions";

export const dynamic = "force-dynamic";

export default async function ExperiencePage() {
  const result = await tablesDB.listRows({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_EXPERIENCE_TABLE_ID!,
  });

  const entries = result.rows.sort(
    (a, b) =>
      new Date(String(b.startDate)).getTime() -
      new Date(String(a.startDate)).getTime(),
  );

  const experience = entries.filter((e) => e.type === "EXPERIENCE");
  const education = entries.filter((e) => e.type === "EDUCATION");

  return (
    <div>
      <h1>Experience & Education</h1>

      <form action={createExperience} className="admin-form">
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

        <input name="organization" placeholder="Organization" required />

        <label>
          Start date
          <input name="startDate" type="date" required />
        </label>

        <label>
          End date (leave blank for Present)
          <input name="endDate" type="date" />
        </label>

        <textarea name="description" placeholder="Description (optional)" />

        <button type="submit">Add Entry</button>
      </form>

      <h3>Experience</h3>
      <ul className="admin-list">
        {experience.map((e) => (
          <li key={e.$id} className="admin-list-item">
            <div>
              <strong>{String(e.title)}</strong>
              <div className="admin-item-meta">{String(e.organization)}</div>
            </div>

            <form action={deleteExperience.bind(null, e.$id)}>
              <button type="submit" className="admin-delete-btn">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>

      <h3>Education</h3>
      <ul className="admin-list">
        {education.map((e) => (
          <li key={e.$id} className="admin-list-item">
            <div>
              <strong>{String(e.title)}</strong>
              <div className="admin-item-meta">{String(e.organization)}</div>
            </div>

            <form action={deleteExperience.bind(null, e.$id)}>
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
