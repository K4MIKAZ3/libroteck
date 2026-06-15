import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { getDb } from "../lib/db/index";
import { productPrices, products, settings } from "../lib/db/schema";

async function main() {
  const db = await getDb();

  const [allProducts, allPrices, allSettings] = await Promise.all([
    db.select().from(products),
    db.select().from(productPrices),
    db.select().from(settings),
  ]);

  const snapshot = {
    exportedAt: new Date().toISOString(),
    products: allProducts,
    productPrices: allPrices,
    settings: allSettings,
  };

  const outDir = path.join(process.cwd(), "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "libroteck-snapshot.json");
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2), "utf8");

  console.log(`Exported ${allProducts.length} products, ${allPrices.length} prices, ${allSettings.length} settings rows.`);
  console.log(`Saved to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
