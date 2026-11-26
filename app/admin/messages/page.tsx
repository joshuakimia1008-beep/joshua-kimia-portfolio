import { Query } from "node-appwrite";
import { tablesDB } from "@/lib/appwrite-server";
import { requireAdmin } from "@/lib/auth";
import MessagesClient, {
  type ContactMessage,
} from "@/components/admin/MessagesClient";

export const dynamic = "force-dynamic";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const tableId = "contact_messages";

export default async function AdminMessagesPage() {
  await requireAdmin();

  const result = await tablesDB.listRows({
    databaseId,
    tableId,
    queries: [Query.orderDesc("createdAt"), Query.limit(100)],
  });

  const messages = result.rows.map((row) => {
    const data = row as unknown as Record<string, unknown>;

    return {
      $id: row.$id,
      name: typeof data.name === "string" ? data.name : "Unknown sender",
      email: typeof data.email === "string" ? data.email : "",
      message: typeof data.message === "string" ? data.message : "",
      status: data.status === "READ" ? "READ" : "UNREAD",
      createdAt: typeof data.createdAt === "string" ? data.createdAt : "",
    } satisfies ContactMessage;
  });

  return <MessagesClient messages={messages} />;
}
