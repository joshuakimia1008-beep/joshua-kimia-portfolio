import { Client, TablesDB } from "node-appwrite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const content = readFileSync(resolve(process.cwd(), file), "utf8");

      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) continue;

        const index = trimmed.indexOf("=");
        if (index === -1) continue;

        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim();

        if (process.env[key] === undefined) {
          process.env[key] = value.replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      // Try the next environment file.
    }
  }
}

async function main() {
  try {
    loadEnv();

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const db = new TablesDB(client);

    const result = await db.listColumns({
      databaseId: "6af0e04700278cb50f3c",
      tableId: "settings",
    });

    const column = result.columns.find(
      (item) => item.key === "dashboardBackgroundUrl",
    );

    if (!column) {
      console.log("dashboardBackgroundUrl was not found.");
      return;
    }

    console.log("\nSETTINGS COLUMN VERIFIED");
    console.log("------------------------");
    console.log("Name:", column.key);
    console.log("Type:", column.type);
    console.log("Status:", column.status);
    console.log("Required:", column.required);

    if (column.status === "available") {
      console.log("\nSUCCESS: Column is ready to use!");
    } else {
      console.log("\nWAIT: Column is still being processed.");
    }
  } catch (error) {
    console.error("Verification failed:", error.message);
    process.exitCode = 1;
  }
}

main();
