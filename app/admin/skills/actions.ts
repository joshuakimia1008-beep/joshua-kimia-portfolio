"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSkill(formData: FormData) {
  await prisma.skill.create({
    data: {
      name: formData.get("name") as string,
      category: formData.get("category") as
        | "PROGRAMMING_AND_WEB"
        | "TOOLS_AND_TECHNOLOGIES"
        | "CURRENTLY_EXPLORING",
      level: (formData.get("level") as string) || null,
      proficiency: formData.get("proficiency")
        ? Number(formData.get("proficiency"))
        : null,
      relatedTechnologies:
        (formData.get("relatedTechnologies") as string) || null,
      learnedFrom: (formData.get("learnedFrom") as string) || null,
    },
  });
  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export async function deleteSkill(id: string) {
  await prisma.skill.delete({ where: { id } });
  revalidatePath("/admin/skills");
  revalidatePath("/");
}
