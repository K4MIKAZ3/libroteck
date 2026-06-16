import { eq, sql } from "drizzle-orm";
import type { getDb } from "@/lib/db/index";
import { productPrices, products, settings, stores } from "@/lib/db/schema";

export type Snapshot = {
  products: (typeof products.$inferSelect)[];
  productPrices: (typeof productPrices.$inferSelect)[];
  settings: (typeof settings.$inferSelect)[];
};

export async function importSnapshot(
  db: Awaited<ReturnType<typeof getDb>>,
  snapshot: Snapshot,
) {
  await db.execute(
    sql`TRUNCATE product_prices, products, settings RESTART IDENTITY CASCADE`,
  );

  const libroteckStore = await db.query.stores.findFirst({
    where: eq(stores.slug, "libroteck"),
  });
  const storeId = libroteckStore?.id ?? 1;

  if (snapshot.settings.length > 0) {
    await db.insert(settings).values(
      snapshot.settings.map(({ id: _id, ...row }) => ({
        ...row,
        storeId,
      })),
    );
  }

  const productIdMap = new Map<number, number>();

  for (const product of snapshot.products) {
    const { id: oldId, createdAt, storeId: _storeId, ...row } = product;
    const [inserted] = await db
      .insert(products)
      .values({
        ...row,
        storeId,
        createdAt: new Date(createdAt),
      })
      .returning({ id: products.id });

    productIdMap.set(oldId, inserted.id);
  }

  const priceRows = snapshot.productPrices
    .map(({ id: _id, productId, ...row }) => {
      const mappedId = productIdMap.get(productId);
      if (!mappedId) return null;
      return { ...row, productId: mappedId };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (priceRows.length > 0) {
    await db.insert(productPrices).values(priceRows);
  }

  return {
    products: snapshot.products.length,
    prices: priceRows.length,
    settings: snapshot.settings.length,
  };
}
