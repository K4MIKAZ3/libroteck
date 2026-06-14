import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { products, productPrices, settings } from "../lib/db/schema";

const demoProducts = [
  {
    name: "Curso Excel Pro",
    slug: "curso-excel-pro",
    type: "course" as const,
    description:
      "Domina Excel desde cero hasta nivel avanzado. Incluye macros, tablas dinámicas y automatización de reportes.",
    coverUrl: "/covers/excel-pro.svg",
    isNew: true,
    prices: [
      { countryCode: "MX" as const, currency: "MXN", amount: 499 },
      { countryCode: "CO" as const, currency: "COP", amount: 89000 },
      { countryCode: "AR" as const, currency: "ARS", amount: 45000 },
      { countryCode: "PE" as const, currency: "PEN", amount: 89 },
      { countryCode: "INT" as const, currency: "USD", amount: 29.99 },
    ],
  },
  {
    name: "Libro Finanzas Personales",
    slug: "libro-finanzas-personales",
    type: "book" as const,
    description:
      "Guía práctica para organizar tus finanzas, crear un presupuesto y alcanzar tus metas económicas.",
    coverUrl: "/covers/finanzas.svg",
    isNew: false,
    prices: [
      { countryCode: "MX" as const, currency: "MXN", amount: 199 },
      { countryCode: "CO" as const, currency: "COP", amount: 35000 },
      { countryCode: "AR" as const, currency: "ARS", amount: 18000 },
      { countryCode: "PE" as const, currency: "PEN", amount: 39 },
      { countryCode: "INT" as const, currency: "USD", amount: 12.99 },
    ],
  },
  {
    name: "Paquete Marketing Digital",
    slug: "paquete-marketing-digital",
    type: "bundle" as const,
    description:
      "Curso completo de marketing digital + libro de estrategias + plantillas editables para redes sociales.",
    coverUrl: "/covers/marketing.svg",
    isNew: true,
    prices: [
      { countryCode: "MX" as const, currency: "MXN", amount: 999 },
      { countryCode: "CO" as const, currency: "COP", amount: 180000 },
      { countryCode: "AR" as const, currency: "ARS", amount: 95000 },
      { countryCode: "PE" as const, currency: "PEN", amount: 179 },
      { countryCode: "INT" as const, currency: "USD", amount: 59.99 },
    ],
  },
];

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  const existingSettings = await db.select().from(settings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(settings).values({
      whatsappNumber: process.env.WHATSAPP_NUMBER ?? "5212345678900",
      storeName: "LibroTeck",
      welcomeMessage: "Elige tu país y ordena por WhatsApp",
    });
    console.log("Settings created.");
  }

  for (const product of demoProducts) {
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.slug, product.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Skipped (exists): ${product.name}`);
      continue;
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

    console.log(`Created: ${product.name}`);
  }

  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
