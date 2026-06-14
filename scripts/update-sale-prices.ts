import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { productPrices, products } from "../lib/db/schema";
import {
  COUNTRIES,
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
    const saleType = type === "bundle" ? "bundle" : type === "course" ? "course" : null;

    for (const price of product.prices) {
      const country = price.countryCode as CountryCode;

      if (saleType) {
        const saleAmount = SALE_AMOUNTS[saleType][country];
        const compareAt =
          price.compareAtAmount ??
          (price.amount > saleAmount ? price.amount : null);

        await db
          .update(productPrices)
          .set({
            amount: saleAmount,
            compareAtAmount:
              compareAt && compareAt > saleAmount ? compareAt : price.compareAtAmount,
          })
          .where(eq(productPrices.id, price.id));

        updated++;
      }
    }

    const existingCountries = new Set(
      product.prices.map((p) => p.countryCode as CountryCode),
    );

    if (!existingCountries.has("BO")) {
      const intPrice = product.prices.find((p) => p.countryCode === "INT");
      const compareAt =
        saleType && intPrice
          ? intPrice.compareAtAmount ?? intPrice.amount
          : intPrice?.amount ?? 0;
      const amount =
        saleType
          ? SALE_AMOUNTS[saleType].BO
          : intPrice
            ? Math.round(intPrice.amount * 6.9)
            : 0;

      if (amount > 0) {
        await db.insert(productPrices).values({
          productId: product.id,
          countryCode: "BO",
          currency: COUNTRIES.BO.currency,
          amount,
          compareAtAmount:
            saleType && compareAt > amount ? Math.round(compareAt * 6.9) : null,
        });
        inserted++;
      }
    }
  }

  console.log(`Updated ${updated} prices. Inserted ${inserted} Bolivia prices.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
