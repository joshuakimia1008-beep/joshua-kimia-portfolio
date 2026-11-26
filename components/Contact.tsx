import { tablesDB } from "@/lib/appwrite-server";
import ContactInteractive from "./ContactInteractive";

const databaseId = process.env.APPWRITE_DATABASE_ID!;

type Settings = {
  contactEmail?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  resumeUrl?: string | null;
  availability?: string | null;
  location?: string | null;
};

export default async function Contact() {
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
    <ContactInteractive
      email={settings?.contactEmail || "JoshuaKimia1008@gmail.com"}
      githubUrl={settings?.githubUrl ?? null}
      linkedinUrl={settings?.linkedinUrl ?? null}
      resumeUrl={settings?.resumeUrl || "/Joshua-Kimia-CV.pdf"}
      availability={settings?.availability ?? "AVAILABLE"}
      location={settings?.location ?? null}
    />
  );
}
