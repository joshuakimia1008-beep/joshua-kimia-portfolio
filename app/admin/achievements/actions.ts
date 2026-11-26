"use server";

import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { tablesDB, storage } from "@/lib/appwrite-server";
import { revalidatePath } from "next/cache";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const tableId = process.env.APPWRITE_ACHIEVEMENTS_TABLE_ID!;
const bucketId = process.env.APPWRITE_BUCKET_ID!;

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function getFileUrl(fileId: string) {
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

async function saveImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!file.type.startsWith("image/")) {
    throw new Error("Achievement upload must be an image.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Achievement image must be 10 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploaded = await storage.createFile({
    bucketId,
    fileId: ID.unique(),
    file: InputFile.fromBuffer(buffer, file.name),
  });

  return getFileUrl(uploaded.$id);
}

function getImageFileId(imageUrl: string | null): string | null {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/");
    const bucketIndex = segments.indexOf("buckets");

    if (
      bucketIndex === -1 ||
      segments[bucketIndex + 1] !== bucketId ||
      segments[bucketIndex + 2] !== "files"
    ) {
      return null;
    }

    return segments[bucketIndex + 3] || null;
  } catch {
    return null;
  }
}

export async function createAchievement(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const dateValue = formData.get("date") as string;
  const imageFile = formData.get("image") as File | null;

  if (!title) {
    throw new Error("Achievement title is required.");
  }

  const imageUrl = await saveImage(imageFile);

  await tablesDB.createRow({
    databaseId,
    tableId,
    rowId: ID.unique(),
    data: {
      title,
      description,
      date: dateValue
        ? new Date(`${dateValue}T00:00:00.000Z`).toISOString()
        : null,
      imageUrl,
      order: 0,
    },
  });

  revalidatePath("/admin/achievements");
  revalidatePath("/");
}

export async function deleteAchievement(id: string) {
  const achievement = await tablesDB.getRow({
    databaseId,
    tableId,
    rowId: id,
  });

  const imageUrl =
    (achievement as unknown as { imageUrl?: string | null }).imageUrl ?? null;

  await tablesDB.deleteRow({
    databaseId,
    tableId,
    rowId: id,
  });

  const imageFileId = getImageFileId(imageUrl);

  if (imageFileId) {
    try {
      await storage.deleteFile({
        bucketId,
        fileId: imageFileId,
      });
    } catch {
      // The achievement is deleted even if image cleanup fails.
    }
  }

  revalidatePath("/admin/achievements");
  revalidatePath("/");
}
