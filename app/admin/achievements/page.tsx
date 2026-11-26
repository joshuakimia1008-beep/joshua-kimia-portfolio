import { tablesDB } from "@/lib/appwrite-server";
import { Query } from "node-appwrite";
import { createAchievement, deleteAchievement } from "./actions";
import ImageCropInput from "@/components/admin/ImageCropInput";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const tableId = process.env.APPWRITE_ACHIEVEMENTS_TABLE_ID!;

type Achievement = {
  $id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  imageUrl?: string | null;
  order?: number;
};

export default async function AchievementsPage() {
  const result = await tablesDB.listRows({
    databaseId,
    tableId,
    queries: [Query.orderAsc("order"), Query.limit(100)],
  });

  const achievements = result.rows as unknown as Achievement[];

  return (
    <div>
      <h1>Achievements</h1>

      <form
        action={createAchievement}
        encType="multipart/form-data"
        className="admin-form"
      >
        <input name="title" placeholder="Title" required />
        <textarea name="description" placeholder="Description (optional)" />
        <label>
          Date (optional)
          <input name="date" type="date" />
        </label>
        <ImageCropInput
          name="image"
          label="Achievement image (optional)"
          aspectRatio={16 / 9}
          helpText="Crop the achievement image before uploading."
        />
        <button type="submit">Add Achievement</button>
      </form>

      <ul className="admin-list">
        {achievements.map((a) => (
          <li key={a.$id} className="admin-list-item">
            <strong>{a.title}</strong>
            <form action={deleteAchievement.bind(null, a.$id)}>
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
