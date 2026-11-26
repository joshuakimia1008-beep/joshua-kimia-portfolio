import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminAccount } from "@/lib/auth";
import { tablesDB } from "@/lib/appwrite-server";

export const dynamic = "force-dynamic";

const databaseId = process.env.APPWRITE_DATABASE_ID!;

async function getAdminAppearance() {
  try {
    const row = await tablesDB.getRow({
      databaseId,
      tableId: "settings",
      rowId: "singleton",
    });

    const settings = row as unknown as Record<string, unknown>;

    const overlayValue = Number(settings.dashboardBackgroundOverlay ?? 42);
    const blurValue = Number(settings.dashboardBackgroundBlur ?? 0);

    return {
      imageUrl:
        typeof settings.dashboardBackgroundUrl === "string"
          ? settings.dashboardBackgroundUrl
          : "",
      overlay: Number.isFinite(overlayValue)
        ? Math.min(80, Math.max(0, overlayValue))
        : 42,
      blur: Number.isFinite(blurValue)
        ? Math.min(12, Math.max(0, blurValue))
        : 0,
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 404
    ) {
      return { imageUrl: "", overlay: 42, blur: 0 };
    }

    throw error;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminAccount();

  if (!user) {
    redirect("/login");
  }

  const appearance = await getAdminAppearance();

  return <AdminShell appearance={appearance}>{children}</AdminShell>;
}
