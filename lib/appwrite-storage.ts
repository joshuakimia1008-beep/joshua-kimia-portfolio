import { ID, Permission, Role } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { storage } from "@/lib/appwrite-server";

const MAX_FILE_SIZE = 30 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

function getStorageConfig() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const bucketId = process.env.APPWRITE_BUCKET_ID;

  if (!endpoint || !projectId || !bucketId) {
    throw new Error("Appwrite Storage environment variables are missing.");
  }

  return { endpoint, projectId, bucketId };
}

export async function uploadPortfolioImage(file: File) {
  const { endpoint, projectId, bucketId } = getStorageConfig();

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must not exceed 30MB.");
  }

  const originalName = file.name;
  const extension = originalName
    .substring(originalName.lastIndexOf("."))
    .toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error("Only JPG, JPEG, PNG and GIF images are supported.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid image file type.");
  }

  const safeName = originalName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.jpeg$/i, ".jpg");

  const fileId = ID.unique();
  const buffer = Buffer.from(await file.arrayBuffer());

  await storage.createFile({
    bucketId,
    fileId,
    file: InputFile.fromBuffer(buffer, safeName),
    permissions: [Permission.read(Role.any())],
  });

  const imageUrl =
    `${endpoint.replace(/\/$/, "")}/storage/buckets/${bucketId}` +
    `/files/${fileId}/view?project=${projectId}`;

  return { fileId, imageUrl };
}

export async function deletePortfolioImage(fileId: string) {
  const { bucketId } = getStorageConfig();

  await storage.deleteFile({
    bucketId,
    fileId,
  });
}
