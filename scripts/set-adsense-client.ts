import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { settings } from "../lib/db/schema";

const ADSENSE_CLIENT_ID = "ca-pub-2874159185263006";

async function main() {
  const db = await getDb();
  const rows = await db.select().from(settings).limit(1);

  if (rows.length === 0) {
    console.error("No settings row found.");
    process.exit(1);
  }

  const [updated] = await db
    .update(settings)
    .set({
      adsEnabled: true,
      adsenseClientId: ADSENSE_CLIENT_ID,
    })
    .where(eq(settings.id, rows[0].id))
    .returning();

  console.log("AdSense configured:");
  console.log("  client:", updated.adsenseClientId);
  console.log("  enabled:", updated.adsEnabled);
  console.log("\nPega los 3 ad-slot en Admin > Configuracion cuando los tengas.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
