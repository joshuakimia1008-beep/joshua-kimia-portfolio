import fs from "node:fs";
import { Client, Storage } from "node-appwrite";

const env = fs.readFileSync(".env", "utf8");

function getEnv(name) {
  const match = env.match(new RegExp(`^${name}=(.*)$`, "m"));
  return match?.[1]?.trim().replace(/^["']|["']$/g, "");
}

console.log("Starting Appwrite bucket inspection...");

const endpoint = getEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
const projectId = getEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
const apiKey = getEnv("APPWRITE_API_KEY");
const bucketId = getEnv("APPWRITE_BUCKET_ID");

if (!endpoint || !projectId || !apiKey || !bucketId) {
  throw new Error("One or more required environment variables are missing.");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const storage = new Storage(client);

try {
  const bucket = await storage.getBucket({ bucketId });

  console.log("\nBUCKET CONFIGURATION");
  console.log("--------------------");
  console.log("Name:", bucket.name);
  console.log("Bucket ID:", bucket.$id);
  console.log("Enabled:", bucket.enabled);
  console.log("Allowed extensions:", bucket.allowedFileExtensions);
  console.log("Maximum file size:", bucket.maximumFileSize);
} catch (error) {
  console.error("BUCKET CHECK FAILED:", error.message);
  process.exitCode = 1;
}
