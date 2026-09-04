"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createExperience(formData: FormData) {
  const endDateValue = formData.get("endDate") as string;

  await prisma.experienceEntry.create({
    data: {
      type: formData.get("type") as "EXPERIENCE" | "EDUCATION",
      title: formData.get("title") as string,
      organization: formData.get("organization") as string,
      startDate: new Date(formData.get("startDate") as string),
      endDate: endDateValue ? new Date(endDateValue) : null,
      description: (formData.get("description") as string) || null,
    },
  });
  revalidatePath("/admin/experience");
  revalidatePath("/");
}

export async function deleteExperience(id: string) {
  await prisma.experienceEntry.delete({ where: { id } });
  revalidatePath("/admin/experience");
  revalidatePath("/");
}
