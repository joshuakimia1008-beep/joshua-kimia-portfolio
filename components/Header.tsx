import { tablesDB } from "@/lib/appwrite-server";
import HeaderNav from "./HeaderNav";

const databaseId = process.env.APPWRITE_DATABASE_ID!;

type Settings = {
  resumeUrl?: string | null;
};

export default async function Header() {
  let settings: Settings | null = null;

  try {
    const row = await tablesDB.getRow({
      databaseId,
      tableId: "settings",
      rowId: "singleton",
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
    <HeaderNav resumeUrl={settings?.resumeUrl || "/Joshua-Kimia-CV.pdf"} />
  );
}
