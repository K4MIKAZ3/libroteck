import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "fs";
import path from "path";
import * as schema from "./schema";
import { products, productPrices, settings } from "./schema";

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: ReturnType<typeof drizzle<typeof schema>>;
  initialized?: boolean;
};

function getDatabasePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "libroteck.db");
  }
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "libroteck.db");
}

function getSqlite() {
  if (globalForDb.sqlite) return globalForDb.sqlite;

  const sqlite = new Database(getDatabasePath());
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  globalForDb.sqlite = sqlite;
  return sqlite;
}

function seedIfEmpty(db: ReturnType<typeof drizzle<typeof schema>>) {
  const existingProducts = db.select().from(products).all();
  if (existingProducts.length > 0) return;

  const existingSettings = db.select().from(settings).all();
  if (existingSettings.length === 0) {
    db.insert(settings)
      .values({
        whatsappNumber: process.env.WHATSAPP_NUMBER ?? "5212345678900",
        storeName: "LibroTeck",
        welcomeMessage: "Elige tu país y ordena por WhatsApp",
      })
      .run();
  }

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

  for (const product of demoProducts) {
    const created = db
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
      .returning()
      .get();

    db.insert(productPrices)
      .values(
        product.prices.map((price) => ({
          productId: created.id,
          countryCode: price.countryCode,
          currency: price.currency,
          amount: price.amount,
        })),
      )
      .run();
  }
}

function initializeDatabase(db: ReturnType<typeof drizzle<typeof schema>>) {
  if (globalForDb.initialized) return;
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  seedIfEmpty(db);
  globalForDb.initialized = true;
}

export function getDb() {
  if (globalForDb.db) return globalForDb.db;

  const db = drizzle(getSqlite(), { schema });
  initializeDatabase(db);
  globalForDb.db = db;
  return db;
}

export { schema };
