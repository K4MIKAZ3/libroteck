import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { productPrices, products } from "../lib/db/schema";
import { slugify } from "../lib/utils";

const product = {
  name: "50 Manuales de Computadoras y Módulos Automotrices",
  slug: slugify("50 Manuales de Computadoras y Módulos Automotrices"),
  type: "bundle" as const,
  description:
    "Colección de 50 manuales técnicos de computadoras y módulos automotrices. Acceso inmediato, descarga en la nube y actualizaciones incluidas.",
  coverUrl: "/covers/manuales-automotrices.svg",
  isNew: true,
  prices: [
    { countryCode: "MX" as const, currency: "MXN", amount: 799 },
    { countryCode: "CO" as const, currency: "COP", amount: 149000 },
    { countryCode: "AR" as const, currency: "ARS", amount: 79000 },
    { countryCode: "PE" as const, currency: "PEN", amount: 129 },
    { countryCode: "INT" as const, currency: "USD", amount: 49.99 },
  ],
};

async function main() {
  const db = await getDb();

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.slug, product.slug))
    .limit(1);

  if (existing.length > 0) {
    console.log("Product already exists:", existing[0].id);
    return;
  }

  const [created] = await db
    .insert(products)
    .values({
      name: product.name,
      slug: product.slug,
      type: product.type,
      description: product.description,
      coverUrl: product.coverUrl,
      isActive: true,
      isNew: product.isNew,
    })
    .returning();

  await db.insert(productPrices).values(
    product.prices.map((price) => ({
      productId: created.id,
      countryCode: price.countryCode,
      currency: price.currency,
      amount: price.amount,
    })),
  );

  console.log("Created product:", created.id, created.slug);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
