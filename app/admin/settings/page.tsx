import { tablesDB } from "@/lib/appwrite-server";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const tableId = "settings";
const rowId = "singleton";

type Settings = {
  bio: string | null;
  profileImageUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  resumeUrl: string | null;
  contactEmail: string | null;
  location: string | null;
  availability: string;
  footerVideoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export default async function SettingsPage() {
  let settings: Settings | null = null;

  try {
    const row = await tablesDB.getRow({
      databaseId,
      tableId,
      rowId,
    });

    settings = row as unknown as Settings;
  } catch (error) {
    const isNotFound =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 404;

    if (!isNotFound) {
      throw error;
    }
  }

  return (
    <div>
      <h1>Settings & Profile</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
