import { Client, TablesDB } from "node-appwrite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  const fallbackPath = resolve(process.cwd(), ".env");

  let content;

  try {
    content = readFileSync(envPath, "utf8");
  } catch {
    content = readFileSync(fallbackPath, "utf8");
  }

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");

    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  }
}

async function main() {
  try {
    loadEnvFile();

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!endpoint || !projectId || !apiKey) {
      throw new Error("Missing Appwrite environment variables.");
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const tablesDB = new TablesDB(client);

    console.log("Creating dashboardBackgroundUrl column...");

    const result = await tablesDB.createStringColumn({
      databaseId: "6af0e04700278cb50f3c",
      tableId: "settings",
      key: "dashboardBackgroundUrl",
      size: 2048,
      required: false,
    });

    console.log("SUCCESS: Column creation requested.");
    console.log("Column:", result.key);
    console.log("Status:", result.status);
  } catch (error) {
    console.error("FAILED:", error.message);
    process.exitCode = 1;
  }
}

main();
