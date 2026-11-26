import nextEnv from "@next/env";
import { Client, TablesDB } from "node-appwrite";

nextEnv.loadEnvConfig(process.cwd());

const endpoint =
  process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

const projectId =
  process.env.APPWRITE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID;

const tableId = "contact_messages";

if (!endpoint || !projectId || !apiKey || !databaseId) {
  console.error("Missing Appwrite environment variables.");

  console.error("Required values:");
  console.error("APPWRITE_ENDPOINT or NEXT_PUBLIC_APPWRITE_ENDPOINT");
  console.error("APPWRITE_PROJECT_ID or NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  console.error("APPWRITE_API_KEY");
  console.error("APPWRITE_DATABASE_ID");

  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const tablesDB = new TablesDB(client);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForColumn(key) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const result = await tablesDB.listColumns({
      databaseId,
      tableId,
    });

    const column = result.columns.find((item) => item.key === key);

    if (column?.status === "available") return;

    if (column?.status === "failed") {
      throw new Error(`Column "${key}" failed to become available.`);
    }

    await wait(1000);
  }

  throw new Error(`Timed out waiting for column "${key}".`);
}

async function createColumnIfMissing(key, createColumn) {
  const result = await tablesDB.listColumns({
    databaseId,
    tableId,
  });

  if (result.columns.some((column) => column.key === key)) {
    console.log(`Column already exists: ${key}`);
    return;
  }

  console.log(`Creating column: ${key}`);

  await createColumn();
  await waitForColumn(key);

  console.log(`Column ready: ${key}`);
}

async function main() {
  console.log("\nAPPWRITE CONTACT TABLE SETUP");
  console.log("----------------------------");

  try {
    await tablesDB.getTable({
      databaseId,
      tableId,
    });

    console.log("Table already exists:", tableId);
  } catch (error) {
    if (error.code !== 404) throw error;

    console.log("Creating Contact Messages table...");

    await tablesDB.createTable({
      databaseId,
      tableId,
      name: "Contact Messages",
      permissions: [],
    });

    console.log("Table created:", tableId);
    await wait(1500);
  }

  await createColumnIfMissing("name", () =>
    tablesDB.createVarcharColumn({
      databaseId,
      tableId,
      key: "name",
      size: 120,
      required: true,
    }),
  );

  await createColumnIfMissing("email", () =>
    tablesDB.createEmailColumn({
      databaseId,
      tableId,
      key: "email",
      required: true,
    }),
  );

  await createColumnIfMissing("message", () =>
    tablesDB.createTextColumn({
      databaseId,
      tableId,
      key: "message",
      required: true,
    }),
  );

  await createColumnIfMissing("status", () =>
    tablesDB.createVarcharColumn({
      databaseId,
      tableId,
      key: "status",
      size: 30,
      required: true,
    }),
  );

  await createColumnIfMissing("createdAt", () =>
    tablesDB.createDatetimeColumn({
      databaseId,
      tableId,
      key: "createdAt",
      required: true,
    }),
  );

  console.log("\nSUCCESS!");
  console.log("----------------------------");
  console.log("Table ID:", tableId);
  console.log("Contact Messages table is ready.");
  console.log("All five columns have been checked.");
}

main().catch((error) => {
  console.error("\nCONTACT TABLE SETUP FAILED:");
  console.error(error.message || error);
  process.exit(1);
});
