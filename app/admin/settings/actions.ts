"use server";

import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { tablesDB, storage } from "@/lib/appwrite-server";
import { revalidatePath } from "next/cache";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const tableId = "settings";
const bucketId = process.env.APPWRITE_BUCKET_ID!;
const rowId = "singleton";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

const MAX_FILE_SIZE = 30 * 1024 * 1024;
const RESUME_FILENAME = "Joshua-Kimia-CV.pdf";

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "svg",
  "pdf",
  "mp4",
  "webm",
];

function getFileUrl(fileId: string) {
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

function isNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 404
  );
}

function getErrorDetails(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return { message: String(error) };
  }

  const details: Record<string, unknown> = {};

  if ("message" in error) details.message = error.message;
  if ("code" in error) details.code = error.code;
  if ("type" in error) details.type = error.type;
  if ("response" in error) details.response = error.response;

  return details;
}

async function saveFile(
  file: File | null,
  storedFilename?: string,
): Promise<string | undefined> {
  if (!file || file.size === 0) return undefined;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`${file.name} exceeds the 30 MB upload limit.`);
  }

  const filename = storedFilename || file.name;
  const extension = filename.split(".").pop()?.toLowerCase();

  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `Unsupported file extension for "${filename}". Allowed formats: ${ALLOWED_EXTENSIONS.join(", ")}.`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Verify that the uploaded resume is a genuine PDF.
  if (storedFilename === RESUME_FILENAME) {
    const pdfSignature = Buffer.from("%PDF-");
    const header = buffer.subarray(0, 1024);

    if (!header.includes(pdfSignature)) {
      throw new Error(
        "The uploaded resume is not a valid PDF document. Please upload a genuine PDF file.",
      );
    }
  }

  console.log("APPWRITE UPLOAD DEBUG:", {
    bucketId,
    originalFilename: file.name,
    filename,
    extension,
    mimeType: file.type,
    fileSize: buffer.length,
    isResume: storedFilename === RESUME_FILENAME,
  });

  try {
    const uploaded = await storage.createFile({
      bucketId,
      fileId: ID.unique(),
      file: InputFile.fromBuffer(buffer, filename),
    });

    console.log("APPWRITE UPLOAD SUCCESS:", {
      bucketId,
      filename,
      fileId: uploaded.$id,
    });

    return getFileUrl(uploaded.$id);
  } catch (error) {
    console.error("APPWRITE UPLOAD FAILED:", {
      bucketId,
      filename,
      extension,
      error: getErrorDetails(error),
    });

    throw new Error(
      `Appwrite could not upload "${filename}". ${
        error instanceof Error ? error.message : "Unknown upload error."
      }`,
    );
  }
}

function getFormFile(formData: FormData, name: string): File | null {
  const value = formData.get(name);

  return value instanceof File && value.size > 0 ? value : null;
}

function validateFile(
  file: File | null,
  type: "image" | "video",
  label: string,
) {
  if (!file) return;

  const valid =
    type === "image"
      ? file.type.startsWith("image/")
      : file.type.startsWith("video/");

  if (!valid) {
    throw new Error(`${label} has an invalid file format.`);
  }
}

/* =========================================================
   PUBLIC PORTFOLIO SETTINGS
   Controls the public hero slideshow and website information.
========================================================= */

