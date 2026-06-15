import { readFileSync } from "fs";
import path from "path";
import { getDb } from "../lib/db/index";
import {
  importSnapshot,
  type Snapshot,
} from "../lib/migration/import-snapshot";

async function main() {
  const snapshotPath = path.join(process.cwd(), "data", "libroteck-snapshot.json");
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as Snapshot;
  const db = await getDb();
  const result = await importSnapshot(db, snapshot);

  console.log(
    `Imported ${result.products} products, ${result.prices} prices, ${result.settings} settings.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
