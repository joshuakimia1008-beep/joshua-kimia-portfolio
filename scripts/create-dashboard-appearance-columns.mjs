import fs from "node:fs";
import { Client, TablesDB } from "node-appwrite";

const env = fs.readFileSync(".env", "utf8");

function getEnv(name) {
  const match = env.match(new RegExp(`^${name}=(.*)$`, "m"));
  return match?.[1]?.trim().replace(/^["']|["']$/g, "");
}

const client = new Client()
  .setEndpoint(getEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT"))
  .setProject(getEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID"))
  .setKey(getEnv("APPWRITE_API_KEY"));

const tablesDB = new TablesDB(client);

const databaseId = getEnv("APPWRITE_DATABASE_ID");
const tableId = "settings";

const columnsToCreate = [
  {
    key: "dashboardBackgroundOverlay",
    min: 0,
    max: 80,
  },
  {
    key: "dashboardBackgroundBlur",
    min: 0,
    max: 12,
  },
];

async function main() {
  console.log("Checking dashboard appearance columns...\n");

  const result = await tablesDB.listColumns({
    databaseId,
    tableId,
  });

  for (const column of columnsToCreate) {
    const existing = result.columns.find(
      (item) => item.key === column.key
    );

    if (existing) {
      console.log(`EXISTS: ${column.key} (${existing.status})`);
      continue;
    }

    console.log(`Creating integer column: ${column.key}`);

    const created = await tablesDB.createIntegerColumn({
      databaseId,
      tableId,
      key: column.key,
      min: column.min,
      max: column.max,
      required: false,
    });

    console.log(`CREATED: ${column.key}`);
    console.log(`Status: ${created.status}`);
  }

  console.log("\nMigration completed.");
}

main().catch((error) => {
  console.error("\nMIGRATION FAILED:", error.message);
  process.exitCode = 1;
});
