import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "fs";
import path from "path";
import { productPrices, products, settings } from "./schema";

let ensured = false;

const demoProducts = [
  {
    name: "Curso Excel Pro",
    slug: "curso-excel-pro",
    type: "course" as const,
    description:
      "Domina Excel desde cero hasta tablas dinámicas, fórmulas avanzadas y dashboards profesionales.",
    coverUrl:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=800&fit=crop",
    isNew: true,
    prices: [
      { countryCode: "MX" as const, currency: "MXN", amount: 499 },
      { countryCode: "CO" as const, currency: "COP", amount: 89000 },
      { countryCode: "AR" as const, currency: "ARS", amount: 45000 },
      { countryCode: "PE" as const, currency: "PEN", amount: 79 },
      { countryCode: "INT" as const, currency: "USD", amount: 29.99 },
    ],
  },
  {
    name: "Libro Finanzas Personales",
    slug: "libro-finanzas-personales",
    type: "book" as const,
    description:
      "Guía práctica para organizar tu dinero, crear un presupuesto y empezar a invertir.",
    coverUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=800&fit=crop",
    isNew: false,
    prices: [
      { countryCode: "MX" as const, currency: "MXN", amount: 199 },
      { countryCode: "CO" as const, currency: "COP", amount: 35000 },
      { countryCode: "AR" as const, currency: "ARS", amount: 18000 },
      { countryCode: "PE" as const, currency: "PEN", amount: 35 },
      { countryCode: "INT" as const, currency: "USD", amount: 12.99 },
    ],
  },
  {
    name: "Paquete Emprendedor Digital",
    slug: "paquete-emprendedor-digital",
    type: "bundle" as const,
    description:
      "Combo con curso de marketing digital, libro de ventas online y plantillas para redes.",
    coverUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=800&fit=crop",
    isNew: true,
    prices: [
      { countryCode: "MX" as const, currency: "MXN", amount: 999 },
      { countryCode: "CO" as const, currency: "COP", amount: 179000 },
      { countryCode: "AR" as const, currency: "ARS", amount: 89000 },
      { countryCode: "PE" as const, currency: "PEN", amount: 149 },
      { countryCode: "INT" as const, currency: "USD", amount: 59.99 },
    ],
  },
];

export function getDatabasePath() {
  if (process.env.VERCEL) {
    const tmpPath = path.join("/tmp", "libroteck.db");
    const bundledPath = path.join(process.cwd(), "data", "libroteck.db");
    if (!fs.existsSync(tmpPath) && fs.existsSync(bundledPath)) {
      fs.copyFileSync(bundledPath, tmpPath);
    }
    return tmpPath;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "libroteck.db");
}

export function ensureDatabase() {
  if (ensured) return;

  const sqlite = new Database(getDatabasePath());
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema: { products, productPrices, settings } });
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  migrate(db, { migrationsFolder });

  const existing = db.select().from(products).limit(1).all();
  if (existing.length === 0) {
    for (const item of demoProducts) {
      const [product] = db
        .insert(products)
        .values({
          name: item.name,
          slug: item.slug,
          type: item.type,
          description: item.description,
          coverUrl: item.coverUrl,
          isActive: true,
          isNew: item.isNew,
        })
        .returning()
        .all();

      db.insert(productPrices)
        .values(
          item.prices.map((price) => ({
            productId: product.id,
            countryCode: price.countryCode,
            currency: price.currency,
            amount: price.amount,
          })),
        )
        .run();
    }
  }

  const settingsRows = db.select().from(settings).limit(1).all();
  if (settingsRows.length === 0) {
    db.insert(settings)
      .values({
        whatsappNumber: process.env.WHATSAPP_NUMBER ?? "5212345678900",
        storeName: "LibroTeck",
        welcomeMessage: "Cursos y libros digitales",
      })
      .run();
  }

  ensured = true;
}
