"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

export async function createAchievement(formData: FormData) {
  const dateValue = formData.get("date") as string;
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${imageFile.name}`;
    const filepath = path.join(process.cwd(), "public", "uploads", filename);
    await writeFile(filepath, buffer);
    imageUrl = `/uploads/${filename}`;
  }

  await prisma.achievement.create({
    data: {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      date: dateValue ? new Date(dateValue) : null,
      imageUrl,
    },
  });
  revalidatePath("/admin/achievements");
  revalidatePath("/");
}

export async function deleteAchievement(id: string) {
  await prisma.achievement.delete({ where: { id } });
  revalidatePath("/admin/achievements");
  revalidatePath("/");
}