export async function updateSettings(formData: FormData) {
  let existing: Record<string, unknown> = {};
  let rowExists = false;

  try {
    const row = await tablesDB.getRow({
      databaseId,
      tableId,
      rowId,
    });

    existing = row as unknown as Record<string, unknown>;
    rowExists = true;
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  // Public hero slideshow images.
  const profileImageFiles = formData
    .getAll("profileImageFiles")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (profileImageFiles.length > 12) {
    throw new Error("Please upload no more than 12 hero photos at a time.");
  }

  if (profileImageFiles.some((file) => !file.type.startsWith("image/"))) {
    throw new Error("Hero slideshow uploads must be image files.");
  }

  if (profileImageFiles.some((file) => file.size > 10 * 1024 * 1024)) {
    throw new Error("Each hero photo must be 10 MB or smaller.");
  }

  const totalUploadBytes = profileImageFiles.reduce(
    (total, file) => total + file.size,
    0,
  );

  if (totalUploadBytes > 30 * 1024 * 1024) {
    throw new Error("The combined hero photo upload must be 30 MB or smaller.");
  }

  const retainedImages = formData
    .getAll("profileImageUrls")
    .filter(
      (entry): entry is string => typeof entry === "string" && entry.length > 0,
    );

  const newImages = await Promise.all(
    profileImageFiles.map((file) => saveFile(file)),
  );

  const profileImageUrl = JSON.stringify([
    ...retainedImages,
    ...newImages.filter((url): url is string => Boolean(url)),
  ]);

  // Other public website assets.
  const faviconFile = getFormFile(formData, "favicon");
  const ogImageFile = getFormFile(formData, "ogImage");
  const resumeFile = getFormFile(formData, "resume");
  const footerVideoFile = getFormFile(formData, "footerVideo");

  validateFile(faviconFile, "image", "Favicon");
  validateFile(ogImageFile, "image", "Open Graph image");
  validateFile(footerVideoFile, "video", "Footer video");

  const [faviconUrl, ogImageUrl, resumeUrl, footerVideoUrl] = await Promise.all(
    [
      saveFile(faviconFile),
      saveFile(ogImageFile),
      saveFile(resumeFile, RESUME_FILENAME),
      saveFile(footerVideoFile),
    ],
  );

  const data = {
    bio: (formData.get("bio") as string) || "",
    profileImageUrl,
    githubUrl: (formData.get("githubUrl") as string) || "",
    linkedinUrl: (formData.get("linkedinUrl") as string) || "",
    twitterUrl: (formData.get("twitterUrl") as string) || "",
    faviconUrl: faviconUrl ?? (existing.faviconUrl as string) ?? "",
    ogImageUrl: ogImageUrl ?? (existing.ogImageUrl as string) ?? "",
    resumeUrl: resumeUrl ?? (existing.resumeUrl as string) ?? "",
    contactEmail: (formData.get("contactEmail") as string) || "",
    location: (formData.get("location") as string) || "",
    availability: (formData.get("availability") as string) || "AVAILABLE",
    footerVideoUrl: footerVideoUrl ?? (existing.footerVideoUrl as string) ?? "",
    seoTitle: (formData.get("seoTitle") as string) || "",
    seoDescription: (formData.get("seoDescription") as string) || "",
  };

  if (rowExists) {
    await tablesDB.updateRow({
      databaseId,
      tableId,
      rowId,
      data,
    });
  } else {
    await tablesDB.createRow({
      databaseId,
      tableId,
      rowId,
      data,
    });
  }

  // Public portfolio changes should refresh the public homepage.
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

/* =========================================================
   ADMIN DASHBOARD APPEARANCE
   Controls ONLY the background of the private admin workspace.
========================================================= */

export async function saveDashboardAppearance(formData: FormData) {
  const backgroundFile = getFormFile(formData, "dashboardBackground");

  validateFile(backgroundFile, "image", "Dashboard background");

  const rawOverlay = Number(formData.get("dashboardBackgroundOverlay") ?? 42);

  const rawBlur = Number(formData.get("dashboardBackgroundBlur") ?? 0);

  if (!Number.isFinite(rawOverlay) || !Number.isFinite(rawBlur)) {
    throw new Error("Overlay and blur values must be valid numbers.");
  }

  const overlay = Math.min(80, Math.max(0, Math.round(rawOverlay)));
  const blur = Math.min(12, Math.max(0, Math.round(rawBlur)));

  let existing: Record<string, unknown> = {};
  let rowExists = false;

  try {
    const row = await tablesDB.getRow({
      databaseId,
      tableId,
      rowId,
    });

    existing = row as unknown as Record<string, unknown>;
    rowExists = true;
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  // Preserve the currently saved admin background unless changed or removed.
  let backgroundUrl =
    typeof existing.dashboardBackgroundUrl === "string"
      ? existing.dashboardBackgroundUrl
      : "";

  if (formData.get("removeDashboardBackground") === "true") {
    backgroundUrl = "";
  } else if (backgroundFile) {
    backgroundUrl = (await saveFile(backgroundFile)) ?? backgroundUrl;
  }

  const data = {
    dashboardBackgroundUrl: backgroundUrl,
    dashboardBackgroundOverlay: overlay,
    dashboardBackgroundBlur: blur,
  };

  if (rowExists) {
    await tablesDB.updateRow({
      databaseId,
      tableId,
      rowId,
      data,
    });
  } else {
    await tablesDB.createRow({
      databaseId,
      tableId,
      rowId,
      data: {
        bio: "",
        profileImageUrl: "[]",
        githubUrl: "",
        linkedinUrl: "",
        twitterUrl: "",
        faviconUrl: "",
        ogImageUrl: "",
        resumeUrl: "",
        contactEmail: "",
        location: "",
        availability: "AVAILABLE",
        footerVideoUrl: "",
        seoTitle: "",
        seoDescription: "",
        ...data,
      },
    });
  }

  // Admin-only appearance changes must not revalidate the public homepage.
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
}
