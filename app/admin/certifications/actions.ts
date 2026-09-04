"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

export async function createCertification(formData: FormData) {
  const expiryValue = formData.get("expiryDate") as string;
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

  await prisma.certification.create({
    data: {
      title: formData.get("title") as string,
      issuer: formData.get("issuer") as string,
      issueDate: new Date(formData.get("issueDate") as string),
      expiryDate: expiryValue ? new Date(expiryValue) : null,
      credentialUrl: (formData.get("credentialUrl") as string) || null,
      imageUrl,
    },
  });
  revalidatePath("/admin/certifications");
  revalidatePath("/");
}

export async function deleteCertification(id: string) {
  await prisma.certification.delete({ where: { id } });
  revalidatePath("/admin/certifications");
  revalidatePath("/");
}
