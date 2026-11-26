"use server";

import { ID } from "node-appwrite";
import { tablesDB } from "@/lib/appwrite-server";
import { revalidatePath } from "next/cache";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const tableId = process.env.APPWRITE_SKILLS_TABLE_ID!;

type SkillCategory =
  | "PROGRAMMING_AND_WEB"
  | "TOOLS_AND_TECHNOLOGIES"
  | "CURRENTLY_EXPLORING";

const validCategories: SkillCategory[] = [
  "PROGRAMMING_AND_WEB",
  "TOOLS_AND_TECHNOLOGIES",
  "CURRENTLY_EXPLORING",
];

export async function createSkill(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as SkillCategory;
  const level = (formData.get("level") as string) || null;

  const proficiencyValue = formData.get("proficiency");
  const proficiency = proficiencyValue ? Number(proficiencyValue) : null;

  const relatedTechnologies =
    (formData.get("relatedTechnologies") as string) || null;

  const learnedFrom = (formData.get("learnedFrom") as string) || null;

  if (!name) {
    throw new Error("Skill name is required.");
  }

  if (!validCategories.includes(category)) {
    throw new Error("Invalid skill category.");
  }

  if (
    proficiency !== null &&
    (!Number.isFinite(proficiency) || proficiency < 0 || proficiency > 100)
  ) {
    throw new Error("Proficiency must be between 0 and 100.");
  }

  await tablesDB.createRow({
    databaseId,
    tableId,
    rowId: ID.unique(),
    data: {
      name,
      category,
      level,
      proficiency,
      relatedTechnologies,
      learnedFrom,
    },
  });

  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export async function deleteSkill(id: string) {
  await tablesDB.deleteRow({
    databaseId,
    tableId,
    rowId: id,
  });

  revalidatePath("/admin/skills");
  revalidatePath("/");
}
