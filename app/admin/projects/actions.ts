"use server";

import { ID } from "node-appwrite";
import { tablesDB } from "@/lib/appwrite-server";
import { requireAdmin } from "@/lib/auth";
import {
  uploadPortfolioImage,
  deletePortfolioImage,
} from "@/lib/appwrite-storage";
import { revalidatePath } from "next/cache";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const tableId = process.env.APPWRITE_PROJECTS_TABLE_ID!;

export async function createProject(formData: FormData) {
  await requireAdmin();

  const imageFile = formData.get("image");

  let uploaded: { fileId: string; imageUrl: string } | null = null;

  if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
    uploaded = await uploadPortfolioImage(imageFile);
  }

  const technologies = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  try {
    await tablesDB.createRow({
      databaseId,
      tableId,
      rowId: ID.unique(),
      data: {
        title: String(formData.get("title") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        image: uploaded?.imageUrl ?? "",
        liveUrl: String(formData.get("liveUrl") ?? ""),
        githubUrl: String(formData.get("repoUrl") ?? ""),
        technologies,
        category: "Project",
        featured: false,
        displayOrder: 0,
      },
    });
  } catch (error) {
    if (uploaded) {
      try {
        await deletePortfolioImage(uploaded.fileId);
      } catch (cleanupError) {
        console.error("PROJECT IMAGE CLEANUP ERROR:", cleanupError);
      }
    }

    throw error;
  }

  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function deleteProject(id: string) {
  await requireAdmin();

  await tablesDB.deleteRow({
    databaseId,
    tableId,
    rowId: id,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function updateProject(id: string, formData: FormData) {
  await requireAdmin();

  const technologies = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  await tablesDB.updateRow({
    databaseId,
    tableId,
    rowId: id,
    data: {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      liveUrl: String(formData.get("liveUrl") ?? ""),
      githubUrl: String(formData.get("repoUrl") ?? ""),
      technologies,
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/");
}
