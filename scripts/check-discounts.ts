import { getDb } from "../lib/db/index";
import { productPrices, products } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = await getDb();
  const rows = await db
    .select({
      productId: products.id,
      name: products.name,
      type: products.type,
      countryCode: productPrices.countryCode,
      amount: productPrices.amount,
      compareAtAmount: productPrices.compareAtAmount,
    })
    .from(products)
    .innerJoin(productPrices, eq(productPrices.productId, products.id))
    .where(eq(products.isActive, true));

  const byProduct = new Map<
    number,
    { name: string; type: string; withDiscount: number; total: number }
  >();

  for (const row of rows) {
    const entry = byProduct.get(row.productId) ?? {
      name: row.name,
      type: row.type,
      withDiscount: 0,
      total: 0,
    };
    entry.total++;
    if (
      row.compareAtAmount != null &&
      row.compareAtAmount > row.amount
    ) {
      entry.withDiscount++;
    }
    byProduct.set(row.productId, entry);
  }

  let withAny = 0;
  let withoutAny = 0;

  for (const [, entry] of byProduct) {
    if (entry.withDiscount > 0) withAny++;
    else withoutAny++;
    console.log(
      `${entry.withDiscount > 0 ? "✓" : "✗"} [${entry.type}] ${entry.name} — ${entry.withDiscount}/${entry.total} países con descuento`,
    );
  }

  console.log(`\nResumen: ${withAny} con descuento, ${withoutAny} sin descuento`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
