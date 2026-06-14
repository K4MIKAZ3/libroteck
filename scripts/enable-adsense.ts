import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { settings } from "../lib/db/schema";

async function main() {
  const db = await getDb();
  const rows = await db.select().from(settings).limit(1);

  if (rows.length === 0) {
    console.log("No settings row found.");
    return;
  }

  await db
    .update(settings)
    .set({ adsEnabled: true })
    .where(eq(settings.id, rows[0].id));

  console.log("AdSense mode enabled (adsEnabled=true).");
  console.log("Next: paste your ca-pub- ID in Admin > Configuracion.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
