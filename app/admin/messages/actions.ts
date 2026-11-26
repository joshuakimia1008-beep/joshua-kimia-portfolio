"use server";

import { tablesDB } from "@/lib/appwrite-server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const tableId = "contact_messages";

export async function updateMessageStatus(
  id: string,
  status: "READ" | "UNREAD",
) {
  await requireAdmin();

  if (!id || !["READ", "UNREAD"].includes(status)) {
    throw new Error("Invalid message update.");
  }

  await tablesDB.updateRow({
    databaseId,
    tableId,
    rowId: id,
    data: { status },
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteContactMessage(id: string) {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    throw new Error("Invalid message ID.");
  }

  await tablesDB.deleteRow({
    databaseId,
    tableId,
    rowId: id,
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
