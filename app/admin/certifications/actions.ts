"use server";

import { ID } from "node-appwrite";
import { tablesDB } from "@/lib/appwrite-server";
import { requireAdmin } from "@/lib/auth";
import {
  uploadPortfolioImage,
  deletePortfolioImage,
} from "@/lib/appwrite-storage";
import { revalidatePath } from "next/cache";

export async function createCertification(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const issuer = String(formData.get("issuer") ?? "").trim();
  const issueDate = String(formData.get("issueDate") ?? "");
  const expiryValue = String(formData.get("expiryDate") ?? "");
  const credentialUrl = String(formData.get("credentialUrl") ?? "").trim();

  const imageFile = formData.get("image");

  if (!title || !issuer || !issueDate) {
    throw new Error("Title, issuer and issue date are required.");
  }

  let uploaded: { fileId: string; imageUrl: string } | null = null;

  if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
    uploaded = await uploadPortfolioImage(imageFile);
  }

  const data: Record<string, unknown> = {
    title,
    issuer,
    issueDate: new Date(`${issueDate}T00:00:00.000Z`).toISOString(),
    displayOrder: Date.now(),
  };

  if (expiryValue) {
    data.expiryDate = new Date(`${expiryValue}T00:00:00.000Z`).toISOString();
  }

  if (credentialUrl) {
    data.credentialUrl = credentialUrl;
  }

  if (uploaded) {
    data.imageUrl = uploaded.imageUrl;
  }

  try {
    await tablesDB.createRow({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_CERTIFICATIONS_TABLE_ID!,
      rowId: ID.unique(),
      data,
    });
  } catch (error) {
    if (uploaded) {
      try {
        await deletePortfolioImage(uploaded.fileId);
      } catch (cleanupError) {
        console.error("CERTIFICATION IMAGE CLEANUP ERROR:", cleanupError);
      }
    }

    throw error;
  }

  revalidatePath("/admin/certifications");
  revalidatePath("/");
}

export async function deleteCertification(id: string) {
  await requireAdmin();

  await tablesDB.deleteRow({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_CERTIFICATIONS_TABLE_ID!,
    rowId: id,
  });

  revalidatePath("/admin/certifications");
  revalidatePath("/");
}
