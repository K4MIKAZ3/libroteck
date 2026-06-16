import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { productPrices, products } from "../lib/db/schema";
import {
  COUNTRIES,
  getCompareAtAmount,
  SALE_AMOUNTS,
  type CountryCode,
  type ProductType,
} from "../lib/pricing/countries";

async function main() {
  const db = await getDb();
  const allProducts = await db.query.products.findMany({ with: { prices: true } });

  let updated = 0;
  let inserted = 0;

  for (const product of allProducts) {
    const type = product.type as ProductType;
    const saleType =
      type === "bundle"
        ? "bundle"
        : type === "course" || type === "subscription"
          ? type
          : null;

    for (const price of product.prices) {
      const country = price.countryCode as CountryCode;

      if (saleType) {
        const saleAmount = SALE_AMOUNTS[saleType][country];
        const compareAt = getCompareAtAmount(type, country, product.slug);

        await db
          .update(productPrices)
          .set({
            amount: saleAmount,
            compareAtAmount:
              compareAt && compareAt > saleAmount ? compareAt : null,
          })
          .where(eq(productPrices.id, price.id));

        updated++;
      }
    }

    const existingCountries = new Set(
      product.prices.map((p) => p.countryCode as CountryCode),
    );

    if (!existingCountries.has("BO") && saleType) {
      const compareAt = getCompareAtAmount(type, "BO", product.slug);
      const amount = SALE_AMOUNTS[saleType].BO;

      await db.insert(productPrices).values({
        productId: product.id,
        countryCode: "BO",
        currency: COUNTRIES.BO.currency,
        amount,
        compareAtAmount:
          compareAt && compareAt > amount ? compareAt : null,
      });
      inserted++;
    }
  }

  console.log(`Updated ${updated} prices. Inserted ${inserted} Bolivia prices.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
