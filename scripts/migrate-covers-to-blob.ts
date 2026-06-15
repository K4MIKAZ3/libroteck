import { getDb } from "../lib/db/index";
import { migrateCoversToBlob } from "../lib/migration/migrate-covers";

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is required.");
    process.exit(1);
  }

  const db = await getDb();
  const result = await migrateCoversToBlob(db);

  for (const error of result.errors) {
    console.error(`Failed ${error}`);
  }

  console.log(`\nMigrated ${result.updated} covers to the new Blob store.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
