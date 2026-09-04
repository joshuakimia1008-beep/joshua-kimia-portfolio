import { prisma } from "@/lib/prisma";
import { createAchievement, deleteAchievement } from "./actions";

export default async function AchievementsPage() {
  const achievements = await prisma.achievement.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1>Achievements</h1>

      <form
        action={createAchievement}
        encType="multipart/form-data"
        style={{ display: "grid", gap: 8, maxWidth: 400, marginBottom: 32 }}
      >
        <input name="title" placeholder="Title" required />
        <textarea name="description" placeholder="Description (optional)" />
        <label>
          Date (optional)
          <input name="date" type="date" />
        </label>
        <label>
          Image (optional)
          <input name="image" type="file" accept="image/*" />
        </label>
        <button type="submit">Add Achievement</button>
      </form>

      <ul>
        {achievements.map((a) => (
          <li key={a.id} style={{ marginBottom: 8 }}>
            <strong>{a.title}</strong>
            <form
              action={deleteAchievement.bind(null, a.id)}
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
