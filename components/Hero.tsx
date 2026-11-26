import { tablesDB } from "@/lib/appwrite-server";
import HeroInteractive from "./HeroInteractive";
import { parseProfileImageUrls } from "./profileImages";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const tableId = "settings";
const rowId = "singleton";

type HeroSettings = {
  bio?: string | null;
  profileImageUrl?: string | null;
  resumeUrl?: string | null;
  location?: string | null;
  availability?: string | null;
};

export default async function Hero() {
  let settings: HeroSettings | null = null;

  try {
    const row = await tablesDB.getRow({
      databaseId,
      tableId,
      rowId,
    });

    settings = row as unknown as HeroSettings;
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
    <HeroInteractive
      bio={settings?.bio ?? null}
      profileImageUrls={parseProfileImageUrls(settings?.profileImageUrl)}
      resumeUrl={settings?.resumeUrl || "/Joshua-Kimia-CV.pdf"}
      location={settings?.location ?? null}
      availability={settings?.availability ?? "AVAILABLE"}
    />
  );
}
