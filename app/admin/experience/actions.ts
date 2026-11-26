"use server";

import { tablesDB } from "@/lib/appwrite-server";
import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";

export async function createExperience(formData: FormData) {
  const type = String(formData.get("type") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDateValue = String(formData.get("endDate") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (
    !["EXPERIENCE", "EDUCATION"].includes(type) ||
    !title ||
    !organization ||
    !startDate
  ) {
    throw new Error("Please provide all required fields.");
  }

  const data: Record<string, unknown> = {
    type,
    title,
    organization,
    startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
  };

  if (endDateValue) {
    data.endDate = new Date(`${endDateValue}T00:00:00.000Z`).toISOString();
  }

  if (description) {
    data.description = description;
  }

  await tablesDB.createRow({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_EXPERIENCE_TABLE_ID!,
    rowId: ID.unique(),
    data,
  });

  revalidatePath("/admin/experience");
  revalidatePath("/");
}

export async function deleteExperience(id: string) {
  await tablesDB.deleteRow({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_EXPERIENCE_TABLE_ID!,
    rowId: id,
  });

  revalidatePath("/admin/experience");
  revalidatePath("/");
}
